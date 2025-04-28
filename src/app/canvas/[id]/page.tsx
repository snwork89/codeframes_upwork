"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User } from "lucide-react"
import HeaderComponent from "@/components/HeaderComponent"
import CodePreview from "@/components/CodePreview";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
  ReactFlowProvider,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import type { Database } from "@/lib/database.types"

const rfStyle = {
  backgroundColor: "rgb(247 247 247)",
}

const TextUpdaterNode = ({ data }: NodeProps) => {
  const { html, css, js, title }: any = data

  return (
    <div className="p-1">
      <div className="font-medium text-sm mb-1 px-1 truncate">{title}</div>
      <CodePreview html={html} css={css} js={js} width="300px" height="200px" />
    </div>
  )
}

function PublicCanvasContent() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [ownerName, setOwnerName] = useState<string | null>(null)
  const params = useParams()
  const canvasId = params.id as string
  const reactFlowInstance = useReactFlow()

  const supabase = createClientComponentClient<Database>()

  const nodeTypes: NodeTypes = {
    textUpdater: TextUpdaterNode,
  }

  useEffect(() => {
    async function loadPublicCanvas() {
      try {
        if (!canvasId) {
          setNotFound(true)
          return
        }

        console.log("Loading canvas with ID:", canvasId)

        // Get canvas settings by public access ID
        const { data: canvasSettings, error: settingsError } = await supabase
          .from("canvas_settings")
          .select("public_access_id, is_public, zoom, position_x, position_y, user_id")
          .eq("public_access_id", canvasId)
          .eq("is_public", true)
          .single()

        if (settingsError) {
          console.error("Canvas not found or not public:", settingsError)
          setNotFound(true)
          return
        }

        // Get user profile separately
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", canvasSettings.user_id)
          .single()

        if (profileError) {
          console.error("Error fetching user profile:", profileError)
        }

        // Set owner name
        const authorName = userProfile?.full_name || userProfile?.email?.split("@")[0] || "Anonymous"
        setOwnerName(authorName)

        console.log("Canvas settings found:", canvasSettings)

        // Set owner name
        // const profile = canvasSettings.profiles as any
        // setOwnerName(profile?.full_name || profile?.email?.split("@")[0] || "Anonymous")

        // Get ALL snippets from this user (not just public ones)
        // This allows the canvas owner to share their entire canvas layout
        const { data: snippets, error: snippetsError } = await supabase
          .from("snippets")
          .select("*")
          .eq("user_id", canvasSettings.user_id)

        if (snippetsError) {
          console.error("Error fetching snippets:", snippetsError)
          return
        }

        console.log("Snippets found:", snippets?.length || 0)

        // Get saved positions
        const { data: positions, error: positionsError } = await supabase
          .from("canvas_positions")
          .select("*")
          .eq("user_id", canvasSettings.user_id)

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

        if (snippets && snippets.length > 0) {
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
              },
              draggable: false, // Make nodes non-draggable in public view
              selectable: false, // Make nodes non-selectable in public view
            }
          })

          setNodes(snippetNodes)
        } else {
          console.log("No snippets found for this canvas")
        }

        // Set viewport after nodes are loaded
        setTimeout(() => {
          if (canvasSettings && reactFlowInstance) {
            reactFlowInstance.setViewport({
              x: canvasSettings.position_x || 0,
              y: canvasSettings.position_y || 0,
              zoom: canvasSettings.zoom || 1,
            })
          }
        }, 200)
      } catch (error) {
        console.error("Error loading public canvas:", error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    loadPublicCanvas()
  }, [canvasId, supabase, reactFlowInstance])

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderComponent />
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Canvas Not Found</h1>
            <p className="text-gray-600 mb-6">The canvas you're looking for doesn't exist or is not public.</p>
            <Link href="/explore">
              <Button className="bg-purple-600 hover:bg-purple-700">Explore Public Snippets</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const styledNodes = nodes.map((node) => ({
    ...node,
    style: {
      border: "1px solid #e5e7eb",
      borderRadius: "0.375rem",
      background: "white",
      opacity: node.data.is_public ? 1 : 0.5, // Make private snippets semi-transparent
    },
  }))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderComponent />

      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <Link href="/explore" className="flex items-center text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explore
          </Link>

          {ownerName && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-1" />
              <span>Canvas by {ownerName}</span>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">Note:</span> Semi-transparent snippets are private and only visible to the
            canvas owner.
          </p>
        </div>
      </div>

      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <ReactFlow
            nodes={styledNodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            style={rfStyle}
            zoomOnScroll
            panOnScroll
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        )}
      </div>
    </div>
  )
}

export default function PublicCanvasView() {
  return (
    <ReactFlowProvider>
      <PublicCanvasContent />
    </ReactFlowProvider>
  )
}
