import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* CREATE */
export async function POST(req: Request) {
  const { childId, urlId, status, timeLimit } = await req.json();

  const setting = await prisma.childUrlSetting.upsert({
    where: {
      childId_urlId: { childId, urlId },
    },
    update: {
      status,
      timeLimit,
    },
    create: {
      childId,
      urlId,
      status,
      timeLimit,
    },
  });

  return NextResponse.json(setting);
}

/* READ */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  const urlId = searchParams.get("urlId");

  const settings = await prisma.childUrlSetting.findMany({
    where: {
      ...(childId ? { childId: Number(childId) } : {}),
      ...(urlId ? { urlId: Number(urlId) } : {}),
    },
  });

  return NextResponse.json(settings);
}

/* DELETE */
export async function DELETE(req: Request) {
  const { childId, urlId } = await req.json();

  await prisma.childUrlSetting.delete({
    where: { childId_urlId: { childId, urlId } },
  });

  return NextResponse.json({ success: true });
}
