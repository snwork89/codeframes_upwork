import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Code, Eye, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import CodePreview from "@/components/CodePreview";
import FavoriteButton from "@/components/favorite-button"
import type { Database } from "@/lib/database.types"

type Snippet = Database["public"]["Tables"]["snippets"]["Row"]

export const revalidate = 3600 // Revalidate this page every hour

export default async function ExplorePage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Get popular public snippets
  const { data: popularSnippets, error: popularError } = await supabase
    .from("snippets")
    .select("*, user_id")
    .eq("is_public", true)
    .order("views", { ascending: false })
    .limit(6)

  // Get recent public snippets
  const { data: recentSnippets, error: recentError } = await supabase
    .from("snippets")
    .select("*, user_id")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(6)

  if (popularError || recentError) {
    console.error("Error fetching snippets:", popularError || recentError)
  }

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

      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Explore Code Snippets</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-purple-100">
            Discover and learn from public code snippets shared by the community
          </p>
          <Link href="/signup">
            <Button className="bg-white text-purple-600 hover:bg-gray-100">Create Your Own Snippets</Button>
          </Link>
        </div>
      </div>

      {/* Popular Snippets */}
      <div className="container mx-auto py-12 px-4 md:px-6">
        <h2 className="text-2xl font-bold mb-6">Popular Snippets</h2>
        {popularSnippets && popularSnippets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularSnippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <p className="text-gray-500">No popular snippets found yet. Be the first to share!</p>
          </div>
        )}

        {/* Recent Snippets */}
        <h2 className="text-2xl font-bold mt-12 mb-6">Recently Added</h2>
        {recentSnippets && recentSnippets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSnippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <p className="text-gray-500">No recent snippets found yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SnippetCard({ snippet }: { snippet: any }) {
  const authorName = "User" // Simplified for now

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{snippet.title}</CardTitle>
          <FavoriteButton snippetId={snippet.id} size="icon" />
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span>By {authorName}</span>
          <span className="mx-2">•</span>
          <span className="flex items-center">
            <Eye className="h-4 w-4 mr-1" /> {snippet.views}
          </span>
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <div className="mb-4">
          <CodePreview
            html={snippet.html_code || ""}
            css={snippet.css_code || ""}
            js={snippet.js_code || ""}
            width="100%"
            height="150px"
          />
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{snippet.description || "No description provided"}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {snippet.html_code && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">HTML</span>}
          {snippet.css_code && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">CSS</span>}
          {snippet.js_code && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">JS</span>}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/snippet/${snippet.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" /> View Snippet
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
