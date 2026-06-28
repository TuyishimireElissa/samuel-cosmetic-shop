import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const { id } = await params; const { delta, reason } = await req.json(); const c = await db.customer.findUnique({ where: { id } }); if (!c) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 }); const newBalance = Math.max(0, c.loyaltyPoints + delta); await db.customer.update({ where: { id }, data: { loyaltyPoints: newBalance } }); await db.loyaltyTransaction.create({ data: { customerId: id, type: "adjust", points: delta, balance: newBalance, reason: reason || "Manual" } }); return NextResponse.json({ ok: true, balance: newBalance }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }