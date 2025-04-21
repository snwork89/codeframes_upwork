import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Get user with verification from Supabase Auth server
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If user is not signed in and the current path is not / or /login or /signup
    // redirect the user to /login
    if (
      !user &&
      !req.nextUrl.pathname.startsWith("/login") &&
      !req.nextUrl.pathname.startsWith("/signup") &&
      req.nextUrl.pathname !== "/" &&
      !req.nextUrl.pathname.startsWith("/auth/")
    ) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // If user is signed in and the current path is / or /login or /signup
    // redirect the user to /dashboard
    if (
      user &&
      (req.nextUrl.pathname === "/" ||
        req.nextUrl.pathname.startsWith("/login") ||
        req.nextUrl.pathname.startsWith("/signup"))
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  } catch (error) {
    // If there's an error verifying the session, redirect to login
    if (
      !req.nextUrl.pathname.startsWith("/login") &&
      !req.nextUrl.pathname.startsWith("/signup") &&
      req.nextUrl.pathname !== "/" &&
      !req.nextUrl.pathname.startsWith("/auth/")
    ) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
