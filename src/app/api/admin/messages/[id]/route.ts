import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const { id } = await params; await db.contactMessage.delete({ where: { id } }); return NextResponse.json({ ok: true }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }