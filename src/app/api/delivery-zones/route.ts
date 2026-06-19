import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cached, withCache } from "@/lib/cache";

export async function GET() {
  try {
    const zones = await cached("/api/delivery-zones", () => db.deliveryZone.findMany({
      where: { isActive: true }, orderBy: { fee: "asc" },
    }), 600);
    return withCache(NextResponse.json({ ok: true, zones }), 600);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
