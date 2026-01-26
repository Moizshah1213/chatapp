import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; 


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, password } = body;

        if (!email || !password) {
            return new NextResponse("Missing Fields", { status: 400 });
        }

        // Check if user already exists
        const exists = await db.user.findUnique({
            where: { email }
        });

        if (exists) {
            return new NextResponse("User already exists", { status: 400 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User in SQLite
        const user = await db.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}