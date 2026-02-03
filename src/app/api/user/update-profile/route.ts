export const dynamic = 'force-dynamic';
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // 👈 Prisma client zaroori hai sync ke liye

export async function PATCH(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const { 
      id, name, pronouns, about, image, banner, 
      primary_color, accent_color, nameplate, 
      decoration, profile_effect ,
      theme
    } = body;

    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    // 1️⃣ Profiles Table Update (Supabase)
    const { data, error: dbError } = await supabaseAdmin
      .from("Profiles") 
      .upsert({
        id,
        name,
        pronouns,
        about,
        image, // 👈 Naya Cloudinary URL yahan ja raha hai
        banner,
        primary_color,
        accent_color,
        nameplate,
        decoration,
        profile_effect,
        theme,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single();

    if (dbError) throw new Error(dbError.message);

    // 2️⃣ Prisma User Table Sync (Yeh Step Missing Tha! 🚀)
    // Isse 'User' table mein GitHub wali image replace ho jayegi
    if (image || name) {
      await db.user.update({
        where: { id: id },
        data: {
          image: image || undefined, // Agar image hai toh update karo
          name: name || undefined,
        }
      });
      console.log("✅ Prisma User Table Synced");
    }

    // 3️⃣ Auth Metadata Sync (Supabase Auth)
    if (data) {
      await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: { 
          full_name: name || data.name, 
          avatar_url: image || data.image 
        }
      });
    }

    return NextResponse.json({ success: true, profile: data });

  } catch (err: any) {
    console.error("🔥 Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}