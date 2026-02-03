export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr"; // ✅ Supabase SSR
import { cookies } from "next/headers";
import { db } from "@/lib/db";

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

    // 2. Auth Check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 3. Servers find karein jahan user member hai
    const servers = await db.server.findMany({
      where: {
        members: {
          some: {
            profileId: user.id // ✅ Supabase ki ID use ho rahi hai
          }
        }
      },
      include: {
        channels: {
          where: {
            name: "general" // Aksar sidebar mein general channel ki link chahiye hoti hai
          },
          take: 1
        }
      }
    });

    return NextResponse.json(servers);

  } catch (error: any) {
    console.error("[SERVERS_LIST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}