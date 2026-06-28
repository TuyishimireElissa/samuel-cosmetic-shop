import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  // Security fix: payment transactions contain PII (phone, amount, orderId).
  // This endpoint must require admin auth.
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
  try {
    const txns = await db.moMoTransaction.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return NextResponse.json({ ok: true, transactions: txns });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "server_error" }, { status: 500 });
  }
}
