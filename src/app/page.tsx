"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Check, Star } from "lucide-react"
import PricingCard from "@/components/pricing-card"
import AnimatedBackground from "@/components/AnimatedBackground"
import { motion } from "framer-motion"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
       <AnimatedBackground />
      {/* Navigation */}
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Code className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold">SnippetVault</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50">
      <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Store and Preview Your Code Snippets
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Save HTML, CSS, and JavaScript snippets with live preview. Organize your code library and access it from
                anywhere.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/signup">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="outline">View Pricing</Button>
              </Link>
            </div>
          </div>
          </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Everything you need to manage your code snippets efficiently.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg">
              <div className="p-3 rounded-full bg-purple-100">
                <Code className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold">Live Preview</h3>
              <p className="text-gray-500 text-center">
                See your HTML, CSS, and JavaScript code in action with real-time preview.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg">
              <div className="p-3 rounded-full bg-purple-100">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold">Organize & Tag</h3>
              <p className="text-gray-500 text-center">
                Categorize your snippets with tags and folders for easy access.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg">
              <div className="p-3 rounded-full bg-purple-100">
                <Check className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold">Share & Collaborate</h3>
              <p className="text-gray-500 text-center">Share your snippets with others or keep them private.</p>
            </div>
          </div>
        </div>
      </section>
      <section id="pricing" className="py-20 bg-white relative overflow-hidden">
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

      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-600" />
            <span className="font-semibold">SnippetVault</span>
          </div>
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} SnippetVault. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-gray-500 hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
