import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Verify the favorite belongs to the user
    const { data: favorite, error: favoriteError } = await supabase
      .from("favorites")
      .select("user_id")
      .eq("id", id)
      .single()

    if (favoriteError || !favorite) {
      return NextResponse.redirect(new URL("/dashboard/favorites?error=not_found", request.url))
    }

    if (favorite.user_id !== user.id) {
      return NextResponse.redirect(new URL("/dashboard/favorites?error=unauthorized", request.url))
    }

    // Delete the favorite
    const { error: deleteError } = await supabase.from("favorites").delete().eq("id", id)

    if (deleteError) {
      return NextResponse.redirect(new URL("/dashboard/favorites?error=delete_failed", request.url))
    }

    // Redirect back to favorites page
    return NextResponse.redirect(new URL("/dashboard/favorites?removed=true", request.url))
  } catch (error) {
    console.error("Error removing favorite:", error)
    return NextResponse.redirect(new URL("/dashboard/favorites?error=unknown", request.url))
  }
}
