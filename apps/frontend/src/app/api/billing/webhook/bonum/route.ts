/* eslint-disable max-lines */

import {
  BillingInvoiceStatus,
  BillingSubscriptionStatus,
  Prisma,
} from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  generateBonumWebhookDedupeKey,
  parseBonumDate,
  verifyBonumChecksum,
} from "@/lib/billing/bonum";

type WebhookPayload = {
  type?: unknown;
  status?: unknown;
  message?: unknown;
  body?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asTrimmedString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const addMonths = (base: Date, months: number) => {
  const result = new Date(base);
  result.setMonth(result.getMonth() + months);
  return result;
};

const isUniqueConstraintError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

const toUpper = (value: string | null) => value?.toUpperCase() ?? null;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const returnUrl =
    process.env.BILLING_POST_PAYMENT_REDIRECT_URL?.trim() ||
    `${url.origin}/home?billing=returned`;
  return NextResponse.redirect(returnUrl);
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const checksumHeader =
    req.headers.get("x-checksum-v2") ?? req.headers.get("x-checksum");
  const checksumKey = process.env.BONUM_MERCHANT_CHECKSUM_KEY?.trim() ?? "";
  const signatureRequired = checksumKey.length > 0;
  const signatureValid = signatureRequired
    ? verifyBonumChecksum(rawBody, checksumHeader)
    : true;
  const dedupeKey = generateBonumWebhookDedupeKey(rawBody);

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    payload = { type: "UNKNOWN", status: "FAILED", body: { rawBody } };
  }

  const payloadBody = isRecord(payload.body) ? payload.body : {};
  const eventType = asTrimmedString(payload.type) ?? "UNKNOWN";
  const eventStatus = asTrimmedString(payload.status) ?? null;
  const bonumInvoiceId =
    asTrimmedString(payloadBody.invoiceId) ??
    asTrimmedString((payload as Record<string, unknown>).invoiceId);
  const transactionId =
    asTrimmedString(payloadBody.transactionId) ??
    asTrimmedString((payload as Record<string, unknown>).transactionId);

  let invoice =
    bonumInvoiceId
      ? await prisma.paymentInvoice.findUnique({
          where: { bonumInvoiceId },
          include: {
            subscription: {
              include: { plan: true },
            },
          },
        })
      : null;

  if (!invoice && transactionId) {
    invoice = await prisma.paymentInvoice.findUnique({
      where: { localTransactionId: transactionId },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    });
  }

  const requestHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    requestHeaders[key] = value;
  });

  let paymentEventId: number | null = null;
  try {
    const paymentEvent = await prisma.paymentEvent.create({
      data: {
        dedupeKey,
        provider: "BONUM",
        userId: invoice?.userId ?? null,
        invoiceId: invoice?.id ?? null,
        eventType,
        eventStatus,
        bonumInvoiceId,
        transactionId,
        signatureValid,
        payload: payload as Prisma.InputJsonValue,
        headers: requestHeaders as Prisma.InputJsonValue,
      },
      select: { id: true },
    });
    paymentEventId = paymentEvent.id;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    const message =
      error instanceof Error ? error.message : "Failed to persist webhook event.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (signatureRequired && !signatureValid) {
    if (paymentEventId) {
      await prisma.paymentEvent.update({
        where: { id: paymentEventId },
        data: {
          processed: true,
          processError: "Invalid checksum signature.",
          processedAt: new Date(),
        },
      });
    }
    return NextResponse.json({ error: "Invalid checksum." }, { status: 401 });
  }

  if (!invoice) {
    if (paymentEventId) {
      await prisma.paymentEvent.update({
        where: { id: paymentEventId },
        data: {
          processed: true,
          processError: "Invoice not found for webhook payload.",
          processedAt: new Date(),
        },
      });
    }
    return NextResponse.json({ received: true, unmatched: true }, { status: 202 });
  }

  try {
    const now = new Date();
    const completedAt =
      parseBonumDate(payloadBody.completedAt) ??
      parseBonumDate(payloadBody.updatedAt) ??
      now;
    const normalizedEventType = toUpper(eventType);
    const normalizedEventStatus = toUpper(eventStatus);
    const normalizedInvoiceStatus = toUpper(
      asTrimmedString(payloadBody.invoiceStatus),
    );
    const isPaymentSuccess =
      normalizedEventType === "PAYMENT" &&
      (normalizedEventStatus === "SUCCESS" ||
        normalizedInvoiceStatus === "PAID" ||
        normalizedInvoiceStatus === "SUCCESS");
    const isPaymentFailed =
      normalizedEventType === "PAYMENT" &&
      (normalizedEventStatus === "FAILED" ||
        normalizedInvoiceStatus === "FAILED" ||
        normalizedInvoiceStatus === "EXPIRED");

    if (isPaymentSuccess) {
      await prisma.$transaction(async (tx) => {
        await tx.paymentInvoice.update({
          where: { id: invoice.id },
          data: {
            status: BillingInvoiceStatus.PAID,
            paidAt: completedAt,
            webhookReceivedAt: now,
            rawLastWebhook: payload as Prisma.InputJsonValue,
            bonumInvoiceId: bonumInvoiceId ?? invoice.bonumInvoiceId,
          },
        });

        if (invoice.subscriptionId && invoice.subscription) {
          await tx.userSubscription.updateMany({
            where: {
              userId: invoice.userId,
              status: BillingSubscriptionStatus.ACTIVE,
              id: { not: invoice.subscriptionId },
            },
            data: {
              status: BillingSubscriptionStatus.CANCELED,
              canceledAt: now,
            },
          });

          await tx.userSubscription.update({
            where: { id: invoice.subscriptionId },
            data: {
              status: BillingSubscriptionStatus.ACTIVE,
              startsAt: now,
              endsAt: addMonths(now, invoice.subscription.plan.durationMonths),
              activatedAt: now,
            },
          });
        }
      });
    } else if (isPaymentFailed) {
      const nextStatus =
        normalizedInvoiceStatus === "EXPIRED"
          ? BillingInvoiceStatus.EXPIRED
          : BillingInvoiceStatus.FAILED;

      await prisma.$transaction(async (tx) => {
        await tx.paymentInvoice.update({
          where: { id: invoice.id },
          data: {
            status: nextStatus,
            failedAt: completedAt,
            webhookReceivedAt: now,
            rawLastWebhook: payload as Prisma.InputJsonValue,
            bonumInvoiceId: bonumInvoiceId ?? invoice.bonumInvoiceId,
          },
        });

        if (invoice.subscriptionId) {
          await tx.userSubscription.update({
            where: { id: invoice.subscriptionId },
            data: {
              status: BillingSubscriptionStatus.CANCELED,
              canceledAt: now,
            },
          });
        }
      });
    } else if (normalizedEventType === "UNSUBSCRIBED" && invoice.subscriptionId) {
      await prisma.userSubscription.update({
        where: { id: invoice.subscriptionId },
        data: {
          status: BillingSubscriptionStatus.CANCELED,
          canceledAt: now,
        },
      });
    } else {
      await prisma.paymentInvoice.update({
        where: { id: invoice.id },
        data: {
          webhookReceivedAt: now,
          rawLastWebhook: payload as Prisma.InputJsonValue,
          bonumInvoiceId: bonumInvoiceId ?? invoice.bonumInvoiceId,
        },
      });
    }

    if (paymentEventId) {
      await prisma.paymentEvent.update({
        where: { id: paymentEventId },
        data: {
          processed: true,
          processedAt: new Date(),
          processError: null,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process webhook.";
    if (paymentEventId) {
      await prisma.paymentEvent.update({
        where: { id: paymentEventId },
        data: {
          processed: true,
          processedAt: new Date(),
          processError: message,
        },
      });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
