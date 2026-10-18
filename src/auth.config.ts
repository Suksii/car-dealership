import type { NextAuthConfig } from "next-auth";

// Dio konfiguracije bez pristupa bazi: koristi ga proxy.ts za optimističku provjeru sesije.
export const authConfig = {
  trustHost: true, // iza Cloudflare/Hetzner proxyja host se uzima iz zahtjeva
  pages: { signIn: "/prijava" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as "admin" | "dealer" | "private";
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
