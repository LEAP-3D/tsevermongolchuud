import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyEmailVerificationToken } from "@/lib/emailVerification";
import { attachSessionCookie, createSessionToken } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") ?? "";
    if (!token) {
      return NextResponse.json({ error: "Missing token." }, { status: 400 });
    }

    const claims = verifyEmailVerificationToken(token);
    if (!claims) {
      return NextResponse.json({ error: "Invalid or expired verification link." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: claims.userId },
      select: { id: true, email: true, name: true, verified: true },
    });
    if (!user || user.email !== claims.email) {
      return NextResponse.json({ error: "Invalid verification link." }, { status: 400 });
    }

    const alreadyVerified = Boolean(user.verified);
    if (!alreadyVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { verified: true },
      });
    }

    const session = createSessionToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({
      verified: true,
      alreadyVerified,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        expiresAt: session.expiresAt * 1000,
      },
    });
    attachSessionCookie(response, session);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
