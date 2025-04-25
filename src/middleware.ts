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

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/signup", "/explore", "/auth/callback"]

    // Check if the path starts with /snippet/ (public snippet view) or /canvas/ (public canvas view)
    const isPublicSnippetView = req.nextUrl.pathname.startsWith("/snippet/")
    const isPublicCanvasView = req.nextUrl.pathname.startsWith("/canvas/")

    // If user is not signed in and the current path is not a public route
    if (
      !user &&
      !publicRoutes.includes(req.nextUrl.pathname) &&
      !isPublicSnippetView &&
      !isPublicCanvasView &&
      !req.nextUrl.pathname.startsWith("/auth/")
    ) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // If user is signed in and the current path is /login or /signup
    // redirect the user to /dashboard
    if (user && (req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup"))) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  } catch (error) {
    // If there's an error verifying the session, redirect to login
    // But allow access to public routes
    const publicRoutes = ["/", "/login", "/signup", "/explore", "/auth/callback"]

    // Check if the path starts with /snippet/ (public snippet view) or /canvas/ (public canvas view)
    const isPublicSnippetView = req.nextUrl.pathname.startsWith("/snippet/")
    const isPublicCanvasView = req.nextUrl.pathname.startsWith("/canvas/")

    if (
      !publicRoutes.includes(req.nextUrl.pathname) &&
      !isPublicSnippetView &&
      !isPublicCanvasView &&
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
