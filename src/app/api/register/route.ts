export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, captchaToken } = body;
    

    // 🛡️ Step 1: Pre-check database
    const userExists = await db.user.findUnique({ where: { email } });
    if (userExists) {
      return NextResponse.json({ error: "User already registered in Database." }, { status: 400 });
    }

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



// ✅ Agar yahan tak code pohancha, matlab captcha sahi hai! 
// Ab apka purana logic (Step 1: Pre-check database) shuru hoga...

    // 🛡️ Step 2: Supabase Signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      captchaToken: captchaToken,
      options: {
        data: { full_name: name },
        emailRedirectTo: `https://chatapp-nine-tau-55.vercel.app/auth/callback`,
      },
    });

    // Agar user pehle se Auth mein hai magar DB mein nahi, toh Supabase error dega
    // Lekin humein check karna hai ke error "User already registered" hai ya kuch aur
    if (authError) {
       return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) return NextResponse.json({ error: "Auth failed" }, { status: 500 });

    // 🛡️ Step 3: Password Hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🛡️ Step 4: Prisma Database Save
   // 2. Prisma Database Save inside api/register/route.ts
try {
  const user = await db.user.create({
    data: {
      id: authData.user.id,
      email: email,
      name: name,
      password: hashedPassword,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      status: "ONLINE",
      statusPreference: "ONLINE",
      // 🚀 Yahan profile bhi saath hi create kar dein taake Dashboard pe error na aaye
      profiles: {
        create: {
          name: name,
          theme: "dark",
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        }
      }
    }
  });


      return NextResponse.json({ message: "Registered!", user });

    } catch (dbError: any) {
      // ❗ AGAR YAHAN ERROR AAYE: Iska matlab hai Prisma schema match nahi kar raha
      console.error("❌ PRISMA_DETAILED_ERROR:", dbError);
      
      // Pro-Tip: Agar DB fail ho jaye, toh humein user ko batana hoga
      return NextResponse.json({ 
        error: `Database Save Failed: ${dbError.message || 'Check Prisma Schema'}` 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("❌ GLOBAL_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
