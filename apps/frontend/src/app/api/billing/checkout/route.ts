import {
  BillingInvoiceStatus,
  BillingSubscriptionStatus,
  type Prisma,
} from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDefaultSubscriptionPlans } from "@/lib/billing/plans";
import {
  createBonumInvoice,
  generateLocalTransactionId,
  resolveWebhookCallbackUrlForInvoice,
} from "@/lib/billing/bonum";
import { getSessionFromRequest, unauthorizedJson } from "@/lib/session";

type CheckoutBody = {
  planCode?: string;
};

const resolveDemoPriceOverrideMnt = (): number | null => {
  const rawValue = process.env.BILLING_DEMO_PRICE_MNT?.trim();
  if (!rawValue) return null;
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

export async function POST(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  try {
    await ensureDefaultSubscriptionPlans();

    const body = (await req.json()) as CheckoutBody;
    const planCode = typeof body.planCode === "string" ? body.planCode.trim() : "";
    if (!planCode) {
      return NextResponse.json({ error: "planCode is required." }, { status: 400 });
    }

    const selectedPlan = await prisma.subscriptionPlan.findUnique({
      where: { code: planCode },
      select: {
        id: true,
        code: true,
        name: true,
        priceMnt: true,
        durationMonths: true,
        maxChildren: true,
        active: true,
        currency: true,
      },
    });
    if (!selectedPlan || !selectedPlan.active) {
      return NextResponse.json({ error: "Selected plan is unavailable." }, { status: 404 });
    }

    const amountMnt = resolveDemoPriceOverrideMnt() ?? selectedPlan.priceMnt;
    const callbackUrl = resolveWebhookCallbackUrlForInvoice(req);
    const localTransactionId = generateLocalTransactionId(session.userId);

    const pendingSubscription = await prisma.userSubscription.create({
      data: {
        userId: session.userId,
        planId: selectedPlan.id,
        status: BillingSubscriptionStatus.PENDING,
        source: "BONUM_WEB_INVOICE",
      },
      select: { id: true },
    });

    const draftInvoice = await prisma.paymentInvoice.create({
      data: {
        userId: session.userId,
        planId: selectedPlan.id,
        subscriptionId: pendingSubscription.id,
        localTransactionId,
        amountMnt,
        currency: selectedPlan.currency,
        status: BillingInvoiceStatus.CREATED,
        callbackUrl,
      },
      select: { id: true },
    });

    try {
      const invoice = await createBonumInvoice({
        amountMnt,
        transactionId: localTransactionId,
        callbackUrl,
        itemTitle: selectedPlan.name,
        itemRemark: `Safe-kid subscription (${selectedPlan.durationMonths} month)`,
      });

      const expiresAt = new Date(Date.now() + invoice.expiresInSeconds * 1_000);

      await prisma.$transaction([
        prisma.paymentInvoice.update({
          where: { id: draftInvoice.id },
          data: {
            bonumInvoiceId: invoice.invoiceId,
            followUpLink: invoice.followUpLink,
            status: BillingInvoiceStatus.PENDING,
            expiresAt,
            ...(invoice.rawResponse === undefined
              ? {}
              : {
                  rawCreateResponse:
                    invoice.rawResponse as Prisma.InputJsonValue,
                }),
          },
        }),
        prisma.userSubscription.update({
          where: { id: pendingSubscription.id },
          data: {
            latestInvoiceId: draftInvoice.id,
          },
        }),
      ]);

      return NextResponse.json({
        checkoutUrl: invoice.followUpLink,
        invoiceId: invoice.invoiceId,
        transactionId: localTransactionId,
        subscriptionId: pendingSubscription.id,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create payment invoice.";

      await prisma.$transaction([
        prisma.paymentInvoice.update({
          where: { id: draftInvoice.id },
          data: {
            status: BillingInvoiceStatus.FAILED,
            failedAt: new Date(),
            rawCreateResponse: { error: message },
          },
        }),
        prisma.userSubscription.update({
          where: { id: pendingSubscription.id },
          data: {
            status: BillingSubscriptionStatus.CANCELED,
            canceledAt: new Date(),
          },
        }),
      ]);

      return NextResponse.json({ error: message }, { status: 502 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
