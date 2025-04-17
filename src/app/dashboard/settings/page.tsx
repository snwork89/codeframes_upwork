"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { PLANS } from "@/lib/stripe"
import type { Database } from "@/lib/database.types"

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]

export default function Settings() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgradeLoading, setUpgradeLoading] = useState(false)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function getSubscription() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          return
        }

        const { data, error } = await supabase.from("subscriptions").select("*").eq("user_id", session.user.id).single()

        if (error) {
          throw error
        }

        setSubscription(data)
      } catch (error) {
        console.error("Error fetching subscription:", error)
        toast({
          title: "Error",
          description: "Failed to load subscription data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    getSubscription()
  }, [supabase])

  const handleUpgrade = async (planType: "basic" | "premium") => {
    setUpgradeLoading(true)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpgradeLoading(false)
    }
  }

  const getCurrentPlan = () => {
    if (!subscription) return null

    switch (subscription.plan_type) {
      case "free":
        return PLANS.FREE
      case "basic":
        return PLANS.BASIC
      case "premium":
        return PLANS.PREMIUM
      default:
        return null
    }
  }

  const currentPlan = getCurrentPlan()

  return (
    <div>
        Setting Page
    </div>
  )
}
