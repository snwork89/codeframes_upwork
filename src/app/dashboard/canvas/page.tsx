"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import CodePreview from "@/components/CodePreview"
import { Pencil, Trash2, Plus, Save, X, Share2, Lock, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { nanoid } from "nanoid"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Database } from "@/lib/database.types"
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Node,
  type Edge,
  type NodeProps,
  type NodeTypes,
  type Viewport,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

type Snippet = Database["public"]["Tables"]["snippets"]["Row"]
type CanvasPosition = Database["public"]["Tables"]["canvas_positions"]["Row"]
type CanvasSettings = Database["public"]["Tables"]["canvas_settings"]["Row"]

const rfStyle = {
  backgroundColor: "rgb(247 247 247)",
}

const TextUpdaterNode = ({ data, selected }: NodeProps) => {
  const { html, css, js, title }: any = data

  return (
    <div className="p-1">
      <div className="font-medium text-sm mb-1 px-1 truncate">{title}</div>
      <CodePreview html={html} css={css} js={js} width="300px" height="200px" />
    </div>
  )
}

const generateId = () => `node-${Math.random().toString(36).substr(2, 9)}`

export default function CanvasView() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ html: "", css: "", js: "", title: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [savingCanvas, setSavingCanvas] = useState(false)
  const [isPublicCanvas, setIsPublicCanvas] = useState(false)
  const [publicAccessId, setPublicAccessId] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState("")
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  const reactFlowInstance = useReactFlow()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialLoadRef = useRef(true)

  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  const nodeTypes: NodeTypes = {
    textUpdater: TextUpdaterNode,
  }

  // Load snippets and canvas positions from Supabase
  useEffect(() => {
    async function loadSnippetsAndPositions() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push("/login")
          return
        }

        // Get canvas settings
        const { data: canvasSettings, error: settingsError } = await supabase
          .from("canvas_settings")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (settingsError && settingsError.code !== "PGRST116") {
          console.error("Error fetching canvas settings:", settingsError)
        }

        if (canvasSettings) {
          setIsPublicCanvas(canvasSettings.is_public)
          setPublicAccessId(canvasSettings.public_access_id)

          // Set share URL if public access is enabled
          if (canvasSettings.is_public && canvasSettings.public_access_id) {
            const baseUrl = window.location.origin
            setShareUrl(`${baseUrl}/canvas/${canvasSettings.public_access_id}`)
          }

          // Set viewport if we have saved settings
          if (reactFlowInstance && initialLoadRef.current) {
            reactFlowInstance.setViewport({
              x: canvasSettings.position_x,
              y: canvasSettings.position_y,
              zoom: canvasSettings.zoom,
            })
          }
        }

        // Get snippets
        const { data: snippets, error } = await supabase
          .from("snippets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        // Get saved positions
        const { data: positions, error: positionsError } = await supabase
          .from("canvas_positions")
          .select("*")
          .eq("user_id", user.id)

        if (positionsError) {
          console.error("Error fetching positions:", positionsError)
        }

        // Create a map of snippet positions
        const positionMap = new Map()
        if (positions) {
          positions.forEach((pos) => {
            positionMap.set(pos.snippet_id, { x: pos.position_x, y: pos.position_y })
          })
        }

        if (snippets) {
          // Convert snippets to nodes
          const snippetNodes: Node[] = snippets.map((snippet, index) => {
            // Use saved position if available, otherwise use default grid layout
            const position = positionMap.get(snippet.id) || {
              x: 100 + (index % 3) * 350,
              y: 100 + Math.floor(index / 3) * 300,
            }

            return {
              id: snippet.id,
              type: "textUpdater",
              position,
              data: {
                html: snippet.html_code || "",
                css: snippet.css_code || "",
                js: snippet.js_code || "",
                title: snippet.title,
                description: snippet.description,
                is_public: snippet.is_public,
                dbId: snippet.id,
              },
              draggable: true,
              selectable: true,
            }
          })

          setNodes(snippetNodes)
        }

        initialLoadRef.current = false
      } catch (error) {
        console.error("Error loading snippets:", error)
        toast({
          title: "Error",
          description: "Failed to load snippets",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadSnippetsAndPositions()
  }, [supabase, router, reactFlowInstance])

  // Save node positions when they change
  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      const updatedNodes = applyNodeChanges(changes, nds)

      // Check if any node position has changed
      const positionChanges = changes.filter((change:any) => change.type === "position" && change.position)

      if (positionChanges.length > 0) {
        // Debounce saving to database
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(() => {
          saveNodePositions(positionChanges, updatedNodes)
        }, 500)
      }

      return updatedNodes
    })
  }, [])

  // Save viewport (zoom and position) when it changes
  const onMoveEnd = useCallback((event: any, viewport: Viewport) => {
    saveCanvasSettings(viewport)
  }, [])

  // Save node positions to database
  const saveNodePositions = async (changes: any[], nodes: Node[]) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) return

      // Process each position change
      for (const change of changes) {
        const nodeId = change.id
        const node = nodes.find((n) => n.id === nodeId)

        if (node && change.position) {
          // Update or insert position in database
          const { error } = await supabase.from("canvas_positions").upsert(
            {
              user_id: user.id,
              snippet_id: nodeId,
              position_x: node.position.x,
              position_y: node.position.y,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,snippet_id",
            },
          )

          if (error) {
            console.error("Error saving node position:", error)
          }
        }
      }
    } catch (error) {
      console.error("Error saving node positions:", error)
    }
  }

  // Save canvas settings (zoom and position)
  const saveCanvasSettings = async (viewport: Viewport) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) return

      // Update or insert canvas settings
      const { error } = await supabase.from("canvas_settings").upsert(
        {
          user_id: user.id,
          zoom: viewport.zoom,
          position_x: viewport.x,
          position_y: viewport.y,
          updated_at: new Date().toISOString(),
          // Keep existing values for public_access_id and is_public
          public_access_id: publicAccessId,
          is_public: isPublicCanvas,
        },
        {
          onConflict: "user_id",
        },
      )

      if (error) {
        console.error("Error saving canvas settings:", error)
      }
    } catch (error) {
      console.error("Error saving canvas settings:", error)
    }
  }

  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), [])

  const onConnect = useCallback((connection: any) => setEdges((eds) => addEdge(connection, eds)), [])

  const selectedNode: any = nodes.find((node) => node.id === selectedNodeId)

  const handleNodeClick = (_: any, node: any) => {
    setSelectedNodeId(node.id)
    setEditData({
      html: node.data.html || "",
      css: node.data.css || "",
      js: node.data.js || "",
      title: node.data.title || "",
    })
  }

  const handleEditClick = () => {
    if (selectedNode) {
      setIsEditing(true)
    }
  }

  const handleSaveClick = async () => {
    if (!selectedNode) return

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

      // Update the node in the state
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  html: editData.html,
                  css: editData.css,
                  js: editData.js,
                  title: editData.title,
                },
              }
            : node,
        ),
      )

      // Update in the database
      const { error } = await supabase
        .from("snippets")
        .update({
          title: editData.title,
          html_code: editData.html,
          css_code: editData.css,
          js_code: editData.js,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedNode.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Snippet updated successfully",
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating snippet:", error)
      toast({
        title: "Error",
        description: "Failed to update snippet",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (selectedNode) {
      setEditData({
        html: selectedNode.data.html || "",
        css: selectedNode.data.css || "",
        js: selectedNode.data.js || "",
        title: selectedNode.data.title || "",
      })
    }
    setIsEditing(false)
  }

  const handleDeleteClick = async () => {
    if (!selectedNode) return

    if (!confirm("Are you sure you want to delete this snippet?")) return

    setDeleting(true)
    try {
      const { error } = await supabase.from("snippets").delete().eq("id", selectedNode.id)

      if (error) throw error

      // Remove the node from the state
      setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId))
      setSelectedNodeId(null)

      toast({
        title: "Success",
        description: "Snippet deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting snippet:", error)
      toast({
        title: "Error",
        description: "Failed to delete snippet",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleAddNewSnippet = () => {
    router.push("/dashboard/new")
  }

  const handleTogglePublicCanvas = async (isPublic: boolean) => {
    setSavingCanvas(true)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push("/login")
        return
      }

      // Generate a public access ID if making public and none exists
      let accessId = publicAccessId
      if (isPublic && !accessId) {
        accessId = nanoid(10)
        setPublicAccessId(accessId)
      }

      // Update canvas settings
      const { error } = await supabase.from("canvas_settings").upsert(
        {
          user_id: user.id,
          is_public: isPublic,
          public_access_id: accessId,
          updated_at: new Date().toISOString(),
          // Keep existing viewport settings
          zoom: reactFlowInstance ? reactFlowInstance.getViewport().zoom : 1,
          position_x: reactFlowInstance ? reactFlowInstance.getViewport().x : 0,
          position_y: reactFlowInstance ? reactFlowInstance.getViewport().y : 0,
        },
        {
          onConflict: "user_id",
        },
      )

      if (error) throw error

      setIsPublicCanvas(isPublic)

      // Update share URL
      if (isPublic && accessId) {
        const baseUrl = window.location.origin
        setShareUrl(`${baseUrl}/canvas/${accessId}`)
      } else {
        setShareUrl("")
      }

      toast({
        title: "Success",
        description: isPublic ? "Canvas is now public" : "Canvas is now private",
      })
    } catch (error) {
      console.error("Error updating canvas visibility:", error)
      toast({
        title: "Error",
        description: "Failed to update canvas visibility",
        variant: "destructive",
      })
    } finally {
      setSavingCanvas(false)
    }
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    })
  }

  const styledNodes = nodes.map((node) => ({
    ...node,
    style: {
      border: node.id === selectedNodeId ? "2px solid #7c3aed" : "1px solid #e5e7eb",
      borderRadius: "0.375rem",
      background: "white",
    },
  }))

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-64px)] flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-white p-4 overflow-y-auto">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Snippet Editor</h2>
            <div className="flex space-x-2">
              <Button onClick={handleAddNewSnippet} size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-1" /> New
              </Button>

              <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4 mr-1" /> Share
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Canvas</DialogTitle>
                    <DialogDescription>
                      Make your canvas public to share it with others. Only public snippets will be visible to others.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex items-center space-x-2 py-4">
                    <Switch
                      id="public-canvas"
                      checked={isPublicCanvas}
                      onCheckedChange={handleTogglePublicCanvas}
                      disabled={savingCanvas}
                    />
                    <Label htmlFor="public-canvas">Make canvas public</Label>
                  </div>

                  {isPublicCanvas && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Input value={shareUrl} readOnly className="flex-1" />
                        <Button onClick={copyShareLink} size="sm">
                          Copy
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <Globe className="h-4 w-4 inline mr-1" />
                        Only public snippets will be visible to others
                      </p>
                    </div>
                  )}

                  {!isPublicCanvas && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span>Your canvas is currently private</span>
                    </div>
                  )}

                  <DialogFooter>
                    <Button onClick={() => setIsShareDialogOpen(false)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {selectedNode ? (
            <>
              <div className="mb-4">
                <h3 className="font-medium mb-1">{selectedNode.data.title}</h3>
                <div className="flex space-x-2">
                  {!isEditing ? (
                    <>
                      <Button size="sm" variant="outline" onClick={handleEditClick} className="flex-1">
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDeleteClick}
                        disabled={deleting}
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSaveClick}
                        disabled={saving}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit} className="flex-1">
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">HTML</label>
                    <textarea
                      value={editData.html}
                      onChange={(e) => setEditData({ ...editData, html: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                      rows={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CSS</label>
                    <textarea
                      value={editData.css}
                      onChange={(e) => setEditData({ ...editData, css: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                      rows={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">JavaScript</label>
                    <textarea
                      value={editData.js}
                      onChange={(e) => setEditData({ ...editData, js: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                      rows={5}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Preview</h4>
                    <CodePreview
                      html={selectedNode.data.html}
                      css={selectedNode.data.css}
                      js={selectedNode.data.js}
                      width="100%"
                      height="200px"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">HTML</h4>
                    <pre className="bg-gray-50 p-2 rounded-md text-xs overflow-x-auto max-h-32 overflow-y-auto">
                      {selectedNode.data.html || "No HTML code"}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">CSS</h4>
                    <pre className="bg-gray-50 p-2 rounded-md text-xs overflow-x-auto max-h-32 overflow-y-auto">
                      {selectedNode.data.css || "No CSS code"}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">JavaScript</h4>
                    <pre className="bg-gray-50 p-2 rounded-md text-xs overflow-x-auto max-h-32 overflow-y-auto">
                      {selectedNode.data.js || "No JavaScript code"}
                    </pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">Select a snippet to view or edit</div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <ReactFlow
              nodes={styledNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              onMoveEnd={onMoveEnd}
              fitView
              style={rfStyle}
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
