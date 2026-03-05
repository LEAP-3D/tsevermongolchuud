import nodemailer from "nodemailer";

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
const getAppOrigin = () => {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
};

type SendDangerousWebsiteAlertEmailParams = {
  to: string;
  parentName?: string | null;
  childName: string;
  domain: string;
  fullUrl: string;
  safetyScore?: number | null;
  visitedAt: Date;
};

export const sendDangerousWebsiteAlertEmail = async (
  params: SendDangerousWebsiteAlertEmailParams,
) => {
  const brandName = getBrandName();
  const supportEmail = getSupportEmail();
  const primaryColor = getBrandPrimaryColor();
  const dashboardUrl = `${getAppOrigin()}/home`;
  const parentGreeting = params.parentName?.trim() ? `Hi ${params.parentName.trim()},` : "Hi,";
  const target = params.domain || params.fullUrl || "Unknown website";
  const visitedAtLabel = params.visitedAt.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
    timeZone: "UTC",
  });
  const safetyScoreLine = Number.isFinite(Number(params.safetyScore))
    ? `Safety score: ${Math.max(0, Math.min(100, Math.round(Number(params.safetyScore))))}/100`
    : "Safety score: Unknown";
  const subject = `Dangerous website alert for ${params.childName}`;
  const text = [
    parentGreeting,
    "",
    `${params.childName} visited a dangerous website.`,
    `Website: ${target}`,
    safetyScoreLine,
    `Visited at (UTC): ${visitedAtLabel}`,
    "",
    `Review details in your dashboard: ${dashboardUrl}`,
    ...(supportEmail ? ["", `Need help? Contact: ${supportEmail}`] : []),
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#0f172a">
      <h2 style="margin:0 0 12px;color:#dc2626">Dangerous website detected</h2>
      <p style="margin:0 0 12px">${parentGreeting}</p>
      <p style="margin:0 0 10px"><strong>${params.childName}</strong> visited a website marked as dangerous.</p>
      <p style="margin:0 0 6px"><strong>Website:</strong> ${target}</p>
      <p style="margin:0 0 6px"><strong>${safetyScoreLine}</strong></p>
      <p style="margin:0 0 18px"><strong>Visited at (UTC):</strong> ${visitedAtLabel}</p>
      <p style="margin:0 0 20px">
        <a href="${dashboardUrl}" style="background:${primaryColor};color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">
          Open Dashboard
        </a>
      </p>
      <p style="margin:0 0 8px;color:#475569">Stay alert and review your child&apos;s recent browsing activity in ${brandName}.</p>
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
      `[email] SMTP is not fully configured. Dangerous website alert for ${params.to}: child=${params.childName} target=${target}`,
    );
    return { sent: false as const };
  }

  const transporter = nodemailer.createTransport(
    smtpService
      ? { service: smtpService, auth: { user: smtpUser, pass: smtpPass } }
      : {
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: { user: smtpUser, pass: smtpPass },
        },
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
