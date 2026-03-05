import nodemailer from "nodemailer";
import { ACCOUNT_DELETE_VERIFICATION_TTL_SECONDS } from "./accountDeleteVerification";

const getBrandName = () => process.env.APP_BRAND_NAME ?? "SafeKid";
const getBrandPrimaryColor = () => process.env.APP_BRAND_PRIMARY_COLOR ?? "#4f46e5";
const getSupportEmail = () => process.env.APP_SUPPORT_EMAIL ?? "";
const getSmtpHost = () => process.env.SMTP_HOST ?? "";
const getSmtpPort = () => Number(process.env.SMTP_PORT ?? 587);
const getSmtpSecure = () => process.env.SMTP_SECURE === "true";
const getSmtpUser = () => process.env.SMTP_USER ?? "";
const getSmtpPass = () => process.env.SMTP_PASS ?? "";
const getSmtpService = () => process.env.SMTP_SERVICE ?? "";
const getFromEmail = () => {
  const customFrom = (process.env.EMAIL_FROM ?? "").trim();
  if (customFrom) return customFrom;
  const smtpUser = getSmtpUser().trim();
  if (smtpUser) return smtpUser;
  return "no-reply@example.com";
};
const getFromName = () => process.env.EMAIL_FROM_NAME ?? getBrandName();
const getFromHeader = () => `${getFromName()} <${getFromEmail()}>`;
const getReplyToEmail = () => process.env.EMAIL_REPLY_TO ?? "";

export const sendAccountDeleteVerificationEmail = async (params: {
  to: string;
  verificationUrl: string;
}) => {
  const brandName = getBrandName();
  const supportEmail = getSupportEmail();
  const primaryColor = getBrandPrimaryColor();
  const expiryHours = Math.max(1, Math.floor(ACCOUNT_DELETE_VERIFICATION_TTL_SECONDS / 3600));
  const subject = `Confirm ${brandName} account deletion`;
  const text = [
    `We received a request to delete your ${brandName} account.`,
    "",
    "Click the link below to confirm account deletion:",
    params.verificationUrl,
    "",
    `This link expires in ${expiryHours} hour${expiryHours === 1 ? "" : "s"}.`,
    "If this wasn't you, ignore this email and your account stays active.",
    ...(supportEmail ? ["", `Need help? Contact: ${supportEmail}`] : []),
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px">Confirm Account Deletion</h2>
      <p style="margin:0 0 12px">Click the button below to permanently delete your account.</p>
      <p style="margin:0 0 20px">
        <a href="${params.verificationUrl}" style="background:${primaryColor};color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">
          Delete Account
        </a>
      </p>
      <p style="margin:0 0 8px">Or copy and paste this URL:</p>
      <p style="margin:0;word-break:break-all">${params.verificationUrl}</p>
      <p style="margin:16px 0 0;color:#475569">This link expires in ${expiryHours} hour${expiryHours === 1 ? "" : "s"}.</p>
      <p style="margin:8px 0 0;color:#475569">If you didn't request this, ignore this email.</p>
      ${supportEmail ? `<p style="margin:8px 0 0;color:#475569">Need help? ${supportEmail}</p>` : ""}
    </div>
  `.trim();

  const smtpUser = getSmtpUser();
  const smtpPass = getSmtpPass();
  const smtpService = getSmtpService();
  const smtpHost = getSmtpHost();
  const smtpPort = getSmtpPort();
  const smtpSecure = getSmtpSecure();
  const replyToEmail = getReplyToEmail();
  const missingAuth = !smtpUser || !smtpPass;
  const missingTransport = !smtpService && !smtpHost;

  if (missingAuth || missingTransport) {
    console.info(
      `[email] SMTP is not fully configured. Account delete link for ${params.to}: ${params.verificationUrl}`,
    );
    return { sent: false as const };
  }

  const transporter = nodemailer.createTransport(
    smtpService
      ? { service: smtpService, auth: { user: smtpUser, pass: smtpPass } }
      : { host: smtpHost, port: smtpPort, secure: smtpSecure, auth: { user: smtpUser, pass: smtpPass } },
  );

  await transporter.sendMail({
    from: getFromHeader(),
    sender: smtpUser ? `${getFromName()} <${smtpUser}>` : undefined,
    replyTo: replyToEmail || undefined,
    to: params.to,
    subject,
    text,
    html,
  });

  return { sent: true as const };
};
