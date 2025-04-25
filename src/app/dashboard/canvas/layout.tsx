"use client"

import type React from "react"

import { ReactFlowProvider } from "@xyflow/react"

export default function CanvasLayout({ children }: { children: React.ReactNode }) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>
}   
