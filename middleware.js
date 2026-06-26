import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/resume",
  "/interview",
  "/ai-cover-letter",
  "/onboarding",
  "/profile",
  "/roadmap",
];

export default withAuth(function middleware(req) {
  const pathname = req.nextUrl.pathname;
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected && !req.nextauth.token) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resume/:path*",
    "/interview/:path*",
    "/ai-cover-letter/:path*",
    "/onboarding/:path*",
    "/profile/:path*",
    "/roadmap/:path*",
  ],
};
