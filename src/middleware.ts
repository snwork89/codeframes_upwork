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

    // Update the middleware to allow public canvas access and landing page visits

    // Modify the public routes array to include canvas public views
    const publicRoutes = ["/", "/login", "/signup", "/explore", "/auth/callback"]

    // Check if the path starts with /snippet/ or /canvas/ (public views)
    const isPublicView = req.nextUrl.pathname.startsWith("/snippet/") || req.nextUrl.pathname.startsWith("/canvas/")

    // Update the condition to use isPublicView instead of isPublicSnippetView
    if (
      !user &&
      !publicRoutes.includes(req.nextUrl.pathname) &&
      !isPublicView &&
      !req.nextUrl.pathname.startsWith("/auth/")
    ) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Remove the automatic redirect from landing page for logged-in users
    // by changing this condition to only redirect from login and signup pages
    if (user && (req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup"))) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  } catch (error) {
    // If there's an error verifying the session, redirect to login
    // But allow access to public routes
    const publicRoutes = ["/", "/login", "/signup", "/explore", "/auth/callback"]

    // Check if the path starts with /snippet/ or /canvas/ (public views)
    const isPublicView = req.nextUrl.pathname.startsWith("/snippet/") || req.nextUrl.pathname.startsWith("/canvas/")

    // Also update the catch block with the same changes
    // In the catch block, update the condition:
    if (!publicRoutes.includes(req.nextUrl.pathname) && !isPublicView && !req.nextUrl.pathname.startsWith("/auth/")) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
