export const dynamic = 'force-dynamic';
import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr"; // ✅ Security ke liye
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const room = req.nextUrl.searchParams.get("room");

    // 1. Auth Check (Sirf logged-in users ko token mile)
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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!room) {
      return NextResponse.json({ error: 'Missing room name' }, { status: 400 });
    }

    // 2. Identity: Username ke bajaye User ID use karein (Unique and Secure)
    // Agar aap display name chahte hain toh user_metadata se lein
    const identity = user.id; 
    const displayName = user.user_metadata?.full_name || user.email || "Unknown";

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // 3. Token Generation
    const at = new AccessToken(apiKey, apiSecret, { 
      identity: identity,
      name: displayName, // Participant ka naam joiner list mein dikhega
    });

    at.addGrant({ 
      roomJoin: true, 
      room: room, 
      canPublish: true, 
      canSubscribe: true 
    });

    return NextResponse.json({ token: await at.toJwt() });

  } catch (error: any) {
    console.error("LIVEKIT_ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}