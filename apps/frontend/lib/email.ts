import nodemailer from "nodemailer";
import { EMAIL_VERIFICATION_TTL_SECONDS } from "./emailVerification";

const getBrandName = () => process.env.APP_BRAND_NAME ?? "SafeKid";
const getBrandPrimaryColor = () => process.env.APP_BRAND_PRIMARY_COLOR ?? "#4f46e5";
const getSupportEmail = () => process.env.APP_SUPPORT_EMAIL ?? "";
const getExpiryHours = () => Math.max(1, Math.floor(EMAIL_VERIFICATION_TTL_SECONDS / 3600));
const getFromEmail = () => process.env.EMAIL_FROM ?? "no-reply@example.com";
const getFromName = () => process.env.EMAIL_FROM_NAME ?? getBrandName();
const getFromHeader = () => `${getFromName()} <${getFromEmail()}>`;
const getSmtpHost = () => process.env.SMTP_HOST ?? "";
const getSmtpPort = () => Number(process.env.SMTP_PORT ?? 587);
const getSmtpSecure = () => process.env.SMTP_SECURE === "true";
const getSmtpUser = () => process.env.SMTP_USER ?? "";
const getSmtpPass = () => process.env.SMTP_PASS ?? "";
const getSmtpService = () => process.env.SMTP_SERVICE ?? "";

type SendVerificationEmailParams = {
  to: string;
  verificationUrl: string;
};

export const sendVerificationEmail = async (params: SendVerificationEmailParams) => {
  const brandName = getBrandName();
  const supportEmail = getSupportEmail();
  const primaryColor = getBrandPrimaryColor();
  const expiryHours = getExpiryHours();
  const subject = `Verify your ${brandName} email`;
  const text = [
    `Welcome to ${brandName}!`,
    "",
    "Please verify your email address by clicking the link below:",
    params.verificationUrl,
    "",
    `This link will expire in ${expiryHours} hours.`,
    ...(supportEmail ? ["", `Need help? Contact: ${supportEmail}`] : []),
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px">Verify your ${brandName} email</h2>
      <p style="margin:0 0 12px">Confirm your email to activate your account.</p>
      <p style="margin:0 0 20px">
        <a href="${params.verificationUrl}" style="background:${primaryColor};color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">
          Verify Email
        </a>
      </p>
      <p style="margin:0 0 8px">Or copy and paste this URL:</p>
      <p style="margin:0;word-break:break-all">${params.verificationUrl}</p>
      <p style="margin:16px 0 0;color:#475569">This link expires in ${expiryHours} hours.</p>
      ${supportEmail ? `<p style="margin:8px 0 0;color:#475569">Need help? ${supportEmail}</p>` : ""}
    </div>
  `.trim();

  const smtpUser = getSmtpUser();
  const smtpPass = getSmtpPass();
  const smtpService = getSmtpService();
  const smtpHost = getSmtpHost();
  const smtpPort = getSmtpPort();
  const smtpSecure = getSmtpSecure();
  const missingAuth = !smtpUser || !smtpPass;
  const missingTransport = !smtpService && !smtpHost;

  if (missingAuth || missingTransport) {
    console.info(
      `[email] SMTP is not fully configured. Verification link for ${params.to}: ${params.verificationUrl}`,
    );
    return { sent: false as const };
  }

  const transporter = nodemailer.createTransport(
    smtpService
      ? {
          service: smtpService,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        }
      : {
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        },
  );

  await transporter.sendMail({
    from: getFromHeader(),
    to: params.to,
    subject,
    text,
    html,
  });

  return { sent: true as const };
};
