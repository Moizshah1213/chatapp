export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";


export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return new NextResponse("Email and Password are required", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: { email: email },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ message: "Password updated" });
  } catch (error) {
    console.error("RESET_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}