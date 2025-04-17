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
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Subscription Settings</h1>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={subscription?.plan_type === "free" ? "border-purple-600" : ""}>
              <CardHeader>
                <CardTitle>Free Plan</CardTitle>
                <CardDescription>For getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$0</div>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Up to 10 snippets
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Live preview
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={subscription?.plan_type === "free" ? "default" : "outline"}
                  className="w-full"
                  disabled={subscription?.plan_type === "free"}
                >
                  {subscription?.plan_type === "free" ? "Current Plan" : "Downgrade"}
                </Button>
              </CardFooter>
            </Card>

            <Card className={subscription?.plan_type === "basic" ? "border-purple-600" : ""}>
              <CardHeader>
                <CardTitle>Basic Plan</CardTitle>
                <CardDescription>For growing collections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$20</div>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Up to 100 snippets
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Live preview
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Advanced organization
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={subscription?.plan_type === "basic" ? "default" : "outline"}
                  className={`w-full ${subscription?.plan_type !== "basic" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                  disabled={subscription?.plan_type === "basic" || upgradeLoading}
                  onClick={() => handleUpgrade("basic")}
                >
                  {subscription?.plan_type === "basic"
                    ? "Current Plan"
                    : subscription?.plan_type === "premium"
                      ? "Downgrade"
                      : "Upgrade"}
                </Button>
              </CardFooter>
            </Card>

            <Card className={subscription?.plan_type === "premium" ? "border-purple-600" : ""}>
              <CardHeader>
                <CardTitle>Premium Plan</CardTitle>
                <CardDescription>For power users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$50</div>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Up to 500 snippets
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Live preview
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Advanced organization
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Team collaboration
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Priority support
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={subscription?.plan_type === "premium" ? "default" : "outline"}
                  className={`w-full ${subscription?.plan_type !== "premium" && subscription?.plan_type !== "basic" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                  disabled={subscription?.plan_type === "premium" || upgradeLoading}
                  onClick={() => handleUpgrade("premium")}
                >
                  {subscription?.plan_type === "premium" ? "Current Plan" : "Upgrade"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {subscription && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Your subscription details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Plan</p>
                      <p className="text-lg font-medium">{currentPlan?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-lg font-medium capitalize">{subscription.status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Snippet Limit</p>
                      <p className="text-lg font-medium">{subscription.snippet_limit}</p>
                    </div>
                    {subscription.current_period_end && subscription.plan_type !== "free" && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Next Billing Date</p>
                        <p className="text-lg font-medium">
                          {new Date(subscription.current_period_end).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              {subscription.plan_type !== "free" && (
                <CardFooter>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    Cancel Subscription
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
