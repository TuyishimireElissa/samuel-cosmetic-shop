import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const { id } = await params; const body = await req.json(); const { password, ...data } = body; if (password) data.passwordHash = hashPassword(password); if (Array.isArray(data.permissions)) data.permissions = JSON.stringify(data.permissions); const staff = await db.staffAccount.update({ where: { id }, data }); return NextResponse.json({ ok: true, staff }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const { id } = await params; await db.staffAccount.delete({ where: { id } }); return NextResponse.json({ ok: true }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }