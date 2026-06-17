import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const where: any = {};
    if (status && status !== "all") where.status = status;
    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ ok: true, orders });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
