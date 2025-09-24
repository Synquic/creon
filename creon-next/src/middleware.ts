import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Redirect root path to /me
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/me", request.url));
  }

  // Redirect /auth/register to /auth/login
  if (request.nextUrl.pathname === "/auth/register") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth/register"],
};
