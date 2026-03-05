import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPasswordChangeToken } from "@/lib/passwordChangeVerification";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") ?? "";
    if (!token) {
      return NextResponse.json({ error: "Missing token." }, { status: 400 });
    }

    const tokenHash = hashPasswordChangeToken(token);
    const user = await prisma.user.findFirst({
      where: { passwordChangeTokenHash: tokenHash },
      select: {
        id: true,
        pendingPasswordHash: true,
        passwordChangeExpiresAt: true,
      },
    });

    if (!user || !user.pendingPasswordHash || !user.passwordChangeExpiresAt) {
      return NextResponse.json({ error: "Invalid or expired password change link." }, { status: 400 });
    }

    if (user.passwordChangeExpiresAt.getTime() <= Date.now()) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          pendingPasswordHash: null,
          passwordChangeTokenHash: null,
          passwordChangeRequestedAt: null,
          passwordChangeExpiresAt: null,
        },
      });
      return NextResponse.json({ error: "Invalid or expired password change link." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: user.pendingPasswordHash,
        pendingPasswordHash: null,
        passwordChangeTokenHash: null,
        passwordChangeRequestedAt: null,
        passwordChangeExpiresAt: null,
      },
    });

    return NextResponse.json({ changed: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Password change confirmation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
