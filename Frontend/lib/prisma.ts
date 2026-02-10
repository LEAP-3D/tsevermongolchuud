import { PrismaPg } from "@prisma/adapter-pg";

type PrismaClientLike = any;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientLike;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const createNoopClient = () => {
  const handler: ProxyHandler<() => void> = {
    get: () => createNoopClient(),
    apply: () => {
      throw new Error(
        "Prisma client is not generated. Run `npx prisma generate` before using the API."
      );
    },
  };
  return new Proxy(() => undefined, handler) as PrismaClientLike;
};

const createPrismaClient = () => {
  try {
    const { PrismaClient } = require("@prisma/client") as {
      PrismaClient: new (options: { adapter: PrismaPg }) => PrismaClientLike;
    };
    return new PrismaClient({
      adapter,
    });
  } catch {
    return createNoopClient();
  }
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
