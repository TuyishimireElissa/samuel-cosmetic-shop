import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cached, withCache } from "@/lib/cache";
export async function GET() { try { const products = await cached("/api/products/featured", () => db.product.findMany({ where: { isActive: true }, orderBy: [{ salesCount: "desc" }, { ratingAvg: "desc" }], take: 8, include: { category: true, images: true } }), 120); return withCache(NextResponse.json({ ok: true, products }), 120); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }
