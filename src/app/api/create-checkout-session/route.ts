import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import { PLANS } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { planType } = await request.json()

    // Get the plan details
    let plan
    if (planType === "basic") {
      plan = PLANS.BASIC
    } else if (planType === "premium") {
      plan = PLANS.PREMIUM
    } else {
      return NextResponse.json({ message: "Invalid plan type" }, { status: 400 })
    }

    if (!plan.stripePriceId) {
      return NextResponse.json({ message: "Stripe price ID not configured" }, { status: 500 })
    }

    // Get or create customer
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", session.user.id)
      .single()

    if (userError) {
      return NextResponse.json({ message: "Error fetching user data" }, { status: 500 })
    }

    // Get existing subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", session.user.id)
      .single()

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
      return NextResponse.json({ message: "Error fetching subscription data" }, { status: 500 })
    }

    let customerId = subscriptionData?.stripe_customer_id

    // If no customer ID exists, create a new customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          userId: session.user.id,
        },
      })

      customerId = customer.id

      // Update the subscription record with the customer ID
      await supabase.from("subscriptions").update({ stripe_customer_id: customerId }).eq("user_id", session.user.id)
    }

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?canceled=true`,
      metadata: {
        userId: session.user.id,
        planType: planType,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
