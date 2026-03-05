(async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");

  const targetDir = path.resolve(__dirname, "../node_modules/.prisma/client");
  const sourceCandidates = [
    path.resolve(__dirname, "../../../node_modules/.prisma/client"),
    path.resolve(__dirname, "../node_modules/.prisma/client"),
  ];

  const sourceDir = sourceCandidates.find((candidate) => fs.existsSync(candidate));

  if (!sourceDir) {
    throw new Error(`Prisma source client not found. Tried: ${sourceCandidates.join(", ")}`);
  }

  if (fs.existsSync(targetDir)) {
    console.log(`Prisma target client already exists: ${targetDir}`);
    return;
  }

  if (path.resolve(sourceDir) === path.resolve(targetDir)) {
    console.log(`Prisma client already in place: ${targetDir}`);
    return;
  }

  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  fs.cpSync(sourceDir, targetDir, { recursive: true, force: true });

  console.log(`Synced Prisma client: ${sourceDir} -> ${targetDir}`);
})().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
