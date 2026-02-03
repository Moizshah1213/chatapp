export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { inviteCode } = await req.json();
    const cookieStore = await cookies();

    // 1. Supabase Server Client Setup
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
        },
      }
    );

    // 2. User Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // 3. Find Server
    const server = await db.server.findUnique({
      where: { inviteCode }
    });

    if (!server) return new NextResponse("Server not found", { status: 404 });

    // 4. Check if already member (Using user.id from Supabase)
    const existingMember = await db.member.findFirst({
      where: {
        serverId: server.id,
        profileId: user.id 
      }
    });

    if (existingMember) return NextResponse.json(server);

    // 5. Add Member
    await db.server.update({
      where: { inviteCode },
      data: {
        members: {
          create: [{ profileId: user.id }]
        }
      }
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[JOIN_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}