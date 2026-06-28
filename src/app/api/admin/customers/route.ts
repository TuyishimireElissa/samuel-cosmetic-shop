import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function GET(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response; try { const customers = await db.customer.findMany({ orderBy: { totalSpent: "desc" }, take: 200, include: { _count: { select: { orders: true } } } }); return NextResponse.json({ ok: true, customers }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }