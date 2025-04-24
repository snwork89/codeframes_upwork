"use client"

import { useEffect, useState } from "react"

interface CodePreviewProps {
  html?: string
  css?: string
  js?: string
  width?: string
  height?: string
}

export default function CodePreview({
  html = "",
  css = "",
  js = "",
  width = "300px",
  height = "200px",
}: CodePreviewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const renderPreview = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `
  }

  if (!mounted) return <div className="bg-gray-100 animate-pulse" style={{ width, height }}></div>

  return (
    <div className="rounded-md overflow-hidden border border-gray-200 shadow-sm" style={{ width, height }}>
      <div className="bg-gray-100 px-3 py-1 border-b border-gray-200 flex items-center justify-between">
        <div className="flex space-x-1.5">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
        </div>
        <div className="text-xs text-gray-500">Preview</div>
      </div>
      <iframe
        srcDoc={renderPreview()}
        title="Code Preview"
        className="w-full h-full border-0 bg-white"
        sandbox="allow-scripts"
        style={{ height: `calc(${height} - 28px)` }}
      />
    </div>
  )
}
