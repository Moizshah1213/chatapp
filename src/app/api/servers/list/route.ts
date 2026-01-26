import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const servers = await db.server.findMany({
    where: {
      members: {
        some: {
          profileId: (session.user as any).id
        }
      }
    }
  });

  return NextResponse.json(servers);
}