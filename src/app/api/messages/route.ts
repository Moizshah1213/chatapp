import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json([], { status: 401 });

  const { searchParams } = new URL(req.url);
  const receiverId = searchParams.get("receiverId");
  const channelId = searchParams.get("channelId");

  const currentUser = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser) return NextResponse.json([], { status: 404 });

  // Common Include Logic taake dono jagah duplicate code na likhna pare
  const messageInclude = {
    user: true, // Message bhejne wala
    replyTo: {
      include: {
        user: true // Jis message ko reply kiya, uska user bhi lao ✅
      }
    }
  };

  // 1. DIRECT MESSAGES (DMs)
  if (receiverId) {
    const messages = await db.message.findMany({
      where: {
        OR: [
          { userId: currentUser.id, receiverId: receiverId },
          { userId: receiverId, receiverId: currentUser.id },
        ],
      },
      include: messageInclude, // ✅ Fixed Syntax
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
  }

  // 2. CHANNEL MESSAGES
  if (channelId) {
    const messages = await db.message.findMany({
      where: {
        channelId: channelId,
      },
      include: messageInclude, // ✅ Fixed Syntax
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
  }

  return NextResponse.json([]);
}