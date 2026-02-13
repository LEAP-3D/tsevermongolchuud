const fs = require("node:fs");
const path = require("node:path");

const sourceDir = path.resolve(__dirname, "../../../node_modules/.prisma/client");
const targetDir = path.resolve(__dirname, "../node_modules/.prisma/client");

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Prisma source client not found: ${sourceDir}`);
}

fs.mkdirSync(path.dirname(targetDir), { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true, force: true });

console.log(`Synced Prisma client: ${sourceDir} -> ${targetDir}`);
