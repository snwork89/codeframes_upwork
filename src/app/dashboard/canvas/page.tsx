"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import CodePreview from "@/components/CodePreview"
import { Pencil, Trash2, Plus, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Node,
  type Edge,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

type Snippet = Database["public"]["Tables"]["snippets"]["Row"]

const rfStyle = {
  backgroundColor: "rgb(247 247 247)",
}

const TextUpdaterNode = ({ data, selected }: NodeProps) => {
  const { html, css, js, title }:any = data

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

  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  const nodeTypes: NodeTypes = {
    textUpdater: TextUpdaterNode,
  }

  // Load snippets from Supabase
  useEffect(() => {
    async function loadSnippets() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push("/login")
          return
        }

        const { data: snippets, error } = await supabase
          .from("snippets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        if (snippets) {
          // Convert snippets to nodes
          const snippetNodes: Node[] = snippets.map((snippet, index) => ({
            id: snippet.id,
            type: "textUpdater",
            position: {
              x: 100 + (index % 3) * 350,
              y: 100 + Math.floor(index / 3) * 300,
            },
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
          }))

          setNodes(snippetNodes)
        }
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

    loadSnippets()
  }, [supabase, router])

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), [])

  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), [])

  const onConnect = useCallback((connection: any) => setEdges((eds) => addEdge(connection, eds)), [])

  const selectedNode:any = nodes.find((node) => node.id === selectedNodeId)

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
            <Button onClick={handleAddNewSnippet} size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-1" /> New
            </Button>
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
