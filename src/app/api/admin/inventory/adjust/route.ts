import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function POST(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const { productId, newQty, reason } = await req.json(); const product = await db.product.findUnique({ where: { id: productId } }); if (!product) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 }); const delta = newQty - product.stockQty; await db.product.update({ where: { id: productId }, data: { stockQty: newQty } }); await db.stockAdjustment.create({ data: { productId, oldQty: product.stockQty, newQty, delta, reason: reason || "", createdBy: "admin" } }); if (newQty <= product.lowStockThreshold) await db.adminNotification.create({ data: { type: "stock", title: "Low stock: " + product.nameEn, body: "Only " + newQty + " units left" } }); return NextResponse.json({ ok: true }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }