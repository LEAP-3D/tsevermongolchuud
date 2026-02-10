// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "database",
  },

  pages: {
    signIn: "/auth/signin",
  },

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // user id
        session.user.id = user.id;

        // API key шалгах
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { apiKey: true },
        });

        // Хэрвээ API key байхгүй бол үүсгэнэ
        if (!dbUser?.apiKey) {
          const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
              apiKey: crypto.randomUUID(),
            },
            select: { apiKey: true },
          });

          session.user.apiKey = updated.apiKey!;
        } else {
          session.user.apiKey = dbUser.apiKey;
        }
      }

      return session;
    },
  },
};
