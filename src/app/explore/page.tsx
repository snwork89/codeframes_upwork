
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import ExplorePage from "@/components/ExplorePageComponent"

export const revalidate = 3600 // Revalidate this page every hour

export default async function Page() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Get public canvases
  const { data: publicCanvasesData, error: canvasError } = await supabase
    .from("canvas_settings")
    .select("id, public_access_id, updated_at, user_id, is_public")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(6)

  // Get user profiles for the canvas owners
  let publicCanvases: any[] = []
  if (publicCanvasesData && publicCanvasesData.length > 0) {
    const userIds = publicCanvasesData.map((canvas) => canvas.user_id)
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds)

    // Map profiles to canvases
    publicCanvases = publicCanvasesData.map((canvas) => {
      const profile = profiles?.find((p) => p.id === canvas.user_id)
      return {
        ...canvas,
        profiles: profile,
      }
    })
  }

  // Get popular public snippets
  const { data: popularSnippets, error: popularError } = await supabase
    .from("snippets")
    .select("*, profiles:user_id(full_name, email)")
    .eq("is_public", true)
    .order("views", { ascending: false })
    .limit(6)

  // Get recent public snippets
  const { data: recentSnippets, error: recentError } = await supabase
    .from("snippets")
    .select("*, profiles:user_id(full_name, email)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(6)

  if (popularError || recentError || canvasError) {
    console.error("Error fetching data:", popularError || recentError || canvasError)
  }

  return (
    <ExplorePage
      publicCanvases={publicCanvases || []}
      popularSnippets={popularSnippets || []}
      recentSnippets={recentSnippets || []}
    />
  )
}
