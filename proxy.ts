import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/src/auth/jwt";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Only protect admin routes
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("auth_token")?.value;
    const session = token ? verifyJWT(token) : null;

    // If not authenticated and trying to access admin, redirect to login
    if (!session) {
      // If already going to login page, allow it
      if (pathname === "/admin/login") {
        return NextResponse.next();
      }
      
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    // If authenticated and trying to access login page, redirect to admin dashboard
    if (pathname === "/admin/login") {
      const adminUrl = new URL("/admin", req.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};