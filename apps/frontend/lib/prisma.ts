/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";

type PrismaClientLike = PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientLike;
};

const createPrismaClient = () => {
  return new PrismaClient();
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
