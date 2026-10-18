import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { authConfig } from "./auth.config";

const googleEnabled = !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email ?? "").trim().toLowerCase();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        const user = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (!user || !user.passwordHash || user.isBlocked) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
    ...(googleEnabled ? [Google] : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Google prijava: nađi ili napravi korisnika u našoj tabeli, pa upiši naš id u user objekat
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      const email = user.email?.toLowerCase();
      if (!email) return false;

      let dbUser = await db.query.users.findFirst({ where: eq(users.email, email) });
      if (dbUser?.isBlocked) return false;

      if (!dbUser) {
        [dbUser] = await db
          .insert(users)
          .values({ email, name: user.name ?? email.split("@")[0], emailVerifiedAt: new Date() })
          .returning();
      }
      await db
        .insert(accounts)
        .values({ userId: dbUser.id, provider: "google", providerAccountId: account.providerAccountId })
        .onConflictDoNothing();
      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, dbUser.id));

      user.id = dbUser.id;
      user.role = dbUser.role;
      return true;
    },
  },
});
