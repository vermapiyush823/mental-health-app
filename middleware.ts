import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/signin" || path === "/signup";

  const token = request.cookies.get("token")?.value || "";

  if (isPublicPath && token) {
    // If user is already logged in, redirect to home page
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isPublicPath && !token) {
    // If user is not logged in and tries to access protected route
    return NextResponse.redirect(new URL("/signin", request.url));
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/",
    "/profile/:path*",
    "/signin",
    "/signup",
  ],
};
