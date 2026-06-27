"use client";

import { useEffect, useState, useCallback } from "react";
import { useUI } from "@/lib/store";
import { t } from "@/lib/i18n";
import { formatPrice, priceHT, vatAmount, profitMarginPct } from "@/lib/format";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { shopWhatsappUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Star, Check, X, Trash2, Plus, Edit, Send, Power, Eye, Mail, Tag, Gift, Zap, Calendar, Building, Megaphone, Quote, UserCog, Palette, Bell, Activity, Search } from "lucide-react";

// Safe fetch helper
async function adminFetch(url: string, options?: RequestInit): Promise<Response> {
  let token = ""; try { const s = localStorage.getItem("sc_ui"); if (s) token = JSON.parse(s)?.state?.adminToken || ""; } catch {}
  if (token && url.startsWith("/api/admin")) {
    if (options?.body instanceof FormData) return fetch(url, { ...options, headers: { "x-admin-token": token } });
    const headers = new Headers(options?.headers); headers.set("x-admin-token", token);
    return fetch(url, { ...options, headers });
  }
  return fetch(url, options);
}

async function safeFetch(url: string, options?: RequestInit): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    let token = ""; try { const s = localStorage.getItem("sc_ui"); if (s) token = JSON.parse(s)?.state?.adminToken || ""; } catch {}
    const headers = new Headers(options?.headers);
    if (token && url.startsWith("/api/admin")) headers.set("x-admin-token", token);
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true, data };
  } catch (e: any) { return { ok: false, error: e?.message || "Network error" }; }
}

// ═══ CUSTOMERS ═══
export function CustomersView() {
  const { currency, lang } = useUI();
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any | null>(null);
  const load = useCallback(() => { adminFetch("/api/admin/customers").then(r => r.json()).then(d => d.ok && setCustomers(d.customers)).finally(() => setLoading(false)); }, []);
  useEffect(() => { load(); }, [load]);
  const filtered = customers.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  const tierColors: Record<string, string> = { bronze: "bg-amber-100 text-amber-800", silver: "bg-gray-200 text-gray-700", gold: "bg-yellow-100 text-yellow-800", platinum: "bg-purple-100 text-purple-800" };
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.customers", lang)}</h1><p className="text-sm text-muted-foreground">{customers.length} {t("admin.customers", lang).toLowerCase()}</p></div>
      <div className="relative max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search", lang)+"..."} className="pl-9 h-10 bg-white border-pink-100" /></div>
      {loading ? <div className="text-center py-10">{t("admin.loading", lang)}</div> : (
        <div className="bg-white rounded-2xl border border-pink-100 overflow-x-auto">
          <table className="w-full text-sm"><thead className="bg-pink-50/50 text-pink-800"><tr><th className="text-left p-3">{t("admin.staff.name", lang)}</th><th className="text-left p-3 hidden sm:table-cell">{t("admin.staff.username", lang)}</th><th className="text-right p-3">{t("admin.portal.orders", lang)}</th><th className="text-right p-3">{t("admin.portal.spent", lang)}</th><th className="text-center p-3">{t("admin.portal.tier", lang)}</th><th className="text-right p-3">{t("admin.edit", lang)}</th></tr></thead>
            <tbody>{filtered.map(c => (<tr key={c.id} className="border-t border-pink-50 hover:bg-pink-50/30"><td className="p-3 font-medium">{c.name}</td><td className="p-3 hidden sm:table-cell text-xs">{c.phone}</td><td className="p-3 text-right">{c.totalOrders}</td><td className="p-3 text-right font-semibold text-pink-700">{formatPrice(c.totalSpent, currency)}</td><td className="p-3 text-center"><Badge className={`text-[10px] capitalize ${tierColors[c.tier]}`}>{c.tier}</Badge></td><td className="p-3 text-right"><Button size="sm" variant="ghost" onClick={() => setEdit(c)}><Eye size={14} /></Button></td></tr>))}</tbody>
          </table>
        </div>
      )}
      {edit && <CustomerModal customer={edit} currency={currency} onClose={() => setEdit(null)} onUpdated={load} />}
    </div>
  );
}

function CustomerModal({ customer, currency, onClose, onUpdated }: any) {
  const { lang } = useUI();
  const [orders, setOrders] = useState<any[]>([]);
  const [pointsAdjust, setPointsAdjust] = useState(0);
  const [reason, setReason] = useState("");
  useEffect(() => { fetch(`/api/orders?phone=${encodeURIComponent(customer.phone)}`).then(r => r.json()).then(d => d.ok && setOrders(d.orders)); }, [customer.phone]);
  async function adjustPoints() { if (!pointsAdjust) return; const r = await safeFetch(`/api/admin/customers/${customer.id}/points`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ delta: pointsAdjust, reason }) }); if (r.ok) { toast.success("Points adjusted"); onUpdated(); onClose(); } else toast.error(r.error); }
  return (
    <Dialog open onOpenChange={onClose}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{customer.name} — {customer.phone}</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm"><Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">{t("admin.portal.spent", lang)}</div><div className="font-bold text-pink-700">{formatPrice(customer.totalSpent, currency)}</div></CardContent></Card><Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">{t("admin.portal.orders", lang)}</div><div className="font-bold">{customer.totalOrders}</div></CardContent></Card><Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">{t("admin.portal.points", lang)}</div><div className="font-bold text-purple-700">{customer.loyaltyPoints}</div></CardContent></Card><Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">{t("admin.portal.tier", lang)}</div><div className="font-bold capitalize">{customer.tier}</div></CardContent></Card></div>
      <div className="bg-pink-50/50 p-3 rounded-xl"><Label>{t("admin.customer.adjustPoints", lang)}</Label><div className="flex gap-2 mt-2"><Input type="number" value={pointsAdjust} onChange={(e) => setPointsAdjust(Number(e.target.value))} placeholder="+/-" className="bg-white" /><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("admin.customer.reason", lang)} className="bg-white" /><Button onClick={adjustPoints} className="bg-pink-600 hover:bg-pink-700">{t("admin.customer.apply", lang)}</Button></div></div>
      <div><h4 className="font-semibold mb-2">{t("admin.portal.history", lang)}</h4><div className="space-y-1 max-h-48 overflow-y-auto">{orders.map(o => (<div key={o.id} className="flex items-center justify-between text-xs p-2 rounded border border-pink-50"><div><span className="font-mono font-semibold">{o.orderNumber}</span><span className="text-muted-foreground ml-2">{new Date(o.createdAt).toLocaleDateString()}</span></div><span className="font-semibold text-pink-700">{formatPrice(o.totalTTC, currency)}</span></div>))}{orders.length === 0 && <div className="text-muted-foreground text-center py-4">{t("admin.portal.noOrders", lang)}</div>}</div></div>
    </DialogContent></Dialog>
  );
}

// ═══ REVIEWS ═══
export function ReviewsView() {
  const { lang } = useUI();
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  useEffect(() => { let c = false; adminFetch(`/api/admin/reviews?status=${filter}`).then(r => r.json()).then(d => { if (!c && d.ok) setReviews(d.reviews); }).finally(() => { if (!c) setLoading(false); }); return () => { c = true; }; }, [filter]);
  async function action(id: string, act: string) { const r = await safeFetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: act }) }); if (r.ok) { toast.success(`Review ${act}d`); setReviews(prev => prev.filter(x => x.id !== id || act === "reply")); } else toast.error(r.error); }
  async function submitReply() { const r = await safeFetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: replyTo.id, action: "reply", reply: replyText }) }); if (r.ok) { toast.success("Reply sent"); setReplyTo(null); setReplyText(""); } else toast.error(r.error); }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3"><div><h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.reviews", lang)}</h1><p className="text-sm text-muted-foreground">{reviews.length} {t("admin.reviews", lang).toLowerCase()}</p></div><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-40 bg-white border-pink-100"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">{t("admin.pending", lang)}</SelectItem><SelectItem value="approved">{t("admin.approved", lang)}</SelectItem><SelectItem value="hidden">{t("admin.off", lang)}</SelectItem><SelectItem value="all">{t("admin.all", lang)}</SelectItem></SelectContent></Select></div>
      {loading ? <div className="text-center py-10">{t("admin.loading", lang)}</div> : reviews.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border border-pink-100"><div className="text-6xl mb-2">⭐</div><p className="text-muted-foreground">{t("product.noReviews", lang)}</p></div> : (
        <div className="space-y-2">{reviews.map(r => (<div key={r.id} className="bg-white rounded-xl border border-pink-100 p-4"><div className="flex items-start justify-between gap-3 mb-2"><div><div className="flex items-center gap-2"><span className="font-semibold">{r.customerName}</span><span className="text-xs text-muted-foreground">{r.customerPhone}</span></div><div className="text-xs text-muted-foreground mt-0.5">{r.product?.emoji} {r.product?.nameEn} · {new Date(r.createdAt).toLocaleDateString()}</div></div><div className="flex gap-1">{[1,2,3,4,5].map(n => <Star key={n} size={14} className={n <= r.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"} />)}</div></div>{r.title && <div className="font-medium text-sm mb-1">{r.title}</div>}<p className="text-sm text-foreground/80 mb-2">{r.body}</p><div className="flex gap-2 flex-wrap">{!r.isApproved && <Button size="sm" onClick={() => action(r.id, "approve")} className="bg-green-600 hover:bg-green-700 h-8"><Check size={12} className="mr-1" /> {t("admin.approve", lang)}</Button>}<Button size="sm" variant="outline" onClick={() => { setReplyTo(r); setReplyText(r.adminReply || ""); }} className="h-8 border-pink-200 text-pink-700"><Mail size={12} className="mr-1" /> {t("admin.messages.replyTo", lang)}</Button><Button size="sm" variant="ghost" onClick={() => action(r.id, "delete")} className="text-red-600 h-8"><Trash2 size={12} /></Button></div></div>))}</div>
      )}
      {replyTo && <Dialog open onOpenChange={() => setReplyTo(null)}><DialogContent><DialogHeader><DialogTitle>{t("admin.messages.replyTo", lang)} {replyTo.customerName}</DialogTitle></DialogHeader><Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} className="bg-pink-50/50" /><DialogFooter><Button variant="outline" onClick={() => setReplyTo(null)}>{t("admin.cancel", lang)}</Button><Button onClick={submitReply} className="bg-pink-600 hover:bg-pink-700">{t("admin.send", lang)}</Button></DialogFooter></DialogContent></Dialog>}
    </div>
  );
}

// ═══ INVENTORY ═══
export function StockView() {
  const { currency, lang } = useUI();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState<any | null>(null);
  const [newQty, setNewQty] = useState(0);
  const [reason, setReason] = useState("");
  useEffect(() => { adminFetch("/api/admin/inventory").then(r => r.json()).then(d => d.ok && setProducts(d.products)).finally(() => setLoading(false)); }, []);
  async function adjust() { const r = await safeFetch("/api/admin/inventory/adjust", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: adjusting.id, newQty, reason }) }); if (r.ok) { toast.success("Adjusted"); setAdjusting(null); setNewQty(0); setReason(""); setProducts(prev => prev.map(p => p.id === adjusting.id ? { ...p, stockQty: newQty } : p)); } else toast.error(r.error); }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.inventory", lang)}</h1>
      {loading ? <div className="text-center py-10">{t("admin.loading", lang)}</div> : (
        <><div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">{lang === "rw" ? "Byose" : lang === "fr" ? "Total" : "Total"}</div><div className="text-xl font-bold text-pink-700">{products.length}</div></CardContent></Card><Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">{lang === "rw" ? "Byarangije" : lang === "fr" ? "Épuisé" : "Out"}</div><div className="text-xl font-bold text-red-600">{products.filter(p => p.stockQty <= 0).length}</div></CardContent></Card><Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">{lang === "rw" ? "Byoroheje" : lang === "fr" ? "Faible" : "Low"}</div><div className="text-xl font-bold text-amber-600">{products.filter(p => p.stockQty > 0 && p.stockQty <= p.lowStockThreshold).length}</div></CardContent></Card><Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">{lang === "rw" ? "Agaciro" : lang === "fr" ? "Valeur" : "Value"}</div><div className="text-xl font-bold text-green-700">{formatPrice(products.reduce((s, p) => s + p.stockQty * p.costPrice, 0), currency)}</div></CardContent></Card></div>
          <div className="bg-white rounded-2xl border border-pink-100 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-pink-50/50 text-pink-800"><tr><th className="text-left p-3">{t("admin.products", lang)}</th><th className="text-right p-3">{t("admin.inventory", lang)}</th><th className="text-right p-3">{t("admin.edit", lang)}</th></tr></thead><tbody>{products.map(p => (<tr key={p.id} className="border-t border-pink-50"><td className="p-3"><span className="text-xl mr-2">{p.emoji}</span>{p.nameEn}</td><td className="p-3 text-right">{p.stockQty <= 0 ? <Badge variant="destructive" className="text-[10px]">OUT</Badge> : p.stockQty <= p.lowStockThreshold ? <Badge className="text-[10px] bg-amber-100 text-amber-800">{p.stockQty} ⚠</Badge> : <span>{p.stockQty}</span>}</td><td className="p-3 text-right"><Button size="sm" variant="outline" onClick={() => { setAdjusting(p); setNewQty(p.stockQty); }} className="border-pink-200 text-pink-700 h-8"><Edit size={12} /></Button></td></tr>))}</tbody></table></div>
        </>
      )}
      {adjusting && <Dialog open onOpenChange={() => setAdjusting(null)}><DialogContent><DialogHeader><DialogTitle>{t("admin.edit", lang)} — {adjusting.nameEn}</DialogTitle></DialogHeader><div className="space-y-3"><div className="text-sm text-muted-foreground">{lang === "rw" ? "Kuri ubu:" : lang === "fr" ? "Actuel :" : "Current:"} {adjusting.stockQty}</div><div><Label>{lang === "rw" ? "Igiteranyo Gishya" : lang === "fr" ? "Nouvelle Quantité" : "New Quantity"}</Label><Input type="number" value={newQty} onChange={(e) => setNewQty(Number(e.target.value))} className="bg-pink-50/50" /></div><div><Label>{t("admin.customer.reason", lang)}</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} className="bg-pink-50/50" /></div></div><DialogFooter><Button variant="outline" onClick={() => setAdjusting(null)}>{t("admin.cancel", lang)}</Button><Button onClick={adjust} className="bg-pink-600 hover:bg-pink-700">{t("admin.save", lang)}</Button></DialogFooter></DialogContent></Dialog>}
    </div>
  );
}

// ═══ COUPONS ═══
export function CouponsView() {
  const { currency, lang } = useUI();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any | null>(null);
  useEffect(() => { adminFetch("/api/admin/coupons").then(r => r.json()).then(d => d.ok && setCoupons(d.coupons)).finally(() => setLoading(false)); }, []);
  async function toggleActive(c: any) { const r = await safeFetch(`/api/admin/coupons/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !c.isActive }) }); if (r.ok) setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x)); }
  async function del(id: string) { if (!confirm("Delete?")) return; const r = await safeFetch(`/api/admin/coupons/${id}`, { method: "DELETE" }); if (r.ok) setCoupons(prev => prev.filter(x => x.id !== id)); }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3"><h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.coupons", lang)}</h1><Button onClick={() => setEdit({})} className="bg-pink-600 hover:bg-pink-700"><Plus size={16} className="mr-1" /> {t("admin.new", lang)}</Button></div>
      {loading ? <div className="text-center py-10">{t("admin.loading", lang)}</div> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{coupons.map(c => (<Card key={c.id} className={!c.isActive ? "opacity-60" : ""}><CardContent className="p-4"><div className="flex items-start justify-between"><div><div className="font-mono font-bold text-lg text-pink-700">{c.code}</div><div className="text-xs text-muted-foreground">{c.description}</div></div><Badge className={c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>{c.isActive ? t("admin.active", lang) : t("admin.off", lang)}</Badge></div><div className="mt-2 text-sm"><div><strong>{c.type === "percent" ? `${c.value}%` : formatPrice(c.value, currency)}</strong> {t("admin.coupon.off", lang)}</div><div className="text-xs text-muted-foreground">{t("admin.coupon.minOrder", lang)}: {formatPrice(c.minOrder, currency)} · {t("admin.coupon.used", lang)}: {c.usesCount}</div></div><div className="flex gap-1 mt-3"><Button size="sm" variant="outline" onClick={() => setEdit(c)} className="border-pink-200 text-pink-700 h-8 flex-1"><Edit size={12} className="mr-1" /> {t("admin.edit", lang)}</Button><Button size="sm" variant="outline" onClick={() => toggleActive(c)} className="h-8"><Power size={12} /></Button><Button size="sm" variant="ghost" onClick={() => del(c.id)} className="text-red-600 h-8"><Trash2 size={12} /></Button></div></CardContent></Card>))}</div>}
      {edit && <CouponForm coupon={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); adminFetch("/api/admin/coupons").then(r => r.json()).then(d => d.ok && setCoupons(d.coupons)); }} />}
    </div>
  );
}

function CouponForm({ coupon, onClose, onSaved }: any) {
  const { lang } = useUI();
  const isEdit = !!coupon.id;
  const [form, setForm] = useState({ code: coupon.code || "", description: coupon.description || "", type: coupon.type || "percent", value: coupon.value || 5, minOrder: coupon.minOrder || 0, maxUses: coupon.maxUses || 0, isPublic: coupon.isPublic ?? true, isActive: coupon.isActive ?? true, expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "" });
  const [saving, setSaving] = useState(false);
  async function save() { setSaving(true); const url = isEdit ? `/api/admin/coupons/${coupon.id}` : "/api/admin/coupons"; const method = isEdit ? "PUT" : "POST"; const data = { ...form, code: form.code.toUpperCase() }; if (form.expiresAt) data.expiresAt = new Date(form.expiresAt).toISOString(); else delete data.expiresAt; const r = await safeFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); setSaving(false); if (r.ok) { toast.success("Saved"); onSaved(); } else toast.error(r.error); }
  return <Dialog open onOpenChange={onClose}><DialogContent><DialogHeader><DialogTitle>{isEdit ? t("admin.edit", lang) : t("admin.new", lang)} {t("admin.coupons", lang)}</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-3"><div><Label>{t("admin.coupon.code", lang)}</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="bg-pink-50/50 font-mono" /></div><div><Label>{t("admin.coupon.type", lang)}</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger className="bg-pink-50/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percent">{t("admin.coupon.percent", lang)}</SelectItem><SelectItem value="fixed">{t("admin.coupon.fixed", lang)}</SelectItem></SelectContent></Select></div><div><Label>{t("admin.coupon.value", lang)}</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="bg-pink-50/50" /></div><div><Label>{t("admin.coupon.minOrder", lang)}</Label><Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} className="bg-pink-50/50" /></div></div><div><Label>{t("admin.coupon.description", lang)}</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-pink-50/50" /></div><div className="flex items-center gap-4"><label className="flex items-center gap-2 text-sm"><Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} /> {t("admin.coupon.public", lang)}</label><label className="flex items-center gap-2 text-sm"><Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /> {t("admin.active", lang)}</label></div><DialogFooter><Button variant="outline" onClick={onClose}>{t("admin.cancel", lang)}</Button><Button onClick={save} disabled={saving} className="bg-pink-600 hover:bg-pink-700">{saving ? t("admin.saving", lang) : t("admin.save", lang)}</Button></DialogFooter></DialogContent></Dialog>;
}

// ═══ BUNDLES ═══
export function BundlesView() {
  const { currency, lang } = useUI();
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any | null>(null);
  useEffect(() => { adminFetch("/api/admin/bundles").then(r => r.json()).then(d => d.ok && setBundles(d.bundles)).finally(() => setLoading(false)); }, []);
  async function del(id: string) { if (!confirm("Delete?")) return; const r = await safeFetch(`/api/admin/bundles/${id}`, { method: "DELETE" }); if (r.ok) setBundles(prev => prev.filter(x => x.id !== id)); }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3"><h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.bundles", lang)}</h1><Button onClick={() => setEdit({})} className="bg-pink-600 hover:bg-pink-700"><Plus size={16} className="mr-1" /> {t("admin.new", lang)}</Button></div>
      {loading ? <div className="text-center py-10">{t("admin.loading", lang)}</div> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{bundles.map(b => (<Card key={b.id}><CardContent className="p-4"><div className="text-4xl mb-2">{b.emoji}</div><div className="font-bold text-pink-900">{b.nameEn}</div><div className="flex items-center gap-2 text-sm"><span className="font-bold text-pink-700">{formatPrice(b.bundlePrice, currency)}</span><span className="line-through text-muted-foreground">{formatPrice(b.normalPrice, currency)}</span><Badge className="bg-green-100 text-green-700 text-[10px]">-{b.savingsPct}%</Badge></div><div className="flex gap-1 mt-3"><Button size="sm" variant="outline" onClick={() => setEdit(b)} className="border-pink-200 text-pink-700 h-8 flex-1"><Edit size={12} className="mr-1" /> {t("admin.edit", lang)}</Button><Button size="sm" variant="ghost" onClick={() => del(b.id)} className="text-red-600 h-8"><Trash2 size={12} /></Button></div></CardContent></Card>))}</div>}
      {edit && <BundleForm bundle={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); adminFetch("/api/admin/bundles").then(r => r.json()).then(d => d.ok && setBundles(d.bundles)); }} />}
    </div>
  );
}

function BundleForm({ bundle, onClose, onSaved }: any) {
  const { lang } = useUI();
  const isEdit = !!bundle.id;
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>(bundle.items?.map((i: any) => i.productId) || []);
  const [form, setForm] = useState({ nameEn: bundle.nameEn || "", descEn: bundle.descEn || "", normalPrice: bundle.normalPrice || 0, bundlePrice: bundle.bundlePrice || 0, emoji: bundle.emoji || "🎁" });
  useEffect(() => { adminFetch("/api/admin/products").then(r => r.json()).then(d => d.ok && setProducts(d.products)); }, []);
  async function save() { const savingsPct = form.normalPrice > 0 ? Math.round((1 - form.bundlePrice / form.normalPrice) * 100) : 0; const url = isEdit ? `/api/admin/bundles/${bundle.id}` : "/api/admin/bundles"; const method = isEdit ? "PUT" : "POST"; const r = await safeFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, savingsPct, productIds: selected }) }); if (r.ok) { toast.success("Saved"); onSaved(); } else toast.error(r.error); }
  return <Dialog open onOpenChange={onClose}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{isEdit ? t("admin.edit", lang) : t("admin.new", lang)} {t("admin.bundles", lang)}</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-3"><div><Label>{t("admin.bundle.emoji", lang)}</Label><Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} maxLength={4} className="bg-pink-50/50" /></div><div><Label>{t("admin.bundle.name", lang)}</Label><Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="bg-pink-50/50" /></div><div><Label>{t("admin.bundle.normalPrice", lang)}</Label><Input type="number" value={form.normalPrice} onChange={(e) => setForm({ ...form, normalPrice: Number(e.target.value) })} className="bg-pink-50/50" /></div><div><Label>{t("admin.bundle.bundlePrice", lang)}</Label><Input type="number" value={form.bundlePrice} onChange={(e) => setForm({ ...form, bundlePrice: Number(e.target.value) })} className="bg-pink-50/50" /></div></div><div><Label>{t("admin.bundle.products", lang)}</Label><div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto border border-pink-100 rounded p-2">{products.map(p => <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer p-1 hover:bg-pink-50 rounded"><input type="checkbox" checked={selected.includes(p.id)} onChange={(e) => { if (e.target.checked) setSelected([...selected, p.id]); else setSelected(selected.filter(x => x !== p.id)); }} /><span>{p.emoji}</span><span className="truncate">{p.nameEn}</span></label>)}</div></div><DialogFooter><Button variant="outline" onClick={onClose}>{t("admin.cancel", lang)}</Button><Button onClick={save} className="bg-pink-600 hover:bg-pink-700">{t("admin.save", lang)}</Button></DialogFooter></DialogContent></Dialog>;
}

// ═══ FLASH SALES ═══
export function FlashSalesView() {
  const { currency, lang } = useUI();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any | null>(null);
  useEffect(() => { adminFetch("/api/admin/flash-sales").then(r => r.json()).then(d => d.ok && setSales(d.sales)).finally(() => setLoading(false)); }, []);
  async function del(id: string) { if (!confirm("Delete?")) return; const r = await safeFetch(`/api/admin/flash-sales/${id}`, { method: "DELETE" }); if (r.ok) setSales(prev => prev.filter(x => x.id !== id)); }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3"><h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.flashSales", lang)}</h1><Button onClick={() => setEdit({})} className="bg-pink-600 hover:bg-pink-700"><Plus size={16} className="mr-1" /> {t("admin.new", lang)}</Button></div>
      {loading ? <div className="text-center py-10">{t("admin.loading", lang)}</div> : sales.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border border-pink-100"><div className="text-6xl mb-2">⚡</div><p className="text-muted-foreground">{t("admin.flash.noSales", lang)}</p></div> : <div className="space-y-2">{sales.map(s => { const isLive = new Date(s.startTime) < new Date() && new Date(s.endTime) > new Date(); return (<Card key={s.id}><CardContent className="p-4"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><span className="font-bold text-pink-900">{s.titleEn}</span>{isLive && <Badge className="bg-red-500 text-white animate-pulse">{t("admin.flash.live", lang)}</Badge>}</div><div className="text-sm"><strong>{s.discountType === "percent" ? `${s.discountValue}%` : formatPrice(s.discountValue, currency)}</strong> {t("admin.coupon.off", lang)}</div><div className="text-xs text-muted-foreground">{new Date(s.startTime).toLocaleString()} → {new Date(s.endTime).toLocaleString()}</div></div><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setEdit(s)} className="border-pink-200 text-pink-700 h-8"><Edit size={12} /></Button><Button size="sm" variant="ghost" onClick={() => del(s.id)} className="text-red-600 h-8"><Trash2 size={12} /></Button></div></div></CardContent></Card>); })}</div>}
      {edit && <FlashSaleForm sale={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); adminFetch("/api/admin/flash-sales").then(r => r.json()).then(d => d.ok && setSales(d.sales)); }} />}
    </div>
  );
}

function FlashSaleForm({ sale, onClose, onSaved }: any) {
  const { lang } = useUI();
  const isEdit = !!sale.id;
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>(sale.items?.map((i: any) => i.productId) || []);
  const [form, setForm] = useState({ titleEn: sale.titleEn || "", discountType: sale.discountType || "percent", discountValue: sale.discountValue || 15, startTime: sale.startTime ? new Date(sale.startTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16), endTime: sale.endTime ? new Date(sale.endTime).toISOString().slice(0, 16) : new Date(Date.now() + 86400000).toISOString().slice(0, 16) });
  useEffect(() => { adminFetch("/api/admin/products").then(r => r.json()).then(d => d.ok && setProducts(d.products)); }, []);
  async function save() { const url = isEdit ? `/api/admin/flash-sales/${sale.id}` : "/api/admin/flash-sales"; const method = isEdit ? "PUT" : "POST"; const r = await safeFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, startTime: new Date(form.startTime).toISOString(), endTime: new Date(form.endTime).toISOString(), productIds: selected }) }); if (r.ok) { toast.success("Saved"); onSaved(); } else toast.error(r.error); }
  return <Dialog open onOpenChange={onClose}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{isEdit ? t("admin.edit", lang) : t("admin.new", lang)} {t("admin.flashSales", lang)}</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-3"><div><Label>{t("admin.flash.title", lang)}</Label><Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="bg-pink-50/50" /></div><div><Label>{t("admin.coupon.type", lang)}</Label><Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}><SelectTrigger className="bg-pink-50/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percent">{t("admin.coupon.percent", lang)}</SelectItem><SelectItem value="fixed">{t("admin.coupon.fixed", lang)}</SelectItem></SelectContent></Select></div><div><Label>{t("admin.coupon.value", lang)}</Label><Input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} className="bg-pink-50/50" /></div><div><Label>{t("admin.flash.start", lang)}</Label><Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="bg-pink-50/50" /></div><div><Label>{t("admin.flash.end", lang)}</Label><Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="bg-pink-50/50" /></div></div><div><Label>{t("admin.flash.productsAll", lang)}</Label><div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto border border-pink-100 rounded p-2">{products.map(p => <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer p-1 hover:bg-pink-50 rounded"><input type="checkbox" checked={selected.includes(p.id)} onChange={(e) => { if (e.target.checked) setSelected([...selected, p.id]); else setSelected(selected.filter(x => x !== p.id)); }} /><span>{p.emoji}</span><span className="truncate">{p.nameEn}</span></label>)}</div></div><DialogFooter><Button variant="outline" onClick={onClose}>{t("admin.cancel", lang)}</Button><Button onClick={save} className="bg-pink-600 hover:bg-pink-700">{t("admin.save", lang)}</Button></DialogFooter></DialogContent></Dialog>;
}

// ═══ BOOKINGS ═══
export function BookingsView() {
  const { lang } = useUI();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminFetch("/api/admin/bookings").then(r => r.json()).then(d => d.ok && setBookings(d.bookings)).finally(() => setLoading(false)); }, []);
  async function updateStatus(id: string, status: string) { const r = await safeFetch(`/api/admin/bookings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); if (r.ok) setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b)); }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.bookings", lang)}</h1>
      {loading ? <div className="text-center py-10">{t("admin.loading", lang)}</div> : bookings.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border border-pink-100"><div className="text-6xl mb-2">📅</div><p className="text-muted-foreground">{t("admin.booking.noBookings", lang)}</p></div> : <div className="space-y-2">{bookings.map(b => (<Card key={b.id}><CardContent className="p-4 flex items-center justify-between flex-wrap gap-2"><div><div className="font-semibold">{b.customerName} · {b.customerPhone}</div><div className="text-xs text-muted-foreground">{b.service} · {new Date(b.date).toLocaleDateString()} {t("admin.booking.at", lang)} {b.timeSlot}</div></div><div className="flex items-center gap-2"><Badge className={b.status === "pending" ? "bg-amber-100 text-amber-700" : b.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{b.status}</Badge><Select value={b.status} onValueChange={(v) => updateStatus(b.id, v)}><SelectTrigger className="w-32 h-8 text-xs bg-pink-50/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">{t("admin.pending", lang)}</SelectItem><SelectItem value="confirmed">{t("admin.confirm", lang)}</SelectItem><SelectItem value="completed">{t("admin.complete", lang)}</SelectItem><SelectItem value="cancelled">{t("admin.cancel", lang)}</SelectItem></SelectContent></Select></div></CardContent></Card>))}</div>}
    </div>
  );
}

// ═══ WHOLESALE ═══
export function WholesaleAdminView() {
  const { currency, lang } = useUI();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  useEffect(() => { adminFetch(`/api/admin/wholesale?status=${filter}`).then(r => r.json()).then(d => d.ok && setUsers(d.users)).finally(() => setLoading(false)); }, [filter]);
  async function approve(id: string) { const r = await safeFetch(`/api/admin/wholesale/${id}/approve`, { method: "PATCH" }); if (r.ok) { toast.success("Approved"); setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "approved" } : u)); } else toast.error(r.error); }
  async function reject(id: string) { const reason = prompt("Reason:"); if (!reason) return; const r = await safeFetch(`/api/admin/wholesale/${id}/reject`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) }); if (r.ok) { toast.success("Rejected"); setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "rejected" } : u)); } }
  async function suspend(id: string) { const r = await safeFetch(`/api/admin/wholesale/${id}/suspend`, { method: "PATCH" }); if (r.ok) setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "suspended" } : u)); }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3"><h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.wholesale", lang)}</h1><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-40 bg-white border-pink-100"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t("admin.all", lang)}</SelectItem><SelectItem value="pending">{t("admin.pending", lang)}</SelectItem><SelectItem value="approved">{t("admin.approved", lang)}</SelectItem><SelectItem value="rejected">{t("admin.rejected", lang)}</SelectItem><SelectItem value="suspended">{t("admin.suspended", lang)}</SelectItem></SelectContent></Select></div>
      {loading ? <div className="text-center py-10">{t("admin.loading", lang)}</div> : users.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border border-pink-100"><div className="text-6xl mb-2">🏢</div><p className="text-muted-foreground">{t("admin.wholesale.noApps", lang)}</p></div> : <div className="space-y-2">{users.map(u => (<Card key={u.id}><CardContent className="p-4"><div className="flex items-start justify-between flex-wrap gap-3"><div><div className="font-bold">{u.businessName}</div><div className="text-sm">{t("admin.wholesale.owner", lang)} {u.ownerName} · TIN: {u.tin}</div><div className="text-xs text-muted-foreground">{u.phone} · {u.district}</div></div><div className="flex flex-col gap-2 items-end"><Badge className={u.status === "pending" ? "bg-amber-100 text-amber-700" : u.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{u.status}</Badge>{u.status === "pending" && <div className="flex gap-1"><Button size="sm" onClick={() => approve(u.id)} className="bg-green-600 hover:bg-green-700 h-8"><Check size={12} className="mr-1" /> {t("admin.approve", lang)}</Button><Button size="sm" variant="outline" onClick={() => reject(u.id)} className="border-red-200 text-red-600 h-8"><X size={12} className="mr-1" /> {t("admin.reject", lang)}</Button></div>}{u.status === "approved" && <Button size="sm" variant="outline" onClick={() => suspend(u.id)} className="border-amber-200 text-amber-700 h-8"><Power size={12} className="mr-1" /> {t("admin.suspend", lang)}</Button>}</div></div></CardContent></Card>))}</div>}
    </div>
  );
}

// ═══ MESSAGES ═══
export function MessagesView() {
  const { lang } = useUI();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  useEffect(() => { adminFetch("/api/admin/messages").then(r => r.json()).then(d => d.ok && setMessages(d.messages)).finally(() => setLoading(false)); }, []);
  async function markRead(id: string) { const r = await safeFetch(`/api/admin/messages/${id}/read`, { method: "PATCH" }); if (r.ok) setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m)); }
  async function del(id: string) { if (!confirm(t("admin.deleteConfirm", lang))) return; const r = await safeFetch(`/api/admin/messages/${id}`, { method: "DELETE" }); if (r.ok) setMessages(prev => prev.filter(m => m.id !== id)); }
  async function sendReply() { window.open(shopWhatsappUrl(reply.phone, `Muraho ${reply.name}!\n\n${replyText}`), "_blank"); await markRead(reply.id); setReply(null); setReplyText(""); }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.messages", lang)}</h1>
      {loading ? <div className="text-center py-10">{t("admin.loading", lang)}</div> : messages.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border border-pink-100"><div className="text-6xl mb-2">💌</div><p className="text-muted-foreground">{t("admin.messages.noMsgs", lang)}</p></div> : <div className="space-y-2">{messages.map(m => (<Card key={m.id} className={m.isRead ? "" : "border-pink-300 bg-pink-50/30"}><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="font-semibold">{m.name}</span>{!m.isRead && <Badge className="text-[9px] bg-pink-500 text-white">NEW</Badge>}</div><div className="text-xs text-muted-foreground">{m.phone} · {m.subject}</div><p className="text-sm mt-1 line-clamp-2">{m.message}</p></div><div className="flex flex-col gap-1">{!m.isRead && <Button size="sm" variant="ghost" onClick={() => markRead(m.id)} className="h-7"><Check size={12} /></Button>}<Button size="sm" variant="outline" onClick={() => { setReply(m); setReplyText(""); }} className="h-7 border-pink-200 text-pink-700"><Mail size={12} /></Button><Button size="sm" variant="ghost" onClick={() => del(m.id)} className="h-7 text-red-600"><Trash2 size={12} /></Button></div></div></CardContent></Card>))}</div>}
      {reply && <Dialog open onOpenChange={() => setReply(null)}><DialogContent><DialogHeader><DialogTitle>{t("admin.messages.replyTo", lang)} {reply.name}</DialogTitle></DialogHeader><Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} className="bg-pink-50/50" /><DialogFooter><Button variant="outline" onClick={() => setReply(null)}>{t("admin.cancel", lang)}</Button><Button onClick={sendReply} className="bg-[#25D366] hover:bg-[#1ebe5d]"><WhatsAppIcon size={14} className="mr-1" /> {t("admin.messages.sendWA", lang)}</Button></DialogFooter></DialogContent></Dialog>}
    </div>
  );
}

// ═══ SUBSCRIBERS ═══
export function SubscribersView() {
  const { lang } = useUI();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcast, setBroadcast] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  useEffect(() => { adminFetch("/api/admin/subscribers").then(r => r.json()).then(d => d.ok && setSubs(d.subscribers)).finally(() => setLoading(false)); }, []);
  async function toggle(id: string, current: boolean) { const r = await safeFetch(`/api/admin/subscribers/${id}/toggle`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) }); if (r.ok) setSubs(prev => prev.map(s => s.id === id ? { ...s, isActive: !current } : s)); }
  async function sendBroadcast() { if (!broadcastMsg) return; if (!confirm(`Send to ${subs.filter(s => s.isActive).length} subscribers?`)) return; const r = await safeFetch("/api/admin/broadcast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: broadcastMsg }) }); if (r.ok) { toast.success("Sent"); setBroadcast(false); setBroadcastMsg(""); } }
  function exportCSV() { const csv = "Phone,Name,Source,Active\n" + subs.map(s => `${s.phone},${s.name},${s.source},${s.isActive}`).join("\n"); const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click(); }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3"><div><h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.subscribers", lang)}</h1><p className="text-sm text-muted-foreground">{subs.filter(s => s.isActive).length} {t("admin.subscribers.active", lang)}</p></div><div className="flex gap-2"><Button variant="outline" onClick={exportCSV} className="border-pink-200 text-pink-700">{t("admin.csv", lang)}</Button><Button onClick={() => setBroadcast(true)} className="bg-pink-600 hover:bg-pink-700"><Send size={14} className="mr-1" /> {t("admin.broadcast", lang)}</Button></div></div>
      {loading ? <div className="text-center py-10">{t("admin.loading", lang)}</div> : <div className="bg-white rounded-2xl border border-pink-100 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-pink-50/50 text-pink-800"><tr><th className="text-left p-3">{t("admin.staff.username", lang)}</th><th className="text-left p-3">{t("admin.staff.name", lang)}</th><th className="text-center p-3">{t("admin.active", lang)}</th></tr></thead><tbody>{subs.map(s => (<tr key={s.id} className="border-t border-pink-50"><td className="p-3 font-mono text-xs">{s.phone}</td><td className="p-3">{s.name || "—"}</td><td className="p-3 text-center"><Switch checked={s.isActive} onCheckedChange={() => toggle(s.id, s.isActive)} /></td></tr>))}</tbody></table></div>}
      {broadcast && <Dialog open onOpenChange={() => setBroadcast(false)}><DialogContent><DialogHeader><DialogTitle>{t("admin.subscribers.broadcastTitle", lang)}</DialogTitle></DialogHeader><Textarea value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} rows={5} className="bg-pink-50/50" /><DialogFooter><Button variant="outline" onClick={() => setBroadcast(false)}>{t("admin.cancel", lang)}</Button><Button onClick={sendBroadcast} className="bg-pink-600 hover:bg-pink-700"><Send size={14} className="mr-1" /> {t("admin.send", lang)}</Button></DialogFooter></DialogContent></Dialog>}
    </div>
  );
}

// ═══ TESTIMONIALS ═══
export function TestimonialsView() {
  const { lang } = useUI();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminFetch("/api/admin/testimonials").then(r => r.json()).then(d => d.ok && setItems(d.testimonials)).finally(() => setLoading(false)); }, []);
  async function approve(id: string) { const r = await safeFetch(`/api/admin/testimonials/${id}/approve`, { method: "PATCH" }); if (r.ok) setItems(prev => prev.map(t => t.id === id ? { ...t, isApproved: true } : t)); }
  async function del(id: string) { if (!confirm(t("admin.deleteConfirm", lang))) return; const r = await safeFetch(`/api/admin/testimonials/${id}`, { method: "DELETE" }); if (r.ok) setItems(prev => prev.filter(t => t.id !== id)); }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.testimonials", lang)}</h1>
      {loading ? <div className="text-center py-10">{t("admin.loading", lang)}</div> : <div className="grid sm:grid-cols-2 gap-3">{items.map(t => (<Card key={t.id} className={!t.isApproved ? "opacity-70" : ""}><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><div className="font-semibold">{t.customerName}</div><div className="flex">{[1,2,3,4,5].map(n => <Star key={n} size={12} className={n <= t.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"} />)}</div></div><p className="text-sm italic">"{t.messageEn}"</p><div className="flex gap-1 mt-2">{!t.isApproved && <Button size="sm" onClick={() => approve(t.id)} className="bg-green-600 hover:bg-green-700 h-7"><Check size={12} className="mr-1" /> {t("admin.approve", lang)}</Button>}<Button size="sm" variant="ghost" onClick={() => del(t.id)} className="text-red-600 h-7"><Trash2 size={12} /></Button></div></CardContent></Card>))}</div>}
    </div>
  );
}

// ═══ STAFF ═══
const ALL_PERMS = ["view_dashboard","view_orders","update_order_status","notify_customer","view_products","manage_products","manage_stock","view_customers","manage_customers","adjust_points","view_analytics","view_wholesale","manage_bookings","view_messages","export_data","manage_reviews"];
export function StaffView() {
  const { lang } = useUI();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any | null>(null);
  useEffect(() => { adminFetch("/api/admin/staff").then(r => r.json()).then(d => d.ok && setStaff(d.staff)).finally(() => setLoading(false)); }, []);
  async function toggle(s: any) { const r = await safeFetch(`/api/admin/staff/${s.id}/toggle`, { method: "PATCH" }); if (r.ok) setStaff(prev => prev.map(x => x.id === s.id ? { ...x, isActive: !x.isActive } : x)); }
  async function del(id: string) { if (!confirm("Delete?")) return; const r = await safeFetch(`/api/admin/staff/${id}`, { method: "DELETE" }); if (r.ok) setStaff(prev => prev.filter(x => x.id !== id)); }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3"><h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.staff", lang)}</h1><Button onClick={() => setEdit({})} className="bg-pink-600 hover:bg-pink-700"><Plus size={16} className="mr-1" /> {t("admin.add", lang)}</Button></div>
      {loading ? <div className="text-center py-10">{t("admin.loading", lang)}</div> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{staff.map(s => { const perms = typeof s.permissions === "string" ? JSON.parse(s.permissions) : (s.permissions || []); return (<Card key={s.id} className={!s.isActive ? "opacity-60" : ""}><CardContent className="p-4"><div className="font-semibold">{s.name}</div><div className="text-xs text-muted-foreground">@{s.username} · {s.role}</div><div className="text-xs mt-2">{perms.length} {t("admin.staff.permissionsCount", lang)}</div><div className="flex gap-1 mt-3"><Button size="sm" variant="outline" onClick={() => setEdit(s)} className="border-pink-200 text-pink-700 h-8 flex-1"><Edit size={12} className="mr-1" /> {t("admin.edit", lang)}</Button><Button size="sm" variant="outline" onClick={() => toggle(s)} className="h-8"><Power size={12} /></Button><Button size="sm" variant="ghost" onClick={() => del(s.id)} className="text-red-600 h-8"><Trash2 size={12} /></Button></div></CardContent></Card>); })}</div>}
      {edit && <StaffForm staff={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); adminFetch("/api/admin/staff").then(r => r.json()).then(d => d.ok && setStaff(d.staff)); }} />}
    </div>
  );
}

function StaffForm({ staff, onClose, onSaved }: any) {
  const { lang } = useUI();
  const isEdit = !!staff.id;
  const [form, setForm] = useState({ name: staff.name || "", username: staff.username || "", password: "", role: staff.role || "viewer" });
  const [perms, setPerms] = useState<string[]>(staff.permissions ? (typeof staff.permissions === "string" ? JSON.parse(staff.permissions) : staff.permissions) : []);
  const [saving, setSaving] = useState(false);
  async function save() { setSaving(true); const url = isEdit ? `/api/admin/staff/${staff.id}` : "/api/admin/staff"; const method = isEdit ? "PUT" : "POST"; const body: any = { ...form, permissions: perms }; if (!form.password) delete body.password; const r = await safeFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setSaving(false); if (r.ok) { toast.success("Saved"); onSaved(); } else toast.error(r.error); }
  return <Dialog open onOpenChange={onClose}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{isEdit ? t("admin.edit", lang) : t("admin.new", lang)} {t("admin.staff", lang)}</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>{t("admin.staff.name", lang)}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-pink-50/50" /></div><div><Label>{t("admin.staff.username", lang)}</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="bg-pink-50/50 font-mono" /></div><div><Label>{isEdit ? t("admin.staff.newPassword", lang) : t("admin.staff.password", lang)}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="bg-pink-50/50" /></div><div><Label>{t("admin.staff.role", lang)}</Label><Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}><SelectTrigger className="bg-pink-50/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sales">{t("admin.staff.sales", lang)}</SelectItem><SelectItem value="inventory">{t("admin.staff.inventory", lang)}</SelectItem><SelectItem value="viewer">{t("admin.staff.viewer", lang)}</SelectItem><SelectItem value="custom">{t("admin.staff.custom", lang)}</SelectItem></SelectContent></Select></div><div><Label>{t("admin.staff.permissions", lang)} ({perms.length})</Label><div className="grid grid-cols-2 gap-1 mt-1 max-h-48 overflow-y-auto border border-pink-100 rounded p-2">{ALL_PERMS.map(p => <label key={p} className="flex items-center gap-1 text-xs cursor-pointer p-1 hover:bg-pink-50 rounded"><input type="checkbox" checked={perms.includes(p)} onChange={() => setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} />{p}</label>)}</div></div></div><DialogFooter><Button variant="outline" onClick={onClose}>{t("admin.cancel", lang)}</Button><Button onClick={save} disabled={saving} className="bg-pink-600 hover:bg-pink-700">{saving ? t("admin.saving", lang) : t("admin.save", lang)}</Button></DialogFooter></DialogContent></Dialog>;
}

// ═══ BRANDING ═══
export function BrandingView() {
  const { lang } = useUI();
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  async function uploadLogo(file: File) {
    setUploadingLogo(true);
    try {
      if (!file.type.startsWith("image/")) { toast.error("Select an image"); return; }
      if (file.size > 5*1024*1024) { toast.error("Max 5MB"); return; }
      const fd = new FormData(); fd.append("file", file);
      const res = await adminFetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) { setSettings({ ...settings, logoUrl: data.url }); toast.success("Uploaded — click Save"); }
      else toast.error(data.error || "Failed");
    } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setUploadingLogo(false); }
  }
  useEffect(() => { fetch("/api/settings").then(r => r.json()).then(d => d.ok && setSettings(d.settings)); }, []);
  async function save() { setSaving(true); const r = await safeFetch("/api/admin/branding", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) }); setSaving(false); if (r.ok) toast.success("Saved"); else toast.error(r.error); }
  if (!settings) return <div className="text-center py-10">{t("admin.loading", lang)}</div>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.branding.title", lang)}</h1>
      <Card><CardHeader><CardTitle>{t("admin.branding.identity", lang)}</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid sm:grid-cols-2 gap-3"><div><Label>{t("admin.branding.shopName", lang)}</Label><Input value={settings.shopName} onChange={(e) => setSettings({ ...settings, shopName: e.target.value })} className="bg-pink-50/50" /></div><div><Label>{t("admin.branding.logoEmoji", lang)}</Label><Input value={settings.logoEmoji} onChange={(e) => setSettings({ ...settings, logoEmoji: e.target.value })} maxLength={4} className="bg-pink-50/50" /></div><div><Label>{t("admin.branding.whatsapp", lang)}</Label><Input value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} className="bg-pink-50/50" /></div><div><Label>{t("admin.branding.email", lang)}</Label><Input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="bg-pink-50/50" /></div><div><Label>{t("admin.branding.tin", lang)}</Label><Input value={settings.tin} onChange={(e) => setSettings({ ...settings, tin: e.target.value })} className="bg-pink-50/50" /></div><div><Label>{t("admin.branding.hours", lang)}</Label><Input value={settings.openingHours} onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })} className="bg-pink-50/50" /></div></div></CardContent></Card>
      <Button onClick={save} disabled={saving} className="bg-pink-600 hover:bg-pink-700">{saving ? t("admin.saving", lang) : t("admin.save", lang)}</Button>
    </div>
  );
}

// ═══ NOTIFICATIONS ═══
export function NotificationsView() {
  const { lang } = useUI();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminFetch("/api/admin/notifications").then(r => r.json()).then(d => d.ok && setNotifs(d.notifications)).finally(() => setLoading(false)); }, []);
  async function markAll() { const r = await safeFetch("/api/admin/notifications/mark-all-read", { method: "PATCH" }); if (r.ok) setNotifs(prev => prev.map(n => ({ ...n, isRead: true }))); }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.notifications.title", lang)}</h1><Button variant="outline" onClick={markAll} className="border-pink-200 text-pink-700">{t("admin.markAllRead", lang)}</Button></div>
      {loading ? <div className="text-center py-10">{t("admin.loading", lang)}</div> : notifs.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border border-pink-100"><div className="text-6xl mb-2">🔔</div><p className="text-muted-foreground">{t("admin.notifications.noNotifs", lang)}</p></div> : <div className="space-y-2">{notifs.map(n => (<Card key={n.id} className={!n.isRead ? "border-pink-300 bg-pink-50/30" : ""}><CardContent className="p-3 flex items-start gap-3"><div className="text-xl">{n.type === "order" ? "🛒" : n.type === "wholesale" ? "🏢" : n.type === "review" ? "⭐" : n.type === "stock" ? "⚠️" : n.type === "booking" ? "📅" : "💌"}</div><div className="flex-1"><div className="font-semibold text-sm">{n.title}</div><div className="text-xs text-muted-foreground">{n.body}</div><div className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div></div></CardContent></Card>))}</div>}
    </div>
  );
}

// ═══ SITE HEALTH ═══
export function SiteHealthView() {
  const { lang } = useUI();
  const [health, setHealth] = useState<any>(null);
  useEffect(() => { adminFetch("/api/admin/site-health").then(r => r.json()).then(d => d.ok && setHealth(d.health)); }, []);
  if (!health) return <div className="text-center py-10">{t("admin.loading", lang)}</div>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>{t("admin.health.title", lang)}</h1>
      <Card><CardHeader><CardTitle>{t("admin.health.services", lang)}</CardTitle></CardHeader><CardContent className="space-y-2">{health.services.map((s: any) => <div key={s.name} className="flex items-center justify-between p-2 rounded border border-pink-50"><div className="flex items-center gap-2"><span className={s.ok ? "text-green-500" : "text-amber-500"}>●</span><span className="font-medium">{s.name}</span></div><div className="text-sm text-muted-foreground">{s.message}</div></div>)}</CardContent></Card>
      <Card><CardHeader><CardTitle>{t("admin.health.database", lang)}</CardTitle></CardHeader><CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">{Object.entries(health.counts).map(([k, v]: any) => <div key={k} className="bg-pink-50/50 p-2 rounded"><div className="text-xs text-muted-foreground capitalize">{k}</div><div className="font-bold text-pink-700">{v}</div></div>)}</CardContent></Card>
    </div>
  );
}
