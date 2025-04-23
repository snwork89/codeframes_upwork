"use client"

import { useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

interface ViewCounterProps {
  snippetId: string
}

export default function ViewCounter({ snippetId }: ViewCounterProps) {
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const incrementViewCount = async () => {
      try {
        // First get the current view count
        const { data, error } = await supabase.from("snippets").select("views").eq("id", snippetId).single()

        if (error) {
          console.error("Error fetching view count:", error)
          return
        }

        // Increment the view count
        const currentViews = data.views || 0
        const newViews = currentViews + 1

        // Update the snippet with the new view count
        const { error: updateError } = await supabase.from("snippets").update({ views: newViews }).eq("id", snippetId)

        if (updateError) {
          console.error("Error updating view count:", updateError)
        }
      } catch (error) {
        console.error("Error in view counter:", error)
      }
    }

    // Use localStorage to prevent multiple counts from the same user
    const viewedSnippets = JSON.parse(localStorage.getItem("viewedSnippets") || "[]")
    if (!viewedSnippets.includes(snippetId)) {
      incrementViewCount()
      localStorage.setItem("viewedSnippets", JSON.stringify([...viewedSnippets, snippetId]))
    }
  }, [snippetId, supabase])

  // This component doesn't render anything visible
  return null
}
