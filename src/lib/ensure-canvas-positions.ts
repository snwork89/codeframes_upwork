import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export async function ensureCanvasPositions(userId: string) {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Get all snippets for the user
  const { data: snippets, error: snippetsError } = await supabase.from("snippets").select("id").eq("user_id", userId)

  if (snippetsError) {
    console.error("Error fetching snippets:", snippetsError)
    return
  }

  // For each snippet, check if it has a position
  for (let i = 0; i < snippets.length; i++) {
    const snippet = snippets[i]

    // Check if position exists
    const { data: position, error: positionError } = await supabase
      .from("canvas_positions")
      .select("id")
      .eq("user_id", userId)
      .eq("snippet_id", snippet.id)
      .single()

    if (positionError && positionError.code !== "PGRST116") {
      console.error("Error checking position:", positionError)
    }

    // If no position exists, create one
    if (!position) {
      const { error: insertError } = await supabase.from("canvas_positions").insert({
        user_id: userId,
        snippet_id: snippet.id,
        position_x: 100 + (i % 3) * 350,
        position_y: 100 + Math.floor(i / 3) * 300,
      })

      if (insertError) {
        console.error("Error creating position:", insertError)
      }
    }
  }

  // Ensure canvas settings exist
  const { data: settings, error: settingsError } = await supabase
    .from("canvas_settings")
    .select("id")
    .eq("user_id", userId)
    .single()

  if (settingsError && settingsError.code !== "PGRST116") {
    console.error("Error checking canvas settings:", settingsError)
  }

  // If no settings exist, create them
  if (!settings) {
    const publicAccessId = Math.random().toString(36).substring(2, 12)

    const { error: insertError } = await supabase.from("canvas_settings").insert({
      user_id: userId,
      zoom: 1.0,
      position_x: 0.0,
      position_y: 0.0,
      is_public: false,
      public_access_id: publicAccessId,
    })

    if (insertError) {
      console.error("Error creating canvas settings:", insertError)
    }
  }
}
