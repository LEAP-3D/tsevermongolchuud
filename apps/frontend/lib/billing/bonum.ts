/* eslint-disable max-lines */

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import prisma from "@/lib/prisma";

type BonumAuthResponse = {
  tokenType?: string;
  accessToken?: string;
  expiresIn?: number;
  refreshToken?: string;
  refreshExpiresIn?: number;
  unit?: string;
};

type BonumConfig = {
  apiBaseUrl: string;
  appSecret: string;
  terminalId: string;
  acceptLanguage: string;
  defaultInvoiceExpiresInSeconds: number;
  checksumKey: string;
  webhookCallbackUrl: string;
};

export type BonumInvoiceCreateInput = {
  amountMnt: number;
  transactionId: string;
  callbackUrl?: string;
  expiresInSeconds?: number;
  itemTitle?: string;
  itemRemark?: string;
};

export type BonumInvoiceCreateResult = {
  invoiceId: string;
  followUpLink: string;
  expiresInSeconds: number;
  rawResponse: unknown;
};

const DEFAULT_BONUM_API_BASE_URL = "https://testapi.bonum.mn";
const DEFAULT_ACCEPT_LANGUAGE = "mn";
const DEFAULT_INVOICE_EXPIRES_SECONDS = 1_800;
const REQUEST_TIMEOUT_MS = 15_000;
const TOKEN_BUFFER_MS = 60_000;

const toClean = (value: string | undefined) => (value ?? "").trim();
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toPositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const getBonumConfig = (): BonumConfig => {
  const webhookFromEnv =
    toClean(process.env.BONUM_WEBHOOK_CALLBACK_URL) ||
    toClean(process.env.BONUM_WEBHOOK_URL);

  return {
    apiBaseUrl: trimTrailingSlash(
      toClean(process.env.BONUM_API_BASE_URL) || DEFAULT_BONUM_API_BASE_URL,
    ),
    appSecret: toClean(process.env.BONUM_APP_SECRET),
    terminalId: toClean(process.env.BONUM_TERMINAL_ID),
    acceptLanguage:
      toClean(process.env.BONUM_ACCEPT_LANGUAGE) || DEFAULT_ACCEPT_LANGUAGE,
    defaultInvoiceExpiresInSeconds: toPositiveInt(
      process.env.BONUM_INVOICE_EXPIRES_SECONDS,
      DEFAULT_INVOICE_EXPIRES_SECONDS,
    ),
    checksumKey: toClean(process.env.BONUM_MERCHANT_CHECKSUM_KEY),
    webhookCallbackUrl: webhookFromEnv,
  };
};

const assertBonumAuthConfig = (config: BonumConfig) => {
  if (!config.appSecret) {
    throw new Error("BONUM_APP_SECRET is not configured.");
  }
  if (!config.terminalId) {
    throw new Error("BONUM_TERMINAL_ID is not configured.");
  }
};

const parseJsonSafe = (text: string): unknown => {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const fetchBonum = async (
  path: string,
  init: RequestInit,
): Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  payload: unknown;
}> => {
  const config = getBonumConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
    const text = await response.text();
    const payload = parseJsonSafe(text);
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      payload,
    };
  } finally {
    clearTimeout(timeout);
  }
};

const extractBonumErrorMessage = (
  payload: unknown,
  fallback: string,
): string => {
  if (typeof payload === "string" && payload.trim()) return payload.trim();
  if (isRecord(payload)) {
    const message = payload.message;
    if (typeof message === "string" && message.trim()) return message.trim();
    const error = payload.error;
    if (typeof error === "string" && error.trim()) return error.trim();
  }
  return fallback;
};

const upsertBonumToken = async (
  terminalId: string,
  tokenPayload: BonumAuthResponse,
) => {
  const now = Date.now();
  const expiresInSeconds =
    Number(tokenPayload.expiresIn) > 0
      ? Number(tokenPayload.expiresIn)
      : DEFAULT_INVOICE_EXPIRES_SECONDS;
  const refreshExpiresSeconds =
    Number(tokenPayload.refreshExpiresIn) > 0
      ? Number(tokenPayload.refreshExpiresIn)
      : null;

  await prisma.bonumAuthToken.upsert({
    where: { terminalId },
    create: {
      terminalId,
      accessToken: tokenPayload.accessToken ?? "",
      refreshToken: tokenPayload.refreshToken ?? null,
      tokenType: tokenPayload.tokenType ?? null,
      expiresInSeconds,
      refreshExpiresSeconds,
      accessTokenExpiresAt: new Date(now + expiresInSeconds * 1_000),
      refreshTokenExpiresAt: refreshExpiresSeconds
        ? new Date(now + refreshExpiresSeconds * 1_000)
        : null,
    },
    update: {
      accessToken: tokenPayload.accessToken ?? "",
      refreshToken: tokenPayload.refreshToken ?? null,
      tokenType: tokenPayload.tokenType ?? null,
      expiresInSeconds,
      refreshExpiresSeconds,
      accessTokenExpiresAt: new Date(now + expiresInSeconds * 1_000),
      refreshTokenExpiresAt: refreshExpiresSeconds
        ? new Date(now + refreshExpiresSeconds * 1_000)
        : null,
    },
  });
};

const requestNewBonumToken = async (
  config: BonumConfig,
): Promise<BonumAuthResponse> => {
  const response = await fetchBonum("/bonum-gateway/ecommerce/auth/create", {
    method: "GET",
    headers: {
      Authorization: `AppSecret ${config.appSecret}`,
      "X-TERMINAL-ID": config.terminalId,
    },
  });

  if (!response.ok) {
    throw new Error(
      extractBonumErrorMessage(
        response.payload,
        `Bonum token create failed (${response.status}).`,
      ),
    );
  }

  if (!isRecord(response.payload) || !response.payload.accessToken) {
    throw new Error("Bonum token create response is invalid.");
  }

  return response.payload as BonumAuthResponse;
};

const refreshBonumToken = async (
  config: BonumConfig,
  refreshToken: string,
): Promise<BonumAuthResponse> => {
  const response = await fetchBonum("/bonum-gateway/ecommerce/auth/refresh", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      "X-TERMINAL-ID": config.terminalId,
    },
  });

  if (!response.ok) {
    throw new Error(
      extractBonumErrorMessage(
        response.payload,
        `Bonum token refresh failed (${response.status}).`,
      ),
    );
  }

  if (!isRecord(response.payload) || !response.payload.accessToken) {
    throw new Error("Bonum token refresh response is invalid.");
  }

  return {
    ...response.payload,
    refreshToken,
  } as BonumAuthResponse;
};

export const resolveBonumAccessToken = async (): Promise<string> => {
  const config = getBonumConfig();
  assertBonumAuthConfig(config);

  const now = Date.now();
  const cached = await prisma.bonumAuthToken.findUnique({
    where: { terminalId: config.terminalId },
  });

  if (
    cached?.accessToken &&
    cached.accessTokenExpiresAt.getTime() - now > TOKEN_BUFFER_MS
  ) {
    return cached.accessToken;
  }

  if (
    cached?.refreshToken &&
    cached.refreshTokenExpiresAt &&
    cached.refreshTokenExpiresAt.getTime() - now > TOKEN_BUFFER_MS
  ) {
    try {
      const refreshed = await refreshBonumToken(config, cached.refreshToken);
      await upsertBonumToken(config.terminalId, refreshed);
      if (!refreshed.accessToken) {
        throw new Error("Bonum refresh response does not contain accessToken.");
      }
      return refreshed.accessToken;
    } catch (error) {
      const stillValidAccessToken =
        cached.accessToken &&
        cached.accessTokenExpiresAt.getTime() - now > 5_000;
      if (stillValidAccessToken) {
        return cached.accessToken;
      }
      const message =
        error instanceof Error ? error.message : "Bonum token refresh failed.";
      console.warn("[billing:bonum] refresh failed", message);
    }
  }

  const fresh = await requestNewBonumToken(config);
  await upsertBonumToken(config.terminalId, fresh);
  if (!fresh.accessToken) {
    throw new Error("Bonum create-token response does not contain accessToken.");
  }
  return fresh.accessToken;
};

export const createBonumInvoice = async (
  input: BonumInvoiceCreateInput,
): Promise<BonumInvoiceCreateResult> => {
  const config = getBonumConfig();
  assertBonumAuthConfig(config);
  const accessToken = await resolveBonumAccessToken();
  const expiresInSeconds =
    input.expiresInSeconds && input.expiresInSeconds > 0
      ? input.expiresInSeconds
      : config.defaultInvoiceExpiresInSeconds;

  const callbackUrl =
    input.callbackUrl?.trim() ||
    config.webhookCallbackUrl ||
    "https://example.com/api/billing/webhook/bonum";

  const response = await fetchBonum("/bonum-gateway/ecommerce/invoices", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept-Language": config.acceptLanguage,
    },
    body: JSON.stringify({
      amount: input.amountMnt,
      callback: callbackUrl,
      transactionId: input.transactionId,
      expiresIn: expiresInSeconds,
      items: [
        {
          title: input.itemTitle ?? "Safe-kid subscription",
          remark:
            input.itemRemark ?? "Safe-kid multi-child subscription payment",
          amount: input.amountMnt,
          count: 1,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(
      extractBonumErrorMessage(
        response.payload,
        `Bonum create invoice failed (${response.status}).`,
      ),
    );
  }

  const invoiceContainer =
    isRecord(response.payload) && isRecord(response.payload.data)
      ? response.payload.data
      : response.payload;

  if (!isRecord(invoiceContainer)) {
    throw new Error("Bonum create invoice response is invalid.");
  }

  const invoiceId =
    typeof invoiceContainer.invoiceId === "string"
      ? invoiceContainer.invoiceId
      : "";
  const followUpLink =
    typeof invoiceContainer.followUpLink === "string"
      ? invoiceContainer.followUpLink
      : "";

  if (!invoiceId || !followUpLink) {
    throw new Error("Bonum invoice response missing invoiceId/followUpLink.");
  }

  return {
    invoiceId,
    followUpLink,
    expiresInSeconds,
    rawResponse: response.payload,
  };
};

export const computeBonumChecksum = (rawBody: string, checksumKey: string) =>
  createHmac("sha256", checksumKey).update(rawBody, "utf8").digest("hex");

export const verifyBonumChecksum = (
  rawBody: string,
  checksumHeader: string | null,
): boolean => {
  const config = getBonumConfig();
  if (!config.checksumKey) return false;
  if (!checksumHeader || !checksumHeader.trim()) return false;

  const expected = computeBonumChecksum(rawBody, config.checksumKey);
  const provided = checksumHeader.trim().toLowerCase();
  const expectedBytes = Buffer.from(expected, "utf8");
  const providedBytes = Buffer.from(provided, "utf8");
  if (expectedBytes.length !== providedBytes.length) return false;
  return timingSafeEqual(expectedBytes, providedBytes);
};

export const generateBonumWebhookDedupeKey = (rawBody: string) =>
  createHash("sha256").update(rawBody, "utf8").digest("hex");

export const generateLocalTransactionId = (userId: number) => {
  const nowPart = Date.now();
  const randomPart = randomBytes(4).toString("hex");
  return `safekid-u${userId}-${nowPart}-${randomPart}`;
};

export const resolveWebhookCallbackUrlForInvoice = (req: Request): string => {
  const config = getBonumConfig();
  if (config.webhookCallbackUrl) return config.webhookCallbackUrl;
  const base = new URL(req.url);
  return `${base.origin}/api/billing/webhook/bonum`;
};

export const parseBonumDate = (value: unknown): Date | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    const fromNumber = new Date(value);
    if (!Number.isNaN(fromNumber.getTime())) return fromNumber;
  }
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const datetimeWithSpace =
    /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(trimmed);
  if (datetimeWithSpace) {
    const utc8 = new Date(`${trimmed.replace(" ", "T")}+08:00`);
    if (!Number.isNaN(utc8.getTime())) return utc8;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};
