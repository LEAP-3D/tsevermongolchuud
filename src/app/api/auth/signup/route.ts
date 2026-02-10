import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const providedPassword = typeof password === "string" ? password : "";
    const trimmedName = typeof name === "string" ? name.trim() : "";

    if (!trimmedEmail || !providedPassword) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        password: providedPassword,
        name: trimmedName || null,
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email already in use." }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : "Sign up failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
