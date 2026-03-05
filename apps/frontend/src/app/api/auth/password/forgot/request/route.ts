import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  buildForgotPasswordResetUrl,
  createPasswordChangeVerificationToken,
} from "@/lib/passwordChangeVerification";
import { sendPasswordChangeVerificationEmail } from "@/lib/email";
import { toEmailUserMessage } from "@/lib/emailErrors";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!trimmedEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      select: { id: true, email: true, verified: true },
    });

    // Keep response generic to avoid account enumeration.
    if (!user || !user.verified) {
      return NextResponse.json({ success: true, emailSent: false });
    }

    const verification = createPasswordChangeVerificationToken();
    const verificationUrl = buildForgotPasswordResetUrl(verification.token);
    const requestedAt = new Date();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        pendingPasswordHash: null,
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
    console.error("[password-forgot:request] email error", error);
    const message = toEmailUserMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
