"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface Snippet {
  id: number
  title: string
  language: string
  color: string
  x: number
  y: number
}

export default function InteractiveCanvas() {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    // Generate random snippets
    const sampleSnippets: Snippet[] = [
      {
        id: 1,
        title: "Navigation Bar",
        language: "HTML",
        color: "bg-orange-500",
        x: 10,
        y: 20,
      },
      {
        id: 2,
        title: "Animation",
        language: "CSS",
        color: "bg-blue-500",
        x: 60,
        y: 30,
      },
      {
        id: 3,
        title: "API Call",
        language: "JS",
        color: "bg-yellow-500",
        x: 30,
        y: 70,
      },
      {
        id: 4,
        title: "Modal Dialog",
        language: "React",
        color: "bg-cyan-500",
        x: 70,
        y: 60,
      },
      {
        id: 5,
        title: "Form Validation",
        language: "JS",
        color: "bg-yellow-500",
        x: 20,
        y: 50,
      },
      {
        id: 6,
        title: "Grid Layout",
        language: "CSS",
        color: "bg-blue-500",
        x: 50,
        y: 10,
      },
    ]

    const timer = setTimeout(() => {
      setSnippets(sampleSnippets)
    }, 500)

    return () => clearTimeout(timer)
  }, [isVisible])

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto h-[500px] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 shadow-lg overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-20">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`col-${i}`} className="border-r border-purple-300 h-full" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`row-${i}`} className="border-b border-purple-300 w-full" />
          ))}
        </div>

        {/* Snippets */}
        {snippets.map((snippet) => (
          <motion.div
            key={snippet.id}
            className="absolute cursor-grab active:cursor-grabbing"
            style={{ left: `${snippet.x}%`, top: `${snippet.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: snippet.id * 0.1 }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.1}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            whileTap={{ scale: 0.95, zIndex: 10 }}
          >
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-48 transform -translate-x-1/2 -translate-y-1/2 overflow-hidden">
              <div className={`${snippet.color} h-1 w-full`}></div>
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-sm">{snippet.title}</h3>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{snippet.language}</span>
                </div>
                <div className="h-16 bg-gray-50 rounded border border-gray-100 p-2">
                  <div className="w-full h-full bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Canvas controls */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
