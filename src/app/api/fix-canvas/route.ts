import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { nanoid } from "nanoid"
import type { Database } from "@/lib/database.types"

// Function to generate a random position within the visible area
function generateRandomPosition(index: number, count: number) {
  // Create a grid-like layout with some randomness
  const columns = Math.ceil(Math.sqrt(count))
  const row = Math.floor(index / columns)
  const col = index % columns

  // Base position with grid layout
  const baseX = col * 400 + 100
  const baseY = row * 300 + 100

  // Add some randomness to avoid perfect alignment
  const randomX = Math.floor(Math.random() * 100) - 50
  const randomY = Math.floor(Math.random() * 100) - 50

  return {
    x: baseX + randomX,
    y: baseY + randomY,
  }
}

export async function POST() {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  try {
    // Check if user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get all snippets for the user
    const { data: snippets, error: snippetsError } = await supabase.from("snippets").select("id").eq("user_id", user.id)

    if (snippetsError) {
      return NextResponse.json({ success: false, error: "Failed to fetch snippets" }, { status: 500 })
    }

    // Get existing positions
    const { data: existingPositions, error: positionsError } = await supabase
      .from("canvas_positions")
      .select("snippet_id")
      .eq("user_id", user.id)

    if (positionsError) {
      return NextResponse.json({ success: false, error: "Failed to fetch positions" }, { status: 500 })
    }

    // Create a set of snippet IDs that already have positions
    const snippetsWithPositions = new Set(existingPositions?.map((pos) => pos.snippet_id) || [])

    // Filter snippets that don't have positions
    const snippetsWithoutPositions = snippets?.filter((snippet) => !snippetsWithPositions.has(snippet.id)) || []

    let positionsCreated = 0

    // Create positions for snippets that don't have them
    if (snippetsWithoutPositions.length > 0) {
      const positionsToInsert = snippetsWithoutPositions.map((snippet, index) => {
        const position = generateRandomPosition(index, snippetsWithoutPositions.length)
        return {
          user_id: user.id,
          snippet_id: snippet.id,
          position_x: position.x,
          position_y: position.y,
          updated_at: new Date().toISOString(),
        }
      })

      const { error: insertError, data: insertedPositions } = await supabase
        .from("canvas_positions")
        .insert(positionsToInsert)
        .select()

      if (insertError) {
        return NextResponse.json({ success: false, error: "Failed to create positions" }, { status: 500 })
      }

      positionsCreated = insertedPositions?.length || 0
    }

    // Check if canvas settings exist
    const { data: settings, error: settingsError } = await supabase
      .from("canvas_settings")
      .select("id")
      .eq("user_id", user.id)

    let settingsCreated = false

    // Create canvas settings if they don't exist
    if (settingsError && settingsError.code === "PGRST116") {
      const publicAccessId = nanoid(10)

      const { error: insertError } = await supabase.from("canvas_settings").insert({
        user_id: user.id,
        zoom: 1.0,
        position_x: 0.0,
        position_y: 0.0,
        is_public: false,
        public_access_id: publicAccessId,
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        return NextResponse.json({ success: false, error: "Failed to create canvas settings" }, { status: 500 })
      }

      settingsCreated = true
    } else if (settingsError) {
      return NextResponse.json({ success: false, error: "Failed to check canvas settings" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      positionsCreated,
      settingsCreated,
    })
  } catch (error) {
    console.error("Error fixing canvas:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
