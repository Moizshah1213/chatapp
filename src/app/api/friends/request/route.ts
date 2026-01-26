import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const targetName = body.targetName?.trim();

    if (!targetName) {
      return NextResponse.json({ error: "Naam likhna zaroori hai" }, { status: 400 });
    }

    const sender = await db.user.findUnique({ 
      where: { email: session.user.email } 
    });

    if (!sender) {
      return NextResponse.json({ error: "Sender profile not found" }, { status: 404 });
    }

    // Receiver ko dhoondein
    const receiver = await db.user.findFirst({ 
      where: { 
        name: targetName 
      } 
    });

    if (!receiver) {
      return NextResponse.json({ error: "User nahi mila! Registration wala exact naam likhein." }, { status: 404 });
    }

    if (sender.id === receiver.id) {
      return NextResponse.json({ error: "Apne aap ko add nahi kar sakte" }, { status: 400 });
    }

    // Check if already friends or request pending
    const existing = await db.friendship.findFirst({
      where: {
        OR: [
          { senderId: sender.id, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: sender.id }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Pehle se request pending hai ya aap dost hain" }, { status: 400 });
    }

    // Request create karein
    await db.friendship.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        status: "PENDING"
      }
    });

    // ✅ FIX: 'targetUser' ki jagah 'receiver.id' use karein
    return NextResponse.json({ 
      message: "Request sent successfully!", 
      receiverId: receiver.id // Frontend ko realtime signal bhejne ke liye zaroori hai
    });

  } catch (error: any) {
    console.error("PRISMA ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}