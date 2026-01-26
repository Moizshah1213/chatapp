// app/api/user/status/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { status } = await req.json(); // ONLINE, DND, IDLE, etc.

  const updatedUser = await db.user.update({
    where: { id: session.user.id },
    data: { statusPreference: status } // 'statusPreference' column schema mein hona chahiye
  });

  return NextResponse.json(updatedUser);
}