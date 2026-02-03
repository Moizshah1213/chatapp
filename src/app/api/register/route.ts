export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: any) { cookieStore.set({ name, value: "", ...options }); },
        },
      }
    );

    // 1. Supabase Signup
// ✅ Yahan 'formData' ki jagah ye variables hain

// 2. Supabase signUp mein in variables ko use karein
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: email,      // 👈 formData.email ki jagah sirf 'email'
  password: password, // 👈 formData.password ki jagah sirf 'password'
  options: {
    data: { full_name: name },
    // Is line ko change karein
emailRedirectTo: `https://chatapp-nine-tau-55.vercel.app/auth/callback`,
  },
});
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
    if (!authData.user) return NextResponse.json({ error: "Auth failed" }, { status: 500 });

    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Prisma Database Save with Detailed Logging
    try {
      const user = await db.user.create({
        data: {
          id: authData.user.id, // Supabase ki ID
          email: email,
          name: name,
          password: hashedPassword,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
          status: "ONLINE",
          statusPreference: "ONLINE",
        }
      });

      return NextResponse.json({ message: "Registered!", user });

    } catch (dbError: any) {
      // ❗ YEH LINE TERMINAL MEIN DEKHEIN
      console.error("❌ PRISMA_DETAILED_ERROR:", dbError);
      
      return NextResponse.json({ 
        error: `DB Error: ${dbError.code || 'Unknown'}. Check terminal.` 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("❌ GLOBAL_ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
