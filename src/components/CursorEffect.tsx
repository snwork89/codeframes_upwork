"use client"

import { useEffect, useState } from "react"

export default function CursorEffect() {
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hidden, setHidden] = useState(true)
  const [clicked, setClicked] = useState(false)
  const [linkHovered, setLinkHovered] = useState(false)

  // Only run on client-side
  useEffect(() => {
    setMounted(true)

    // Don't apply custom cursor on mobile/touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseEnter = () => setHidden(false)
    const handleMouseLeave = () => setHidden(true)
    const handleMouseDown = () => setClicked(true)
    const handleMouseUp = () => setClicked(false)

    const handleLinkHoverStart = (e: MouseEvent) => {
      // Check if the hovered element is a button, link, or has a pointer cursor
      const target = e.target as HTMLElement
      const computed = window.getComputedStyle(target)
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        computed.cursor === "pointer"
      ) {
        setLinkHovered(true)
      }
    }

    const handleLinkHoverEnd = () => {
      setLinkHovered(false)
    }

    document.addEventListener("mousemove", updatePosition)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mouseover", handleLinkHoverStart)
    document.addEventListener("mouseout", handleLinkHoverEnd)

    // Remove default cursor
    document.documentElement.classList.add("no-cursor")

    return () => {
      document.removeEventListener("mousemove", updatePosition)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mouseover", handleLinkHoverStart)
      document.removeEventListener("mouseout", handleLinkHoverEnd)
      document.documentElement.classList.remove("no-cursor")
    }
  }, [])

  // Don't render anything on server-side or on mobile devices
  if (!mounted) return null

  // Check for mobile devices after mounting
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null
  }

  return (
    <>
      {/* Main cursor */}
      <div
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-300 ${
          hidden ? "opacity-0" : "opacity-100"
        }`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        {/* Outer ring */}
        <div
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
            linkHovered
              ? "w-12 h-12 border-2 border-purple-500 bg-purple-100/20 backdrop-blur-sm"
              : "w-8 h-8 border border-purple-500/50 bg-transparent"
          } ${clicked ? "scale-90" : "scale-100"}`}
        ></div>

        {/* Inner dot */}
        <div
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600 transition-all duration-300 ${
            linkHovered ? "w-2 h-2 opacity-70" : "w-3 h-3"
          } ${clicked ? "scale-75" : "scale-100"}`}
        ></div>
      </div>

      {/* Cursor trail */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9998] w-6 h-6 rounded-full bg-purple-400/20 blur-sm transition-opacity duration-300"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
          opacity: hidden ? 0 : 0.5,
        }}
      ></div>

      <style jsx global>{`
        .no-cursor {
          cursor: none !important;
        }
        
        @media (pointer: coarse) {
          .no-cursor {
            cursor: auto !important;
          }
        }
      `}</style>
    </>
  )
}
