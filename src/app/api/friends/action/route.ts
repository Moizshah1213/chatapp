import { db } from "@/lib/db"

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId, action } = await req.json();

  if (action === "ACCEPT") {
    await db.friendship.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" }
    });
  } else {
    await db.friendship.delete({
      where: { id: requestId }
    });
  }

  return NextResponse.json({ success: true });
}