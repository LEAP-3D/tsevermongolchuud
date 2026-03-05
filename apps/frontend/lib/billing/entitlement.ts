import { BillingSubscriptionStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  DEFAULT_FREE_MAX_CHILDREN,
  ensureDefaultSubscriptionPlans,
} from "@/lib/billing/plans";

export type UserEntitlement = {
  isPaid: boolean;
  maxChildren: number;
  aiAgentEnabled: boolean;
  activePlanCode: string | null;
  activePlanName: string | null;
  activeSubscriptionId: number | null;
  subscriptionEndsAt: Date | null;
};

const markExpiredSubscriptions = async (userId: number, now: Date) => {
  await prisma.userSubscription.updateMany({
    where: {
      userId,
      status: BillingSubscriptionStatus.ACTIVE,
      endsAt: { lte: now },
    },
    data: {
      status: BillingSubscriptionStatus.EXPIRED,
    },
  });
};

export const getUserEntitlement = async (
  userId: number,
): Promise<UserEntitlement> => {
  await ensureDefaultSubscriptionPlans();
  const now = new Date();
  await markExpiredSubscriptions(userId, now);

  const activeSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      status: BillingSubscriptionStatus.ACTIVE,
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      plan: { active: true },
    },
    include: {
      plan: true,
    },
    orderBy: [{ endsAt: "desc" }, { id: "desc" }],
  });

  if (!activeSubscription) {
    return {
      isPaid: false,
      maxChildren: DEFAULT_FREE_MAX_CHILDREN,
      aiAgentEnabled: false,
      activePlanCode: null,
      activePlanName: null,
      activeSubscriptionId: null,
      subscriptionEndsAt: null,
    };
  }

  return {
    isPaid: true,
    maxChildren: Math.max(
      DEFAULT_FREE_MAX_CHILDREN,
      Number(activeSubscription.plan.maxChildren) || DEFAULT_FREE_MAX_CHILDREN,
    ),
    aiAgentEnabled: Boolean(activeSubscription.plan.aiAgentEnabled),
    activePlanCode: activeSubscription.plan.code,
    activePlanName: activeSubscription.plan.name,
    activeSubscriptionId: activeSubscription.id,
    subscriptionEndsAt: activeSubscription.endsAt,
  };
};

export type UserChildCapacity = {
  entitlement: UserEntitlement;
  childCount: number;
  remainingSlots: number;
  canAddChild: boolean;
};

export const getUserChildCapacity = async (
  userId: number,
): Promise<UserChildCapacity> => {
  const [entitlement, childCount] = await Promise.all([
    getUserEntitlement(userId),
    prisma.child.count({
      where: { parentId: userId },
    }),
  ]);

  const remainingSlots = Math.max(0, entitlement.maxChildren - childCount);
  const canAddChild = childCount < entitlement.maxChildren;

  return {
    entitlement,
    childCount,
    remainingSlots,
    canAddChild,
  };
};
