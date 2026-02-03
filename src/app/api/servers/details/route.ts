export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr"; // ✅ Security ke liye
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    // 1. Supabase Client Setup (Security check ke liye)
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: { get: (name) => cookieStore.get(name)?.value }
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("id");

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    // 2. Database Fetch
    const server = await db.server.findUnique({
      where: { id: serverId },
      include: {
        channels: {
          orderBy: { createdAt: "asc" } // Channels hamesha order mein milenge
        },
        members: {
          include: { 
            profile: true // ⚠️ Check karein schema mein 'profile' hai ya 'user'
          }
        },
      }
    });

    if (!server) {
      return new NextResponse("Server Not Found", { status: 404 });
    }

    return NextResponse.json(server);

  } catch (error: any) {
    console.error("[SERVER_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}