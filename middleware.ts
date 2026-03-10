import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

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

    // Assets routes - hanya admin yang bisa create/edit/delete
    if (path.startsWith("/assets/create") || 
        path.startsWith("/assets/edit") || 
        path.startsWith("/assets/delete")) {
      if (token?.role !== "ADMIN" && token?.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/assets", req.url))
      }
    }

    // Loans approve/reject - hanya admin
    if (path.includes("/loans/") && (path.includes("approve") || path.includes("reject"))) {
      if (token?.role !== "ADMIN" && token?.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/loans", req.url))
      }
    }

    return NextResponse.next()
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
    "/super-admin/:path*"
  ]
}