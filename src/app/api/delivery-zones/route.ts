import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const zones = await db.deliveryZone.findMany({
      where: { isActive: true },
      orderBy: { fee: "asc" },
    });
    return NextResponse.json({ ok: true, zones });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
