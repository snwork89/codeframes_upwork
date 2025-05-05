"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wrench } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function FixCanvasButton() {
  const [isFixing, setIsFixing] = useState(false)

  const handleFixCanvas = async () => {
    setIsFixing(true)
    try {
      const response = await fetch("/api/fix-canvas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Canvas fixed",
          description: `Created ${data.positionsCreated} positions. ${data.settingsCreated ? "Created canvas settings." : ""}`,
        })

        // Reload the page to show the fixed canvas
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fix canvas",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fixing canvas:", error)
      toast({
        title: "Error",
        description: "Failed to fix canvas",
        variant: "destructive",
      })
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <Button onClick={handleFixCanvas} disabled={isFixing} size="sm" variant="outline" className="ml-2">
      <Wrench className="h-4 w-4 mr-1" />
      {isFixing ? "Fixing..." : "Fix Canvas"}
    </Button>
  )
}
