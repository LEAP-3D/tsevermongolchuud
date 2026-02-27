#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const loadDatabaseUrlFromEnvFiles = () => {
  if (process.env.DATABASE_URL) return;

  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "src/.env"),
    path.resolve(process.cwd(), "apps/frontend/.env"),
    path.resolve(process.cwd(), "apps/frontend/.env.local"),
    path.resolve(process.cwd(), "apps/frontend/src/.env"),
  ];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, "utf8");
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator <= 0) continue;
      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
    if (process.env.DATABASE_URL) return;
  }
};

loadDatabaseUrlFromEnvFiles();

const prisma = new PrismaClient();

const parseArgs = () => {
  const args = process.argv.slice(2);
  const readValue = (name) => {
    const index = args.indexOf(name);
    if (index === -1) return null;
    return args[index + 1] ?? null;
  };
  const hasFlag = (name) => args.includes(name);

  const shiftMinutesRaw = readValue("--shift-minutes");
  const childIdRaw = readValue("--child-id");
  const afterRaw = readValue("--after");
  const beforeRaw = readValue("--before");
  const limitRaw = readValue("--limit");

  const shiftMinutes = Number(shiftMinutesRaw);
  const childId = childIdRaw ? Number(childIdRaw) : null;
  const limit = limitRaw ? Number(limitRaw) : null;

  if (!Number.isFinite(shiftMinutes)) {
    throw new Error(
      "Missing or invalid --shift-minutes. Example: --shift-minutes -480",
    );
  }
  if (childIdRaw && !Number.isFinite(childId)) {
    throw new Error("Invalid --child-id");
  }
  if (limitRaw && (!Number.isFinite(limit) || limit <= 0)) {
    throw new Error("Invalid --limit");
  }

  const parseDate = (value, flagName) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid ${flagName}. Use ISO date/time, e.g. 2026-02-27`);
    }
    return date;
  };

  return {
    shiftMinutes: Math.trunc(shiftMinutes),
    childId: childId ? Math.trunc(childId) : null,
    after: parseDate(afterRaw, "--after"),
    before: parseDate(beforeRaw, "--before"),
    limit: limit ? Math.trunc(limit) : null,
    apply: hasFlag("--apply"),
  };
};

const buildWhere = ({ childId, after, before }) => {
  const where = {};
  if (childId) where.childId = childId;
  if (after || before) {
    where.visitedAt = {
      ...(after ? { gte: after } : {}),
      ...(before ? { lte: before } : {}),
    };
  }
  return where;
};

const run = async () => {
  const options = parseArgs();
  const where = buildWhere(options);
  const shiftMs = options.shiftMinutes * 60 * 1000;
  const dryRun = !options.apply;
  const batchSize = 200;
  let cursorId = null;
  let seen = 0;
  let updated = 0;
  const samples = [];

  while (true) {
    const rows = await prisma.history.findMany({
      where,
      select: { id: true, childId: true, visitedAt: true },
      orderBy: { id: "asc" },
      take: batchSize,
      ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {}),
    });

    if (rows.length === 0) break;
    cursorId = rows[rows.length - 1].id;

    const remaining =
      options.limit && options.limit > 0 ? Math.max(0, options.limit - seen) : rows.length;
    const activeRows =
      options.limit && options.limit > 0 ? rows.slice(0, Math.min(rows.length, remaining)) : rows;

    if (activeRows.length === 0) break;

    seen += activeRows.length;

    const updates = [];
    for (const row of activeRows) {
      if (!(row.visitedAt instanceof Date) || Number.isNaN(row.visitedAt.getTime())) continue;
      const nextVisitedAt = new Date(row.visitedAt.getTime() + shiftMs);
      if (samples.length < 12) {
        samples.push({
          id: row.id,
          childId: row.childId,
          before: row.visitedAt.toISOString(),
          after: nextVisitedAt.toISOString(),
        });
      }

      if (!dryRun) {
        updates.push(
          prisma.history.update({
            where: { id: row.id },
            data: { visitedAt: nextVisitedAt },
          }),
        );
      }
      updated += 1;
    }

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    if (options.limit && seen >= options.limit) break;
  }

  console.log(`Mode: ${dryRun ? "DRY RUN" : "APPLY"}`);
  console.log(`Shift minutes: ${options.shiftMinutes}`);
  console.log(`Rows matched/processed: ${seen}`);
  console.log(`Rows to update${dryRun ? "" : "d"}: ${updated}`);
  if (samples.length > 0) {
    console.log("Sample rows (before -> after):");
    for (const sample of samples) {
      console.log(
        `  #${sample.id} (child ${sample.childId}) ${sample.before} -> ${sample.after}`,
      );
    }
  } else {
    console.log("No rows found for the selected filters.");
  }

  if (dryRun) {
    console.log("Re-run with --apply to persist the updates.");
  }
};

run()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
