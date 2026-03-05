import { createHash, randomBytes } from "node:crypto";

export const ACCOUNT_DELETE_VERIFICATION_TTL_SECONDS = 60 * 60;

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

export const hashAccountDeleteToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const createAccountDeleteVerificationToken = () => {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashAccountDeleteToken(token);
  const expiresAt = new Date(Date.now() + ACCOUNT_DELETE_VERIFICATION_TTL_SECONDS * 1000);
  return { token, tokenHash, expiresAt };
};

export const buildAccountDeleteVerificationUrl = (token: string) => {
  const url = new URL("/verify-email", getAppOrigin());
  url.searchParams.set("purpose", "account-delete");
  url.searchParams.set("token", token);
  return url.toString();
};
