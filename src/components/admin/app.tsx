"use client";

import { useEffect, useState, useCallback } from "react";
import { useUI } from "@/lib/store";
import { t, pickLang } from "@/lib/i18n";
import { formatPrice, priceHT, vatAmount, profitMarginPct, grossProfitHT } from "@/lib/format";
import { WHATSAPP_LINK, shopWhatsappUrl, buildOrderMessage } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileSpreadsheet,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Receipt,
  TrendingUp,
  AlertTriangle,
  Users,
  Search,
  ExternalLink,
  Banknote,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

type View = "dashboard" | "products" | "orders" | "vat" | "customers";

export function AdminApp() {
  const { adminName, adminLogout, lang } = useUI();
  const [view, setView] = useState<View>("dashboard");

  return (
    <div className="min-h-screen flex bg-pink-50/30">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-pink-100 p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-6 px-2">
          <span className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 grid place-items-center text-white">
            ✿
          </span>
          <div className="leading-tight">
            <div className="font-bold text-pink-900 text-sm" style={{ fontFamily: "var(--font-playfair)" }}>
              Samuel Cosmetic
            </div>
            <div className="text-[10px] text-pink-500 uppercase tracking-wide">Admin Panel</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: "dashboard", label: t("admin.dashboard", lang), icon: LayoutDashboard },
            { id: "products", label: t("admin.products", lang), icon: Package },
            { id: "orders", label: t("admin.orders", lang), icon: ShoppingCart },
            { id: "vat", label: t("admin.vatReport", lang), icon: FileSpreadsheet },
          ].map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id as View)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                view === n.id
                  ? "bg-pink-100 text-pink-700 font-semibold"
                  : "text-foreground/70 hover:bg-pink-50"
              }`}
            >
              <n.icon size={16} />
              {n.label}
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-pink-100 space-y-2">
          <div className="px-2 text-xs">
            <div className="font-semibold text-pink-800">{adminName}</div>
            <div className="text-muted-foreground">Administrator</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={adminLogout}
            className="w-full border-pink-200 text-pink-700"
          >
            <LogOut size={14} className="mr-1" /> {t("admin.logout", lang)}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 pb-16 md:pb-4">
        {/* Top bar (mobile) */}
        <header className="md:hidden sticky top-0 z-10 bg-white border-b border-pink-100 p-3 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 grid place-items-center text-white text-sm">
            ✿
          </span>
          <span className="font-bold text-pink-900 text-sm flex-1">Admin Panel</span>
          <Button variant="ghost" size="sm" onClick={adminLogout}>
            <LogOut size={14} />
          </Button>
        </header>

        {/* Mobile tab bar */}
        <nav className="md:hidden sticky top-[57px] z-10 bg-white border-b border-pink-100 grid grid-cols-4">
          {[
            { id: "dashboard", label: "Dash", icon: LayoutDashboard },
            { id: "products", label: "Items", icon: Package },
            { id: "orders", label: "Orders", icon: ShoppingCart },
            { id: "vat", label: "VAT", icon: FileSpreadsheet },
          ].map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id as View)}
              className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${
                view === n.id ? "text-pink-700 border-b-2 border-pink-600 font-semibold" : "text-muted-foreground"
              }`}
            >
              <n.icon size={16} />
              {n.label}
            </button>
          ))}
        </nav>

        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {view === "dashboard" && <DashboardView />}
          {view === "products" && <ProductsView />}
          {view === "orders" && <OrdersView />}
          {view === "vat" && <VatView />}
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────
function DashboardView() {
  const { lang, currency } = useUI();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => d.ok && setData(d.analytics));
  }, []);

  if (!data) return <div className="text-center py-20 text-muted-foreground">{t("common.loading", lang)}</div>;

  const kpis = [
    { label: t("admin.kpi.revenue", lang), value: formatPrice(data.revenueToday, currency), icon: Banknote, color: "from-pink-500 to-pink-600" },
    { label: t("admin.kpi.orders", lang), value: data.ordersToday, icon: ShoppingCart, color: "from-purple-500 to-purple-600" },
    { label: t("admin.kpi.products", lang), value: data.productsCount, icon: Package, color: "from-amber-500 to-amber-600" },
    { label: t("admin.kpi.lowStock", lang), value: data.lowStockCount, icon: AlertTriangle, color: "from-red-500 to-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>
          {t("admin.dashboard", lang)}
        </h1>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="overflow-hidden border-0 shadow-sm">
            <div className={`bg-gradient-to-br ${k.color} p-3 text-white`}>
              <k.icon size={18} className="opacity-80" />
            </div>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="text-xl font-bold text-pink-900">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={16} className="text-pink-600" />
              Revenue — Last 7 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: any) => formatPrice(Number(v), currency)}
                  contentStyle={{ borderRadius: 12, border: "1px solid #fce7f0" }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#e75480" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users size={16} className="text-purple-600" />
              Orders by District
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.districtStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="district" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  formatter={(v: any) => [`${v} orders`, "Orders"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #f3e8ff" }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top products + low stock */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package size={16} className="text-amber-600" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topProducts.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-6">No sales yet.</div>
              )}
              {data.topProducts.map((p: any, i: number) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 grid place-items-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="text-xl">{p.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.salesCount} sold</div>
                  </div>
                  <div className="font-semibold text-pink-700">{formatPrice(p.revenue, currency)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.lowStockProducts.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-6">All products well stocked ✅</div>
              )}
              {data.lowStockProducts.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50/50">
                  <div className="text-xl">{p.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-red-600">
                      Only {p.stockQty} left — reorder soon
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-[10px]">{p.stockQty}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status pie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={Object.entries(data.statusBreakdown).map(([k, v]) => ({ name: k, value: v }))}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                  label
                >
                  {["#e75480", "#8b5cf6", "#22c55e", "#f59e0b", "#3b82f6", "#ef4444"].map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 text-sm">
              {Object.entries(data.statusBreakdown).map(([k, v]: any, i) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded" style={{ background: ["#e75480", "#8b5cf6", "#22c55e", "#f59e0b", "#3b82f6", "#ef4444"][i % 6] }} />
                    <span className="capitalize">{k}</span>
                  </span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
              {Object.keys(data.statusBreakdown).length === 0 && (
                <div className="text-muted-foreground text-center py-4">No orders yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────
function ProductsView() {
  const { lang, currency } = useUI();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([p, c]) => {
      if (p.ok) setProducts(p.products);
      if (c.ok) setCategories(c.categories);
      setLoading(false);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter((p) =>
    !search || p.nameEn.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(p: any) {
    if (!confirm(`Delete ${p.nameEn}?`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Product deleted");
      load();
    } else {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>
            {t("admin.products", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{products.length} products · RRA-compliant pricing</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-pink-600 hover:bg-pink-700">
          <Plus size={16} className="mr-1" /> {t("admin.products.add", lang)}
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU..."
          className="pl-9 h-10 bg-white border-pink-100"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">{t("common.loading", lang)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pink-50/50 text-pink-800">
                <tr>
                  <th className="text-left p-3 font-semibold">Product</th>
                  <th className="text-left p-3 font-semibold hidden sm:table-cell">SKU</th>
                  <th className="text-left p-3 font-semibold">Cost HT</th>
                  <th className="text-left p-3 font-semibold">Sell TTC</th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell">Margin</th>
                  <th className="text-left p-3 font-semibold">Stock</th>
                  <th className="text-right p-3 font-semibold">{t("admin.orders.actions", lang)}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const margin = profitMarginPct(p.sellingPrice, p.costPrice);
                  return (
                    <tr key={p.id} className="border-t border-pink-50 hover:bg-pink-50/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{p.emoji}</span>
                          <div className="min-w-0">
                            <div className="font-medium truncate max-w-[180px]">{p.nameEn}</div>
                            <div className="text-xs text-muted-foreground">{p.category?.nameEn}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell font-mono text-xs">{p.sku}</td>
                      <td className="p-3 text-xs">{formatPrice(p.costPrice, currency)}</td>
                      <td className="p-3 font-semibold text-pink-700">{formatPrice(p.sellingPrice, currency)}</td>
                      <td className="p-3 hidden md:table-cell">
                        <Badge className={margin > 30 ? "bg-green-100 text-green-700" : margin > 15 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}>
                          {margin}%
                        </Badge>
                      </td>
                      <td className="p-3">
                        {p.stockQty <= 5 ? (
                          <Badge variant="destructive" className="text-[10px]">{p.stockQty} left</Badge>
                        ) : (
                          <span className="text-sm">{p.stockQty}</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditing(p); setShowForm(true); }}>
                            <Edit size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(p)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

function ProductForm({ product, categories, onClose, onSaved }: {
  product: any;
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { lang, currency } = useUI();
  const isEdit = !!product;
  const [form, setForm] = useState({
    id: product?.id || "",
    nameEn: product?.nameEn || "",
    nameFr: product?.nameFr || "",
    nameRw: product?.nameRw || "",
    descEn: product?.descEn || "",
    descFr: product?.descFr || "",
    descRw: product?.descRw || "",
    categoryId: product?.categoryId || categories[0]?.id || "",
    emoji: product?.emoji || "💄",
    sku: product?.sku || "",
    costPrice: product?.costPrice || 0,
    sellingPrice: product?.sellingPrice || 0,
    wholesalePrice: product?.wholesalePrice || 0,
    stockQty: product?.stockQty || 0,
    lowStockThreshold: product?.lowStockThreshold || 5,
    moq: product?.moq || 1,
    badge: product?.badge || "",
    isActive: product?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  // Live calc
  const ht = priceHT(form.sellingPrice);
  const vat = vatAmount(form.sellingPrice);
  const profit = grossProfitHT(form.sellingPrice, form.costPrice);
  const margin = profitMarginPct(form.sellingPrice, form.costPrice);

  async function save() {
    setSaving(true);
    const url = isEdit ? `/api/admin/products/${form.id}` : "/api/admin/products";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.ok) {
      toast.success(isEdit ? "Product updated" : "Product added");
      onSaved();
    } else {
      toast.error(data.error || "Save failed");
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Name (EN)</Label>
            <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="bg-pink-50/50" />
          </div>
          <div className="space-y-1">
            <Label>Name (FR)</Label>
            <Input value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })} className="bg-pink-50/50" />
          </div>
          <div className="space-y-1">
            <Label>Name (RW)</Label>
            <Input value={form.nameRw} onChange={(e) => setForm({ ...form, nameRw: e.target.value })} className="bg-pink-50/50" />
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
              <SelectTrigger className="bg-pink-50/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.emoji} {c.nameEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>SKU</Label>
            <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="bg-pink-50/50 font-mono" />
          </div>
          <div className="space-y-1">
            <Label>Emoji</Label>
            <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="bg-pink-50/50" maxLength={4} />
          </div>
          <div className="space-y-1">
            <Label>{t("admin.products.cost", lang)} (HT)</Label>
            <Input
              type="number"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
              className="bg-pink-50/50"
            />
          </div>
          <div className="space-y-1">
            <Label>{t("admin.products.price", lang)} (TTC)</Label>
            <Input
              type="number"
              value={form.sellingPrice}
              onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })}
              className="bg-pink-50/50"
            />
          </div>
          <div className="space-y-1">
            <Label>{t("admin.products.wholesale", lang)}</Label>
            <Input
              type="number"
              value={form.wholesalePrice}
              onChange={(e) => setForm({ ...form, wholesalePrice: Number(e.target.value) })}
              className="bg-pink-50/50"
            />
          </div>
          <div className="space-y-1">
            <Label>{t("admin.products.stock", lang)}</Label>
            <Input
              type="number"
              value={form.stockQty}
              onChange={(e) => setForm({ ...form, stockQty: Number(e.target.value) })}
              className="bg-pink-50/50"
            />
          </div>
          <div className="space-y-1">
            <Label>{t("admin.products.badge", lang)}</Label>
            <Select value={form.badge} onValueChange={(v) => setForm({ ...form, badge: v })}>
              <SelectTrigger className="bg-pink-50/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                <SelectItem value="bestseller">Best Seller</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* RRA Live calc */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">{t("admin.products.calc.ht", lang)}</div>
            <div className="font-bold text-pink-700">{formatPrice(ht, currency)}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">{t("admin.products.calc.vat", lang)} (18%)</div>
            <div className="font-bold text-purple-700">{formatPrice(vat, currency)}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">{t("admin.products.calc.profit", lang)}</div>
            <div className={`font-bold ${profit > 0 ? "text-green-700" : "text-red-700"}`}>{formatPrice(profit, currency)}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">{t("admin.products.calc.margin", lang)}</div>
            <div className={`font-bold ${margin > 30 ? "text-green-700" : margin > 15 ? "text-amber-700" : "text-red-700"}`}>{margin}%</div>
          </div>
        </div>

        {/* Descriptions */}
        <Tabs defaultValue="en">
          <TabsList>
            <TabsTrigger value="en">EN</TabsTrigger>
            <TabsTrigger value="fr">FR</TabsTrigger>
            <TabsTrigger value="rw">RW</TabsTrigger>
          </TabsList>
          <TabsContent value="en">
            <Textarea value={form.descEn} onChange={(e) => setForm({ ...form, descEn: e.target.value })} className="bg-pink-50/50" rows={3} />
          </TabsContent>
          <TabsContent value="fr">
            <Textarea value={form.descFr} onChange={(e) => setForm({ ...form, descFr: e.target.value })} className="bg-pink-50/50" rows={3} />
          </TabsContent>
          <TabsContent value="rw">
            <Textarea value={form.descRw} onChange={(e) => setForm({ ...form, descRw: e.target.value })} className="bg-pink-50/50" rows={3} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-pink-200">
            {t("admin.products.cancel", lang)}
          </Button>
          <Button onClick={save} disabled={saving} className="bg-pink-600 hover:bg-pink-700">
            {saving ? t("common.loading", lang) : t("admin.products.save", lang)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────
function OrdersView() {
  const { lang, currency } = useUI();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOrder, setViewOrder] = useState<any | null>(null);

  const load = useCallback(() => {
    const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
    fetch(`/api/admin/orders${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setOrders(d.orders);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(orderId: string, status: string) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`Status → ${status}`);
      load();
    }
  }

  function notifyWhatsApp(order: any) {
    const items = JSON.parse(order.itemsJson || "[]");
    const msg = `*${order.orderNumber} Update*\n\nHello ${order.customerName}, your order status is now: *${order.status.toUpperCase()}*\n\nTotal: RWF ${order.totalTTC.toLocaleString()}\n\nThank you for shopping with Samuel Cosmetic Shop!`;
    window.open(shopWhatsappUrl(msg), "_blank");
  }

  function generateEBM(order: any) {
    setViewOrder(order);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>
            {t("admin.orders", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">{orders.length} orders</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white border-pink-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">{t("common.loading", lang)}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-10 text-center">
          <div className="text-6xl mb-2">📦</div>
          <p className="text-muted-foreground">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => {
            const statusColors: Record<string, string> = {
              pending: "bg-amber-100 text-amber-800",
              confirmed: "bg-blue-100 text-blue-800",
              processing: "bg-purple-100 text-purple-800",
              shipped: "bg-indigo-100 text-indigo-800",
              delivered: "bg-green-100 text-green-800",
              cancelled: "bg-red-100 text-red-800",
            };
            return (
              <div key={o.id} className="bg-white rounded-xl border border-pink-100 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-pink-700">{o.orderNumber}</span>
                    <Badge className={`text-[10px] ${statusColors[o.status] || "bg-gray-100"}`}>
                      {o.status}
                    </Badge>
                    <Badge className="text-[10px] bg-pink-100 text-pink-700 capitalize">{o.paymentMethod}</Badge>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium">{o.customerName}</span>
                    <span className="text-muted-foreground"> · {o.customerPhone}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {o.district} · {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-bold text-pink-700">{formatPrice(o.totalTTC, currency)}</div>
                    <div className="text-[10px] text-muted-foreground">VAT: {formatPrice(o.vatAmount, currency)}</div>
                  </div>
                  <Select
                    value={o.status}
                    onValueChange={(v) => updateStatus(o.id, v)}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs bg-pink-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setViewOrder(o)} aria-label="View">
                      <Eye size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-[#25D366]" onClick={() => notifyWhatsApp(o)} aria-label="Notify">
                      <WhatsAppIcon size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => generateEBM(o)} aria-label="EBM Receipt">
                      <Receipt size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewOrder && (
        <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: any; onClose: () => void }) {
  const { currency, lang } = useUI();
  const items = typeof order.items === "string" ? JSON.parse(order.items || "[]") : (order.items || JSON.parse(order.itemsJson || "[]"));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt size={18} className="text-pink-600" />
            EBM Receipt — {order.orderNumber}
          </DialogTitle>
        </DialogHeader>

        {/* Receipt-style display */}
        <div className="bg-white border-2 border-dashed border-pink-200 rounded-xl p-4 font-mono text-sm">
          <div className="text-center mb-3 pb-3 border-b border-pink-200">
            <div className="text-2xl">✿</div>
            <div className="font-bold text-pink-900">SAMUEL COSMETIC SHOP</div>
            <div className="text-xs">Kigali, Rwanda</div>
            <div className="text-xs">TIN: 102345678 · SDC: SCS-EBM-001</div>
            <div className="text-xs">+250 790 215 965</div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span>Receipt #:</span><span className="font-bold">{order.receiptNumber || order.orderNumber}</span></div>
            <div className="flex justify-between"><span>MRC:</span><span>{order.mrcCode || "—"}</span></div>
            <div className="flex justify-between"><span>Date:</span><span>{new Date(order.createdAt).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Customer:</span><span>{order.customerName}</span></div>
            <div className="flex justify-between"><span>Phone:</span><span>{order.customerPhone}</span></div>
            <div className="flex justify-between"><span>District:</span><span>{order.district}</span></div>
          </div>

          <div className="mt-3 pt-3 border-t border-pink-200">
            <div className="grid grid-cols-12 text-[10px] font-bold pb-1 border-b border-pink-100">
              <div className="col-span-6">Désignation</div>
              <div className="col-span-1 text-center">Qté</div>
              <div className="col-span-2 text-right">PU HT</div>
              <div className="col-span-3 text-right">Montant TTC</div>
            </div>
            {items.map((item: any, i: number) => (
              <div key={i} className="grid grid-cols-12 text-[11px] py-0.5">
                <div className="col-span-6 truncate">{item.emoji} {item.nameEn || item.name}</div>
                <div className="col-span-1 text-center">{item.qty}</div>
                <div className="col-span-2 text-right">{formatPrice(item.priceHT || priceHT(item.priceTTC), currency)}</div>
                <div className="col-span-3 text-right">{formatPrice(item.lineTTC || item.priceTTC * item.qty, currency)}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-pink-200 space-y-1 text-xs">
            <div className="flex justify-between"><span>Total HT:</span><span>{formatPrice(order.subtotalHT, currency)}</span></div>
            <div className="flex justify-between"><span>TVA 18%:</span><span>{formatPrice(order.vatAmount, currency)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount:</span><span>-{formatPrice(order.discount, currency)}</span></div>}
            <div className="flex justify-between"><span>Delivery:</span><span>{formatPrice(order.deliveryFee, currency)}</span></div>
            <div className="flex justify-between font-bold text-base border-t border-pink-200 pt-1"><span>TTC Total:</span><span>{formatPrice(order.totalTTC, currency)}</span></div>
          </div>

          <div className="mt-3 pt-3 border-t border-pink-200 text-center text-[10px]">
            <div>Merci! Murakoze gukora ibicuruzwa byacu.</div>
            <div className="mt-1">RRA EBM Compliant · {order.mrcCode}</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => window.print()} className="border-pink-200">
            <Receipt size={14} className="mr-1" /> Print
          </Button>
          <Button onClick={onClose} className="bg-pink-600 hover:bg-pink-700">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// VAT Report
// ─────────────────────────────────────────────────────────────
function VatView() {
  const { lang, currency } = useUI();
  const [data, setData] = useState<any>(null);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetch(`/api/admin/vat-report?month=${month}`)
      .then((r) => r.json())
      .then((d) => d.ok && setData(d));
  }, [month]);

  function exportCSV() {
    if (!data) return;
    const headers = ["Date", "Receipt #", "Order #", "Customer", "Phone", "HT", "TVA 18%", "TTC", "MRC", "Items"];
    const rows = data.rows.map((r: any) => [
      new Date(r.date).toISOString(),
      r.receiptNumber,
      r.orderNumber,
      r.customer,
      r.customerPhone,
      r.subtotalHT,
      r.vatAmount,
      r.totalTTC,
      r.mrcCode,
      r.itemCount,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c: any) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VAT-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!data) return <div className="text-center py-20 text-muted-foreground">{t("common.loading", lang)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-900" style={{ fontFamily: "var(--font-playfair)" }}>
            {t("admin.vat.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">RRA-compliant · TIN: 102345678</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-40 bg-white border-pink-100"
          />
          <Button onClick={exportCSV} variant="outline" className="border-pink-200 text-pink-700">
            <ExternalLink size={14} className="mr-1" /> {t("admin.vat.export", lang)}
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">{t("admin.vat.salesHT", lang)}</div>
            <div className="text-xl font-bold text-pink-700">{formatPrice(data.totals.salesHT, currency)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">{t("admin.vat.collected", lang)}</div>
            <div className="text-xl font-bold text-purple-700">{formatPrice(data.totals.collected, currency)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">{t("admin.vat.salesTTC", lang)}</div>
            <div className="text-xl font-bold text-green-700">{formatPrice(data.totals.salesTTC, currency)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Orders</div>
            <div className="text-xl font-bold text-amber-700">{data.totals.orderCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-pink-50/50 text-pink-800">
              <tr>
                <th className="text-left p-3 font-semibold">Date</th>
                <th className="text-left p-3 font-semibold">Receipt #</th>
                <th className="text-left p-3 font-semibold hidden sm:table-cell">Customer</th>
                <th className="text-right p-3 font-semibold">HT</th>
                <th className="text-right p-3 font-semibold">TVA</th>
                <th className="text-right p-3 font-semibold">TTC</th>
                <th className="text-left p-3 font-semibold hidden md:table-cell">MRC</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">
                    No orders for this month.
                  </td>
                </tr>
              ) : (
                data.rows.map((r: any) => (
                  <tr key={r.orderNumber} className="border-t border-pink-50 hover:bg-pink-50/30">
                    <td className="p-3 text-xs">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="p-3 font-mono text-xs">{r.receiptNumber || r.orderNumber}</td>
                    <td className="p-3 hidden sm:table-cell">
                      <div className="font-medium text-xs">{r.customer}</div>
                      <div className="text-[10px] text-muted-foreground">{r.customerPhone}</div>
                    </td>
                    <td className="p-3 text-right text-xs">{formatPrice(r.subtotalHT, currency)}</td>
                    <td className="p-3 text-right text-xs text-purple-700">{formatPrice(r.vatAmount, currency)}</td>
                    <td className="p-3 text-right font-semibold text-pink-700 text-xs">{formatPrice(r.totalTTC, currency)}</td>
                    <td className="p-3 hidden md:table-cell font-mono text-[10px]">{r.mrcCode}</td>
                  </tr>
                ))
              )}
            </tbody>
            {data.rows.length > 0 && (
              <tfoot className="bg-pink-100/50 font-bold">
                <tr>
                  <td colSpan={3} className="p-3 text-right">TOTALS:</td>
                  <td className="p-3 text-right text-pink-700">{formatPrice(data.totals.salesHT, currency)}</td>
                  <td className="p-3 text-right text-purple-700">{formatPrice(data.totals.collected, currency)}</td>
                  <td className="p-3 text-right text-green-700">{formatPrice(data.totals.salesTTC, currency)}</td>
                  <td className="p-3 hidden md:table-cell"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* RRA filing guidance */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50">
        <CardContent className="p-4 text-sm">
          <h3 className="font-bold text-pink-800 mb-2 flex items-center gap-2">
            <FileSpreadsheet size={16} /> RRA Monthly Filing
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            Use these totals when filing your monthly VAT declaration with the Rwanda Revenue Authority:
          </p>
          <div className="grid sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-white rounded-lg p-2">
              <div className="text-muted-foreground">TVA Collectée</div>
              <div className="font-bold text-purple-700">{formatPrice(data.totals.collected, currency)}</div>
            </div>
            <div className="bg-white rounded-lg p-2">
              <div className="text-muted-foreground">TVA Déductible (input VAT paid to suppliers)</div>
              <div className="font-bold text-amber-700">Enter manually</div>
            </div>
            <div className="bg-white rounded-lg p-2">
              <div className="text-muted-foreground">TVA Nette à Payer</div>
              <div className="font-bold text-pink-700">{formatPrice(data.totals.collected, currency)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
