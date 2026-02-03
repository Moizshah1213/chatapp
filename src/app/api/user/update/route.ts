export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: { get: (name) => cookieStore.get(name)?.value }
      }
    );

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return new NextResponse("Unauthorized", { status: 401 });

    const { name, banner, image } = await req.json();

    // ✅ FIX: Upsert use karein taake GitHub wale users ka record agar DB mein nahi hai toh ban jaye
    const updatedUser = await db.user.upsert({
      where: { 
        id: authUser.id 
      },
      update: { 
        // Agar user pehle se hai toh sirf ye cheezain update hon
        name: name || undefined, 
        banner: banner || undefined, 
        image: image || undefined 
      },
      create: {
        // Agar GitHub wala user pehli baar update kar raha hai aur DB mein nahi hai
        id: authUser.id,
        email: authUser.email!,
        name: name || authUser.user_metadata?.full_name || authUser.user_metadata?.user_name || "GitHub User",
        image: image || authUser.user_metadata?.avatar_url || "",
        password: "", // OAuth users ke liye password khali rahega
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("[PROFILE_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}