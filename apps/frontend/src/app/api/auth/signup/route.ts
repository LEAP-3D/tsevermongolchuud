import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { attachSessionCookie, createSessionToken } from "@/lib/session";

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

    const session = createSessionToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({
      user: { ...user, expiresAt: session.expiresAt * 1000 },
    });
    attachSessionCookie(response, session);
    return response;
  } catch (error) {
    const isUniqueError =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002";
    if (isUniqueError) {
      return NextResponse.json({ error: "Email already in use." }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : "Sign up failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
