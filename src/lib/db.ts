import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use connection pooling for Supabase to avoid "max clients reached" errors
const datasourceUrl = process.env.DATABASE_URL || "";
const isSupabase = datasourceUrl.includes("supabase.com");

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: isSupabase 
          ? datasourceUrl + (datasourceUrl.includes("?") ? "&" : "?") + "pgbouncer=true&connection_limit=1&pool_timeout=20"
          : datasourceUrl,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
