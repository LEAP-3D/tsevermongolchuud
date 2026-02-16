import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { attachSessionCookie, createSessionToken } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const providedPassword = typeof password === "string" ? password : "";

    if (!trimmedEmail || !providedPassword) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      select: { id: true, email: true, name: true, password: true },
    });

    if (!user || user.password !== providedPassword) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const session = createSessionToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, expiresAt: session.expiresAt * 1000 },
    });
    attachSessionCookie(response, session);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
