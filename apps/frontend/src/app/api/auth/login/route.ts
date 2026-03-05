import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { attachSessionCookie, createSessionToken } from "@/lib/session";
import { hashPassword, isHashedPassword, verifyPassword } from "@/lib/password";
import { buildEmailVerificationUrl, createEmailVerificationToken } from "@/lib/emailVerification";
import { sendVerificationEmail } from "@/lib/email";
import { toEmailUserMessage } from "@/lib/emailErrors";

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
      select: { id: true, email: true, name: true, password: true, verified: true },
    });

    if (!user || !(await verifyPassword(providedPassword, user.password))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if (!user.verified) {
      let emailSent = false;
      let emailSendError: string | null = null;

      try {
        const verification = createEmailVerificationToken({
          userId: user.id,
          email: user.email,
        });
        const verificationUrl = buildEmailVerificationUrl(verification.token);
        const result = await sendVerificationEmail({ to: user.email, verificationUrl });
        emailSent = result.sent;
      } catch (error) {
        console.error("[auth:login] verification email send failed", error);
        emailSendError = toEmailUserMessage(error);
      }

      const defaultMessage = emailSent
        ? "Please verify your email before signing in. We sent a verification email. Please check your inbox."
        : "Please verify your email before signing in.";

      return NextResponse.json(
        {
          error: emailSendError ?? defaultMessage,
          code: "EMAIL_NOT_VERIFIED",
          emailSent,
        },
        { status: 403 },
      );
    }
    if (!isHashedPassword(user.password)) {
      const hashedPassword = await hashPassword(providedPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
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
