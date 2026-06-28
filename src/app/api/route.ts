import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Quick health check: can we reach the database?
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      name: "Samuel Cosmetic Shop API",
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, status: "unhealthy", error: e?.message || "database_error" },
      { status: 503 }
    );
  }
}