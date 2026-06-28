import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const { id } = await params; const body = await req.json(); if (body.expiresAt) body.expiresAt = new Date(body.expiresAt); else if (body.expiresAt === "") delete body.expiresAt; const coupon = await db.coupon.update({ where: { id }, data: body }); return NextResponse.json({ ok: true, coupon }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const { id } = await params; await db.coupon.delete({ where: { id } }); return NextResponse.json({ ok: true }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }