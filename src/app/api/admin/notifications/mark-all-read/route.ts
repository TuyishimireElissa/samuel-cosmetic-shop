import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function PATCH(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
  try { await db.adminNotification.updateMany({ where: { isRead: false }, data: { isRead: true } }); return NextResponse.json({ ok: true }); } catch (e: any) { return NextResponse.json({ ok: false, error: e?.message }, { status: 500 }); }
}
