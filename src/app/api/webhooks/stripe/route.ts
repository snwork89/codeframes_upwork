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

  console.log(`Processing webhook event: ${event.type}`)

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        // Extract metadata
        const userId = session.metadata?.userId
        const planType = session.metadata?.planType

        if (!userId || !planType) {
          console.error("Missing metadata in checkout session", session.metadata)
          return NextResponse.json({ message: "Missing metadata" }, { status: 400 })
        }

        console.log(`Processing checkout completion for user ${userId}, plan ${planType}`)

        // Get the snippet limit for the purchased plan
        let snippetLimitIncrease = 0
        if (planType === "basic") {
          snippetLimitIncrease = PLANS.BASIC.snippetLimit
        } else if (planType === "premium") {
          snippetLimitIncrease = PLANS.PREMIUM.snippetLimit
        }

        if (snippetLimitIncrease === 0) {
          console.error(`Invalid plan type: ${planType}`)
          return NextResponse.json({ message: "Invalid plan type" }, { status: 400 })
        }

        // Get current subscription data
        const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
          .from("subscriptions")
          .select("snippet_limit, plan_type")
          .eq("user_id", userId)
          .single()

        if (subscriptionError) {
          console.error("Error fetching subscription data:", subscriptionError)
          return NextResponse.json({ message: "Error fetching subscription data" }, { status: 500 })
        }

        // Get user profile data for the invoice
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from("profiles")
          .select("email, full_name")
          .eq("id", userId)
          .single()

        if (profileError) {
          console.error("Error fetching profile data:", profileError)
          // Continue anyway, as this is not critical
        }

        // Calculate new snippet limit
        // If user is on free plan, set to the new plan's limit
        // If user already has a paid plan, add the new limit to their existing limit
        let newSnippetLimit = subscriptionData.snippet_limit

        // For users upgrading from free plan
        if (subscriptionData.plan_type === "free" && subscriptionData.snippet_limit === PLANS.FREE.snippetLimit) {
          newSnippetLimit = snippetLimitIncrease
        } else {
          // For users who already have a paid plan or increased limit
          newSnippetLimit = subscriptionData.snippet_limit + snippetLimitIncrease
        }

        console.log(`Updating snippet limit from ${subscriptionData.snippet_limit} to ${newSnippetLimit}`)

        // Create an invoice record
        const { error: invoiceError } = await supabaseAdmin.from("invoices").insert({
          user_id: userId,
          email: profileData?.email || null,
          full_name: profileData?.full_name || null,
          plan_type: planType,
          amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
          snippet_limit_added: snippetLimitIncrease,
          payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
          payment_method: session.payment_method_types ? session.payment_method_types[0] : null,
          status: "completed",
          metadata: {
            checkout_session_id: session.id,
            customer: session.customer,
            previous_limit: subscriptionData.snippet_limit,
            new_limit: newSnippetLimit,
          },
        })

        if (invoiceError) {
          console.error("Error creating invoice record:", invoiceError)
          // Continue anyway, as this is not critical
        }

        // Update subscription in database
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            plan_type: planType, // Update to the new plan type
            status: "active",
            snippet_limit: newSnippetLimit,
          })
          .eq("user_id", userId)

        if (updateError) {
          console.error("Error updating subscription:", updateError)
          return NextResponse.json({ message: "Error updating subscription" }, { status: 500 })
        }

        console.log(`Successfully updated snippet limit for user ${userId}`)
        break
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`Payment succeeded: ${paymentIntent.id}`)
        // Additional handling if needed
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`Payment failed: ${paymentIntent.id}`)
        // Handle failed payment if needed
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ message: "Error processing webhook" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

export async function GET() {
  return NextResponse.json({ message: "Stripe webhook endpoint" })
}
