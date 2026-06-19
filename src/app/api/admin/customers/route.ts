import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() { try { const customers = await db.customer.findMany({ orderBy: { totalSpent: "desc" }, take: 200, include: { _count: { select: { orders: true } } } }); return NextResponse.json({ ok: true, customers }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }