import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Sign out the user
  await supabase.auth.signOut()

  // Clear cookies and redirect
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"), {
    status: 302,
    headers: {
      "Set-Cookie": `sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly; secure; samesite=lax`,
    },
  })
}