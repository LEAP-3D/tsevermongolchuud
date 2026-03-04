import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyEmailVerificationToken } from "@/lib/emailVerification";

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
      select: { id: true, email: true, verified: true },
    });
    if (!user || user.email !== claims.email) {
      return NextResponse.json({ error: "Invalid verification link." }, { status: 400 });
    }

    if (user.verified) {
      return NextResponse.json({ verified: true, alreadyVerified: true });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { verified: true },
    });

    return NextResponse.json({ verified: true, alreadyVerified: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
