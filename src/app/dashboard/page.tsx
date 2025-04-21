import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Code, ExternalLink, Pencil, Layers } from "lucide-react"
import type { Database } from "@/lib/database.types"

type Snippet = Database["public"]["Tables"]["snippets"]["Row"]

export default async function Dashboard() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Get user's snippets
  const { data: snippets, error } = await supabase
    .from("snippets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching snippets:", error)
  }

  // Get user's subscription
  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single()

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Snippets</h1>
          <div className="flex gap-2">
            <Link href="/dashboard/canvas">
              <Button variant="outline" className="flex items-center gap-2">
                <Layers className="h-4 w-4" /> Canvas View
              </Button>
            </Link>
            <Link href="/dashboard/new">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" /> New Snippet
              </Button>
            </Link>
          </div>
        </div>

        {subscription && (
          <div className="mb-6 bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  {snippets?.length || 0} of {subscription.snippet_limit} snippets used
                </p>
                <div className="w-64 h-2 bg-gray-200 rounded-full mt-2">
                  <div
                    className="h-2 bg-purple-600 rounded-full"
                    style={{
                      width: `${Math.min(((snippets?.length || 0) / subscription.snippet_limit) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              {(snippets?.length || 0) >= subscription.snippet_limit && subscription.plan_type === "free" && (
                <Link href="/dashboard/settings">
                  <Button variant="outline">Upgrade Plan</Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {snippets && snippets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {snippets.map((snippet) => (
              <Card key={snippet.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{snippet.title}</CardTitle>
                </CardHeader>
                <CardContent className="py-2 flex-grow">
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {snippet.description || "No description provided"}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {snippet.html_code && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">HTML</span>
                    )}
                    {snippet.css_code && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">CSS</span>
                    )}
                    {snippet.js_code && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">JS</span>
                    )}
                    {snippet.is_public && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Public</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Created: {new Date(snippet.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between">
                  <Link href={`/dashboard/edit/${snippet.id}`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </Link>
                  <Link href={`/dashboard/view/${snippet.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" /> View
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-purple-100">
                  <Code className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h2 className="text-xl font-medium mb-2">You don't have any snippets yet</h2>
              <p className="text-gray-500 mb-4">Create your first code snippet to get started</p>
              <Link href="/dashboard/new">
                <Button className="bg-purple-600 hover:bg-purple-700">Create New Snippet</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
