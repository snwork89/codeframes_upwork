import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import stripe from "@/lib/stripe"
import { PLANS } from "@/lib/stripe"
import type { Database } from "@/lib/database.types"

export async function POST(request: Request) {
  try {
    const { planType, userId } = await request.json()

    if (!planType || !userId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Validate plan type
    if (planType !== "basic" && planType !== "premium") {
      return NextResponse.json({ message: "Invalid plan type" }, { status: 400 })
    }

    // Get price ID based on plan type
    const priceId = planType === "basic" ? PLANS.BASIC.stripePriceId : PLANS.PREMIUM.stripePriceId

    if (!priceId) {
      return NextResponse.json({ message: "Price ID not configured" }, { status: 500 })
    }

    // Get user email for the checkout session
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get the snippet limit for the plan
    const snippetLimit = planType === "basic" ? PLANS.BASIC.snippetLimit : PLANS.PREMIUM.snippetLimit

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment", // Use "payment" for one-time payments
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?canceled=true`,
      customer_email: userData.email,
      metadata: {
        userId,
        planType,
        snippetLimit: snippetLimit.toString(),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
