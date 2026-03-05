import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getSessionFromRequest, unauthorizedJson } from "@/lib/session";
import {
  buildPasswordChangeVerificationUrl,
  createPasswordChangeVerificationToken,
} from "@/lib/passwordChangeVerification";
import { sendPasswordChangeVerificationEmail } from "@/lib/email";
import { toEmailUserMessage } from "@/lib/emailErrors";

export async function POST(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return unauthorizedJson();
    }

    const { newPassword, confirmPassword } = await req.json();
    const nextPassword = typeof newPassword === "string" ? newPassword : "";
    const nextPasswordConfirm = typeof confirmPassword === "string" ? confirmPassword : "";

    if (!nextPassword || !nextPasswordConfirm) {
      return NextResponse.json({ error: "New password and confirmation are required." }, { status: 400 });
    }
    if (nextPassword !== nextPasswordConfirm) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, verified: true },
    });
    if (!user) {
      return unauthorizedJson();
    }
    if (!user.verified) {
      return NextResponse.json({ error: "Please verify your email first." }, { status: 403 });
    }

    const hashedPassword = await hashPassword(nextPassword);
    const verification = createPasswordChangeVerificationToken();
    const verificationUrl = buildPasswordChangeVerificationUrl(verification.token);
    const requestedAt = new Date();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        pendingPasswordHash: hashedPassword,
        passwordChangeTokenHash: verification.tokenHash,
        passwordChangeRequestedAt: requestedAt,
        passwordChangeExpiresAt: verification.expiresAt,
      },
    });

    const result = await sendPasswordChangeVerificationEmail({
      to: user.email,
      verificationUrl,
    });

    return NextResponse.json({ success: true, emailSent: result.sent });
  } catch (error) {
    console.error("[password-change:request] email error", error);
    const message = toEmailUserMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
