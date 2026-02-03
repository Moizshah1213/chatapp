export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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

    // 2. Session Check
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content, fileUrl, receiverId, channelId, fileType } = await req.json();

    if (!content && !fileUrl) {
      return new NextResponse("Content missing", { status: 400 });
    }

    // 3. Database mein message save karein
    // Note: 'user.id' seedha use karein, email se find karne ki zaroorat nahi
    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        fileType,
        userId: user.id, // Supabase ID is Prisma Profile ID
        receiverId: receiverId || null, 
        channelId: channelId || null,   
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    });

    // Supabase Realtime automatically broadcasts this insert if enabled on DB level
    return NextResponse.json(message);

  } catch (error: any) {
    console.error("[MESSAGE_SEND_ERROR]", error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}