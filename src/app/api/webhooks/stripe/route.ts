import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import stripe from "@/lib/stripe"
import { PLANS } from "@/lib/stripe"
import type { Database } from "@/lib/database.types"
import type Stripe from "stripe"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get("stripe-signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "")
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`)
    return NextResponse.json({ message: "Webhook signature verification failed" }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session

      // Extract metadata
      const userId = session.metadata?.userId
      const planType = session.metadata?.planType

      if (!userId || !planType) {
        console.error("Missing metadata in checkout session")
        return NextResponse.json({ message: "Missing metadata" }, { status: 400 })
      }

      // Get subscription details from Stripe
      if (session.subscription) {
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        // Determine snippet limit based on plan type
        let snippetLimit = 10 // Default to free plan
        if (planType === "basic") {
          snippetLimit = PLANS.BASIC.snippetLimit
        } else if (planType === "premium") {
          snippetLimit = PLANS.PREMIUM.snippetLimit
        }

        // Update subscription in database
        await supabaseAdmin
          .from("subscriptions")
          .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            plan_type: planType,
            status: subscription.status,
            snippet_limit: snippetLimit,
          })
          .eq("user_id", userId)
      }

      break
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice & { subscription: string }
      const subscriptionId = invoice.subscription
      if (!subscriptionId) {
        break
      }
      // Get subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId as string)

      // Find the user by subscription ID
      const { data: subscriptionData, error } = await supabaseAdmin
        .from("subscriptions")
        .select("user_id, plan_type")
        .eq("stripe_subscription_id", subscriptionId)
        .single()

      if (error || !subscriptionData) {
        console.error("Error finding subscription:", error)
        break
      }

      // Update subscription in database
      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: subscription.status,
        })
        .eq("stripe_subscription_id", subscriptionId)

      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription

      // Find the user by subscription ID
      const { data: subscriptionData, error } = await supabaseAdmin
        .from("subscriptions")
        .select("user_id, plan_type")
        .eq("stripe_subscription_id", subscription.id)
        .single()

      if (error || !subscriptionData) {
        console.error("Error finding subscription:", error)
        break
      }

      // Check if plan has changed
      const newPriceId = subscription.items.data[0].price.id
      let newPlanType = subscriptionData.plan_type
      let snippetLimit = 10 // Default to free plan

      if (newPriceId === PLANS.BASIC.stripePriceId) {
        newPlanType = "basic"
        snippetLimit = PLANS.BASIC.snippetLimit
      } else if (newPriceId === PLANS.PREMIUM.stripePriceId) {
        newPlanType = "premium"
        snippetLimit = PLANS.PREMIUM.snippetLimit
      }

      // Update subscription in database
      await supabaseAdmin
        .from("subscriptions")
        .update({
          stripe_price_id: newPriceId,
          plan_type: newPlanType,
          status: subscription.status,
          snippet_limit: snippetLimit,
        })
        .eq("stripe_subscription_id", subscription.id)

      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription

      // Update subscription in database to free plan
      await supabaseAdmin
        .from("subscriptions")
        .update({
          stripe_subscription_id: null,
          stripe_price_id: null,
          plan_type: "free",
          status: "canceled",
          snippet_limit: PLANS.FREE.snippetLimit,
        })
        .eq("stripe_subscription_id", subscription.id)

      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

export async function GET() {
  return NextResponse.json({ message: "Stripe webhook endpoint" })
}
