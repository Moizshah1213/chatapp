import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { email: session.user.email } });

  // Wo requests dhoondein jo is user ko bheji gayi hain (ReceiverId === current user)
  const pendingRequests = await db.friendship.findMany({
    where: {
      receiverId: user!.id,
      status: "PENDING",
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          status: true,
          image: true,
        }
      }
    }
  });

  return NextResponse.json(pendingRequests);
}