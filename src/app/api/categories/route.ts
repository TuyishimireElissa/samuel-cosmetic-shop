import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cached, withCache } from "@/lib/cache";

export async function GET() {
  try {
    const categories = await cached("/api/categories", () => db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    }), 300);
    return withCache(NextResponse.json({ ok: true, categories }), 300);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
