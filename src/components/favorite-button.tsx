"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

interface FavoriteButtonProps {
  snippetId: string
  initialIsFavorited?: boolean
  onFavoriteChange?: (isFavorited: boolean) => void
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export default function FavoriteButton({
  snippetId,
  initialIsFavorited = false,
  onFavoriteChange,
  variant = "outline",
  size = "sm",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)

      if (user) {
        // Check if the snippet is already favorited
        const { data } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("snippet_id", snippetId)
          .single()

        setIsFavorited(!!data)
      }
    }

    checkAuth()
  }, [snippetId, supabase])

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to favorite snippets",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to favorite snippets",
          variant: "destructive",
        })
        return
      }

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("snippet_id", snippetId)

        if (error) throw error

        setIsFavorited(false)
        if (onFavoriteChange) onFavoriteChange(false)
        toast({
          title: "Removed from favorites",
          description: "Snippet removed from your favorites",
        })
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          snippet_id: snippetId,
        })

        if (error) throw error

        setIsFavorited(true)
        if (onFavoriteChange) onFavoriteChange(true)
        toast({
          title: "Added to favorites",
          description: "Snippet added to your favorites",
        })
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`${
        isFavorited ? "text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50" : ""
      }`}
    >
      <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""} ${size !== "icon" ? "mr-2" : ""}`} />
      {size !== "icon" && (isFavorited ? "Favorited" : "Favorite")}
    </Button>
  )
}
