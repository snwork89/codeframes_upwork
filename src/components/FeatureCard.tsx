"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  highlighted?: boolean
  delay?: number
}

export default function FeatureCard({ icon, title, description, highlighted = false, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.1), 0 8px 10px -6px rgba(124, 58, 237, 0.1)",
      }}
      className={cn(
        "flex flex-col items-center space-y-4 p-6 rounded-xl transition-all duration-300",
        highlighted
          ? "bg-gradient-to-br from-purple-50 via-white to-purple-50 border border-purple-200 shadow-md"
          : "bg-white border hover:border-purple-200",
      )}
    >
      <div
        className={cn("p-3 rounded-full transition-all duration-300", highlighted ? "bg-purple-100" : "bg-purple-50")}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-500 text-center">{description}</p>
    </motion.div>
  )
}
