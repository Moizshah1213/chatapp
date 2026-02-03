export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr"; // ✅ Supabase SSR
import { cookies } from "next/headers";

export async function POST(req: Request) {
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

    const body = await req.json();
    const { requestId } = body;

    if (!requestId) {
      return new NextResponse("Request ID is missing", { status: 400 });
    }

    // 3. Security Check: Ensure only the RECEIVER can accept the request
    const friendship = await db.friendship.findUnique({
      where: { id: requestId },
    });

    if (!friendship || friendship.receiverId !== user.id) {
      return new NextResponse("Forbidden: You cannot accept this request", { status: 403 });
    }

    // 4. Update Status
    const updatedFriendship = await db.friendship.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });

    return NextResponse.json(updatedFriendship);
  } catch (error) {
    console.error("[FRIENDS_ACCEPT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}