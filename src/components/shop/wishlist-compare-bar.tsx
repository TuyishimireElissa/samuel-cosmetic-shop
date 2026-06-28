"use client";
import { useEffect, useState } from "react";
import { useCompare, useWishlist, useCart, useUI } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GitCompare, Heart, X, Trash2, ShoppingCart, ImageIcon } from "lucide-react";
import { toast } from "sonner";

export function WishlistCompareBar() {
  const compareIds = useCompare((s) => s.ids);
  const wishlistIds = useWishlist((s) => s.ids);
  const compareRemove = useCompare((s) => s.remove);
  const compareClear = useCompare((s) => s.clear);
  const wishlistToggle = useWishlist((s) => s.toggle);
  const cartAdd = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const currency = useUI((s) => s.currency);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [showCompare, setShowCompare] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  useEffect(() => {
    const ids = [...new Set([...compareIds, ...wishlistIds])];
    if (ids.length === 0) return;
    let cancelled = false;
    Promise.all(ids.map((id) => fetch(`/api/products/${id}`).then((r) => r.json()).then((d) => (d.ok ? [id, d.product] : null)).catch(() => null))).then((results) => {
      if (cancelled) return;
      const map: Record<string, any> = {};
      for (const r of results) if (r) map[r[0]] = r[1];
      setProducts(map);
    });
    return () => { cancelled = true; };
  }, [compareIds, wishlistIds]);

  const compareProducts = compareIds.map((id) => products[id]).filter(Boolean);
  const wishlistProducts = wishlistIds.map((id) => products[id]).filter(Boolean);

  // SHOP-007 fix: use product photo instead of emoji (user's #1 rule).
  function productThumb(p: any) {
    const img = p?.images?.[0]?.url;
    if (img) return <img src={img} alt={p?.nameEn || "Product"} className="w-12 h-12 rounded-lg object-cover" />;
    return <div className="w-12 h-12 rounded-lg bg-pink-50 grid place-items-center"><ImageIcon size={20} className="text-pink-300" /></div>;
  }

  return (
    <>
      {(compareIds.length > 0 || wishlistIds.length > 0) && (
        <div className="fixed left-3 z-40 flex gap-2" style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}>
          {compareIds.length > 0 && <button onClick={() => setShowCompare(true)} className="px-3 h-10 rounded-full bg-purple-600 text-white text-sm font-semibold shadow-lg flex items-center gap-2 hover:bg-purple-700"><GitCompare size={14} /> Compare ({compareIds.length})</button>}
          {wishlistIds.length > 0 && <button onClick={() => setShowWishlist(true)} className="px-3 h-10 rounded-full bg-pink-600 text-white text-sm font-semibold shadow-lg flex items-center gap-2 hover:bg-pink-700"><Heart size={14} className="fill-white" /> Wishlist ({wishlistIds.length})</button>}
        </div>
      )}
      {showCompare && (
        <Dialog open onOpenChange={() => setShowCompare(false)}><DialogContent aria-describedby={undefined} className="max-w-3xl max-h-[90vh] overflow-x-auto"><DialogHeader><DialogTitle className="flex items-center justify-between"><span className="flex items-center gap-2"><GitCompare size={20} className="text-purple-600" /> Compare Products</span><Button variant="ghost" size="sm" onClick={compareClear}>Clear all</Button></DialogTitle></DialogHeader>
          {compareProducts.length === 0 ? <div className="text-center py-8 text-muted-foreground">No products to compare</div> : (
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-pink-100"><th className="text-left p-2">Feature</th>{compareProducts.map((p) => <th key={p.id} className="p-2 min-w-[140px]"><div className="text-center"><div className="flex justify-center mb-1">{productThumb(p)}</div><div className="text-xs font-medium line-clamp-2">{p.nameEn}</div><button onClick={() => compareRemove(p.id)} className="text-red-500 text-[10px] mt-1 inline-flex items-center gap-0.5"><X size={10} /> Remove</button></div></th>)}</tr></thead>
              <tbody>
                <tr className="border-b border-pink-50"><td className="p-2 font-semibold">Price</td>{compareProducts.map((p) => <td key={p.id} className="p-2 text-center font-bold text-pink-700">{formatPrice(p.sellingPrice, currency)}</td>)}</tr>
                <tr className="border-b border-pink-50"><td className="p-2 font-semibold">Category</td>{compareProducts.map((p) => <td key={p.id} className="p-2 text-center text-xs">{p.category?.nameEn || "—"}</td>)}</tr>
                <tr className="border-b border-pink-50"><td className="p-2 font-semibold">Rating</td>{compareProducts.map((p) => <td key={p.id} className="p-2 text-center text-xs">{p.ratingAvg?.toFixed(1) || "—"}</td>)}</tr>
                <tr className="border-b border-pink-50"><td className="p-2 font-semibold">Stock</td>{compareProducts.map((p) => <td key={p.id} className="p-2 text-center text-xs">{p.stockQty > 0 ? `${p.stockQty} in stock` : "Out"}</td>)}</tr>
                <tr><td className="p-2 font-semibold">Action</td>{compareProducts.map((p) => <td key={p.id} className="p-2 text-center"><Button size="sm" onClick={() => { cartAdd({ id: p.id, priceTTC: p.sellingPrice, name: p.nameEn, image: p?.images?.[0]?.url }); toast.success("Added"); setCartOpen(true); setShowCompare(false); }} className="bg-pink-600 hover:bg-pink-700 h-8" disabled={p.stockQty <= 0}><ShoppingCart size={12} className="mr-1" /> Add</Button></td>)}</tr>
              </tbody></table></div>
          )}
        </DialogContent></Dialog>
      )}
      {showWishlist && (
        <Dialog open onOpenChange={() => setShowWishlist(false)}><DialogContent aria-describedby={undefined} className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><Heart size={20} className="text-pink-600 fill-pink-500" /> My Wishlist</DialogTitle></DialogHeader>
          {wishlistProducts.length === 0 ? <div className="text-center py-8 text-muted-foreground">Your wishlist is empty</div> : (
            <div className="space-y-2">{wishlistProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded border border-pink-50">{productThumb(p)}<div className="flex-1 min-w-0"><div className="font-medium text-sm line-clamp-1">{p.nameEn}</div><div className="text-xs text-muted-foreground">{formatPrice(p.sellingPrice, currency)}</div></div><Button size="sm" onClick={() => { cartAdd({ id: p.id, priceTTC: p.sellingPrice, name: p.nameEn, image: p?.images?.[0]?.url }); toast.success("Added"); }} className="bg-pink-600 hover:bg-pink-700 h-8" disabled={p.stockQty <= 0}><ShoppingCart size={12} className="mr-1" /> Add</Button><Button size="sm" variant="ghost" onClick={() => wishlistToggle(p.id)} className="text-red-500 h-8 w-8 p-0"><Trash2 size={12} /></Button></div>
            ))}</div>
          )}
        </DialogContent></Dialog>
      )}
    </>
  );
}
