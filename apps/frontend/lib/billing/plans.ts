import prisma from "@/lib/prisma";

export const DEFAULT_FREE_MAX_CHILDREN = 1;

export type DefaultSubscriptionPlan = {
  code: string;
  name: string;
  description: string;
  priceMnt: number;
  durationMonths: number;
  maxChildren: number;
  aiAgentEnabled: boolean;
  sortOrder: number;
};

export const DEFAULT_SUBSCRIPTION_PLANS: DefaultSubscriptionPlan[] = [
  {
    code: "PLUS_2_5_1M",
    name: "Plus 2-5 Children (1 Month)",
    description: "For families with up to 5 children.",
    priceMnt: 20_000,
    durationMonths: 1,
    maxChildren: 5,
    aiAgentEnabled: true,
    sortOrder: 10,
  },
  {
    code: "PLUS_2_5_6M",
    name: "Plus 2-5 Children (6 Months)",
    description: "For families with up to 5 children.",
    priceMnt: 120_000,
    durationMonths: 6,
    maxChildren: 5,
    aiAgentEnabled: true,
    sortOrder: 20,
  },
  {
    code: "PLUS_2_5_12M",
    name: "Plus 2-5 Children (12 Months)",
    description: "For families with up to 5 children.",
    priceMnt: 240_000,
    durationMonths: 12,
    maxChildren: 5,
    aiAgentEnabled: true,
    sortOrder: 30,
  },
  {
    code: "FAMILY_5P_1M",
    name: "Family 5+ Children (1 Month)",
    description: "For larger families (5+ children).",
    priceMnt: 30_000,
    durationMonths: 1,
    maxChildren: 50,
    aiAgentEnabled: true,
    sortOrder: 40,
  },
  {
    code: "FAMILY_5P_6M",
    name: "Family 5+ Children (6 Months)",
    description: "For larger families (5+ children).",
    priceMnt: 180_000,
    durationMonths: 6,
    maxChildren: 50,
    aiAgentEnabled: true,
    sortOrder: 50,
  },
  {
    code: "FAMILY_5P_12M",
    name: "Family 5+ Children (12 Months)",
    description: "For larger families (5+ children).",
    priceMnt: 360_000,
    durationMonths: 12,
    maxChildren: 50,
    aiAgentEnabled: true,
    sortOrder: 60,
  },
];

let lastPlanSyncAt = 0;
const PLAN_SYNC_INTERVAL_MS = 60_000;

export const ensureDefaultSubscriptionPlans = async () => {
  const now = Date.now();
  if (now - lastPlanSyncAt < PLAN_SYNC_INTERVAL_MS) return;

  for (const plan of DEFAULT_SUBSCRIPTION_PLANS) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      create: {
        code: plan.code,
        name: plan.name,
        description: plan.description,
        priceMnt: plan.priceMnt,
        durationMonths: plan.durationMonths,
        maxChildren: plan.maxChildren,
        aiAgentEnabled: plan.aiAgentEnabled,
        sortOrder: plan.sortOrder,
      },
      update: {
        name: plan.name,
        description: plan.description,
        priceMnt: plan.priceMnt,
        durationMonths: plan.durationMonths,
        maxChildren: plan.maxChildren,
        aiAgentEnabled: plan.aiAgentEnabled,
        sortOrder: plan.sortOrder,
        active: true,
      },
    });
  }

  lastPlanSyncAt = now;
};
