// import {
//   type NextAuthOptions,
//   type DefaultSession,
//   type User as NextAuthUser,
// } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import prisma from "@/lib/prisma";
// import crypto from "crypto";

// // We use interface here only because TypeScript requires it for "Declaration Merging"
// // to extend the existing NextAuth types.
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       apiKey: string;
//     } & DefaultSession["user"];
//   }

//   interface User extends NextAuthUser {
//     apiKey?: string | null;
//   }
// }

// // Defining our logic types as 'type'
// type SessionCallbackParams = {
//   session: any;
//   user: NextAuthUser & { id: string; apiKey?: string | null };
// };

// export const authOptions: NextAuthOptions = {
//   // Casting to the specific type to satisfy ESLint Line 9
//   adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],

//   session: {
//     strategy: "database",
//   },

//   pages: {
//     signIn: "/auth/signin",
//   },

//   callbacks: {
//     async session({ session, user }: SessionCallbackParams) {
//       if (session.user) {
//         // Line 30: Property 'id' is now recognized
//         session.user.id = user.id;

//         const dbUser = await prisma.user.findUnique({
//           where: { id: user.id },
//           select: { apiKey: true },
//         });

//         if (!dbUser?.apiKey) {
//           const updated = await prisma.user.update({
//             where: { id: user.id },
//             data: {
//               apiKey: crypto.randomUUID(),
//             },
//             select: { apiKey: true },
//           });

//           // Line 48: Property 'apiKey' is now recognized
//           session.user.apiKey = updated.apiKey!;
//         } else {
//           // Line 50: Property 'apiKey' is now recognized
//           session.user.apiKey = dbUser.apiKey;
//         }
//       }

//       return session;
//     },
//   },
// };
