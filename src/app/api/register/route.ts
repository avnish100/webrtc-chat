// app/api/register/route.ts
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    const exists = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (exists) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: "An unexpected error occurred while registering the user" },
      { status: 500 }
    );
  }
}