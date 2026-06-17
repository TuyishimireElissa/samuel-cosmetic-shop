import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: { category: true, images: true },
    });
    if (!product) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    // increment view count
    await db.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
    return NextResponse.json({ ok: true, product });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
