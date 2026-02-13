/* eslint-disable max-lines */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest, unauthorizedJson } from "@/lib/session";

const requireChild = async (childId: number, parentId: number) => {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { id: true, parentId: true },
  });
  if (!child || child.parentId !== parentId) {
    return null;
  }
  return child;
};

const getBlockedSource = (timeLimit: number | null | undefined) =>
  timeLimit === -1 ? "AI" : "PARENT";

export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  const { searchParams } = new URL(req.url);
  const childIdParam = searchParams.get("childId");
  const childId = childIdParam ? Number.parseInt(childIdParam, 10) : null;
  if (!childId || Number.isNaN(childId)) {
    return NextResponse.json({ error: "Invalid childId" }, { status: 400 });
  }

  const child = await requireChild(childId, session.userId);
  if (!child) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [categories, categorySettings, urlSettings]: [
    Array<{ id: number; name: string }>,
    Array<{ categoryId: number; status: string; timeLimit: number | null }>,
    Array<{ urlId: number; timeLimit: number | null }>
  ] = await Promise.all([
    prisma.categoryCatalog.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.childCategorySetting.findMany({
      where: { childId },
      select: { categoryId: true, status: true, timeLimit: true },
    }),
    prisma.childUrlSetting.findMany({
      where: { childId, status: "BLOCKED" },
      select: { urlId: true, timeLimit: true },
    }),
  ]);

  const urlIds = urlSettings.map((setting) => setting.urlId);
  const urlCatalog: Array<{ id: number; domain: string }> = urlIds.length
    ? await prisma.urlCatalog.findMany({
        where: { id: { in: urlIds } },
        select: { id: true, domain: true },
      })
    : [];

  const statusMap = new Map(categorySettings.map((setting) => [setting.categoryId, setting.status]));
  const sourceByCategoryId = new Map(
    categorySettings
      .filter((setting) => setting.status === "BLOCKED")
      .map((setting) => [setting.categoryId, getBlockedSource(setting.timeLimit)]),
  );
  const sourceByUrlId = new Map(urlSettings.map((setting) => [setting.urlId, getBlockedSource(setting.timeLimit)]));
  const categoriesWithStatus = categories.map((category) => ({
    id: category.id,
    name: category.name,
    status: statusMap.get(category.id) ?? "ALLOWED",
    source: sourceByCategoryId.get(category.id) ?? null,
  }));

  return NextResponse.json({
    categories: categoriesWithStatus,
    blockedSites: urlCatalog
      .map((site) => ({
        id: site.id,
        domain: site.domain,
        source: sourceByUrlId.get(site.id) ?? "PARENT",
      }))
      .sort((a, b) => a.domain.localeCompare(b.domain)),
  });
}

export async function POST(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  const payload = await req.json();
  const childId = payload?.childId ? Number.parseInt(String(payload.childId), 10) : null;
  if (!childId || Number.isNaN(childId)) {
    return NextResponse.json({ error: "Invalid childId" }, { status: 400 });
  }

  const child = await requireChild(childId, session.userId);
  if (!child) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (payload?.categoryId) {
    const categoryId = Number.parseInt(String(payload.categoryId), 10);
    if (Number.isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
    }
    const enabled = Boolean(payload.enabled);
    const setting = await prisma.childCategorySetting.upsert({
      where: {
        childId_categoryId: { childId, categoryId },
      },
      update: {
        status: enabled ? "BLOCKED" : "ALLOWED",
        timeLimit: null,
      },
      create: {
        childId,
        categoryId,
        status: enabled ? "BLOCKED" : "ALLOWED",
        timeLimit: null,
      },
    });
    return NextResponse.json(setting);
  }

  if (payload?.domain) {
    const rawDomain = String(payload.domain).trim().toLowerCase();
    if (!rawDomain) {
      return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
    }

    const url = await prisma.urlCatalog.upsert({
      where: { domain: rawDomain },
      update: {},
      create: {
        domain: rawDomain,
        categoryName: "Custom",
        safetyScore: 0,
        tags: [],
        updatedAt: new Date(),
      },
    });

    const setting = await prisma.childUrlSetting.upsert({
      where: {
        childId_urlId: { childId, urlId: url.id },
      },
      update: {
        status: "BLOCKED",
        timeLimit: null,
      },
      create: {
        childId,
        urlId: url.id,
        status: "BLOCKED",
        timeLimit: null,
      },
    });
    return NextResponse.json(setting);
  }

  return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  const payload = await req.json();
  const childId = payload?.childId ? Number.parseInt(String(payload.childId), 10) : null;
  if (!childId || Number.isNaN(childId)) {
    return NextResponse.json({ error: "Invalid childId" }, { status: 400 });
  }

  const child = await requireChild(childId, session.userId);
  if (!child) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const toDomain = (value: string) =>
    value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

  if (payload?.domain) {
    const domain = toDomain(String(payload.domain));
    if (!domain) {
      return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
    }
    const url = await prisma.urlCatalog.findUnique({
      where: { domain },
      select: { id: true },
    });
    if (!url) {
      return NextResponse.json({ success: true, removed: 0 });
    }
    const removed = await prisma.childUrlSetting.deleteMany({
      where: { childId, urlId: url.id },
    });
    return NextResponse.json({ success: true, removed: removed.count });
  }

  if (Array.isArray(payload?.domains)) {
    const rawDomains = (payload.domains as unknown[]).filter(
      (value: unknown): value is string => typeof value === "string",
    );
    const normalized = rawDomains.map((value) => toDomain(value)).filter((value) => value.length > 0);
    const uniqueDomains = [...new Set(normalized)];
    if (uniqueDomains.length === 0) {
      return NextResponse.json({ error: "Invalid domains" }, { status: 400 });
    }
    const urls = await prisma.urlCatalog.findMany({
      where: { domain: { in: uniqueDomains } },
      select: { id: true },
    });
    const urlIds = urls.map((item) => item.id);
    if (urlIds.length === 0) {
      return NextResponse.json({ success: true, removed: 0 });
    }
    const removed = await prisma.childUrlSetting.deleteMany({
      where: { childId, urlId: { in: urlIds } },
    });
    return NextResponse.json({ success: true, removed: removed.count });
  }

  return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
}
