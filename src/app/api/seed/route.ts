import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  // Trigger the seed by importing & running
  try {
    const { execSync } = await import("child_process");
    execSync("bun run scripts/seed.ts", { cwd: process.cwd() });
    return NextResponse.json({ ok: true, message: "seeded" });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
