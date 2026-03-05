import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { hashPasswordChangeToken } from "@/lib/passwordChangeVerification";

export async function POST(req: Request) {
  try {
    const { token, newPassword, confirmPassword } = await req.json();
    const rawToken = typeof token === "string" ? token.trim() : "";
    const nextPassword = typeof newPassword === "string" ? newPassword : "";
    const nextPasswordConfirm = typeof confirmPassword === "string" ? confirmPassword : "";

    if (!rawToken || !nextPassword || !nextPasswordConfirm) {
      return NextResponse.json(
        { error: "Token, new password, and confirmation are required." },
        { status: 400 },
      );
    }
    if (nextPassword !== nextPasswordConfirm) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const tokenHash = hashPasswordChangeToken(rawToken);
    const user = await prisma.user.findFirst({
      where: { passwordChangeTokenHash: tokenHash },
      select: { id: true, passwordChangeExpiresAt: true },
    });

    if (!user || !user.passwordChangeExpiresAt) {
      return NextResponse.json({ error: "Invalid or expired password reset link." }, { status: 400 });
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
      return NextResponse.json({ error: "Invalid or expired password reset link." }, { status: 400 });
    }

    const hashedPassword = await hashPassword(nextPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        pendingPasswordHash: null,
        passwordChangeTokenHash: null,
        passwordChangeRequestedAt: null,
        passwordChangeExpiresAt: null,
      },
    });

    return NextResponse.json({ changed: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Password reset failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
