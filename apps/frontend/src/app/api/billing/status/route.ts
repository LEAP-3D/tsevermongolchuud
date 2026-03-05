import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest, unauthorizedJson } from "@/lib/session";
import { getUserChildCapacity } from "@/lib/billing/entitlement";

export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  try {
    const [capacity, invoices, subscriptions] = await Promise.all([
      getUserChildCapacity(session.userId),
      prisma.paymentInvoice.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          plan: {
            select: {
              code: true,
              name: true,
              durationMonths: true,
              maxChildren: true,
            },
          },
        },
      }),
      prisma.userSubscription.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          plan: {
            select: {
              code: true,
              name: true,
              durationMonths: true,
              maxChildren: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      summary: {
        ...capacity.entitlement,
        childCount: capacity.childCount,
        remainingSlots: capacity.remainingSlots,
      },
      subscriptions,
      invoices,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load billing status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
