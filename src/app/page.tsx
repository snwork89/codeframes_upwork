"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Star, Zap, Layout, Layers, Sparkles, Lightbulb, Infinity, Globe } from "lucide-react"
import PricingCard from "@/components/pricing-card"
import FeatureCard from "@/components/FeatureCard"
import CursorEffect from "@/components/CursorEffect"
import AnimatedBackground from "@/components/AnimatedBackground"
import CodePreview from "@/components/LandingPageCodePreview"
import InteractiveCanvas from "@/components/InterActiveCanvas"
import UserDropdown from "@/components/user-dropdown"
import { motion } from "framer-motion"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setIsLoggedIn(!!user)
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase])

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-white">
      <CursorEffect />
      <AnimatedBackground />

      {/* Navigation */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-75 blur group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white rounded-full p-1">
                <Code className="h-6 w-6 text-purple-600 transition-transform duration-300 group-hover:rotate-12" />
              </div>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              SnippetVault
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/explore">
              <Button variant="ghost" className="hover:bg-purple-50 transition-colors duration-300">
                <Globe className="h-4 w-4 mr-2" />
                Explore
              </Button>
            </Link>

            {loading ? (
              <Button variant="ghost" disabled>
                Loading...
              </Button>
            ) : isLoggedIn ? (
              <UserDropdown />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hover:bg-purple-50 transition-colors duration-300">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-block mb-4 px-4 py-1.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full text-sm font-medium animate-pulse">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                Organize your code like never before
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              Store Code Snippets on an{" "}
              <span className="relative inline-block text-purple-700">
                Infinite Canvas
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
              </span>
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl mb-8">
              Save HTML, CSS, and JavaScript snippets with live preview. Organize your code library visually and access
              it from anywhere with our interactive infinite canvas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg hover:scale-105 w-full sm:w-auto group">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg hover:scale-105 w-full sm:w-auto group">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              )}
              <Link href="#pricing">
                <Button
                  variant="outline"
                  className="border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 w-full sm:w-auto"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Animated code preview */}
        <div className="mt-16 relative z-10">
          <CodePreview delay={500} />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-20"></div>
      </section>

      {/* Infinite Canvas Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <div className="inline-flex items-center justify-center mb-4">
              <span className="p-2 rounded-lg bg-purple-100">
                <Infinity className="h-6 w-6 text-purple-600" />
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Organize on an <span className="text-purple-700">Infinite Canvas</span>
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              Arrange your snippets spatially, group related code, and visualize your entire collection at once. Drag,
              zoom, and organize your code in a way that makes sense to you.
            </p>
          </motion.div>

          {/* Interactive canvas demo */}
          <InteractiveCanvas />

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-purple-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Layout className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg">Spatial Organization</h3>
              </div>
              <p className="text-gray-500">
                Organize your snippets visually in a way that mirrors your mental model. Group related code together.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-purple-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Layers className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg">Drag & Drop</h3>
              </div>
              <p className="text-gray-500">
                Easily move and arrange your snippets with intuitive drag and drop functionality.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-purple-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg">Instant Preview</h3>
              </div>
              <p className="text-gray-500">See your code in action with real-time previews that update as you type.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <div className="inline-flex items-center justify-center mb-4">
              <span className="p-2 rounded-lg bg-purple-100">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Powerful Features</h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              Everything you need to manage your code snippets efficiently on an infinite canvas.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Code className="h-6 w-6 text-purple-600" />}
              title="Live Preview"
              description="See your HTML, CSS, and JavaScript code in action with real-time preview."
              delay={0.1}
            />
            <FeatureCard
              icon={<Star className="h-6 w-6 text-purple-600" />}
              title="Organize & Tag"
              description="Categorize your snippets with tags and arrange them spatially on your canvas."
              highlighted={true}
              delay={0.2}
            />
            <FeatureCard
              icon={<Lightbulb className="h-6 w-6 text-purple-600" />}
              title="Share & Collaborate"
              description="Share your snippets with others or keep them private."
              delay={0.3}
            />
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute top-1/3 left-0 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-20"></div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <div className="inline-flex items-center justify-center mb-4">
              <span className="p-2 rounded-lg bg-purple-100">
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
                  className="h-6 w-6 text-purple-600"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                  <path d="M12 18V6"></path>
                </svg>
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              Choose the plan that's right for your coding journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Free"
              price="$0"
              description="Perfect for getting started"
              features={["Save up to 10 code snippets", "Live preview", "Basic organization"]}
              buttonText="Get Started"
              buttonVariant="outline"
              href="/signup"
              delay={0.1}
            />
            <PricingCard
              title="Basic"
              price="$20"
              description="For growing snippet collections"
              features={["Save up to 100 code snippets", "Live preview", "Advanced organization", "Snippet sharing"]}
              buttonText="Subscribe"
              buttonVariant="default"
              href="/signup"
              highlighted={true}
              delay={0.2}
            />
            <PricingCard
              title="Premium"
              price="$50"
              description="For power users"
              features={[
                "Save up to 500 code snippets",
                "Live preview",
                "Advanced organization",
                "Snippet sharing",
                "Team collaboration",
                "Priority support",
              ]}
              buttonText="Subscribe"
              buttonVariant="outline"
              href="/signup"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          ></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6 text-white">
              Ready to organize your code snippets?
            </h2>
            <p className="mx-auto max-w-[700px] text-purple-100 md:text-xl mb-8">
              Join thousands of developers who use SnippetVault to manage their code library.
            </p>
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="bg-white text-purple-600 hover:bg-purple-50 transition-all duration-300 hover:shadow-lg text-lg px-8 py-6 h-auto">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button className="bg-white text-purple-600 hover:bg-purple-50 transition-all duration-300 hover:shadow-lg text-lg px-8 py-6 h-auto">
                  Get Started for Free
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <Code className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold">SnippetVault</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="/terms" className="text-gray-500 hover:text-purple-600 transition-colors duration-300">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-purple-600 transition-colors duration-300">
                Privacy
              </Link>
              <Link href="#" className="text-gray-500 hover:text-purple-600 transition-colors duration-300">
                Documentation
              </Link>
              <Link href="#" className="text-gray-500 hover:text-purple-600 transition-colors duration-300">
                Blog
              </Link>
            </div>
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} SnippetVault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
