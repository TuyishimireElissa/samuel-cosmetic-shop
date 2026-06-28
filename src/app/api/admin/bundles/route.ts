import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function GET() { try { const bundles = await db.bundle.findMany({ orderBy: { createdAt: "desc" }, include: { items: { include: { product: true } } } }); return NextResponse.json({ ok: true, bundles }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }
export async function POST(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const { productIds, ...data } = await req.json(); const bundle = await db.bundle.create({ data }); for (const pid of productIds || []) await db.bundleItem.create({ data: { bundleId: bundle.id, productId: pid } }); return NextResponse.json({ ok: true, bundle }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }