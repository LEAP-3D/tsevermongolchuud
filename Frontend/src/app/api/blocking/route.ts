import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childIdParam = searchParams.get("childId");
  const parentIdParam = searchParams.get("parentId");
  const childId = childIdParam ? Number.parseInt(childIdParam, 10) : null;
  if (!childId || Number.isNaN(childId)) {
    return NextResponse.json({ error: "Invalid childId" }, { status: 400 });
  }
  const parentId = parentIdParam ? Number.parseInt(parentIdParam, 10) : null;
  if (!parentId || Number.isNaN(parentId)) {
    return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
  }

  const child = await requireChild(childId, parentId);
  if (!child) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [categories, categorySettings, urlSettings] = await Promise.all([
    prisma.categoryCatalog.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.childCategorySetting.findMany({
      where: { childId },
      select: { categoryId: true, status: true },
    }),
    prisma.childUrlSetting.findMany({
      where: { childId, status: "BLOCKED" },
      select: { urlId: true },
    }),
  ]);

  const urlIds = urlSettings.map((setting) => setting.urlId);
  const urlCatalog = urlIds.length
    ? await prisma.urlCatalog.findMany({
        where: { id: { in: urlIds } },
        select: { id: true, domain: true },
      })
    : [];

  const statusMap = new Map(categorySettings.map((setting) => [setting.categoryId, setting.status]));
  const categoriesWithStatus = categories.map((category) => ({
    id: category.id,
    name: category.name,
    status: statusMap.get(category.id) ?? "ALLOWED",
  }));

  return NextResponse.json({
    categories: categoriesWithStatus,
    blockedSites: urlCatalog.map((site) => site.domain),
  });
}

export async function POST(req: Request) {
  const payload = await req.json();
  const childId = payload?.childId ? Number.parseInt(String(payload.childId), 10) : null;
  if (!childId || Number.isNaN(childId)) {
    return NextResponse.json({ error: "Invalid childId" }, { status: 400 });
  }
  const parentId = payload?.parentId ? Number.parseInt(String(payload.parentId), 10) : null;
  if (!parentId || Number.isNaN(parentId)) {
    return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
  }

  const child = await requireChild(childId, parentId);
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
      },
      create: {
        childId,
        categoryId,
        status: enabled ? "BLOCKED" : "ALLOWED",
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
      },
      create: {
        childId,
        urlId: url.id,
        status: "BLOCKED",
      },
    });
    return NextResponse.json(setting);
  }

  return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
}
