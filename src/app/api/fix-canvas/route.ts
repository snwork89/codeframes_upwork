import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all snippets for the user
    const { data: snippets, error: snippetsError } = await supabase.from("snippets").select("id").eq("user_id", user.id)

    if (snippetsError) {
      return NextResponse.json({ error: "Failed to fetch snippets" }, { status: 500 })
    }

    // For each snippet, check if it has a position
    let positionsCreated = 0
    for (let i = 0; i < snippets.length; i++) {
      const snippet = snippets[i]

      // Check if position exists
      const { data: position, error: positionError } = await supabase
        .from("canvas_positions")
        .select("id")
        .eq("user_id", user.id)
        .eq("snippet_id", snippet.id)
        .single()

      if (positionError && positionError.code !== "PGRST116") {
        console.error("Error checking position:", positionError)
      }

      // If no position exists, create one
      if (!position) {
        const { error: insertError } = await supabase.from("canvas_positions").insert({
          user_id: user.id,
          snippet_id: snippet.id,
          position_x: 100 + (i % 3) * 350,
          position_y: 100 + Math.floor(i / 3) * 300,
        })

        if (insertError) {
          console.error("Error creating position:", insertError)
        } else {
          positionsCreated++
        }
      }
    }

    // Ensure canvas settings exist
    const { data: settings, error: settingsError } = await supabase
      .from("canvas_settings")
      .select("id, public_access_id")
      .eq("user_id", user.id)
      .single()

    let settingsCreated = false
    let publicAccessId = settings?.public_access_id

    if (settingsError && settingsError.code === "PGRST116") {
      // If no settings exist, create them
      publicAccessId = Math.random().toString(36).substring(2, 12)

      const { error: insertError } = await supabase.from("canvas_settings").insert({
        user_id: user.id,
        zoom: 1.0,
        position_x: 0.0,
        position_y: 0.0,
        is_public: false,
        public_access_id: publicAccessId,
      })

      if (insertError) {
        console.error("Error creating canvas settings:", insertError)
      } else {
        settingsCreated = true
      }
    }

    return NextResponse.json({
      success: true,
      positionsCreated,
      settingsCreated,
      publicAccessId,
    })
  } catch (error) {
    console.error("Error fixing canvas:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
