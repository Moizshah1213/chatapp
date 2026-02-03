export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ inviteCode: string }> } // 🚩 Promise type define karein
) {
  try {
    // 1. Params ko await karke unwrap karein
    const { inviteCode } = await params;

    if (!inviteCode) {
      return new NextResponse("Invite code missing", { status: 400 });
    }

    // 2. Database query karein
   const server = await db.server.findUnique({
      where: { inviteCode: inviteCode },
      select: {
        id: true,
        name: true,
        imageUrl: true, // ✅ 'image' ki jagah 'imageUrl' likhein
      }
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    return NextResponse.json(server);
  } catch (error) {
    console.error("[INVITE_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}