import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Pencil } from "lucide-react"
import CodePreview from "@/components/CodePreview"
import type { Database } from "@/lib/database.types"

interface SnippetViewPageProps {
  params: {
    id: string
  }
}

export default async function SnippetViewPage({ params }: SnippetViewPageProps) {
  const { id } = params
  const supabase = createServerComponentClient<Database>({ cookies })

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Get snippet details
  const { data: snippet, error } = await supabase
    .from("snippets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !snippet) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <Link href={`/dashboard/edit/${snippet.id}`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{snippet.title}</h1>
          {snippet.description && <p className="text-gray-500">{snippet.description}</p>}
          <div className="flex flex-wrap gap-2 mt-3">
            {snippet.html_code && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">HTML</span>}
            {snippet.css_code && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">CSS</span>}
            {snippet.js_code && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">JS</span>}
            {snippet.is_public && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Public</span>}
          </div>
        </div>

        <Card className="mb-8 p-4">
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
        </Card>

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
      </div>
    </DashboardLayout>
  )
}
