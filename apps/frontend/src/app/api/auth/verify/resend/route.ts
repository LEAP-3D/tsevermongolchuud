import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildEmailVerificationUrl, createEmailVerificationToken } from "@/lib/emailVerification";
import { sendVerificationEmail } from "@/lib/email";
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

    if (!user) {
      return NextResponse.json({ success: true, emailSent: false });
    }
    if (user.verified) {
      return NextResponse.json({ success: true, alreadyVerified: true, emailSent: false });
    }

    const verification = createEmailVerificationToken({
      userId: user.id,
      email: user.email,
    });
    const verificationUrl = buildEmailVerificationUrl(verification.token);
    const result = await sendVerificationEmail({ to: user.email, verificationUrl });

    return NextResponse.json({ success: true, emailSent: result.sent });
  } catch (error) {
    console.error("[verify:resend] email error", error);
    const message = toEmailUserMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
