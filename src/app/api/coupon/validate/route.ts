import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) {
      return NextResponse.json(
        { ok: false, error: "missing_code" },
        { status: 400 }
      );
    }
    const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ ok: false, error: "invalid_coupon" });
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ ok: false, error: "expired" });
    }
    if (coupon.maxUses > 0 && coupon.usesCount >= coupon.maxUses) {
      return NextResponse.json({ ok: false, error: "max_uses_reached" });
    }
    if (subtotal < coupon.minOrder) {
      return NextResponse.json({
        ok: false,
        error: "below_min_order",
        minOrder: coupon.minOrder,
      });
    }
    let discount = 0;
    if (coupon.type === "percent") {
      discount = Math.round((subtotal * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }
    return NextResponse.json({ ok: true, discount, coupon });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
