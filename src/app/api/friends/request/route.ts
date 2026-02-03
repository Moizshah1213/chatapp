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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const targetName = body.targetName?.trim();

    if (!targetName) {
      return NextResponse.json({ error: "Naam likhna zaroori hai" }, { status: 400 });
    }

    // 3. Receiver ko dhoondein (Database query)
    const receiver = await db.user.findFirst({ 
      where: { 
        name: {
          equals: targetName,
          mode: 'insensitive' // ✅ Taake 'Moiz' aur 'moiz' dono chal jayein
        }
      } 
    });

    if (!receiver) {
      return NextResponse.json({ error: "User nahi mila! Exact naam likhein." }, { status: 404 });
    }

    // 4. Validation: Apne aap ko add karna
    if (user.id === receiver.id) {
      return NextResponse.json({ error: "Apne aap ko add nahi kar sakte" }, { status: 400 });
    }

    // 5. Existing friendship check (Pending ya Accepted dono cover honge)
    const existing = await db.friendship.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: user.id }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ 
        error: existing.status === "ACCEPTED" ? "Aap pehle se dost hain" : "Request pehle se pending hai" 
      }, { status: 400 });
    }

    // 6. Request create karein
    const newRequest = await db.friendship.create({
      data: {
        senderId: user.id,
        receiverId: receiver.id,
        status: "PENDING"
      }
    });

    return NextResponse.json({ 
      message: "Request sent successfully!", 
      receiverId: receiver.id,
      requestId: newRequest.id
    });

  } catch (error: any) {
    console.error("FRIEND_SEND_ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}