"use client";
import { useState } from "react";
import { useUI, useCart } from "@/lib/store";
import { pickLang, t } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import type { Product, Category, ProductImage } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ShoppingCart, Star, ImageIcon } from "lucide-react";

interface Props {
  product: Product & { category: Category | null; images?: ProductImage[] };
  currency: ReturnType<typeof useUI.getState>["currency"];
  onQuickView?: (p: Product) => void;
}

export function ProductCard({ product, currency, onQuickView }: Props) {
  const lang = useUI((s) => s.lang);
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const wholesaleUser = useUI((s) => s.wholesaleUser);
  const [added, setAdded] = useState(false);
  const [bump, setBump] = useState(false);
  const [imgError, setImgError] = useState(false);
  const name = pickLang(product, lang);
  const isWholesale = !!(wholesaleUser && wholesaleUser.status === "approved");
  const displayPrice = isWholesale && product.wholesalePrice > 0 ? product.wholesalePrice : product.sellingPrice;
  const price = formatPrice(displayPrice, currency);
  const outOfStock = product.stockQty <= 0;
  const lowStock = product.stockQty > 0 && product.stockQty <= 5;
  const primaryImage = product.images && product.images.length > 0 ? (product.images.find((i) => i.isPrimary) || product.images[0]) : null;
  const hasPhoto = !!primaryImage && !imgError;

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (outOfStock) return;
    add({ id: product.id, priceTTC: displayPrice, name, emoji: product.emoji, image: primaryImage?.url });
    setAdded(true); setBump(true);
    setTimeout(() => setAdded(false), 2000);
    setTimeout(() => setBump(false), 350);
    setCartOpen(true);
  }

  const badgeColors: Record<string, string> = {
    bestseller: "bg-amber-100 text-amber-800 border-amber-300",
    new: "bg-emerald-100 text-emerald-800 border-emerald-300",
    hot: "bg-red-100 text-red-800 border-red-300",
    popular: "bg-purple-100 text-purple-800 border-purple-300",
  };

  return (
    <article className="fade-in-up group relative bg-card border border-pink-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-pink-300 transition-all cursor-pointer flex flex-col" onClick={() => onQuickView?.(product)}>
      <div className="aspect-square grid place-items-center relative overflow-hidden bg-gradient-to-br from-pink-50 via-pink-25 to-purple-50">
        {hasPhoto ? (
          <img src={primaryImage!.url} alt={name} className={`w-full h-full object-cover transition-transform group-hover:scale-110 ${bump ? "scale-110" : ""}`} onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <div className="flex flex-col items-center justify-center text-pink-300 p-4 text-center">
            <ImageIcon size={48} className="mb-2 opacity-50" strokeWidth={1.5} />
            <span className="text-[10px] font-medium text-pink-400 uppercase tracking-wide">Photo Coming Soon</span>
          </div>
        )}
        {product.badge && <Badge className={`absolute top-2 left-2 text-[10px] uppercase border z-10 ${badgeColors[product.badge] || "bg-pink-100 text-pink-800 border-pink-300"}`}>{t(`product.${product.badge}`, lang)}</Badge>}
        {outOfStock ? <Badge className="absolute top-2 right-2 text-[10px] bg-gray-200 text-gray-700 z-10">{t("product.outOfStock", lang)}</Badge> : lowStock ? <Badge className="absolute top-2 right-2 text-[10px] bg-red-100 text-red-700 z-10">⚡ {product.stockQty} left</Badge> : null}
      </div>
      <div className="p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1">
        <div className="text-[10px] sm:text-xs uppercase tracking-wider text-pink-500 font-semibold truncate">{product.category ? pickLang(product.category, lang) : ""}</div>
        <h3 className="text-sm sm:text-[15px] font-semibold leading-snug line-clamp-2 group-hover:text-pink-700" style={{ fontFamily: "var(--font-playfair)" }} title={name}>{name}</h3>
        <div className="flex items-center gap-1 text-xs text-amber-500 min-h-[16px]">
          {product.ratingAvg > 0 ? (<><Star size={12} fill="currentColor" /><span className="font-semibold">{product.ratingAvg.toFixed(1)}</span><span className="text-muted-foreground">({product.ratingCount})</span></>) : <span className="text-muted-foreground text-[11px]">No reviews yet</span>}
        </div>
        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div><div className="text-lg sm:text-xl font-bold text-pink-700 leading-none">{price}</div><div className="text-[10px] text-muted-foreground mt-0.5">{isWholesale ? "Wholesale · TTC" : "TTC · VAT 18%"}</div></div>
          <Button size="sm" onClick={handleAdd} disabled={outOfStock} className={`h-9 px-2 sm:px-3 shrink-0 ${added ? "bg-green-600" : "bg-pink-600 hover:bg-pink-700"}`}>
            {added ? <><Check size={14} className="mr-1" /><span className="hidden sm:inline">{t("product.added", lang)}</span></> : <><ShoppingCart size={14} className="sm:mr-1" /><span className="hidden sm:inline">{t("product.addToCart", lang)}</span></>}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (<div className="rounded-2xl border border-pink-100 overflow-hidden"><div className="aspect-square shimmer" /><div className="p-4 space-y-2"><div className="h-3 w-1/3 shimmer rounded" /><div className="h-4 w-full shimmer rounded" /><div className="h-4 w-2/3 shimmer rounded" /><div className="h-8 w-full shimmer rounded mt-3" /></div></div>);
}
