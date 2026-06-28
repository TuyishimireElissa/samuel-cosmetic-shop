/**
 * Sets the Prisma datasource provider based on DATABASE_URL.
 * - If DATABASE_URL starts with "file:", uses SQLite (local dev)
 * - If DATABASE_URL starts with "postgresql://", uses PostgreSQL (Vercel/Supabase)
 * This script runs before prisma generate to ensure the correct provider.
 */
const fs = require("fs");
const path = require("path");

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const dbUrl = process.env.DATABASE_URL || "";
const isPostgres = dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://");
const provider = isPostgres ? "postgresql" : "sqlite";

let schema = fs.readFileSync(schemaPath, "utf8");
schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${provider}"`);
fs.writeFileSync(schemaPath, schema);

console.log(`[set-provider] DATABASE_URL starts with: ${dbUrl.substring(0, 30)}...`);
console.log(`[set-provider] Set Prisma provider to: ${provider}`);
