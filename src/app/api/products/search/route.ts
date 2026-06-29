import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cached } from "@/lib/cache";

// Lightweight search endpoint for typeahead suggestions.
// Returns only id, name, price, image, category — minimal payload for instant dropdown.

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const limit = Math.min(Number(url.searchParams.get("limit")) || 8, 20);

    if (!q || q.length < 1) {
      return NextResponse.json({ ok: true, suggestions: [], trending: [] });
    }

    const normalizedQ = normalize(q);

    // Use cached product list (300s TTL)
    const allProducts = await cached("/api/products:all", () => db.product.findMany({
      where: { isActive: true },
      orderBy: { salesCount: "desc" },
      include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }), 300);

    // Score and filter
    const scored = allProducts
      .map(p => {
        const nameEn = normalize(p.nameEn || "");
        const nameFr = normalize(p.nameFr || "");
        const nameRw = normalize(p.nameRw || "");
        const sku = (p.sku || "").toLowerCase();
        const catName = normalize(p.category?.nameEn || p.category?.nameFr || p.category?.nameRw || "");

        let score = 0;

        // Name matches
        for (const name of [nameEn, nameFr, nameRw]) {
          if (!name) continue;
          if (name === normalizedQ) { score = Math.max(score, 1000); continue; }
          if (name.startsWith(normalizedQ)) { score = Math.max(score, 800); continue; }
          if (name.includes(normalizedQ)) { score = Math.max(score, 600); continue; }
          // Word-level partial match
          const nameWords = name.split(" ");
          const qWords = normalizedQ.split(" ");
          let matchCount = 0;
          for (const qw of qWords) {
            if (nameWords.some(nw => nw.startsWith(qw))) matchCount++;
          }
          if (matchCount > 0) score = Math.max(score, 400 + matchCount * 50);
        }

        // SKU match
        if (sku.includes(normalizedQ)) score = Math.max(score, 300);

        // Category match
        if (catName.includes(normalizedQ)) score = Math.max(score, 200);

        return { p, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const suggestions = scored.map(x => ({
      id: x.p.id,
      nameEn: x.p.nameEn,
      nameFr: x.p.nameFr,
      nameRw: x.p.nameRw,
      sellingPrice: x.p.sellingPrice,
      wholesalePrice: x.p.wholesalePrice,
      sku: x.p.sku,
      stockQty: x.p.stockQty,
      categoryId: x.p.categoryId,
      categoryName: x.p.category?.nameEn || x.p.category?.nameFr || x.p.category?.nameRw || "",
      image: x.p.images?.[0]?.url || null,
      badge: x.p.badge,
    }));

    return NextResponse.json({
      ok: true,
      suggestions,
      query: q,
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "server_error" }, { status: 500 });
  }
}
