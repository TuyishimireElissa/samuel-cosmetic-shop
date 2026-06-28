import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const { id } = await params; const { status } = await req.json(); const updated = await db.booking.update({ where: { id }, data: { status } }); return NextResponse.json({ ok: true, booking: updated }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }