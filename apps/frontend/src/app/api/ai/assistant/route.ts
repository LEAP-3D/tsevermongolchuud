/* eslint-disable max-lines */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest, unauthorizedJson } from "@/lib/session";

type IncomingChatMessage = {
  sender: "ai" | "user";
  text: string;
};

type AssistantAction =
  | { type: "BLOCK_DOMAIN"; childId?: number; childName?: string; domain?: string }
  | { type: "UNBLOCK_DOMAIN"; childId?: number; childName?: string; domain?: string }
  | { type: "BLOCK_CATEGORY"; childId?: number; childName?: string; categoryName?: string }
  | { type: "UNBLOCK_CATEGORY"; childId?: number; childName?: string; categoryName?: string }
  | {
      type: "SET_CATEGORY_LIMIT";
      childId?: number;
      childName?: string;
      categoryName?: string;
      minutes?: number;
    }
  | { type: "SET_WEEKDAY_LIMIT"; childId?: number; childName?: string; minutes?: number }
  | { type: "SET_WEEKEND_LIMIT"; childId?: number; childName?: string; minutes?: number }
  | { type: "SET_SESSION_LIMIT"; childId?: number; childName?: string; minutes?: number };
type AssistantActionOrLegacy =
  | AssistantAction
  | { type: "SET_DAILY_LIMIT"; childId?: number; childName?: string; minutes?: number };

type AssistantModelResponse = {
  reply: string;
  actions: AssistantAction[];
};

const ACTION_VERB_REGEX = /\b(block|ban|limit|set|change|update|restrict)\b/i;
const BLOCK_INTENT_REGEX = /\b(block|ban|restrict)\b/i;
const LIMIT_INTENT_REGEX = /\b(limit|set|change|update|daily|session|weekday|weekend)\b/i;
const TABLE_NOT_FOUND_CODE = "P2021";

const isPrismaTableMissingError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: string }).code === TABLE_NOT_FOUND_CODE;

const toSafeDomain = (value: string) =>
  value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

const toSafeMinutes = (value: unknown, fallbackMinutes: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallbackMinutes;
  return Math.max(1, Math.round(numeric));
};

const getOrCreateCategoryByName = async (name: string) => {
  const trimmed = name.trim();
  const existing = await prisma.categoryCatalog.findFirst({
    where: {
      name: {
        equals: trimmed,
        mode: "insensitive",
      },
    },
  });
  if (existing) return existing;
  return prisma.categoryCatalog.create({ data: { name: trimmed } });
};

const extractCategoryNameFromText = (text: string) => {
  const quoted = text.match(/["“”']([^"“”']{2,60})["“”']/);
  if (quoted?.[1]) return quoted[1].trim();
  const patterns = [
    /(?:category|ангилал)\s*(?:limit)?\s*(?:for|to|:)?\s*([a-zA-Z][a-zA-Z0-9\s-]{1,40})/i,
    /([a-zA-Z][a-zA-Z0-9\s-]{1,40})\s*(?:category|ангилал)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
};

const parseModelResponse = (raw: string): AssistantModelResponse | null => {
  try {
    const parsed = JSON.parse(raw) as Partial<AssistantModelResponse>;
    if (!parsed || typeof parsed.reply !== "string") return null;
    const actions = Array.isArray(parsed.actions) ? parsed.actions : [];
    return { reply: parsed.reply, actions: normalizeActions(actions) };
  } catch {
    return null;
  }
};

const normalizeActions = (actions: unknown[]): AssistantAction[] => {
  const normalized: AssistantAction[] = [];
  for (const raw of actions) {
    if (!raw || typeof raw !== "object") continue;
    const action = raw as AssistantActionOrLegacy;
    if (action.type === "SET_DAILY_LIMIT") {
      normalized.push({
        type: "SET_WEEKDAY_LIMIT",
        childId: action.childId,
        childName: action.childName,
        minutes: action.minutes,
      });
      normalized.push({
        type: "SET_WEEKEND_LIMIT",
        childId: action.childId,
        childName: action.childName,
        minutes: action.minutes,
      });
      continue;
    }
    if (
      action.type === "BLOCK_DOMAIN" ||
      action.type === "UNBLOCK_DOMAIN" ||
      action.type === "BLOCK_CATEGORY" ||
      action.type === "UNBLOCK_CATEGORY" ||
      action.type === "SET_CATEGORY_LIMIT" ||
      action.type === "SET_WEEKDAY_LIMIT" ||
      action.type === "SET_WEEKEND_LIMIT" ||
      action.type === "SET_SESSION_LIMIT"
    ) {
      normalized.push(action);
    }
  }
  return normalized;
};

const callGemini = async (prompt: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          responseMimeType: "application/json",
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  return payload.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
};

type AssistantContext = {
  children: Array<{ id: number; name: string }>;
  summary: string;
  blockedDomainsByChild: Map<number, string[]>;
  blockedCategoriesByChild: Map<number, string[]>;
  categoryLimitsByChild: Map<number, Array<{ name: string; minutes: number }>>;
};

const buildQuickSummary = async (
  parentId: number,
  selectedChildId: number | null,
): Promise<AssistantContext> => {
  const children = await prisma.child.findMany({
    where: { parentId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const childIds = children.map((child) => child.id);
  if (childIds.length === 0) {
    return {
      children,
      summary: "No children profiles found yet.",
      blockedDomainsByChild: new Map(),
      blockedCategoriesByChild: new Map(),
      categoryLimitsByChild: new Map(),
    };
  }

  const scopedChildIds =
    selectedChildId && childIds.includes(selectedChildId) ? [selectedChildId] : childIds;

  const recentHistory = await prisma.history.findMany({
    where: {
      childId: { in: scopedChildIds },
    },
    orderBy: { visitedAt: "desc" },
    take: 60,
    select: {
      childId: true,
      domain: true,
      categoryName: true,
      duration: true,
      actionTaken: true,
      visitedAt: true,
    },
  });

  const [blockedUrlSettings, blockedCategorySettings] = await Promise.all([
    prisma.childUrlSetting.findMany({
      where: { childId: { in: scopedChildIds }, status: "BLOCKED" },
      select: { childId: true, urlId: true },
    }),
    prisma.childCategorySetting.findMany({
      where: { childId: { in: scopedChildIds }, status: "BLOCKED" },
      select: { childId: true, categoryId: true },
    }),
  ]);

  const urlIds = [...new Set(blockedUrlSettings.map((item) => item.urlId))];
  const categoryIds = [...new Set(blockedCategorySettings.map((item) => item.categoryId))];
  const [blockedUrls, blockedCategories] = await Promise.all([
    urlIds.length
      ? prisma.urlCatalog.findMany({
          where: { id: { in: urlIds } },
          select: { id: true, domain: true },
        })
      : Promise.resolve([]),
    categoryIds.length
      ? prisma.categoryCatalog.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  const domainByUrlId = new Map(blockedUrls.map((item) => [item.id, item.domain]));
  const categoryNameById = new Map(blockedCategories.map((item) => [item.id, item.name]));
  const blockedDomainsByChild = new Map<number, string[]>();
  const blockedCategoriesByChild = new Map<number, string[]>();

  for (const row of blockedUrlSettings) {
    const domain = domainByUrlId.get(row.urlId);
    if (!domain) continue;
    const next = blockedDomainsByChild.get(row.childId) ?? [];
    if (!next.includes(domain)) next.push(domain);
    blockedDomainsByChild.set(row.childId, next);
  }
  for (const row of blockedCategorySettings) {
    const categoryName = categoryNameById.get(row.categoryId);
    if (!categoryName) continue;
    const next = blockedCategoriesByChild.get(row.childId) ?? [];
    if (!next.includes(categoryName)) next.push(categoryName);
    blockedCategoriesByChild.set(row.childId, next);
  }

  for (const domains of blockedDomainsByChild.values()) {
    domains.sort((a, b) => a.localeCompare(b));
  }
  for (const categories of blockedCategoriesByChild.values()) {
    categories.sort((a, b) => a.localeCompare(b));
  }

  const categoryLimitsByChild = new Map<number, Array<{ name: string; minutes: number }>>();
  try {
    const categoryLimitRows = await prisma.childCategoryLimit.findMany({
      where: { childId: { in: scopedChildIds } },
      select: { childId: true, name: true, minutes: true },
      orderBy: [{ childId: "asc" }, { name: "asc" }],
    });
    for (const row of categoryLimitRows) {
      const minutes = Number(row.minutes);
      if (!Number.isFinite(minutes) || minutes <= 0) continue;
      const next = categoryLimitsByChild.get(row.childId) ?? [];
      next.push({ name: row.name, minutes: Math.round(minutes) });
      categoryLimitsByChild.set(row.childId, next);
    }
  } catch (error) {
    if (!isPrismaTableMissingError(error)) {
      throw error;
    }
  }

  let childTimeLimits: Array<{
    childId: number;
    weekdayLimit: number;
    weekendLimit: number;
    sessionLimit: number;
  }> = [];
  try {
    childTimeLimits = await prisma.childTimeLimit.findMany({
      where: { childId: { in: childIds } },
      select: { childId: true, weekdayLimit: true, weekendLimit: true, sessionLimit: true },
    });
  } catch (error) {
    if (!isPrismaTableMissingError(error)) {
      throw error;
    }
  }

  const usageByChild = new Map<number, number>();
  const blockedByChild = new Map<number, number>();

  for (const row of recentHistory) {
    usageByChild.set(row.childId, (usageByChild.get(row.childId) ?? 0) + Number(row.duration ?? 0));
    if (row.actionTaken === "BLOCKED") {
      blockedByChild.set(row.childId, (blockedByChild.get(row.childId) ?? 0) + 1);
    }
  }

  const limitByChild = new Map(childTimeLimits.map((item) => [item.childId, item]));
  const summaryLines = children
    .filter((child) => scopedChildIds.includes(child.id))
    .map((child) => {
    const usageMinutes = usageByChild.get(child.id) ?? 0;
    const blocked = blockedByChild.get(child.id) ?? 0;
    const limits = limitByChild.get(child.id);
    const weekdayMinutes = toSafeMinutes(limits?.weekdayLimit, 180);
    const weekendMinutes = toSafeMinutes(limits?.weekendLimit, 300);
    const sessionMinutes = toSafeMinutes(limits?.sessionLimit, 60);
    const weekday = Math.round(weekdayMinutes);
    const weekend = Math.round(weekendMinutes);
    const session = Math.round(sessionMinutes);
      const blockedDomains = blockedDomainsByChild.get(child.id) ?? [];
      const blockedCategoriesForChild = blockedCategoriesByChild.get(child.id) ?? [];
      const categoryLimits = categoryLimitsByChild.get(child.id) ?? [];
      return [
        `${child.name} (id:${child.id}): recent usage ${usageMinutes}m, blocked events ${blocked}, weekday limit ${weekday}m, weekend limit ${weekend}m, session limit ${session}m`,
        `blocked domains: ${blockedDomains.length ? blockedDomains.join(", ") : "none"}`,
        `blocked categories: ${blockedCategoriesForChild.length ? blockedCategoriesForChild.join(", ") : "none"}`,
        `category limits: ${
          categoryLimits.length
            ? categoryLimits.map((item) => `${item.name} ${item.minutes}m`).join(", ")
            : "none"
        }`,
      ].join("\n");
    });

  const topDomains = recentHistory
    .reduce<Map<string, number>>((map, item) => {
      if (!item.domain) return map;
      map.set(item.domain, (map.get(item.domain) ?? 0) + Number(item.duration ?? 0));
      return map;
    }, new Map())
    .entries();

  const domainList = [...topDomains]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([domain, minutes]) => `${domain} (${minutes}m)`)
    .join(", ");

  return {
    children,
    summary: `${summaryLines.join("\n")}\nTop domains: ${domainList || "none"}`,
    blockedDomainsByChild,
    blockedCategoriesByChild,
    categoryLimitsByChild,
  };
};

const fallbackAssistant = (
  message: string,
  summary: string,
  context: AssistantContext,
  selectedChildId: number | null,
): AssistantModelResponse => {
  const text = message.toLowerCase();
  const numeric = text.match(/(\d{2,3})\s*(min|minute|minutes|m)\b/i);
  const domainMatch = text.match(/\b([a-z0-9-]+\.)+[a-z]{2,}\b/i);
  const categoryName = extractCategoryNameFromText(message);
  const unblockIntentRegex = /\b(unblock|allow|whitelist|unban|remove block)\b/i;
  const summaryIntentRegex =
    /\b(summary|activity|activities|usage|report|reports|safety|risk|internet|online|dashboard)\b/i;
  const blockedListIntentRegex =
    /\b(blocked sites?|blocked domains?|blocked categories?|all blocked|list blocked)\b/i;
  const casualChatRegex =
    /\b(hello|hi|hey|how are you|joke|story|explain|translate|movie|music|travel|code|help|what is|who is)\b/i;

  if (unblockIntentRegex.test(text) && domainMatch) {
    return {
      reply: `I can allow ${domainMatch[0]}. Please confirm and I will apply it to the selected child (or specify child name).`,
      actions: [{ type: "UNBLOCK_DOMAIN", domain: domainMatch[0] }],
    };
  }

  if (BLOCK_INTENT_REGEX.test(text) && domainMatch) {
    return {
      reply: `I can block ${domainMatch[0]}. Please confirm and I will apply it to the selected child (or specify child name).`,
      actions: [{ type: "BLOCK_DOMAIN", domain: domainMatch[0] }],
    };
  }

  if (unblockIntentRegex.test(text) && categoryName && /\b(category|ангилал)\b/i.test(text)) {
    return {
      reply: `I can allow ${categoryName} category. Please confirm and I will apply it.`,
      actions: [{ type: "UNBLOCK_CATEGORY", categoryName }],
    };
  }

  if (BLOCK_INTENT_REGEX.test(text) && categoryName && /\b(category|ангилал)\b/i.test(text)) {
    return {
      reply: `I can block ${categoryName} category. Please confirm and I will apply it.`,
      actions: [{ type: "BLOCK_CATEGORY", categoryName }],
    };
  }

  const isWeekdayRequest = /\b(weekday|weekdays|school day|mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday)\b/i.test(text);
  const isWeekendRequest = /\b(weekend|weekends|sat|saturday|sun|sunday)\b/i.test(text);
  const isDailyRequest = /\b(daily|per day|өдөр|өдрийн)\b/i.test(text);
  const isSessionRequest = /\b(session|one session|нэг удаа)\b/i.test(text);
  const isCategoryLimitRequest =
    /\b(category|ангилал)\b/i.test(text) && /\b(limit|set|change|update|хязгаар)\b/i.test(text);

  if (blockedListIntentRegex.test(text)) {
    const scopedChildIds =
      selectedChildId && context.children.some((child) => child.id === selectedChildId)
        ? [selectedChildId]
        : context.children.map((child) => child.id);

    const lines = scopedChildIds.map((childId) => {
      const child = context.children.find((item) => item.id === childId);
      const blockedDomains = context.blockedDomainsByChild.get(childId) ?? [];
      const blockedCategories = context.blockedCategoriesByChild.get(childId) ?? [];
      return [
        `${child?.name ?? `child ${childId}`}:`,
        `- blocked domains: ${blockedDomains.length ? blockedDomains.join(", ") : "none"}`,
        `- blocked categories: ${blockedCategories.length ? blockedCategories.join(", ") : "none"}`,
      ].join("\n");
    });

    return {
      reply: `Current blocked sites and categories:\n\n${lines.join("\n\n")}`,
      actions: [],
    };
  }

  if (LIMIT_INTENT_REGEX.test(text) && numeric && isWeekdayRequest) {
    return {
      reply: `I can set weekday limit to ${numeric[1]} minutes. Please confirm and I will apply it to the selected child (or specify child name).`,
      actions: [{ type: "SET_WEEKDAY_LIMIT", minutes: Number(numeric[1]) }],
    };
  }

  if (LIMIT_INTENT_REGEX.test(text) && numeric && isWeekendRequest) {
    return {
      reply: `I can set weekend limit to ${numeric[1]} minutes. Please confirm and I will apply it to the selected child (or specify child name).`,
      actions: [{ type: "SET_WEEKEND_LIMIT", minutes: Number(numeric[1]) }],
    };
  }

  if (LIMIT_INTENT_REGEX.test(text) && numeric && isSessionRequest) {
    return {
      reply: `I can set session limit to ${numeric[1]} minutes. Please confirm and I will apply it to the selected child (or specify child name).`,
      actions: [{ type: "SET_SESSION_LIMIT", minutes: Number(numeric[1]) }],
    };
  }

  if (isCategoryLimitRequest && numeric && categoryName) {
    return {
      reply: `I can set ${categoryName} category limit to ${numeric[1]} minutes. Please confirm and I will apply it.`,
      actions: [
        {
          type: "SET_CATEGORY_LIMIT",
          categoryName,
          minutes: Number(numeric[1]),
        },
      ],
    };
  }

  if (LIMIT_INTENT_REGEX.test(text) && numeric && isDailyRequest) {
    return {
      reply: `Daily limit was removed. I can set both weekday and weekend limits to ${numeric[1]} minutes. Please confirm and I will apply it to the selected child (or specify child name).`,
      actions: [
        { type: "SET_WEEKDAY_LIMIT", minutes: Number(numeric[1]) },
        { type: "SET_WEEKEND_LIMIT", minutes: Number(numeric[1]) },
      ],
    };
  }

  if (summaryIntentRegex.test(text)) {
    return {
      reply: `Here is a live summary from your data:\n${summary}`,
      actions: [],
    };
  }

  if (casualChatRegex.test(text)) {
    return {
      reply:
        "Absolutely. I can chat about general topics too. Ask me anything, and if you want parental-control changes, I can do those with confirmation.",
      actions: [],
    };
  }

  return {
    reply:
      "I can help with both general chat and parental controls. Ask me any question, or request actions like block/unblock domain, block/unblock category, and changing weekday/weekend/session/category limits.",
    actions: [],
  };
};

const resolveChildId = (
  action: AssistantAction,
  children: Array<{ id: number; name: string }>,
  selectedChildId: number | null,
) => {
  if (typeof action.childId === "number") {
    const found = children.find((child) => child.id === action.childId);
    if (found) return found.id;
  }
  if (action.childName) {
    const target = action.childName.trim().toLowerCase();
    const found = children.find((child) => child.name.trim().toLowerCase() === target);
    if (found) return found.id;
  }
  if (selectedChildId && children.some((child) => child.id === selectedChildId)) {
    return selectedChildId;
  }
  return null;
};

const executeActions = async (
  actions: AssistantAction[],
  children: Array<{ id: number; name: string }>,
  selectedChildId: number | null,
) => {
  const executed: string[] = [];
  const errors: string[] = [];

  for (const action of actions) {
    const childId = resolveChildId(action, children, selectedChildId);
    if (!childId) {
      errors.push(`Could not resolve target child for ${action.type}.`);
      continue;
    }

    if (action.type === "BLOCK_DOMAIN" || action.type === "UNBLOCK_DOMAIN") {
      const rawDomain = action.domain ? toSafeDomain(action.domain) : "";
      if (!rawDomain) {
        errors.push("Missing or invalid domain for domain action.");
        continue;
      }

      const url = await prisma.urlCatalog.upsert({
        where: { domain: rawDomain },
        update: {},
        create: {
          domain: rawDomain,
          categoryName: "Custom",
          safetyScore: 100,
          tags: ["ai-action"],
          updatedAt: new Date(),
        },
      });

      await prisma.childUrlSetting.upsert({
        where: { childId_urlId: { childId, urlId: url.id } },
        update: {
          status: action.type === "BLOCK_DOMAIN" ? "BLOCKED" : "ALLOWED",
          timeLimit: action.type === "BLOCK_DOMAIN" ? -1 : null,
        },
        create: {
          childId,
          urlId: url.id,
          status: action.type === "BLOCK_DOMAIN" ? "BLOCKED" : "ALLOWED",
          timeLimit: action.type === "BLOCK_DOMAIN" ? -1 : null,
        },
      });

      const child = children.find((item) => item.id === childId);
      if (action.type === "BLOCK_DOMAIN") {
        executed.push(`Blocked ${rawDomain} for ${child?.name ?? `child ${childId}`}.`);
      } else {
        executed.push(`Allowed ${rawDomain} for ${child?.name ?? `child ${childId}`}.`);
      }
      continue;
    }

    if (action.type === "BLOCK_CATEGORY" || action.type === "UNBLOCK_CATEGORY") {
      const name = action.categoryName?.trim();
      if (!name) {
        errors.push("Missing category name for category action.");
        continue;
      }

      const category = await getOrCreateCategoryByName(name);

      await prisma.childCategorySetting.upsert({
        where: { childId_categoryId: { childId, categoryId: category.id } },
        update: {
          status: action.type === "BLOCK_CATEGORY" ? "BLOCKED" : "ALLOWED",
          timeLimit: action.type === "BLOCK_CATEGORY" ? -1 : null,
        },
        create: {
          childId,
          categoryId: category.id,
          status: action.type === "BLOCK_CATEGORY" ? "BLOCKED" : "ALLOWED",
          timeLimit: action.type === "BLOCK_CATEGORY" ? -1 : null,
        },
      });

      const child = children.find((item) => item.id === childId);
      if (action.type === "BLOCK_CATEGORY") {
        executed.push(`Blocked ${category.name} category for ${child?.name ?? `child ${childId}`}.`);
      } else {
        executed.push(`Allowed ${category.name} category for ${child?.name ?? `child ${childId}`}.`);
      }
      continue;
    }

    if (action.type === "SET_CATEGORY_LIMIT") {
      const name = action.categoryName?.trim();
      const minutes = Number(action.minutes);
      if (!name) {
        errors.push("Missing category name for set-category-limit action.");
        continue;
      }
      if (!Number.isFinite(minutes) || minutes <= 0) {
        errors.push("Invalid minutes for set-category-limit action.");
        continue;
      }

      const roundedMinutes = Math.round(minutes);
      const category = await getOrCreateCategoryByName(name);

      try {
        await prisma.childCategoryLimit.upsert({
          where: {
            childId_name: {
              childId,
              name: category.name,
            },
          },
          update: { minutes: roundedMinutes },
          create: {
            childId,
            name: category.name,
            minutes: roundedMinutes,
          },
        });
      } catch (error) {
        if (!isPrismaTableMissingError(error)) {
          throw error;
        }
        errors.push(
          "Category-limit table is missing in current database. Run your existing DB migration/push workflow.",
        );
        continue;
      }

      await prisma.childCategorySetting.upsert({
        where: { childId_categoryId: { childId, categoryId: category.id } },
        update: { status: "LIMITED", timeLimit: roundedMinutes },
        create: {
          childId,
          categoryId: category.id,
          status: "LIMITED",
          timeLimit: roundedMinutes,
        },
      });

      const child = children.find((item) => item.id === childId);
      executed.push(
        `Set ${category.name} category limit to ${roundedMinutes}m for ${child?.name ?? `child ${childId}`}.`,
      );
      continue;
    }

    if (
      action.type === "SET_WEEKDAY_LIMIT" ||
      action.type === "SET_WEEKEND_LIMIT" ||
      action.type === "SET_SESSION_LIMIT"
    ) {
      const minutes = Number(action.minutes);
      if (!Number.isFinite(minutes) || minutes <= 0) {
        errors.push(`Invalid minutes for ${action.type}.`);
        continue;
      }

      try {
        const existing = await prisma.childTimeLimit.findUnique({ where: { childId } });
        const base = {
          weekdayLimit: toSafeMinutes(existing?.weekdayLimit, 180),
          weekendLimit: toSafeMinutes(existing?.weekendLimit, 300),
          sessionLimit: toSafeMinutes(existing?.sessionLimit, 60),
          breakEvery: toSafeMinutes(existing?.breakEvery, 45),
          breakDuration: toSafeMinutes(existing?.breakDuration, 10),
          focusMode: existing?.focusMode ?? false,
          downtimeEnabled: existing?.downtimeEnabled ?? true,
        };

        const roundedMinutes = Math.round(minutes);
        const nextWeekdayLimit =
          action.type === "SET_WEEKDAY_LIMIT" ? roundedMinutes : base.weekdayLimit;
        const nextWeekendLimit =
          action.type === "SET_WEEKEND_LIMIT" ? roundedMinutes : base.weekendLimit;
        const nextSessionLimit =
          action.type === "SET_SESSION_LIMIT" ? roundedMinutes : base.sessionLimit;

        await prisma.childTimeLimit.upsert({
          where: { childId },
          update: {
            weekdayLimit: nextWeekdayLimit,
            weekendLimit: nextWeekendLimit,
            dailyLimit: Math.max(nextWeekdayLimit, nextWeekendLimit),
            sessionLimit: nextSessionLimit,
          },
          create: {
            childId,
            ...base,
            weekdayLimit: nextWeekdayLimit,
            weekendLimit: nextWeekendLimit,
            dailyLimit: Math.max(nextWeekdayLimit, nextWeekendLimit),
            sessionLimit: nextSessionLimit,
          },
        });
      } catch (error) {
        if (isPrismaTableMissingError(error)) {
          errors.push(
            "Time-limit table is missing in current database. Run your existing DB migration/push workflow.",
          );
          continue;
        }
        throw error;
      }

      const child = children.find((item) => item.id === childId);
      if (action.type === "SET_WEEKDAY_LIMIT") {
        executed.push(`Set weekday limit to ${Math.round(minutes)}m for ${child?.name ?? `child ${childId}`}.`);
      } else if (action.type === "SET_WEEKEND_LIMIT") {
        executed.push(`Set weekend limit to ${Math.round(minutes)}m for ${child?.name ?? `child ${childId}`}.`);
      } else {
        executed.push(`Set session limit to ${Math.round(minutes)}m for ${child?.name ?? `child ${childId}`}.`);
      }
    }
  }

  return { executed, errors };
};

export async function POST(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return unauthorizedJson();
    }

    const payload = (await req.json()) as {
      selectedChildId?: number | null;
      message?: string;
      chatHistory?: IncomingChatMessage[];
      confirmActions?: boolean;
      actionsToConfirm?: AssistantAction[];
    };

    const parentId = session.userId;
    const selectedChildId = payload.selectedChildId ? Number(payload.selectedChildId) : null;
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    const chatHistory = Array.isArray(payload.chatHistory) ? payload.chatHistory.slice(-10) : [];
    const confirmActions = Boolean(payload.confirmActions);
    const actionsToConfirm = Array.isArray(payload.actionsToConfirm) ? payload.actionsToConfirm : [];

    if (!confirmActions && !message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }
    if (confirmActions && actionsToConfirm.length === 0) {
      return NextResponse.json({ error: "No actions provided for confirmation." }, { status: 400 });
    }

    const context = await buildQuickSummary(parentId, selectedChildId);
    const { children, summary } = context;
    if (children.length === 0) {
      return NextResponse.json({
        reply: "I couldn't find any children for this account yet. Add a child profile first.",
        actionsApplied: [],
        actionErrors: [],
        requiresConfirmation: false,
        pendingActions: [],
      });
    }

    let assistantResult: AssistantModelResponse | null = null;
    if (!confirmActions) {
      const childDescriptor = children.map((child) => `${child.name} (id:${child.id})`).join(", ");
      const prompt = `You are a general-purpose AI assistant with optional parental-control tools.
Return strict JSON only, format:
{
  "reply": "string",
  "actions": [
    {
      "type": "BLOCK_DOMAIN|UNBLOCK_DOMAIN|BLOCK_CATEGORY|UNBLOCK_CATEGORY|SET_CATEGORY_LIMIT|SET_WEEKDAY_LIMIT|SET_WEEKEND_LIMIT|SET_SESSION_LIMIT",
      "childId": number optional,
      "childName": string optional,
      "domain": "example.com" optional,
      "categoryName": "Games" optional,
      "minutes": number optional
    }
  ]
}

Rules:
- You can freely chat on any topic. Do not limit yourself to parental-control-only responses.
- Understand and reply in the same language as the user's latest message.
- Use actions only when user explicitly asks to change dashboard settings for child safety controls.
- If user asks only analysis/general chat, return empty actions array.
- Do not invent children not in this list: ${childDescriptor}.
- Domain must be plain hostname only.
- For SET_CATEGORY_LIMIT include both categoryName and minutes.
- Keep reply concise and actionable.

Current account summary:
${summary}

Recent chat:
${chatHistory.map((item) => `${item.sender}: ${item.text}`).join("\n")}

User message:
${message}`;

      try {
        const raw = await callGemini(prompt);
        if (raw) {
          assistantResult = parseModelResponse(raw);
        }
      } catch {
        assistantResult = null;
      }

      if (!assistantResult) {
        assistantResult = fallbackAssistant(message, summary, context, selectedChildId);
      }
    }

    const candidateActions = confirmActions ? actionsToConfirm : (assistantResult?.actions ?? []);
    const allowActions = confirmActions || ACTION_VERB_REGEX.test(message);

    if (!confirmActions && allowActions && candidateActions.length > 0) {
      return NextResponse.json({
        reply: `${assistantResult?.reply ?? "I found actions to apply."}\n\nPlease confirm before I apply these changes.`,
        actionsApplied: [],
        actionErrors: [],
        requiresConfirmation: true,
        pendingActions: candidateActions,
      });
    }

    const { executed, errors } = confirmActions
      ? await executeActions(candidateActions, children, selectedChildId)
      : { executed: [], errors: [] };

    const actionAppendix =
      executed.length || errors.length
        ? `\n\n${[...executed, ...errors.map((item) => `Could not apply: ${item}`)].join("\n")}`
        : "";

    return NextResponse.json({
      reply: `${assistantResult?.reply ?? "Done."}${actionAppendix}`,
      actionsApplied: executed,
      actionErrors: errors,
      requiresConfirmation: false,
      pendingActions: [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
