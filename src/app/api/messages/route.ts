export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
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
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json([], { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const receiverId = searchParams.get("receiverId");
    const channelId = searchParams.get("channelId");

    // 3. Optimized Include Logic (Type safety ke sath)
    const messageInclude = {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          status: true,
          profiles: true,
        },
      },
      replyTo: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profiles: true,
            },
          },
        },
      },
    };

    // 4. FETCH LOGIC
    // Fixed ts(7034): Explicitly typing as any[] to avoid implicit any error
    let messages: any[] = [];

    if (receiverId) {
      // Direct Messages (DMs) fetching
      messages = await db.message.findMany({
        where: {
          OR: [
            { userId: authUser.id, receiverId: receiverId },
            { userId: receiverId, receiverId: authUser.id },
          ],
        },
        include: messageInclude,
        orderBy: {
          createdAt: "asc",
        },
      });
    } else if (channelId) {
      // Server Channel Messages fetching
      messages = await db.message.findMany({
        where: {
          channelId: channelId,
        },
        include: messageInclude,
        orderBy: {
          createdAt: "asc",
        },
      });
    }

    return NextResponse.json(messages);

  } catch (error: any) {
    console.error("[MESSAGES_GET_ERROR]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}