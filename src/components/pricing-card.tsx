import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface PricingCardProps {
  title: string
  price: string
  description: string
  features: string[]
  buttonText: string
  buttonVariant: "default" | "outline"
  href: string
  highlighted?: boolean
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
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col p-6 bg-white rounded-lg border shadow-sm",
        highlighted && "border-purple-600 shadow-md relative",
      )}
    >
      {highlighted && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
          Popular
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">{title}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-gray-500 ml-1">/month</span>
        </div>
        <p className="text-gray-500">{description}</p>
      </div>
      <ul className="flex flex-col gap-2 mt-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <Link href={href} className="w-full">
          <Button
            variant={buttonVariant}
            className={cn("w-full", highlighted && buttonVariant === "default" && "bg-purple-600 hover:bg-purple-700")}
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  )
}
