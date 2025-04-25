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
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
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

export default function PublicCanvasView() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [ownerName, setOwnerName] = useState<string | null>(null)
  const params = useParams()
  const canvasId = params.id as string

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

        // Get canvas settings by public access ID
        const { data: canvasSettings, error: settingsError } = await supabase
          .from("canvas_settings")
          .select("*, profiles:user_id(full_name, email)")
          .eq("public_access_id", canvasId)
          .eq("is_public", true)
          .single()

        if (settingsError || !canvasSettings) {
          console.error("Canvas not found or not public:", settingsError)
          setNotFound(true)
          return
        }

        // Set owner name
        const profile = canvasSettings.profiles as any
        setOwnerName(profile?.full_name || profile?.email?.split("@")[0] || "Anonymous")

        // Get public snippets from this user
        const { data: snippets, error: snippetsError } = await supabase
          .from("snippets")
          .select("*")
          .eq("user_id", canvasSettings.user_id)
          .eq("is_public", true)

        if (snippetsError) {
          console.error("Error fetching snippets:", snippetsError)
          return
        }

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
              },
              draggable: false, // Make nodes non-draggable in public view
              selectable: false, // Make nodes non-selectable in public view
            }
          })

          setNodes(snippetNodes)
        }

        // Set viewport if we have saved settings
        setTimeout(() => {
          const flowInstance = document.querySelector(".react-flow")
          if (flowInstance && typeof (flowInstance as any).setViewport === "function") {
            ;(flowInstance as any).setViewport({
              x: canvasSettings.position_x,
              y: canvasSettings.position_y,
              zoom: canvasSettings.zoom,
            })
          }
        }, 100)
      } catch (error) {
        console.error("Error loading public canvas:", error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    loadPublicCanvas()
  }, [canvasId, supabase])

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
