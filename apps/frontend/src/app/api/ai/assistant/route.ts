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
  | { type: "BLOCK_CATEGORY"; childId?: number; childName?: string; categoryName?: string }
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
      action.type === "BLOCK_CATEGORY" ||
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

const buildQuickSummary = async (parentId: number, selectedChildId: number | null) => {
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
    };
  }

  const recentHistory = await prisma.history.findMany({
    where: {
      childId: selectedChildId && childIds.includes(selectedChildId) ? selectedChildId : { in: childIds },
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
  const summaryLines = children.map((child) => {
    const usageMinutes = usageByChild.get(child.id) ?? 0;
    const blocked = blockedByChild.get(child.id) ?? 0;
    const limits = limitByChild.get(child.id);
    const weekdayMinutes = toSafeMinutes(limits?.weekdayLimit, 180);
    const weekendMinutes = toSafeMinutes(limits?.weekendLimit, 300);
    const sessionMinutes = toSafeMinutes(limits?.sessionLimit, 60);
    const weekday = Math.round(weekdayMinutes);
    const weekend = Math.round(weekendMinutes);
    const session = Math.round(sessionMinutes);
    return `${child.name} (id:${child.id}): recent usage ${usageMinutes}m, blocked events ${blocked}, weekday limit ${weekday}m, weekend limit ${weekend}m, session limit ${session}m`;
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
  };
};

const fallbackAssistant = (message: string, summary: string): AssistantModelResponse => {
  const text = message.toLowerCase();
  const numeric = text.match(/(\d{2,3})\s*(min|minute|minutes|m)\b/i);
  const domainMatch = text.match(/\b([a-z0-9-]+\.)+[a-z]{2,}\b/i);
  const summaryIntentRegex =
    /\b(summary|activity|activities|usage|report|reports|safety|risk|internet|online|dashboard)\b/i;
  const casualChatRegex =
    /\b(hello|hi|hey|how are you|joke|story|explain|translate|movie|music|travel|code|help|what is|who is)\b/i;

  if (BLOCK_INTENT_REGEX.test(text) && domainMatch) {
    return {
      reply: `I can block ${domainMatch[0]}. Please confirm and I will apply it to the selected child (or specify child name).`,
      actions: [{ type: "BLOCK_DOMAIN", domain: domainMatch[0] }],
    };
  }

  const isWeekdayRequest = /\b(weekday|weekdays|school day|mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday)\b/i.test(text);
  const isWeekendRequest = /\b(weekend|weekends|sat|saturday|sun|sunday)\b/i.test(text);
  const isDailyRequest = /\b(daily|per day|өдөр|өдрийн)\b/i.test(text);
  const isSessionRequest = /\b(session|one session|нэг удаа)\b/i.test(text);

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
      "I can help with both general chat and parental controls. Ask me any question, or request actions like blocking a domain or changing weekday/weekend/session limits.",
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

    if (action.type === "BLOCK_DOMAIN") {
      const rawDomain = action.domain ? toSafeDomain(action.domain) : "";
      if (!rawDomain) {
        errors.push("Missing or invalid domain for block action.");
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
        update: { status: "BLOCKED", timeLimit: -1 },
        create: { childId, urlId: url.id, status: "BLOCKED", timeLimit: -1 },
      });

      const child = children.find((item) => item.id === childId);
      executed.push(`Blocked ${rawDomain} for ${child?.name ?? `child ${childId}`}.`);
      continue;
    }

    if (action.type === "BLOCK_CATEGORY") {
      const name = action.categoryName?.trim();
      if (!name) {
        errors.push("Missing category name for block-category action.");
        continue;
      }

      const category = await prisma.categoryCatalog.upsert({
        where: { name },
        update: {},
        create: { name },
      });

      await prisma.childCategorySetting.upsert({
        where: { childId_categoryId: { childId, categoryId: category.id } },
        update: { status: "BLOCKED", timeLimit: -1 },
        create: { childId, categoryId: category.id, status: "BLOCKED", timeLimit: -1 },
      });

      const child = children.find((item) => item.id === childId);
      executed.push(`Blocked ${name} category for ${child?.name ?? `child ${childId}`}.`);
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

    const { children, summary } = await buildQuickSummary(parentId, selectedChildId);
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
      "type": "BLOCK_DOMAIN|BLOCK_CATEGORY|SET_WEEKDAY_LIMIT|SET_WEEKEND_LIMIT|SET_SESSION_LIMIT",
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
        assistantResult = fallbackAssistant(message, summary);
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
