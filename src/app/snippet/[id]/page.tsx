import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Code, ArrowLeft, Eye, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import CodePreview from "@/components/CodePreview"
import ViewCounter from "@/components/view-counter"
import type { Database } from "@/lib/database.types"

type Snippet = Database["public"]["Tables"]["snippets"]["Row"]

interface SnippetPageProps {
  params: {
    id: string
  }
}

export default async function SnippetPage({ params }: SnippetPageProps) {
  const { id } = params
  const supabase = createServerComponentClient<Database>({ cookies })

  // Get snippet details
  const { data: snippet, error } = await supabase
    .from("snippets")
    .select("*, profiles(full_name, email)")
    .eq("id", id)
    .eq("is_public", true)
    .single()

  if (error || !snippet) {
    notFound()
  }

  const authorName = snippet.profiles?.full_name || snippet.profiles?.email?.split("@")[0] || "Anonymous"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto py-4 px-4 md:px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Code className="h-6 w-6 text-purple-600" />
            <span className="font-bold text-xl">SnippetVault</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-purple-600 hover:bg-purple-700">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-6">
          <Link href="/explore" className="flex items-center text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explore
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{snippet.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <span>By {authorName}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(snippet.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{snippet.views} views</span>
              </div>
            </div>
          </div>

          {snippet.description && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Description</h2>
              <p className="text-gray-700">{snippet.description}</p>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Preview</h2>
            <div className="border rounded-lg overflow-hidden">
              <CodePreview
                html={snippet.html_code || ""}
                css={snippet.css_code || ""}
                js={snippet.js_code || ""}
                width="100%"
                height="300px"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {snippet.html_code && (
              <div>
                <h3 className="text-md font-medium mb-2 flex items-center">
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs mr-2">HTML</span>
                  HTML Code
                </h3>
                <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto max-h-80 overflow-y-auto border">
                  {snippet.html_code}
                </pre>
              </div>
            )}

            {snippet.css_code && (
              <div>
                <h3 className="text-md font-medium mb-2 flex items-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mr-2">CSS</span>
                  CSS Code
                </h3>
                <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto max-h-80 overflow-y-auto border">
                  {snippet.css_code}
                </pre>
              </div>
            )}

            {snippet.js_code && (
              <div>
                <h3 className="text-md font-medium mb-2 flex items-center">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs mr-2">JS</span>
                  JavaScript Code
                </h3>
                <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto max-h-80 overflow-y-auto border">
                  {snippet.js_code}
                </pre>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/signup">
              <Button className="bg-purple-600 hover:bg-purple-700">Create Your Own Snippets</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Invisible component to increment view count */}
      <ViewCounter snippetId={snippet.id} />
    </div>
  )
}
