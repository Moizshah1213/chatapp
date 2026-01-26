import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("id");

    console.log("Backend received ID:", serverId); // Debugging ke liye

    if (!serverId) {
      return new NextResponse("ID missing", { status: 400 });
    }

    const server = await db.server.findUnique({
      where: { id: serverId },
      include: {
        channels: true,
        members: {
          include: { profile: true }
        },
      }
    });

    if (!server) {
      console.log("Server not found in DB");
      return new NextResponse("Not Found", { status: 404 }); // Check karein kahin ye toh trigger nahi ho raha
    }

    return NextResponse.json(server);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}