import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const order = await db.order.findUnique({ where: { id } });
    if (!order)
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    return NextResponse.json({
      ok: true,
      order: { ...order, items: JSON.parse(order.itemsJson || "[]") },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const allowed = ["status", "paymentStatus", "notes"];
    const data: any = {};
    for (const k of allowed) if (k in body) data[k] = body[k];
    const updated = await db.order.update({ where: { id }, data });
    return NextResponse.json({ ok: true, order: updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
