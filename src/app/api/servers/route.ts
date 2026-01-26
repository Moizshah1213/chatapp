import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { name, imageUrl } = await req.json();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const server = await db.server.create({
      data: {
        profileId: (session.user as any).id,
        name,
        imageUrl,
        inviteCode: uuidv4(), // Unique invite link ke liye
        channels: {
          create: [
            { name: "general", profileId: (session.user as any).id }
          ]
        },
        members: {
          create: [
            { profileId: (session.user as any).id, role: "ADMIN" }
          ]
        }
      }
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}