import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
import { bustCache } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ ok: true, categories });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
  try {
    const body = await req.json();
    if (!body.id || !body.nameEn || !body.slug) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }
    const category = await db.category.create({
      data: {
        id: body.id,
        nameEn: body.nameEn,
        nameFr: body.nameFr || body.nameEn,
        nameRw: body.nameRw || body.nameEn,
        emoji: body.emoji || "",
        slug: body.slug,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder || 0,
      },
    });
    bustCache("/api/categories");
    bustCache("/api/products");
    return NextResponse.json({ ok: true, category });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
