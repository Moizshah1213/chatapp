import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error("Missing info");
        const user = await db.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) throw new Error("User not found");
        const isCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isCorrect) throw new Error("Invalid password");
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image ?? undefined,
          status: user.status,
          statusPreference: user.statusPreference,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) token.id = user.id;
      if (trigger === "update") token.updatedAt = Date.now(); 
      return token;
    },
    async session({ session, token }: any) {
      if (session.user && token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { 
            id: true, name: true, image: true, banner: true, 
            status: true, statusPreference: true, lastSeen: true 
          }
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.status = dbUser.status;
          session.user.name = dbUser.name;
          session.user.banner = dbUser.banner;
          session.user.image = dbUser.image;
          session.user.statusPreference = dbUser.statusPreference;
        }
      }
      return session;
    }
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
};