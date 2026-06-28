import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";

export async function POST(req: NextRequest) {
  // Admin-only: seeding wipes & rebuilds the entire database.
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
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
