import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const { id } = await params; const s = await db.staffAccount.findUnique({ where: { id } }); if (!s) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 }); const updated = await db.staffAccount.update({ where: { id }, data: { isActive: !s.isActive } }); return NextResponse.json({ ok: true, staff: updated }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }