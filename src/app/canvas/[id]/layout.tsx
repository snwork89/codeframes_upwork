"use client"

import type React from "react"
import { ReactFlowProvider } from "@xyflow/react"

export default function PublicCanvasLayout({ children }: { children: React.ReactNode }) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>
}
