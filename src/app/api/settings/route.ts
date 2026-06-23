import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cached, withCache } from "@/lib/cache";

export async function GET() {
  try {
    const settings = await cached("/api/settings", () => db.siteSetting.findUnique({ where: { id: "singleton" } }), 60);
    return withCache(NextResponse.json({ ok: true, settings }), 60);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
