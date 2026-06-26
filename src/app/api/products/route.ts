import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cached, withCache } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "";
    const search = (url.searchParams.get("search") || "").trim().toLowerCase();
    const sort = url.searchParams.get("sort") || "newest";

    const allProducts = await cached("/api/products:all", () => db.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    }), 60);

    let products = allProducts;

    if (category && category !== "all") {
      products = products.filter((p) => p.categoryId === category);
    }

    if (search) {
      products = products.filter((p) => {
        const haystack = [
          p.nameEn, p.nameFr, p.nameRw, p.sku,
          p.descEn, p.descFr, p.descRw,
          p.emoji, p.badge,
          p.category?.nameEn || "", p.category?.nameFr || "", p.category?.nameRw || "", p.category?.emoji || "",
        ].join(" ").toLowerCase();
        return haystack.includes(search);
      });
    }

    const sorters: Record<string, (a: any, b: any) => number> = {
      newest: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      priceLow: (a, b) => a.sellingPrice - b.sellingPrice,
      priceHigh: (a, b) => b.sellingPrice - a.sellingPrice,
      rating: (a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0),
      popular: (a, b) => (b.salesCount || 0) - (a.salesCount || 0),
    };
    products = [...products].sort(sorters[sort] || sorters.newest);

    return withCache(NextResponse.json({ ok: true, products }), 30);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "server_error" }, { status: 500 });
  }
}
