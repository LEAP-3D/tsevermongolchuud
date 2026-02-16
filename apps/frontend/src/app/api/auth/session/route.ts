import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  clearSessionCookie,
  getSessionFromRequest,
  unauthorizedJson,
} from "@/lib/session";

export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return unauthorizedJson();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    clearSessionCookie(response);
    return response;
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      expiresAt: session.expiresAt * 1000,
    },
  });
}
