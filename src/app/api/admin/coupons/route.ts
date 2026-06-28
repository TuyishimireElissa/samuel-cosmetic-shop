import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function GET(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response; try { const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } }); return NextResponse.json({ ok: true, coupons }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }
export async function POST(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const body = await req.json(); body.code = body.code.toUpperCase(); if (body.expiresAt) body.expiresAt = new Date(body.expiresAt); else delete body.expiresAt; const coupon = await db.coupon.create({ data: body }); return NextResponse.json({ ok: true, coupon }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }