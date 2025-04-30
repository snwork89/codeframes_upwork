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
      const snippetLimit = session.metadata?.snippetLimit ? Number.parseInt(session.metadata.snippetLimit) : 0

      if (!userId || !planType) {
        console.error("Missing metadata in checkout session")
        return NextResponse.json({ message: "Missing metadata" }, { status: 400 })
      }

      // For one-time payments, we need to update the user's snippet limit
      // First, get the current subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
        .from("subscriptions")
        .select("snippet_limit, plan_type")
        .eq("user_id", userId)
        .single()

      if (subscriptionError) {
        console.error("Error fetching subscription data:", subscriptionError)
        return NextResponse.json({ message: "Error fetching subscription data" }, { status: 500 })
      }

      // Determine the new snippet limit
      let newSnippetLimit = snippetLimit
      const newPlanType = planType

      // If the user is upgrading from free to a paid plan, use the new limit
      // If they're already on a paid plan, add the new limit to their existing limit
      if (subscriptionData.plan_type !== "free" && subscriptionData.snippet_limit > PLANS.FREE.snippetLimit) {
        newSnippetLimit =
          subscriptionData.snippet_limit +
          snippetLimit -
          PLANS[subscriptionData.plan_type.toUpperCase() as keyof typeof PLANS].snippetLimit
      }

      // Update subscription in database
      await supabaseAdmin
        .from("subscriptions")
        .update({
          plan_type: newPlanType,
          status: "active",
          snippet_limit: newSnippetLimit,
          // For one-time payments, we don't need to store subscription_id
          stripe_price_id: session.amount_total ? session.amount_total.toString() : null,
        })
        .eq("user_id", userId)

      break
    }

    // We don't need to handle subscription events for one-time payments
    // But we'll keep some basic payment handling

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log(`Payment succeeded: ${paymentIntent.id}`)
      break
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log(`Payment failed: ${paymentIntent.id}`)
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
