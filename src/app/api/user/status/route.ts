export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr"; // ✅ Supabase SSR
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    // 1. Supabase Client Setup
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // 2. Auth Check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await req.json(); // ONLINE, DND, IDLE, INVISIBLE

    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    // 3. Update User Status in Database
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { 
        statusPreference: status, // User ki pasand (e.g., Do Not Disturb)
        status: status === "INVISIBLE" ? "OFFLINE" : status, // Current status broadcast karne ke liye
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error: any) {
    console.error("[USER_STATUS_PATCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}