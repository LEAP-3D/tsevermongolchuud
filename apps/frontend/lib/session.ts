import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "pg_session";
export const SESSION_DURATION_SECONDS = 6 * 60 * 60;

type JwtHeader = {
  alg: "HS256";
  typ: "JWT";
};

type JwtPayload = {
  sub: number;
  email: string;
  iat: number;
  exp: number;
};

export type SessionClaims = {
  userId: number;
  email: string;
  issuedAt: number;
  expiresAt: number;
};

const DEV_FALLBACK_SECRET = "dev-only-change-auth-jwt-secret";

const getJwtSecret = () =>
  process.env.AUTH_JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? DEV_FALLBACK_SECRET;

const base64UrlEncodeJson = (value: unknown) =>
  Buffer.from(JSON.stringify(value), "utf8").toString("base64url");

const signJwt = (data: string) =>
  createHmac("sha256", getJwtSecret()).update(data).digest("base64url");

const parseJwtPart = <T>(value: string): T | null => {
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
};

const extractCookie = (header: string | null, key: string): string | null => {
  if (!header) return null;
  const pairs = header.split(";");
  for (const pair of pairs) {
    const [rawName, ...rawValue] = pair.trim().split("=");
    if (rawName !== key) continue;
    const value = rawValue.join("=");
    if (!value) return null;
    return decodeURIComponent(value);
  }
  return null;
};

export const createSessionToken = (params: {
  userId: number;
  email: string;
}): { token: string; expiresAt: number } => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + SESSION_DURATION_SECONDS;
  const header: JwtHeader = { alg: "HS256", typ: "JWT" };
  const payload: JwtPayload = {
    sub: params.userId,
    email: params.email,
    iat: issuedAt,
    exp: expiresAt,
  };

  const encodedHeader = base64UrlEncodeJson(header);
  const encodedPayload = base64UrlEncodeJson(payload);
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = signJwt(unsigned);

  return {
    token: `${unsigned}.${signature}`,
    expiresAt,
  };
};

export const verifySessionToken = (token: string): SessionClaims | null => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  if (!encodedHeader || !encodedPayload || !encodedSignature) return null;

  const header = parseJwtPart<JwtHeader>(encodedHeader);
  const payload = parseJwtPart<JwtPayload>(encodedPayload);
  if (!header || !payload) return null;
  if (header.alg !== "HS256" || header.typ !== "JWT") return null;

  const expectedSignature = signJwt(`${encodedHeader}.${encodedPayload}`);
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
  if (!Number.isInteger(userId) || userId <= 0) return null;

  const issuedAt = Number(payload.iat);
  const expiresAt = Number(payload.exp);
  if (!Number.isInteger(issuedAt) || !Number.isInteger(expiresAt)) return null;
  if (expiresAt <= Math.floor(Date.now() / 1000)) return null;
  if (typeof payload.email !== "string" || payload.email.length === 0) return null;

  return {
    userId,
    email: payload.email,
    issuedAt,
    expiresAt,
  };
};

export const getSessionFromRequest = (req: Request): SessionClaims | null => {
  const token = extractCookie(req.headers.get("cookie"), SESSION_COOKIE_NAME);
  if (!token) return null;
  return verifySessionToken(token);
};

export const unauthorizedJson = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export const attachSessionCookie = (
  response: NextResponse,
  session: { token: string; expiresAt: number },
) => {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: session.token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
    expires: new Date(session.expiresAt * 1000),
  });
};

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
};
