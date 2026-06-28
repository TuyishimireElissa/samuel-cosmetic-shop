import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  // Security: phone numbers are enumerable. Rate-limit by IP to slow down
  // enumeration attacks. For full protection, require SMS OTP verification.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`customer-lookup:${ip}`);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many requests. Try again in a minute." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }
  try {
    const url = new URL(req.url);
    const phone = url.searchParams.get("phone");
    if (!phone) return NextResponse.json({ ok: false, error: "no_phone" }, { status: 400 });
    const customer = await db.customer.findUnique({ where: { phone } });
    if (!customer) return NextResponse.json({ ok: false, error: "not_found" });
    const orders = await db.order.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" }, take: 20 });
    return NextResponse.json({ ok: true, customer, orders });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "server_error" }, { status: 500 });
  }
}
