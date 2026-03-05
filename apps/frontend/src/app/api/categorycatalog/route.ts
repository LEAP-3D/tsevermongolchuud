import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { dedupeCategoriesByNormalizedName, normalizeCategoryName } from "@/lib/categoryFilters";

/* CREATE */
export async function POST(req: Request) {
  const { name } = await req.json();
  const normalizedInput = normalizeCategoryName(name);
  if (!normalizedInput) {
    return NextResponse.json({ error: "Category name is required." }, { status: 400 });
  }

  const existing = await prisma.categoryCatalog.findFirst({
    where: {
      name: {
        equals: String(name).trim(),
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    return NextResponse.json(existing);
  }

  const category = await prisma.categoryCatalog.create({
    data: { name: String(name).trim() },
  });

  return NextResponse.json(category);
}

/* READ */
export async function GET() {
  const categories = await prisma.categoryCatalog.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(dedupeCategoriesByNormalizedName(categories));
}

/* DELETE */
export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.categoryCatalog.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
