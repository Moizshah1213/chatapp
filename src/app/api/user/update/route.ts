import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db"; 
// Purana import hata kar ye lagayein
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";



export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { name, banner, image } = await req.json();

    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: { name, banner, image },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}