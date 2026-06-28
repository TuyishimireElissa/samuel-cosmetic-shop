import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
import { bustCache } from "@/lib/cache";
export async function GET() {
  try { const rows = await db.siteContent.findMany({ orderBy: { key: "asc" } }); return NextResponse.json({ ok: true, content: rows }); }
  catch (e: any) { return NextResponse.json({ ok: false, error: e?.message }, { status: 500 }); }
}
export async function PUT(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { key, valueEn, valueFr = "", valueRw = "", updatedBy = "admin" } = body;
    if (!key || !valueEn) return NextResponse.json({ ok: false, error: "missing_key_or_value" }, { status: 400 });
    const row = await db.siteContent.upsert({ where: { key }, update: { valueEn, valueFr, valueRw, updatedBy }, create: { key, valueEn, valueFr, valueRw, updatedBy } });
    bustCache("/api/settings"); bustCache("/api/settings:content");
    return NextResponse.json({ ok: true, content: row });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e?.message }, { status: 500 }); }
}
export async function DELETE(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(req.url); const key = url.searchParams.get("key");
    if (!key) return NextResponse.json({ ok: false, error: "missing_key" }, { status: 400 });
    await db.siteContent.deleteMany({ where: { key } });
    bustCache("/api/settings"); bustCache("/api/settings:content");
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e?.message }, { status: 500 }); }
}
