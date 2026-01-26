import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      status?: string;
      banner?: string;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    status?: string;
    banner?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}