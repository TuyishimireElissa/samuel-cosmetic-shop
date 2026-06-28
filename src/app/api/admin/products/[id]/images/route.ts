import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bustCache } from "@/lib/cache";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { url, altText = "", isPrimary = false } = await req.json();
    if (!url) return NextResponse.json({ ok: false, error: "no_url" }, { status: 400 });
    const count = await db.productImage.count({ where: { productId: id } });
    if (count >= 5) return NextResponse.json({ ok: false, error: "max_5_images" }, { status: 400 });
    const image = await db.productImage.create({ data: { productId: id, url, altText, isPrimary, sortOrder: count } });
    if (isPrimary) await db.productImage.updateMany({ where: { productId: id, NOT: { id: image.id } }, data: { isPrimary: false } });
    // Bust product caches so the new image appears immediately
    bustCache("/api/products");
    bustCache("/api/products:all");
    return NextResponse.json({ ok: true, image });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const imgId = url.searchParams.get("imgId");
    if (!imgId) return NextResponse.json({ ok: false, error: "no_imgId" }, { status: 400 });
    await db.productImage.delete({ where: { id: imgId, productId: id } });
    // Bust product caches
    bustCache("/api/products");
    bustCache("/api/products:all");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
