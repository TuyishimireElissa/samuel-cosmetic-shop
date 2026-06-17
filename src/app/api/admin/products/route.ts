import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
    return NextResponse.json({ ok: true, products });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Generate id if not provided
    if (!body.id) {
      const prefix = (body.categoryId || "PR").slice(0, 2).toUpperCase();
      const count = await db.product.count();
      body.id = `${prefix}-${String(count + 1).padStart(3, "0")}`;
    }
    if (!body.sku) body.sku = `SKU-${body.id}`;
    const created = await db.product.create({ data: body });
    return NextResponse.json({ ok: true, product: created });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
