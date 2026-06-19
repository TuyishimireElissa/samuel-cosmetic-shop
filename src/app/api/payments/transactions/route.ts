import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() { try { const txns = await db.moMoTransaction.findMany({ orderBy: { createdAt: "desc" }, take: 100 }); return NextResponse.json({ ok: true, transactions: txns }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }