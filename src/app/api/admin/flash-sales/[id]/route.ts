import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const { id } = await params; const { productIds, ...data } = await req.json(); if (data.startTime) data.startTime = new Date(data.startTime); if (data.endTime) data.endTime = new Date(data.endTime); const sale = await db.flashSale.update({ where: { id }, data }); if (productIds) { await db.flashSaleItem.deleteMany({ where: { flashSaleId: id } }); for (const pid of productIds) await db.flashSaleItem.create({ data: { flashSaleId: id, productId: pid } }); } return NextResponse.json({ ok: true, sale }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const { id } = await params; await db.flashSale.delete({ where: { id } }); return NextResponse.json({ ok: true }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }