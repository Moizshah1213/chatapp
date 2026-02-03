export const dynamic = 'force-dynamic';
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr"; // ✅ Supabase SSR
import { cookies } from "next/headers";
import { db } from "@/lib/db";

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

    const { name, imageUrl } = await req.json();

    if (!name || !imageUrl) {
      return new NextResponse("Name and Image are required", { status: 400 });
    }

    // 3. Server, Channel, aur Member aik saath create karein
    // user.id hi aapka profileId hai
    const server = await db.server.create({
      data: {
        profileId: user.id,
        name,
        imageUrl,
        inviteCode: uuidv4(),
        channels: {
          create: [
            { name: "general", profileId: user.id }
          ]
        },
        members: {
          create: [
            { profileId: user.id, role: "ADMIN" }
          ]
        }
      }
    });

    return NextResponse.json(server);

  } catch (error: any) {
    console.log("[SERVERS_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}