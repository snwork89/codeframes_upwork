import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { Database } from "@/lib/database.types"

export async function checkAdminAccess() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Check if user is an admin
  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (error || !profile || profile.role !== "admin") {
    redirect("/dashboard") // Redirect non-admin users
  }

  return session.user
}
