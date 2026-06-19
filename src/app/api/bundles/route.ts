import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cached, withCache } from "@/lib/cache";
export async function GET() { try { const bundles = await cached("/api/bundles", () => db.bundle.findMany({ where: { isActive: true }, include: { items: { include: { product: true } } }, orderBy: { createdAt: "desc" } }), 120); return withCache(NextResponse.json({ ok: true, bundles }), 120); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }
