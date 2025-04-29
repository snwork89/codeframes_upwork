"use client"

import { useState } from "react"
import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Code, Plus, Settings, LogOut, Grid, Layers, Heart, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const navItems = [
    { href: "/dashboard", icon: Grid, label: "Grid View" },
    { href: "/dashboard/canvas", icon: Layers, label: "Canvas View" },
    { href: "/dashboard/favorites", icon: Heart, label: "Favorites" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ]

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  }

  const logoVariants = {
    initial: { scale: 0.9 },
    animate: {
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 300,
      },
    },
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <motion.div
        className="w-64 bg-white border-r hidden md:block"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div className="p-4 border-b" variants={logoVariants} initial="initial" animate="animate">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-600" />
            <span className="font-bold">SnippetVault</span>
          </div>
        </motion.div>
        <div className="p-4">
          <Link href="/dashboard/new">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 mb-6">
                <Plus className="h-4 w-4 mr-2" /> New Snippet
              </Button>
            </motion.div>
          </Link>
          <nav className="space-y-1">
            {navItems.map((item, i) => (
              <motion.div
                key={item.href}
                custom={i}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md hover:bg-gray-100",
                    pathname === item.href ? "bg-purple-50 text-purple-700" : "text-gray-700",
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" /> {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
        <motion.div
          className="absolute bottom-0 w-64 p-4 border-t"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <form action="/auth/signout" method="post">
            <motion.div whileHover={{ x: 5 }}>
              <Button variant="ghost" className="w-full justify-start text-gray-700">
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed top-0 left-0 h-full w-64 bg-white z-50 md:hidden"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-600" />
                <span className="font-bold">SnippetVault</span>
              </div>
              <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <Link href="/dashboard/new" onClick={() => setIsMobileMenuOpen(false)}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 mb-6">
                    <Plus className="h-4 w-4 mr-2" /> New Snippet
                  </Button>
                </motion.div>
              </Link>
              <nav className="space-y-1">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    custom={i}
                    variants={navItemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ x: 5 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md hover:bg-gray-100",
                        pathname === item.href ? "bg-purple-50 text-purple-700" : "text-gray-700",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4 mr-2" /> {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>
            <motion.div
              className="absolute bottom-0 w-64 p-4 border-t"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <form action="/auth/signout" method="post">
                <motion.div whileHover={{ x: 5 }}>
                  <Button variant="ghost" className="w-full justify-start text-gray-700">
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b p-4 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-600" />
              <span className="font-bold">SnippetVault</span>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
              <span className="sr-only">Open menu</span>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <motion.main
          className="flex-1 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
