"use client"

import { useEffect, useState } from "react"

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })

      const target = e.target as HTMLElement
      setIsPointer(window.getComputedStyle(target).cursor === "pointer")
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    window.addEventListener("mousemove", updatePosition)
    window.addEventListener("mouseenter", handleMouseEnter)
    window.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", updatePosition)
      window.removeEventListener("mouseenter", handleMouseEnter)
      window.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  // Don't show custom cursor on mobile devices
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
    return null
  }

  return (
    <>
      <div
        className={`fixed pointer-events-none z-50 rounded-full mix-blend-difference transition-transform duration-150 ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${isClicking ? "scale-90" : "scale-100"}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isPointer ? "60px" : "20px",
          height: isPointer ? "60px" : "20px",
          backgroundColor: isPointer ? "rgba(255, 255, 255, 0.2)" : "white",
          transform: `translate(-50%, -50%) ${isPointer ? "scale(1.2)" : "scale(1)"}`,
          border: isPointer ? "1px solid rgba(255, 255, 255, 0.5)" : "none",
          transition: "width 0.2s, height 0.2s, background-color 0.2s, transform 0.1s",
        }}
      />
      <div
        className={`fixed pointer-events-none z-50 rounded-full bg-purple-600 transition-transform duration-75 ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${isClicking ? "scale-90" : "scale-100"}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "4px",
          height: "4px",
          transform: "translate(-50%, -50%)",
        }}
      />
      <style jsx global>{`
        body {
          cursor: none;
        }
        
        @media (max-width: 768px) {
          body {
            cursor: auto;
          }
        }
      `}</style>
    </>
  )
}
