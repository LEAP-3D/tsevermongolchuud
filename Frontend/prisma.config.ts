import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma", // Notice the ./ for your Frontend directory
  datasource: {
    url: process.env.DATABASE_URL,
  },
  // If you are using standard PostgreSQL, you need to tell Prisma 7
  // that you are using a driver adapter for the Client.
});
