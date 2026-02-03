export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // 1. Supabase Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Prisma User Fetch
    const currentUser = await db.user.findUnique({
      where: { email: user.email! },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Friends Data Fetch with Nitro Profiles
    const friendsData = await db.friendship.findMany({
      where: {
        OR: [
          { senderId: currentUser.id, status: "ACCEPTED" },
          { receiverId: currentUser.id, status: "ACCEPTED" },
        ],
      },
      include: { 
        sender: { include: { profiles: true } }, 
        receiver: { include: { profiles: true } } 
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    const now = new Date();

    const friendsList = friendsData.map((f: any) => {
      const isSender = f.senderId === currentUser.id;
      const friend = isSender ? f.receiver : f.sender;
      const unreadCount = isSender ? f.senderUnread : f.receiverUnread;
      
      // Profile data handling
      const profile = friend.profiles || {}; 
      
      const lastSeen = friend.lastSeen ? new Date(friend.lastSeen) : new Date(0);
      const diffInSeconds = Math.floor((now.getTime() - lastSeen.getTime()) / 1000);
      let finalStatus = friend.status;
      if (diffInSeconds > 60) finalStatus = "OFFLINE";

      return {
        id: friend.id,
        name: friend.name,
        image: friend.image,
        status: finalStatus,
        updatedAt: f.updatedAt,
        unreadCount: unreadCount,
        friendshipId: f.id, 
        iAmSender: isSender,
        // Nitro data sent to frontend
        nameplate: profile.nameplate || "default",
        banner: profile.banner || null,
        primary_color: profile.primary_color || null,
        accent_color: profile.accent_color || null,
        decoration: profile.decoration || "none"
      };
    });

    return NextResponse.json(friendsList);

  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} // 👈 Ye wala brace aur upar wala catch miss tha