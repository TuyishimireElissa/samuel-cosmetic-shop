"use client";
import { useEffect, useState } from "react";
import { useUI, useCart, useWishlist, useCompare, useRecentlyViewed } from "@/lib/store";
import { pickLang, t } from "@/lib/i18n";
import { formatPrice, priceHT, vatAmount } from "@/lib/format";
import { shopWhatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ShoppingCart, Check, Heart, Share2, Bell, GitCompare, ImageIcon } from "lucide-react";
import type { Product } from "@prisma/client";

interface Review { id: string; customerName: string; rating: number; title: string; body: string; adminReply: string; helpfulCount: number; createdAt: string; }

export function QuickViewModal({ product, onClose }: { product: (Product & { category?: any; images?: any[] }) | null; onClose: () => void; }) {
  const { lang, currency } = useUI();
  const cartAdd = useCart((s) => s.add);
  const wishlistToggle = useWishlist((s) => s.toggle);
  const wishlistHas = useWishlist((s) => s.has);
  const compareToggle = useCompare((s) => s.toggle);
  const compareIds = useCompare((s) => s.ids);
  const addRecently = useRecentlyViewed((s) => s.add);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!product) return;
    addRecently(product.id);
    fetch(`/api/products/${product.id}/reviews`).then((r) => r.json()).then((d) => d.ok && setReviews(d.reviews));
  }, [product, addRecently]);

  if (!product) return null;
  const name = pickLang(product, lang);
  const desc = lang === "rw" ? product.descRw : lang === "fr" ? product.descFr : product.descEn;
  const images = product.images || [];
  const inWishlist = wishlistHas(product.id);
  const inCompare = compareIds.includes(product.id);

  function handleAddToCart() {
    cartAdd({ id: product!.id, priceTTC: product!.sellingPrice, name, emoji: product!.emoji });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }
  function toggleWishlist() { wishlistToggle(product!.id); toast.success(inWishlist ? "Removed" : "❤️ Added to wishlist"); }
  function toggleCompare() { if (!inCompare && compareIds.length >= 3) { toast.error("Max 3"); return; } compareToggle(product!.id); toast.success(inCompare ? "Removed" : "📊 Added to compare"); }
  async function setPriceAlert() {
    const phone = prompt("Enter WhatsApp number:", "+250 7XX XXX XXX"); if (!phone) return;
    const res = await fetch("/api/price-alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product!.id, customerName: "Customer", customerPhone: phone, targetPrice: Math.round(product!.sellingPrice * 0.9) }) });
    if (res.ok) toast.success("🔔 Price alert set!"); else toast.error("Failed");
  }
  async function share() {
    const url = `${window.location.origin}/?product=${product!.id}`;
    if (navigator.share) { try { await navigator.share({ title: name, url }); } catch {} } else { navigator.clipboard.writeText(url); toast.success("Link copied"); }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="sr-only">{name}</DialogTitle></DialogHeader>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 grid place-items-center">
              {images.length > 0 ? <img src={images[activeImage]?.url} alt={name} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center text-pink-300 p-4 text-center"><ImageIcon size={64} className="mb-2 opacity-50" strokeWidth={1.5} /><span className="text-xs font-medium text-pink-400 uppercase tracking-wide">Photo Coming Soon</span></div>}
            </div>
            {images.length > 1 && <div className="mt-2 grid grid-cols-5 gap-2">{images.map((img: any, i: number) => <button key={img.id} onClick={() => setActiveImage(i)} className={`aspect-square rounded-lg overflow-hidden border-2 ${i === activeImage ? "border-pink-500" : "border-pink-100"}`}><img src={img.url} alt="" className="w-full h-full object-cover" /></button>)}</div>}
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-pink-500 font-semibold mb-1">{product.category ? pickLang(product.category, lang) : ""}</div>
              <h2 className="text-2xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{name}</h2>
              <div className="flex items-center gap-2 mt-2"><StarRating value={product.ratingAvg} readOnly size={16} lang={lang} /><span className="text-sm text-muted-foreground">{product.ratingAvg > 0 ? `${product.ratingAvg.toFixed(1)} (${product.ratingCount})` : t("product.noReviews", lang)}</span></div>
            </div>
            <div><div className="text-3xl font-bold text-pink-700">{formatPrice(product.sellingPrice, currency)}</div><div className="text-xs text-muted-foreground mt-1">HT: {formatPrice(priceHT(product.sellingPrice), currency)} · VAT 18%: {formatPrice(vatAmount(product.sellingPrice), currency)}</div></div>
            <p className="text-sm text-foreground/80 leading-relaxed">{desc}</p>
            {product.stockQty <= 0 ? (
              <Badge variant="destructive">{t("product.outOfStock", lang)}</Badge>
            ) : product.stockQty <= 5 ? (
              <Badge className="bg-red-100 text-red-700 pulse-warn">⚡ {t("product.only", lang)} {product.stockQty} {t("product.left", lang)}!</Badge>
            ) : (
              <Badge className="bg-green-100 text-green-700">✓ {lang === "rw" ? "Biri mu stock" : lang === "fr" ? "En stock" : "In stock"} ({product.stockQty})</Badge>
            )}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleAddToCart} disabled={product.stockQty <= 0} className={`flex-1 h-12 ${added ? "bg-green-600" : "bg-pink-600 hover:bg-pink-700"}`}>{added ? <><Check size={18} className="mr-2" /> {t("product.added", lang)}</> : <><ShoppingCart size={18} className="mr-2" /> {t("product.addToCart", lang)}</>}</Button>
              <Button onClick={toggleWishlist} variant="outline" size="icon" className="h-12 w-12 border-pink-200"><Heart size={18} className={inWishlist ? "fill-pink-500 text-pink-500" : "text-pink-500"} /></Button>
              <Button onClick={toggleCompare} variant="outline" size="icon" className="h-12 w-12 border-pink-200"><GitCompare size={18} className={inCompare ? "fill-purple-500 text-purple-500" : "text-purple-500"} /></Button>
              <Button onClick={share} variant="outline" size="icon" className="h-12 w-12 border-pink-200"><Share2 size={18} className="text-pink-500" /></Button>
              <Button onClick={setPriceAlert} variant="outline" size="icon" className="h-12 w-12 border-pink-200"><Bell size={18} className="text-pink-500" /></Button>
            </div>
            <a href={shopWhatsappUrl(`Muraho! Ndashaka kugura: ${name} (${formatPrice(product.sellingPrice, currency)})`)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full h-11 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-semibold"><WhatsAppIcon size={18} /> {t("cart.orderWhatsapp", lang)}</a>
          </div>
        </div>
        <div className="mt-4 border-t border-pink-100 pt-4">
          <Tabs defaultValue="reviews">
            <TabsList><TabsTrigger value="reviews">{t("product.reviews", lang)} ({reviews.length})</TabsTrigger><TabsTrigger value="write">{t("product.writeReview", lang)}</TabsTrigger></TabsList>
            <TabsContent value="reviews" className="space-y-3 mt-3">
              {reviews.length === 0 ? <div className="text-center py-8 text-muted-foreground"><div className="text-5xl mb-2">⭐</div><p>{t("product.noReviews", lang)}</p></div> : reviews.map((r) => (
                <div key={r.id} className="p-3 rounded-xl border border-pink-100 bg-pink-50/30">
                  <div className="flex items-center justify-between mb-1"><div className="font-semibold text-sm">{r.customerName}</div><div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</div></div>
                  <StarRating value={r.rating} readOnly size={14} />
                  {r.title && <div className="font-medium text-sm mt-1">{r.title}</div>}
                  <p className="text-sm mt-1 text-foreground/80">{r.body}</p>
                  {r.adminReply && <div className="mt-2 p-2 rounded bg-pink-100 text-xs"><div className="font-semibold text-pink-700">{t("product.shopReply", lang)}</div>{r.adminReply}</div>}
                </div>
              ))}
            </TabsContent>
            <TabsContent value="write" className="mt-3"><ReviewForm productId={product.id} lang={lang} onSubmitted={() => toast.success(t("product.reviewSubmitted", lang))} /></TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReviewForm({ productId, lang, onSubmitted }: { productId: string; lang: any; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { toast.error(lang === "rw" ? "Hitamo amanota" : lang === "fr" ? "Choisir une note" : "Select a rating"); return; }
    if (!name || !phone || !body) { toast.error(lang === "rw" ? "Uzuza imyanya yose" : lang === "fr" ? "Remplir tous les champs" : "Fill all fields"); return; }
    setSubmitting(true);
    try { const res = await fetch(`/api/products/${productId}/reviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: name, customerPhone: phone, rating, title, body }) }); const data = await res.json(); if (data.ok) { onSubmitted(); setRating(0); setName(""); setPhone(""); setTitle(""); setBody(""); } else toast.error(data.error || "Failed"); } finally { setSubmitting(false); }
  }
  return <form onSubmit={submit} className="space-y-3"><div><Label>{lang === "rw" ? "Amanota *" : lang === "fr" ? "Note *" : "Rating *"}</Label><div className="mt-1"><StarRating value={rating} onChange={setRating} lang={lang} size={32} /></div></div><div className="grid sm:grid-cols-2 gap-3"><div><Label>{lang === "rw" ? "Amazina *" : lang === "fr" ? "Nom *" : "Name *"}</Label><Input value={name} onChange={(e) => setName(e.target.value)} required className="bg-pink-50/50" /></div><div><Label>{lang === "rw" ? "Telefone *" : lang === "fr" ? "Téléphone *" : "Phone *"}</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 7XX XXX XXX" required className="bg-pink-50/50" /></div></div><div><Label>{lang === "rw" ? "Umutwe" : lang === "fr" ? "Titre" : "Title"}</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-pink-50/50" /></div><div><Label>{lang === "rw" ? "Ibyatoranyijwe *" : lang === "fr" ? "Avis *" : "Review *"}</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} required className="bg-pink-50/50" /></div><Button type="submit" disabled={submitting} className="bg-pink-600 hover:bg-pink-700">{submitting ? (lang === "rw" ? "Kohereza..." : lang === "fr" ? "Envoi..." : "Submitting...") : (lang === "rw" ? "Tumiza Icyatoranyijwe" : lang === "fr" ? "Soumettre l'Avis" : "Submit Review")}</Button></form>;
}
