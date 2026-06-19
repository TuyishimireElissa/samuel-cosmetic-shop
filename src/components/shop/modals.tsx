"use client";
import { useState } from "react";
import { useUI } from "@/lib/store";
import { t } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { shopWhatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Package, CheckCircle2, Clock, Award } from "lucide-react";

export function OrderTrackingModal({ onClose }: { onClose: () => void }) {
  const { lang, currency } = useUI();
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  async function track() { if (!phone) return; setLoading(true); setSearched(true); try { const res = await fetch(`/api/orders/track?phone=${encodeURIComponent(phone)}`); const data = await res.json(); if (data.ok) setOrders(data.orders); } finally { setLoading(false); } }
  const statusFlow = ["pending", "confirmed", "processing", "shipped", "delivered"];
  function sc(s: string) { return s === "delivered" ? "bg-green-100 text-green-700" : s === "shipped" ? "bg-blue-100 text-blue-700" : s === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"; }
  return (
    <Dialog open onOpenChange={onClose}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><Package size={20} className="text-pink-600" /> Track Your Orders</DialogTitle></DialogHeader>
      <div className="bg-pink-50/50 p-3 rounded-xl space-y-2"><Label>Enter your WhatsApp number</Label><div className="flex gap-2"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 7XX XXX XXX" className="bg-white" /><Button onClick={track} disabled={loading} className="bg-pink-600 hover:bg-pink-700"><Search size={14} className="mr-1" /> Track</Button></div></div>
      {searched && !loading && orders.length === 0 && <div className="text-center py-8 text-muted-foreground"><div className="text-5xl mb-2">🔍</div>No orders found</div>}
      {orders.length > 0 && <div className="space-y-3">{orders.map((o) => { const items = JSON.parse(o.itemsJson || "[]"); const itemCount = items.reduce((s: number, i: any) => s + i.qty, 0); const currentStep = statusFlow.indexOf(o.status); return (
        <div key={o.id} className="border border-pink-100 rounded-xl p-3"><div className="flex items-center justify-between mb-2"><div className="font-mono font-bold text-pink-700">{o.orderNumber}</div><Badge className={`text-[10px] ${sc(o.status)}`}>{o.status}</Badge></div>
          <div className="text-xs text-muted-foreground mb-2">{new Date(o.createdAt).toLocaleString()} · {itemCount} items · {formatPrice(o.totalTTC, currency)}</div>
          {o.status !== "cancelled" && <div className="flex items-center gap-1 my-3">{statusFlow.map((s, i) => { const done = i <= currentStep; return <div key={s} className="flex items-center gap-1 flex-1"><div className={`w-6 h-6 rounded-full grid place-items-center text-[10px] ${done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}>{done ? "✓" : i + 1}</div>{i < statusFlow.length - 1 && <div className={`flex-1 h-px ${i < currentStep ? "bg-green-500" : "bg-gray-200"}`} />}</div>; })}</div>}
          <a href={shopWhatsappUrl(`Muraho! Oridere ${o.orderNumber}. Status: ${o.status}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#25D366] hover:underline"><WhatsAppIcon size={12} /> Ask about this order</a>
        </div>); })}</div>}
    </DialogContent></Dialog>
  );
}

export function CustomerPortalModal({ onClose }: { onClose: () => void }) {
  const { currency } = useUI();
  const [phone, setPhone] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  async function lookup() { if (!phone) return; setLoading(true); try { const res = await fetch(`/api/customers/lookup?phone=${encodeURIComponent(phone)}`); const d = await res.json(); if (d.ok) setData(d); else setData({ error: d.error }); } finally { setLoading(false); } }
  const tierColors: Record<string, string> = { bronze: "from-amber-400 to-amber-600", silver: "from-gray-300 to-gray-500", gold: "from-yellow-400 to-yellow-600", platinum: "from-purple-400 to-purple-600" };
  const tierNext: Record<string, number> = { bronze: 50000, silver: 200000, gold: 500000 };
  return (
    <Dialog open onOpenChange={onClose}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><Award size={20} className="text-pink-600" /> My Account</DialogTitle></DialogHeader>
      {!data && <div className="bg-pink-50/50 p-3 rounded-xl space-y-2"><Label>Enter your WhatsApp number</Label><div className="flex gap-2"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 7XX XXX XXX" className="bg-white" /><Button onClick={lookup} disabled={loading} className="bg-pink-600 hover:bg-pink-700">View</Button></div></div>}
      {data?.error && <div className="text-center py-8 text-muted-foreground"><div className="text-5xl mb-2">👤</div>No account found. Place an order first!</div>}
      {data?.customer && <div className="space-y-4"><div className={`bg-gradient-to-br ${tierColors[data.customer.tier]} text-white p-4 rounded-2xl`}><div className="flex items-center justify-between"><div><div className="text-xs opacity-90">Welcome back,</div><div className="text-xl font-bold">{data.customer.name}</div></div><div className="text-right"><div className="text-3xl">{data.customer.tier === "bronze" ? "🥉" : data.customer.tier === "silver" ? "🥈" : data.customer.tier === "gold" ? "🥇" : "💎"}</div><div className="text-xs capitalize font-bold">{data.customer.tier} Member</div></div></div><div className="mt-3 grid grid-cols-3 gap-2 text-sm"><div><div className="text-xs opacity-80">Points</div><div className="font-bold">{data.customer.loyaltyPoints}</div></div><div><div className="text-xs opacity-80">Orders</div><div className="font-bold">{data.customer.totalOrders}</div></div><div><div className="text-xs opacity-80">Spent</div><div className="font-bold">{formatPrice(data.customer.totalSpent, currency)}</div></div></div>{tierNext[data.customer.tier] && <div className="mt-3"><div className="text-xs opacity-90">Progress to next tier</div><div className="h-2 bg-white/30 rounded-full mt-1 overflow-hidden"><div className="bg-white h-full" style={{ width: `${Math.min(100, (data.customer.totalSpent / tierNext[data.customer.tier]) * 100)}%` }} /></div></div>}</div>
        <div><h4 className="font-semibold mb-2">Order History</h4><div className="space-y-1 max-h-48 overflow-y-auto">{data.orders.map((o: any) => <div key={o.id} className="flex items-center justify-between text-xs p-2 rounded border border-pink-50"><div><span className="font-mono font-semibold">{o.orderNumber}</span><span className="text-muted-foreground ml-2">{new Date(o.createdAt).toLocaleDateString()}</span></div><div className="flex items-center gap-2"><Badge variant="outline" className="text-[9px] capitalize">{o.status}</Badge><span className="font-semibold text-pink-700">{formatPrice(o.totalTTC, currency)}</span></div></div>)}{data.orders.length === 0 && <div className="text-muted-foreground text-center py-4">No orders yet</div>}</div></div></div>}
    </DialogContent></Dialog>
  );
}

export function BookingModal({ onClose }: { onClose: () => void }) {
  const { lang } = useUI();
  const [step, setStep] = useState(1);
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const services = [{ id: "consultation", label: "Beauty Consultation", emoji: "💄", duration: "30 min" }, { id: "makeup", label: "Makeup Session", emoji: "✨", duration: "60 min" }, { id: "skincare", label: "Skincare Analysis", emoji: "🧴", duration: "45 min" }];
  async function loadSlots(d: string) { setDate(d); setTimeSlot(""); const res = await fetch(`/api/bookings?action=slots&date=${d}`); const data = await res.json(); if (data.ok) setSlots(data.slots); }
  async function submit() { setLoading(true); try { const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: name, customerPhone: phone, customerEmail: email, service, date, timeSlot, notes }) }); const data = await res.json(); if (data.ok) { setSuccess(data.booking); setStep(5); } else alert(data.error); } finally { setLoading(false); } }
  return (
    <Dialog open onOpenChange={onClose}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><Clock size={20} className="text-pink-600" /> Book an Appointment</DialogTitle></DialogHeader>
      {success ? <div className="text-center py-6 space-y-3"><CheckCircle2 size={64} className="mx-auto text-green-500" /><div><h3 className="font-bold text-lg text-pink-900">Booking Confirmed!</h3><p className="text-sm text-muted-foreground">We'll confirm via WhatsApp</p></div><div className="bg-pink-50 rounded p-3 text-sm"><div><strong>Service:</strong> {service}</div><div><strong>Date:</strong> {new Date(date).toLocaleDateString()}</div><div><strong>Time:</strong> {timeSlot}</div></div><Button onClick={onClose} className="bg-pink-600 hover:bg-pink-700">Done</Button></div> : <>
        <div className="flex items-center gap-1 text-xs mb-3">{[1,2,3,4].map(n => <div key={n} className="flex items-center gap-1"><div className={`w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold ${step >= n ? "bg-pink-600 text-white" : "bg-pink-100 text-pink-400"}`}>{n}</div>{n < 4 && <div className={`w-4 h-px ${step > n ? "bg-pink-600" : "bg-pink-100"}`} />}</div>)}</div>
        {step === 1 && <div className="space-y-2"><Label>Choose a service</Label>{services.map(s => <button key={s.id} onClick={() => { setService(`${s.label} (${s.duration})`); setStep(2); }} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 ${service.includes(s.label) ? "border-pink-500 bg-pink-50" : "border-pink-100 hover:bg-pink-50"}`}><span className="text-3xl">{s.emoji}</span><div className="text-left flex-1"><div className="font-medium">{s.label}</div><div className="text-xs text-muted-foreground">{s.duration}</div></div></button>)}</div>}
        {step === 2 && <div className="space-y-2"><Label>Pick a date</Label><Input type="date" value={date} onChange={(e) => loadSlots(e.target.value)} min={new Date().toISOString().slice(0, 10)} className="bg-pink-50/50" />{date && slots.length > 0 && <div><Label className="mt-2">Available slots</Label><div className="grid grid-cols-4 gap-2 mt-1">{slots.map(s => <button key={s} onClick={() => { setTimeSlot(s); setStep(3); }} className={`py-2 rounded-lg text-sm border-2 ${timeSlot === s ? "border-pink-500 bg-pink-50" : "border-pink-100 hover:bg-pink-50"}`}>{s}</button>)}</div></div>}<Button variant="ghost" onClick={() => setStep(1)}>← Back</Button></div>}
        {step === 3 && <div className="space-y-2"><div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="bg-pink-50/50" /></div><div><Label>Phone *</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 7XX XXX XXX" className="bg-pink-50/50" /></div><div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-pink-50/50" /></div><div><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-pink-50/50" /></div><div className="flex gap-2"><Button variant="ghost" onClick={() => setStep(2)}>← Back</Button><Button onClick={() => name && phone && setStep(4)} disabled={!name || !phone} className="bg-pink-600 hover:bg-pink-700 flex-1">Next →</Button></div></div>}
        {step === 4 && <div className="space-y-3"><div className="bg-pink-50/50 rounded-xl p-3 text-sm"><div><strong>Service:</strong> {service}</div><div><strong>Date:</strong> {new Date(date).toLocaleDateString()} at {timeSlot}</div><div><strong>Name:</strong> {name}</div><div><strong>Phone:</strong> {phone}</div></div><div className="flex gap-2"><Button variant="ghost" onClick={() => setStep(3)}>← Back</Button><Button onClick={submit} disabled={loading} className="bg-pink-600 hover:bg-pink-700 flex-1">{loading ? "Booking..." : "Confirm Booking"}</Button></div></div>}
      </>}
    </DialogContent></Dialog>
  );
}

export function WholesaleModal({ onClose }: { onClose: () => void }) {
  const { currency } = useUI();
  const [mode, setMode] = useState<"choice" | "register" | "login" | "dashboard">("choice");
  const [form, setForm] = useState({ businessName: "", ownerName: "", tin: "", phone: "", email: "", district: "", businessType: "retailer", expectedVolume: 100000, password: "" });
  const [loginTin, setLoginTin] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  async function register() { setLoading(true); setError(""); try { const res = await fetch("/api/wholesale/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const data = await res.json(); if (data.ok) { setMode("dashboard"); setUser(data.user); } else setError(data.error); } finally { setLoading(false); } }
  async function login() { setLoading(true); setError(""); try { const res = await fetch("/api/wholesale/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tin: loginTin, password: loginPass }) }); const data = await res.json(); if (data.ok) { setMode("dashboard"); setUser(data.user); } else setError(data.error); } finally { setLoading(false); } }
  const tierDiscounts: Record<string, number> = { bronze: 5, silver: 8, gold: 12, platinum: 18 };
  return (
    <Dialog open onOpenChange={onClose}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><Package size={20} className="text-pink-600" /> Wholesale Account</DialogTitle></DialogHeader>
      {mode === "choice" && <div className="space-y-3"><div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-xl"><h3 className="font-bold text-pink-900 mb-2">Why become a wholesale buyer?</h3><ul className="text-sm space-y-1"><li>✓ 5-18% off retail prices</li><li>✓ Pro-forma invoices</li><li>✓ Priority delivery</li></ul></div><div className="grid sm:grid-cols-2 gap-2"><Button onClick={() => setMode("register")} className="bg-pink-600 hover:bg-pink-700 h-12">Apply</Button><Button onClick={() => setMode("login")} variant="outline" className="border-pink-200 text-pink-700 h-12">Login</Button></div></div>}
      {mode === "register" && <div className="space-y-3"><div className="grid grid-cols-2 gap-2"><div><Label>Business Name *</Label><Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="bg-pink-50/50" /></div><div><Label>Owner Name *</Label><Input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} className="bg-pink-50/50" /></div><div><Label>TIN *</Label><Input value={form.tin} onChange={(e) => setForm({ ...form, tin: e.target.value })} className="bg-pink-50/50 font-mono" /></div><div><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-pink-50/50" /></div></div><div><Label>Password *</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="bg-pink-50/50" /></div>{error && <div className="text-sm text-red-600">{error}</div>}<div className="flex gap-2"><Button variant="ghost" onClick={() => setMode("choice")}>← Back</Button><Button onClick={register} disabled={loading || !form.businessName || !form.tin || !form.phone || !form.password} className="bg-pink-600 hover:bg-pink-700 flex-1">{loading ? "Submitting..." : "Submit"}</Button></div></div>}
      {mode === "login" && <div className="space-y-3"><div><Label>TIN</Label><Input value={loginTin} onChange={(e) => setLoginTin(e.target.value)} className="bg-pink-50/50 font-mono" /></div><div><Label>Password</Label><Input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="bg-pink-50/50" /></div>{error && <div className="text-sm text-red-600">{error}</div>}<div className="flex gap-2"><Button variant="ghost" onClick={() => setMode("choice")}>← Back</Button><Button onClick={login} disabled={loading || !loginTin || !loginPass} className="bg-pink-600 hover:bg-pink-700 flex-1">{loading ? "Logging in..." : "Login"}</Button></div></div>}
      {mode === "dashboard" && user && <div className="space-y-4"><div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-4 rounded-2xl"><div className="text-xs opacity-80">Welcome</div><div className="text-xl font-bold">{user.businessName}</div><div className="text-sm opacity-90">{user.ownerName} · TIN: {user.tin}</div></div>{user.status === "approved" ? <div className="bg-pink-50/50 rounded-xl p-3 text-sm"><p>Approved! Contact us for bulk orders at <strong>{tierDiscounts[user.tier]}% off</strong>.</p><a href={shopWhatsappUrl(`Murakoze! Ndi wholesale buyer: ${user.businessName} (TIN: ${user.tin}).`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 px-4 h-10 rounded-full bg-[#25D366] text-white text-sm font-semibold"><WhatsAppIcon size={16} /> Place Bulk Order</a></div> : <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-800">Status: <strong>{user.status}</strong></div>}</div>}
    </DialogContent></Dialog>
  );
}
