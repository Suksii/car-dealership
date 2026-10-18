import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const protectedPrefixes = ["/nalog", "/plac", "/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const needsAuth = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (needsAuth && !req.auth) {
    const url = new URL("/prijava", req.nextUrl.origin);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/admin") && req.auth?.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico)$).*)"],
};
