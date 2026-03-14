import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Set bahasa Indonesia di header
    const response = NextResponse.next()
    response.headers.set('Content-Language', 'id')
    response.headers.set('Accept-Language', 'id, en;q=0.7')

    // Admin routes
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN" && token?.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Super Admin only routes
    if (path.startsWith("/super-admin")) {
      if (token?.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/assets/:path*", 
    "/loans/:path*", 
    "/admin/:path*",
    "/super-admin/:path*",
    "/chat/:path*",
    "/helpdesk/:path*"
  ]
}