"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { PLANS } from "@/lib/stripe";
import type { Database } from "@/lib/database.types";
import { useRouter } from "next/navigation";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

export default function Settings() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [snippetCount, setSnippetCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  
  const gridVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };
  
  const featureItemVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  useEffect(() => {
    async function getSubscriptionAndSnippets() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/login");
          return;
        }

        // Get subscription data
        const { data: subscriptionData, error: subscriptionError } =
          await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (subscriptionError) {
          throw subscriptionError;
        }

        setSubscription(subscriptionData);

        // Count user's snippets
        const { count, error: countError } = await supabase
          .from("snippets")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (countError) {
          throw countError;
        }

        setSnippetCount(count || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load subscription data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    getSubscriptionAndSnippets();
  }, [supabase, router]);

  const handleUpgrade = async (planType: "basic" | "premium") => {
    setUpgradeLoading(planType);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpgradeLoading(null);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) return null;

    switch (subscription.plan_type) {
      case "free":
        return PLANS.FREE;
      case "basic":
        return PLANS.BASIC;
      case "premium":
        return PLANS.PREMIUM;
      default:
        return null;
    }
  };

  const currentPlan = getCurrentPlan();
  const snippetsRemaining = subscription
    ? subscription.snippet_limit - snippetCount
    : 0;

  return (
    <DashboardLayout>
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Subscription Settings</h1>
  
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={gridVariants}
        >
          {/* Free Plan */}
          <motion.div variants={cardVariants}>
            <Card className={subscription?.plan_type === "free" ? "border-purple-600" : ""}>
              <CardHeader>
                <CardTitle>Free Plan</CardTitle>
                <CardDescription>For getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$0</div>
                <motion.ul
                  className="space-y-2"
                  initial="hidden"
                  animate="visible"
                >
                  {[
                    "Up to 10 snippets",
                    "Basic canvas access",
                    "Community support",
                  ].map((feature, index) => (
                    <motion.li
                      key={index}
                      variants={featureItemVariants}
                      className="flex items-center gap-2"
                    >
                      ✅ {feature}
                    </motion.li>
                  ))}
                </motion.ul>
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
          </motion.div>
  
          {/* Basic Plan */}
          <motion.div variants={cardVariants}>
            <Card className={subscription?.plan_type === "basic" ? "border-purple-600" : ""}>
              <CardHeader>
                <CardTitle>Basic Plan</CardTitle>
                <CardDescription>For growing collections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$20</div>
                <motion.ul
                  className="space-y-2"
                  initial="hidden"
                  animate="visible"
                >
                  {[
                    "Up to 100 snippets",
                    "Infinite canvas features",
                    "Priority support",
                  ].map((feature, index) => (
                    <motion.li
                      key={index}
                      variants={featureItemVariants}
                      className="flex items-center gap-2"
                    >
                      🚀 {feature}
                    </motion.li>
                  ))}
                </motion.ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={subscription?.plan_type === "basic" ? "default" : "outline"}
                  className={`w-full ${
                    subscription?.plan_type !== "basic" ? "bg-purple-600 hover:bg-purple-700" : ""
                  }`}
                  disabled={subscription?.plan_type === "basic" || upgradeLoading === "basic"}
                  onClick={() => handleUpgrade("basic")}
                >
                  {upgradeLoading === "basic" ? (
                    <span className="flex items-center">Processing...</span>
                  ) : subscription?.plan_type === "basic" ? (
                    "Current Plan"
                  ) : subscription?.plan_type === "premium" ? (
                    "Downgrade"
                  ) : (
                    "Upgrade"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
  
          {/* Premium Plan */}
          <motion.div variants={cardVariants}>
            <Card className={subscription?.plan_type === "premium" ? "border-purple-600" : ""}>
              <CardHeader>
                <CardTitle>Premium Plan</CardTitle>
                <CardDescription>For power users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$50</div>
                <motion.ul
                  className="space-y-2"
                  initial="hidden"
                  animate="visible"
                >
                  {[
                    "Unlimited snippets",
                    "Advanced canvas tools",
                    "1:1 Support",
                  ].map((feature, index) => (
                    <motion.li
                      key={index}
                      variants={featureItemVariants}
                      className="flex items-center gap-2"
                    >
                      💎 {feature}
                    </motion.li>
                  ))}
                </motion.ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={subscription?.plan_type === "premium" ? "default" : "outline"}
                  className={`w-full ${
                    subscription?.plan_type !== "premium" &&
                    subscription?.plan_type !== "basic"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : ""
                  }`}
                  disabled={subscription?.plan_type === "premium" || upgradeLoading === "premium"}
                  onClick={() => handleUpgrade("premium")}
                >
                  {upgradeLoading === "premium" ? (
                    <span className="flex items-center">Processing...</span>
                  ) : subscription?.plan_type === "premium" ? (
                    "Current Plan"
                  ) : (
                    "Upgrade"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
  
      {/* Current Subscription Section */}
      {subscription && (
        <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Plan</span>
                  <p className="font-medium capitalize">{subscription.plan_type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Snippet Limit</span>
                  <p className="font-medium">
                    {snippetCount} / {subscription.snippet_limit} snippets used
                  </p>
                </div>
              </div>
      
              {/* Animated Progress Bar */}
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-2 border border-purple-500">
                <motion.div
                  className="h-full bg-purple-600"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      (snippetCount / subscription.snippet_limit) * 100,
                      100
                    )}%`,
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
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
      </motion.div>
      )}
    </div>
  </DashboardLayout>
  );
}
