import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Lib wali file se import

const handler = NextAuth(authOptions);

// Next.js ko sirf ye chahiye. Yahan kuch aur EXPORT nahi hona chahiye.
export { handler as GET, handler as POST };