"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Code, Globe } from "lucide-react"
import UserDropdown from "@/components/user-dropdown"

export default function HeaderComponent() {
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
  )
}
