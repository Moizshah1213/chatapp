import { db } from "@/lib/db"
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json([], { status: 401 });

  // 1. User fetch karein
  const currentUser = await db.user.findUnique({
    where: { email: session.user.email },
  });

  // Safe Check: Agar user DB mein nahi hai
  if (!currentUser) return NextResponse.json([], { status: 404 });

  // 2. Friendships fetch karein
  const friendsData = await db.friendship.findMany({
    where: {
      OR: [
        { senderId: currentUser.id, status: "ACCEPTED" },
        { receiverId: currentUser.id, status: "ACCEPTED" },
      ],
    },
    include: { sender: true, receiver: true },
  });

  const now = new Date();

  // 3. Mapping with safe checks
  const friendsList = friendsData.map((f: any) => {
    const friend = f.senderId === currentUser.id ? f.receiver : f.sender;
    
    const lastSeen = friend.lastSeen ? new Date(friend.lastSeen) : new Date(0);
    const diffInSeconds = Math.floor((now.getTime() - lastSeen.getTime()) / 1000);

    let finalStatus = friend.status;
    if (diffInSeconds > 60) {
      finalStatus = "OFFLINE";
    }

    return {
      id: friend.id,
      name: friend.name,
      image: friend.image,
      status: finalStatus
    };
  });

  return NextResponse.json(friendsList);
}