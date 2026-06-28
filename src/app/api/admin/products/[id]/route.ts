import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
import { bustCache } from "@/lib/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    });
    if (!product)
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, product });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    delete body.id;
    delete body.createdAt;
    const updated = await db.product.update({ where: { id }, data: body });
    // API-009 fix: bust public product cache so edits appear on storefront.
    bustCache("/api/products");
    bustCache("/api/products:all");
    bustCache("/api/products/featured");
    return NextResponse.json({ ok: true, product: updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    await db.product.delete({ where: { id } });
    // API-009 fix: bust public product cache so deletion reflects on storefront.
    bustCache("/api/products");
    bustCache("/api/products:all");
    bustCache("/api/products/featured");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
