import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { clientIp, rateLimit } from "./lib/rate-limit";

const { auth } = NextAuth(authConfig);

const protectedPrefixes = ["/nalog", "/plac", "/admin"];

/** Limiti po IP-u za osjetljive POST-ove (prijava/registracija su server akcije na istoj putanji). */
const LIMITS: Record<string, [limit: number, windowMs: number]> = {
  "/prijava": [10, 10 * 60_000],
  "/registracija": [5, 60 * 60_000],
  "/zaboravljena-lozinka": [5, 60 * 60_000],
  "/nova-lozinka": [10, 60 * 60_000],
  "/api/upload": [60, 10 * 60_000],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (req.method === "POST" && LIMITS[pathname]) {
    const [limit, windowMs] = LIMITS[pathname];
    const r = rateLimit(`${pathname}:${clientIp(req.headers)}`, limit, windowMs);
    if (!r.ok) {
      return new NextResponse("Previše pokušaja, probaj kasnije.", {
        status: 429,
        headers: { "Retry-After": String(r.retryAfterSec) },
      });
    }
  }

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico)$).*)"],
};
