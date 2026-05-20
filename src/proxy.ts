import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, images, logo, favicon, and login page/API routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check authentication
  const isAuthenticated = request.cookies.get("isAuthenticated")?.value === "true";

  if (!isAuthenticated) {
    // Redirect unauthenticated requests to the login screen
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.svg (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.svg).*)",
  ],
};
