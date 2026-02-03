export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr"; // ✅ Supabase SSR Client
import { cookies } from "next/headers"; // ✅ Cookies access karne ke liye
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // 1. Supabase Client Setup (Cookies ke sath)
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

    // 2. Session check karein
    const { data: { user } } = await supabase.auth.getUser();
    const { name, type, serverId } = await req.json();

    if (!user || !serverId) {
      return new NextResponse("Unauthorized or Missing Data", { status: 401 });
    }

    // 3. User ki ID lein (Supabase user.id hi Prisma ka profileId/userId hoga)
    const userId = user.id;

    // 4. Channel Create karein
    const channel = await db.channel.create({
      data: {
        name: name,
        type: type === "VOICE" ? ChannelType.VOICE : ChannelType.TEXT,
        serverId: serverId,
        profileId: userId,
      },
    });

    return NextResponse.json(channel);
  } catch (error: any) {
    console.error("PRISMA ERROR:", error.message);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}