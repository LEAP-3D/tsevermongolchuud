import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserChildCapacity } from "@/lib/billing/entitlement";
import { ensureDefaultSubscriptionPlans } from "@/lib/billing/plans";
import { getSessionFromRequest, unauthorizedJson } from "@/lib/session";

export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  try {
    await ensureDefaultSubscriptionPlans();

    const [plans, capacity] = await Promise.all([
      prisma.subscriptionPlan.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { priceMnt: "asc" }],
        select: {
          code: true,
          name: true,
          description: true,
          priceMnt: true,
          durationMonths: true,
          maxChildren: true,
          aiAgentEnabled: true,
          currency: true,
        },
      }),
      getUserChildCapacity(session.userId),
    ]);

    return NextResponse.json({
      plans,
      summary: {
        isPaid: capacity.entitlement.isPaid,
        maxChildren: capacity.entitlement.maxChildren,
        aiAgentEnabled: capacity.entitlement.aiAgentEnabled,
        activePlanCode: capacity.entitlement.activePlanCode,
        activePlanName: capacity.entitlement.activePlanName,
        activeSubscriptionId: capacity.entitlement.activeSubscriptionId,
        subscriptionEndsAt: capacity.entitlement.subscriptionEndsAt,
        childCount: capacity.childCount,
        remainingSlots: capacity.remainingSlots,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load billing plans.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
