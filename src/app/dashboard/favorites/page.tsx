import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Heart } from "lucide-react"
import type { Database } from "@/lib/database.types"

export default async function FavoritesPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Get user's favorites with snippet details
  const { data: favorites, error } = await supabase
    .from("favorites")
    .select(
      `
      id,
      created_at,
      snippets (
        id,
        title,
        description,
        html_code,
        css_code,
        js_code,
        created_at,
        is_public,
        views,
        profiles (
          full_name,
          email
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching favorites:", error)
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Favorites</h1>
          <Link href="/explore">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Heart className="h-4 w-4 mr-2" /> Explore More Snippets
            </Button>
          </Link>
        </div>

        {favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite:any) => {
              const snippet = favorite.snippets
              if (!snippet) return null

              const authorName = snippet.profiles?.full_name || snippet.profiles?.email?.split("@")[0] || "Anonymous"

              return (
                <Card key={favorite.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{snippet.title}</CardTitle>
                    <div className="text-sm text-gray-500">By {authorName}</div>
                  </CardHeader>
                  <CardContent className="py-2 flex-grow">
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {snippet.description || "No description provided"}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {snippet.html_code && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">HTML</span>
                      )}
                      {snippet.css_code && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">CSS</span>
                      )}
                      {snippet.js_code && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">JS</span>
                      )}
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {snippet.views} views
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      Favorited on: {new Date(favorite.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between">
                    <Link href={`/snippet/${snippet.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" /> View
                      </Button>
                    </Link>
                    <Link href={`/dashboard/favorites/remove/${favorite.id}`}>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Heart className="h-4 w-4 mr-2 fill-current" /> Remove
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-purple-100">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h2 className="text-xl font-medium mb-2">You don't have any favorites yet</h2>
              <p className="text-gray-500 mb-4">Explore public snippets and add them to your favorites</p>
              <Link href="/explore">
                <Button className="bg-purple-600 hover:bg-purple-700">Explore Snippets</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
