import { db } from "@/lib/db"; // Ab ye sahi chalega
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { NextResponse } from "next/server";

// api/friends/accept/route.ts
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestId } = body; // friendshipId ki jagah requestId kar dein

    if (!requestId) {
      return new NextResponse("Request ID is missing", { status: 400 });
    }

    const updatedFriendship = await db.friendship.update({
      where: { id: requestId }, // requestId use karein
      data: { status: "ACCEPTED" },
    });

    return NextResponse.json(updatedFriendship);
  } catch (error) {
    console.error("[FRIENDS_ACCEPT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}