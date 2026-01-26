import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Aapka central db export
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content, fileUrl, receiverId, channelId, fileType } = await req.json();

    if (!content && !fileUrl) {
      return new NextResponse("Content missing", { status: 400 });
    }

    // Current user ki ID nikalna email se
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) return new NextResponse("User not found", { status: 404 });

    // 1. Database mein message save karein
    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        fileType,
        userId: currentUser.id,
        receiverId: receiverId || null, // For DMs
        channelId: channelId || null,   // For Server Channels
      },
      include: {
        user: true // Taake frontend ko sender ki info (name, image) sath mil jaye
      }
    });

    // ❌ Pusher ka code yahan se nikal diya hai
    // ✅ Supabase Realtime 'Message' table mein naya data dekhte hi 
    // khud sab ko broadcast kar dega.

    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGE_SEND_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}