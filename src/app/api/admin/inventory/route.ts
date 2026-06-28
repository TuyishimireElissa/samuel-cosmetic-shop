import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAuth } from "@/lib/route-auth";
export async function GET(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response; try { const products = await db.product.findMany({ orderBy: { stockQty: "asc" }, select: { id: true, nameEn: true, emoji: true, stockQty: true, lowStockThreshold: true, costPrice: true, sellingPrice: true } }); return NextResponse.json({ ok: true, products }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }