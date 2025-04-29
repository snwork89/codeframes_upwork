"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Code, ExternalLink, Pencil, Layers } from "lucide-react"
import type { Database } from "@/lib/database.types"

type Snippet = Database["public"]["Tables"]["snippets"]["Row"]

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [user, setUser] = useState<any>(null)
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [canvasSettings, setCanvasSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      // Get authenticated user
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        router.push("/login")
        return
      }

      setUser(userData.user)

      // Get user's snippets
      const { data: snippetsData, error } = await supabase
        .from("snippets")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching snippets:", error)
      } else {
        setSnippets(snippetsData || [])
      }

      // Get user's subscription
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userData.user.id)
        .single()

      setSubscription(subscriptionData)

      // Get canvas settings
      const { data: canvasSettingsData } = await supabase
        .from("canvas_settings")
        .select("public_access_id, is_public")
        .eq("user_id", userData.user.id)
        .single()

      setCanvasSettings(canvasSettingsData)
      setLoading(false)

      // Trigger animations after data is loaded
      setTimeout(() => setIsLoaded(true), 100)
    }

    fetchData()
  }, [supabase, router])

  const hasPublicCanvas = canvasSettings?.is_public && canvasSettings?.public_access_id

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  const alertVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        delay: 0.3,
      },
    },
  }

  const progressVariants = {
    hidden: { width: 0 },
    visible: (percent: number) => ({
      width: `${percent}%`,
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 0.5,
      },
    }),
  }

  const emptyStateVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.2,
      },
    },
  }

  const progressPercent = subscription ? Math.min(((snippets?.length || 0) / subscription.snippet_limit) * 100, 100) : 0

  return (
    <DashboardLayout>
      <motion.div
        className="p-6"
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div className="flex justify-between items-center mb-6" variants={headerVariants}>
          <h1 className="text-2xl font-bold">Your Snippets</h1>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/dashboard/canvas">
                <Button variant="outline" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" /> Canvas View
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/dashboard/new">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" /> New Snippet
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence>
          {hasPublicCanvas && (
            <motion.div
              className="mb-6 bg-white p-4 rounded-lg border border-green-200 bg-green-50"
              variants={alertVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <motion.div
                    className="bg-green-100 p-2 rounded-full mr-3"
                    initial={{ rotate: -10, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                  >
                    <Layers className="h-5 w-5 text-green-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-medium">Your canvas is public</h3>
                    <p className="text-sm text-gray-600">Share your canvas with others</p>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href={`/canvas/${canvasSettings?.public_access_id}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" /> View Public Canvas
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {subscription && (
            <motion.div
              className="mb-6 bg-white p-4 rounded-lg border"
              variants={alertVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    {snippets?.length || 0} of {subscription.snippet_limit} snippets used
                  </p>
                  <div className="w-64 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <motion.div
                      className="h-2 bg-purple-600 rounded-full"
                      custom={progressPercent}
                      variants={progressVariants}
                    ></motion.div>
                  </div>
                </div>
                {(snippets?.length || 0) >= subscription.snippet_limit && subscription.plan_type === "free" && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/dashboard/settings">
                      <Button variant="outline">Upgrade Plan</Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="bg-white h-64 rounded-lg border animate-pulse"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
              />
            ))}
          </motion.div>
        ) : snippets && snippets.length > 0 ? (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
            {snippets.map((snippet, index) => (
              <motion.div
                key={snippet.id}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{snippet.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 flex-grow">
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {snippet.description || "No description provided"}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {snippet.html_code && (
                        <motion.span
                          className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs"
                          whileHover={{ scale: 1.1 }}
                        >
                          HTML
                        </motion.span>
                      )}
                      {snippet.css_code && (
                        <motion.span
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                          whileHover={{ scale: 1.1 }}
                        >
                          CSS
                        </motion.span>
                      )}
                      {snippet.js_code && (
                        <motion.span
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                          whileHover={{ scale: 1.1 }}
                        >
                          JS
                        </motion.span>
                      )}
                      {snippet.is_public && (
                        <motion.span
                          className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                          whileHover={{ scale: 1.1 }}
                        >
                          Public
                        </motion.span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      Created: {new Date(snippet.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link href={`/dashboard/edit/${snippet.id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </Button>
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link href={snippet.is_public ? `/snippet/${snippet.id}` : `/dashboard/view/${snippet.id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" /> View
                        </Button>
                      </Link>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div className="bg-white p-6 rounded-lg shadow-sm border" variants={emptyStateVariants}>
            <div className="text-center py-12">
              <motion.div
                className="flex justify-center mb-4"
                initial={{ rotate: -10, scale: 0.9, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
              >
                <div className="p-3 rounded-full bg-purple-100">
                  <Code className="h-8 w-8 text-purple-600" />
                </div>
              </motion.div>
              <motion.h2
                className="text-xl font-medium mb-2"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                You don't have any snippets yet
              </motion.h2>
              <motion.p
                className="text-gray-500 mb-4"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                Create your first code snippet to get started
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <Link href="/dashboard/new">
                  <Button className="bg-purple-600 hover:bg-purple-700">Create New Snippet</Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
