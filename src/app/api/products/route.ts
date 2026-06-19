import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cached, withCache } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "";
    const search = url.searchParams.get("search") || "";
    const sort = url.searchParams.get("sort") || "newest";
    const minPrice = Number(url.searchParams.get("minPrice") || 0);
    const maxPrice = Number(url.searchParams.get("maxPrice") || 0);

    const where: any = { isActive: true };
    if (category && category !== "all") where.categoryId = category;
    if (search) {
      where.OR = [
        { nameEn: { contains: search } },
        { nameFr: { contains: search } },
        { nameRw: { contains: search } },
        { sku: { contains: search } },
      ];
    }
    if (minPrice > 0 || maxPrice > 0) {
      where.sellingPrice = {};
      if (minPrice > 0) where.sellingPrice.gte = minPrice;
      if (maxPrice > 0) where.sellingPrice.lte = maxPrice;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "priceLow") orderBy = { sellingPrice: "asc" };
    else if (sort === "priceHigh") orderBy = { sellingPrice: "desc" };
    else if (sort === "rating") orderBy = { ratingAvg: "desc" };
    else if (sort === "popular") orderBy = { salesCount: "desc" };

    const cacheKey = `/api/products:${category}:${search}:${sort}:${minPrice}:${maxPrice}`;
    const products = await cached(cacheKey, () => db.product.findMany({
      where, orderBy, include: { category: true, images: true },
    }), 60);
    return withCache(NextResponse.json({ ok: true, products }), 60);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
