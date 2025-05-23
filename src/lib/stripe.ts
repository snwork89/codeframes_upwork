import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default stripe

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    snippetLimit: 10,
    stripePriceId: null,
  },
  BASIC: {
    name: "Basic",
    price: 20,
    snippetLimit: 100,
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || "",
    description: "One-time purchase for 100 snippets",
  },
  PREMIUM: {
    name: "Premium",
    price: 50,
    snippetLimit: 500,
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || "",
    description: "One-time purchase for 500 snippets",
  },
}

export function validateStripePriceIds() {
  if (!process.env.STRIPE_BASIC_PRICE_ID) {
    console.warn("Warning: STRIPE_BASIC_PRICE_ID environment variable is not set")
  }
  if (!process.env.STRIPE_PREMIUM_PRICE_ID) {
    console.warn("Warning: STRIPE_PREMIUM_PRICE_ID environment variable is not set")
  }
}
