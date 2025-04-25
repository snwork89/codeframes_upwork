"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import type { Database } from "@/lib/database.types"

export default function EditSnippet() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [htmlCode, setHtmlCode] = useState("")
  const [cssCode, setCssCode] = useState("")
  const [jsCode, setJsCode] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewActive, setPreviewActive] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const router = useRouter()
  const params = useParams()
  const snippetId = params.id as string
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchSnippet() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push("/login")
          return
        }

        // Get snippet details
        const { data: snippet, error } = await supabase
          .from("snippets")
          .select("*")
          .eq("id", snippetId)
          .eq("user_id", user.id)
          .single()

        if (error || !snippet) {
          console.error("Error fetching snippet:", error)
          setNotFound(true)
          return
        }

        // Set form values
        setTitle(snippet.title)
        setDescription(snippet.description || "")
        setHtmlCode(snippet.html_code || "")
        setCssCode(snippet.css_code || "")
        setJsCode(snippet.js_code || "")
        setIsPublic(snippet.is_public)
      } catch (error) {
        console.error("Error fetching snippet:", error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchSnippet()
  }, [snippetId, supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push("/login")
        return
      }

      // Update the snippet
      const { error } = await supabase
        .from("snippets")
        .update({
          title,
          description,
          html_code: htmlCode,
          css_code: cssCode,
          js_code: jsCode,
          is_public: isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq("id", snippetId)
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Success!",
        description: "Your snippet has been updated",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating snippet:", error)
      toast({
        title: "Error",
        description: "Failed to update snippet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const renderPreview = () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>${jsCode}</script>
        </body>
      </html>
    `

    return <iframe srcDoc={html} title="preview" className="w-full h-full border-0 bg-white" sandbox="allow-scripts" />
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Snippet Not Found</h1>
            <p className="text-gray-600 mb-6">
              The snippet you're looking for doesn't exist or you don't have permission to edit it.
            </p>
            <Link href="/dashboard">
              <Button className="bg-purple-600 hover:bg-purple-700">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Edit Snippet</h1>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Snippet Details</CardTitle>
                    <CardDescription>Edit the basic information about your code snippet</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="My Awesome Snippet"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="A brief description of what this snippet does"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                      <Label htmlFor="public">Make this snippet public</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Code</CardTitle>
                    <CardDescription>Edit your HTML, CSS, and JavaScript code</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="html">
                      <TabsList className="mb-4">
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="css">CSS</TabsTrigger>
                        <TabsTrigger value="js">JavaScript</TabsTrigger>
                      </TabsList>
                      <TabsContent value="html">
                        <Textarea
                          value={htmlCode}
                          onChange={(e) => setHtmlCode(e.target.value)}
                          placeholder="<div>Your HTML code here</div>"
                          className="font-mono h-64"
                        />
                      </TabsContent>
                      <TabsContent value="css">
                        <Textarea
                          value={cssCode}
                          onChange={(e) => setCssCode(e.target.value)}
                          placeholder="body { margin: 0; }"
                          className="font-mono h-64"
                        />
                      </TabsContent>
                      <TabsContent value="js">
                        <Textarea
                          value={jsCode}
                          onChange={(e) => setJsCode(e.target.value)}
                          placeholder="console.log('Hello world');"
                          className="font-mono h-64"
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPreviewActive(!previewActive)}
                      className="w-full"
                    >
                      {previewActive ? "Hide Preview" : "Show Preview"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="space-y-6">
                {previewActive ? (
                  <Card className="h-[600px]">
                    <CardHeader>
                      <CardTitle>Preview</CardTitle>
                      <CardDescription>Live preview of your code</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[500px]">{renderPreview()}</CardContent>
                  </Card>
                ) : (
                  <Card className="h-[600px] flex items-center justify-center">
                    <CardContent className="text-center">
                      <p className="text-gray-500">Click "Show Preview" to see your code in action</p>
                    </CardContent>
                  </Card>
                )}

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={saving || !title}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}
