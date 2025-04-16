"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface PricingCardProps {
  title: string
  price: string
  description: string
  features: string[]
  buttonText: string
  buttonVariant: "default" | "outline"
  href: string
  highlighted?: boolean
  delay?: number
}

export default function PricingCard({
  title,
  price,
  description,
  features,
  buttonText,
  buttonVariant,
  href,
  highlighted = false,
  delay = 0,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, scale: highlighted ? 1.03 : 1.02 }}
      className={cn(
        "flex flex-col p-6 bg-white rounded-xl border transition-all duration-300 relative",
        highlighted ? "border-purple-300 shadow-xl z-10" : "border-gray-200 shadow-lg",
      )}
    >
      {highlighted && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
            Most Popular
          </div>
        </div>
      )}
      <div className="space-y-2">
        <h3 className={cn("text-2xl font-bold", highlighted && "text-purple-600")}>{title}</h3>
        <div className="mt-4 flex items-end">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-gray-500 ml-1 mb-1">/month</span>
        </div>
        <p className="text-gray-500">{description}</p>
      </div>
      <ul className="flex flex-col gap-3 mt-6 mb-6">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            className="flex items-start gap-2"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: delay + 0.1 * index }}
          >
            <div className={cn("p-0.5 rounded-full mt-0.5", highlighted ? "bg-purple-100" : "bg-gray-100")}>
              <Check className={cn("h-4 w-4", highlighted ? "text-purple-600" : "text-green-500")} />
            </div>
            <span className="text-gray-700">{feature}</span>
          </motion.li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <Link href={href} className="w-full">
          <Button
            variant={buttonVariant}
            className={cn(
              "w-full transition-all duration-300 hover:shadow-lg",
              highlighted &&
                buttonVariant === "default" &&
                "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
              !highlighted && buttonVariant === "outline" && "hover:border-purple-300 hover:bg-purple-50",
            )}
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
