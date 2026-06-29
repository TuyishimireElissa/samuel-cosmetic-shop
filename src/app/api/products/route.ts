import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cached, withCache, bustCache } from "@/lib/cache";

// ── Levenshtein distance for typo tolerance ────────────────────────────
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,        // deletion
        dp[i][j - 1] + 1,        // insertion
        dp[i - 1][j - 1] + cost  // substitution
      );
    }
  }
  return dp[m][n];
}

// ── Normalize query: lowercase, trim, collapse whitespace ──────────────
function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

// ── Check if a word is a typo of another (within threshold) ────────────
function isTypoMatch(query: string, word: string, threshold = 2): boolean {
  if (Math.abs(query.length - word.length) > threshold) return false;
  return levenshtein(query, word) <= threshold;
}

// ── Score a product against the search query ──────────────────────────
// Higher score = better match. 0 = no match.
function scoreProduct(product: any, query: string): number {
  const q = normalize(query);
  if (!q) return 0;

  const nameEn = normalize(product.nameEn || "");
  const nameFr = normalize(product.nameFr || "");
  const nameRw = normalize(product.nameRw || "");
  const sku = (product.sku || "").toLowerCase();
  const descEn = normalize(product.descEn || "");
  const catName = normalize(product.category?.nameEn || product.category?.nameFr || product.category?.nameRw || "");
  const badge = (product.badge || "").toLowerCase();

  let score = 0;
  const qWords = q.split(" ");

  // ── Name matching (highest weight) ──────────────────────────────────
  for (const name of [nameEn, nameFr, nameRw]) {
    if (!name) continue;
    const nameWords = name.split(" ");

    // Exact name match
    if (name === q) { score = Math.max(score, 1000); continue; }

    // Name starts with query
    if (name.startsWith(q)) { score = Math.max(score, 800); continue; }

    // Name contains query as substring
    if (name.includes(q)) { score = Math.max(score, 600); continue; }

    // Each query word matches a name word
    let wordMatchCount = 0;
    for (const qw of qWords) {
      // Partial word match (e.g. "lip" matches "lipstick")
      if (nameWords.some(nw => nw.startsWith(qw))) {
        wordMatchCount++;
        continue;
      }
      // Typo tolerance (e.g. "lipstik" matches "lipstick")
      if (qw.length >= 4 && nameWords.some(nw => isTypoMatch(qw, nw))) {
        wordMatchCount++;
        continue;
      }
    }
    if (wordMatchCount === qWords.length) {
      score = Math.max(score, 500 + wordMatchCount * 50);
    } else if (wordMatchCount > 0) {
      score = Math.max(score, 200 + wordMatchCount * 30);
    }
  }

  // ── SKU matching (exact = high, partial = medium) ───────────────────
  if (sku === q) score = Math.max(score, 700);
  else if (sku.includes(q)) score = Math.max(score, 400);

  // ── Category matching ───────────────────────────────────────────────
  if (catName.includes(q)) score = Math.max(score, 150);

  // ── Description matching (lower weight) ─────────────────────────────
  if (descEn.includes(q)) score = Math.max(score, 100);

  // ── Badge matching ──────────────────────────────────────────────────
  if (badge.includes(q)) score = Math.max(score, 80);

  return score;
}

// ── Main GET handler ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "";
    const search = (url.searchParams.get("search") || "").trim();
    const sort = url.searchParams.get("sort") || "newest";
    const limit = Math.min(Number(url.searchParams.get("limit")) || 0, 200);

    // Cache the full product list (300s) — search/filter is done in-memory
    const allProducts = await cached("/api/products:all", () => db.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    }), 300);

    let products = allProducts;

    // ── Category filter ───────────────────────────────────────────────
    if (category && category !== "all") {
      products = products.filter((p) => p.categoryId === category);
    }

    // ── Search filter with fuzzy matching + scoring ───────────────────
    if (search) {
      const scored = products
        .map(p => ({ product: p, score: scoreProduct(p, search) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);
      products = scored.map(x => x.product);
    }

    // ── Sort ──────────────────────────────────────────────────────────
    if (!search) {
      // Only apply explicit sort if not searching (search uses relevance)
      const sorters: Record<string, (a: any, b: any) => number> = {
        newest: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
        priceLow: (a, b) => a.sellingPrice - b.sellingPrice,
        priceHigh: (a, b) => b.sellingPrice - a.sellingPrice,
        rating: (a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0),
        popular: (a, b) => (b.salesCount || 0) - (a.salesCount || 0),
      };
      products = [...products].sort(sorters[sort] || sorters.newest);
    }

    // ── Limit ─────────────────────────────────────────────────────────
    if (limit > 0) {
      products = products.slice(0, limit);
    }

    // Don't CDN-cache search results (they're dynamic per query)
    const response = NextResponse.json({ ok: true, products, total: products.length });
    if (search) {
      response.headers.set("Cache-Control", "no-store");
    } else {
      response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    }
    return response;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "server_error" }, { status: 500 });
  }
}
