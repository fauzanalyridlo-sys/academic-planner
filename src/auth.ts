import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [Google],

  session: {
    strategy: "database",

    // Sesi berlaku maksimal 2 jam.
    maxAge: 2 * 60 * 60,

    // Interval pembaruan sesi database.
    updateAge: 30 * 60,
  },

  callbacks: {
    async signIn({ user }) {
      const allowedEmail = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
      const userEmail = user.email?.trim().toLowerCase();

      return Boolean(
        allowedEmail &&
        userEmail &&
        userEmail === allowedEmail
      );
    },
  },

  pages: {
    signIn: "/login",
  },
});