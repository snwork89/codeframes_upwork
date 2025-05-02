import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

/**
 * This script can be run to make a user an admin
 * Run it with: npx tsx lib/make-admin.ts user@example.com
 */

async function makeAdmin(email: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing environment variables")
    process.exit(1)
  }

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )

  try {
    // Find user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role")
      .eq("email", email)
      .single()

    if (userError || !user) {
      console.error("User not found:", email)
      process.exit(1)
    }

    console.log(`Found user: ${user.email} (${user.id})`)
    console.log(`Current role: ${user.role}`)

    // Update user role to admin
    const { error: updateError } = await supabaseAdmin.from("profiles").update({ role: "admin" }).eq("id", user.id)

    if (updateError) {
      console.error("Error updating user role:", updateError)
      process.exit(1)
    }

    console.log(`Successfully updated ${user.email} to admin role`)
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  }
}

// Get email from command line arguments
const email = process.argv[2]
if (!email) {
  console.error("Please provide an email address")
  console.error("Usage: npx tsx lib/make-admin.ts user@example.com")
  process.exit(1)
}

makeAdmin(email)
