import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function GET(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response; try { const sales = await db.flashSale.findMany({ orderBy: { createdAt: "desc" }, include: { items: { include: { product: true } } } }); return NextResponse.json({ ok: true, sales }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }
export async function POST(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const { productIds, ...data } = await req.json(); data.startTime = new Date(data.startTime); data.endTime = new Date(data.endTime); const sale = await db.flashSale.create({ data }); for (const pid of productIds || []) await db.flashSaleItem.create({ data: { flashSaleId: sale.id, productId: pid } }); return NextResponse.json({ ok: true, sale }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }