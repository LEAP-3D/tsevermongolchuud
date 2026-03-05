import { createHmac, timingSafeEqual } from "node:crypto";

type VerifyTokenHeader = {
  alg: "HS256";
  typ: "JWT";
};

type VerifyTokenPayload = {
  sub: number;
  email: string;
  purpose: "email-verification";
  iat: number;
  exp: number;
};

export type EmailVerificationClaims = {
  userId: number;
  email: string;
  issuedAt: number;
  expiresAt: number;
};

export const EMAIL_VERIFICATION_TTL_SECONDS = 24 * 60 * 60;
const DEV_FALLBACK_SECRET = "dev-only-change-email-verify-secret";

const getVerifySecret = () =>
  process.env.EMAIL_VERIFICATION_SECRET ??
  process.env.AUTH_JWT_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  DEV_FALLBACK_SECRET;

const base64UrlEncodeJson = (value: unknown) =>
  Buffer.from(JSON.stringify(value), "utf8").toString("base64url");

const parseJwtPart = <T>(value: string): T | null => {
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
};

const signToken = (unsigned: string) =>
  createHmac("sha256", getVerifySecret()).update(unsigned).digest("base64url");

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

export const createEmailVerificationToken = (params: {
  userId: number;
  email: string;
  ttlSeconds?: number;
}) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + (params.ttlSeconds ?? EMAIL_VERIFICATION_TTL_SECONDS);
  const header: VerifyTokenHeader = { alg: "HS256", typ: "JWT" };
  const payload: VerifyTokenPayload = {
    sub: params.userId,
    email: params.email,
    purpose: "email-verification",
    iat: issuedAt,
    exp: expiresAt,
  };

  const encodedHeader = base64UrlEncodeJson(header);
  const encodedPayload = base64UrlEncodeJson(payload);
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = signToken(unsigned);

  return {
    token: `${unsigned}.${signature}`,
    expiresAt,
  };
};

export const verifyEmailVerificationToken = (token: string): EmailVerificationClaims | null => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  if (!encodedHeader || !encodedPayload || !encodedSignature) return null;

  const header = parseJwtPart<VerifyTokenHeader>(encodedHeader);
  const payload = parseJwtPart<VerifyTokenPayload>(encodedPayload);
  if (!header || !payload) return null;
  if (header.alg !== "HS256" || header.typ !== "JWT") return null;
  if (payload.purpose !== "email-verification") return null;

  const expectedSignature = signToken(`${encodedHeader}.${encodedPayload}`);
  let expectedBytes: Buffer;
  let providedBytes: Buffer;
  try {
    expectedBytes = Buffer.from(expectedSignature, "base64url");
    providedBytes = Buffer.from(encodedSignature, "base64url");
  } catch {
    return null;
  }

  if (expectedBytes.length !== providedBytes.length) return null;
  if (!timingSafeEqual(expectedBytes, providedBytes)) return null;

  const userId = Number(payload.sub);
  const issuedAt = Number(payload.iat);
  const expiresAt = Number(payload.exp);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  if (!Number.isInteger(issuedAt) || !Number.isInteger(expiresAt)) return null;
  if (expiresAt <= Math.floor(Date.now() / 1000)) return null;
  if (typeof payload.email !== "string" || !payload.email) return null;

  return {
    userId,
    email: payload.email,
    issuedAt,
    expiresAt,
  };
};

export const buildEmailVerificationUrl = (token: string) => {
  const url = new URL("/verify-email", getAppOrigin());
  url.searchParams.set("token", token);
  return url.toString();
};
