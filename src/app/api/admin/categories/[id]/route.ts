import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
import { bustCache } from "@/lib/cache";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
  try {
    const { id } = await params;
    const body = await req.json();
    delete body.id;
    const updated = await db.category.update({ where: { id }, data: body });
    bustCache("/api/categories");
    bustCache("/api/products");
    return NextResponse.json({ ok: true, category: updated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
  try {
    const { id } = await params;
    await db.category.delete({ where: { id } });
    bustCache("/api/categories");
    bustCache("/api/products");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
