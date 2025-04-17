"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"

export default function NewSnippet() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [htmlCode, setHtmlCode] = useState("")
  const [cssCode, setCssCode] = useState("")
  const [jsCode, setJsCode] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewActive, setPreviewActive] = useState(false)

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to create a snippet",
          variant: "destructive",
        })
        return
      }

      // Check if user has reached their snippet limit
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("snippet_limit")
        .eq("user_id", session.user.id)
        .single()

      if (subscriptionError) {
        throw subscriptionError
      }

      // Count user's existing snippets
      const { count, error: countError } = await supabase
        .from("snippets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id)

      if (countError) {
        throw countError
      }

      if (count !== null && count >= subscriptionData.snippet_limit) {
        toast({
          title: "Limit reached",
          description: "You've reached your snippet limit. Please upgrade your plan to create more snippets.",
          variant: "destructive",
        })
        return
      }

      // Create the snippet
      const { error } = await supabase.from("snippets").insert({
        title,
        description,
        html_code: htmlCode,
        css_code: cssCode,
        js_code: jsCode,
        user_id: session.user.id,
        is_public: isPublic,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Success!",
        description: "Your snippet has been created",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error creating snippet:", error)
      toast({
        title: "Error",
        description: "Failed to create snippet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Snippet</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Snippet Details</CardTitle>
                  <CardDescription>Enter the basic information about your code snippet</CardDescription>
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
                  <CardDescription>Enter your HTML, CSS, and JavaScript code</CardDescription>
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

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading || !title}>
                {loading ? "Creating..." : "Create Snippet"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
