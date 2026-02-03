export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr"; // ✅ Supabase SSR
import { cookies } from "next/headers";

export async function GET() {
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

    // 2. Auth Check (Seedha user object lein)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Pending Requests fetch karein
    // Note: user.id seedha use karein kyunki Supabase ID hi Prisma ki id hai
    const pendingRequests = await db.friendship.findMany({
      where: {
        receiverId: user.id, // 👈 Null check ki zaroorat nahi, upar check ho gaya
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            status: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Taake nayi requests sab se upar hon
      }
    });

    return NextResponse.json(pendingRequests);

  } catch (error: any) {
    console.error("[PENDING_FRIENDS_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}