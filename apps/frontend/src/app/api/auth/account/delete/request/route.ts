import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest, unauthorizedJson } from "@/lib/session";
import {
  buildAccountDeleteVerificationUrl,
  createAccountDeleteVerificationToken,
} from "@/lib/accountDeleteVerification";
import { sendAccountDeleteVerificationEmail } from "@/lib/accountDeleteEmail";
import { toEmailUserMessage } from "@/lib/emailErrors";

export async function POST(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return unauthorizedJson();
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

    const verification = createAccountDeleteVerificationToken();
    const verificationUrl = buildAccountDeleteVerificationUrl(verification.token);
    const requestedAt = new Date();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        deleteAccountTokenHash: verification.tokenHash,
        deleteAccountRequestedAt: requestedAt,
        deleteAccountExpiresAt: verification.expiresAt,
      },
    });

    const result = await sendAccountDeleteVerificationEmail({
      to: user.email,
      verificationUrl,
    });

    return NextResponse.json({ success: true, emailSent: result.sent });
  } catch (error) {
    console.error("[account-delete:request] email error", error);
    const message = toEmailUserMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
