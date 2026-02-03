export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); }, // ✅ Modern format
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        profiles: true, 
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3️⃣ SMART MERGE LOGIC
    // Agar profile table mein updated image/name hai toh wo dikhao, 
    // warna User table (Github wali) dikhao.
    const mergedData = {
      ...dbUser,
      // Priority: Profile Table Data > User Table Data
      name: dbUser.profiles?.name || dbUser.name,
      image: dbUser.profiles?.image || dbUser.image, 
      banner: dbUser.profiles?.banner || dbUser.banner,
      // Baaki nitro features jo sirf profile mein hain
      pronouns: dbUser.profiles?.pronouns,
      about: dbUser.profiles?.about,
      nameplate: dbUser.profiles?.nameplate,
      decoration: dbUser.profiles?.decoration,
      profile_effect: dbUser.profiles?.profile_effect,
    };

    return NextResponse.json(mergedData);

  } catch (err: any) {
    console.error("[PROFILE_GET_ROUTE_ERROR]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}