import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db"
import { ChannelType } from "@prisma/client"; // ✅ Enum import karein

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { name, type, serverId } = await req.json();

    if (!session?.user || !serverId) {
      return new NextResponse("Bad Request: Missing Data", { status: 400 });
    }

    const userId = (session.user as any).id;

    // Direct creation using the IDs from your schema
    const channel = await db.channel.create({
  data: {
    name: name,
    type: type === "VOICE" ? ChannelType.VOICE : ChannelType.TEXT, // ✅ Case ensure karein
    serverId: serverId,
    profileId: userId,
  }
});

    return NextResponse.json(channel);
  } catch (error: any) {
    console.error("PRISMA ERROR:", error.message);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}