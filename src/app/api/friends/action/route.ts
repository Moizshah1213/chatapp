export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr"; // ✅ Supabase SSR
import { cookies } from "next/headers";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, action } = await req.json();

    if (!requestId) {
      return NextResponse.json({ error: "Missing Request ID" }, { status: 400 });
    }

    // 3. Security: Check if request exists and if the user is involved
    const friendship = await db.friendship.findUnique({
      where: { id: requestId },
    });

    if (!friendship) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Sirf receiver accept kar sakta hai, lekin reject/delete dono (sender/receiver) kar sakte hain
    if (action === "ACCEPT" && friendship.receiverId !== user.id) {
      return NextResponse.json({ error: "Only the receiver can accept" }, { status: 403 });
    }

    if (friendship.senderId !== user.id && friendship.receiverId !== user.id) {
      return NextResponse.json({ error: "You are not part of this friendship" }, { status: 403 });
    }

    // 4. Action Logic
    if (action === "ACCEPT") {
      await db.friendship.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" }
      });
    } else {
      // REJECT ya DELETE ke liye request khatam kar do
      await db.friendship.delete({
        where: { id: requestId }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[FRIEND_PATCH_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}