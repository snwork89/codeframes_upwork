import type React from "react"
import Link from "next/link"
import { Code, Plus, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r hidden md:block">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-600" />
            <span className="font-bold">SnippetVault</span>
          </div>
        </div>
        <div className="p-4">
          <Link href="/dashboard/new">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 mb-6">
              <Plus className="h-4 w-4 mr-2" /> New Snippet
            </Button>
          </Link>
          <nav className="space-y-1">
            <Link href="/dashboard" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
              All Snippets
            </Link>
            <Link
              href="/dashboard/favorites"
              className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              Favorites
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Settings className="h-4 w-4 mr-2" /> Settings
            </Link>
          </nav>
        </div>
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <form action="/auth/signout" method="post">
            <Button variant="ghost" className="w-full justify-start text-gray-700">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b p-4 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-600" />
              <span className="font-bold">SnippetVault</span>
            </div>
            <Button variant="ghost" size="sm">
              <span className="sr-only">Open menu</span>
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
                className="h-6 w-6"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
