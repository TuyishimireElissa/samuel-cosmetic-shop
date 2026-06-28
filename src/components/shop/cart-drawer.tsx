"use client";

import { useState, useEffect } from "react";
import { useUI, useCart } from "@/lib/store";
import { pickLang, t } from "@/lib/i18n";
import { formatPrice, calcCartTotals, priceHT, vatAmount } from "@/lib/format";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Truck,
  CreditCard,
} from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

type Step = "review" | "delivery" | "payment" | "confirm" | "success";

interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  etaHours: number;
}

interface PlacedOrder {
  orderNumber: string;
  totalTTC: number;
  subtotalHT: number;
  vatAmount: number;
  deliveryFee: number;
  discount: number;
  mrcCode: string | null;
  receiptNumber: string | null;
  paymentMethod: string;
  items: any[];
  whatsappMessage?: string;
}

export function CartDrawer() {
  const { cartOpen, setCartOpen, lang, currency, enterAdmin } = useUI();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const [step, setStep] = useState<Step>("review");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [zoneId, setZoneId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("whatsapp");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  // Load delivery zones
  useEffect(() => {
    fetch("/api/delivery-zones")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setZones(d.zones);
          if (d.zones[0]) setZoneId(d.zones[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const cartLines = items.map((i) => ({
    id: i.id,
    qty: i.qty,
    priceTTC: i.priceTTC,
  }));
  const zone = zones.find((z) => z.id === zoneId);
  const totals = calcCartTotals(cartLines, zone?.fee || 0, couponDiscount);

  function handleApplyCoupon() {
    if (!couponCode) return;
    fetch("/api/coupon/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal: totals.subtotalTTC }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setCouponDiscount(d.discount);
          toast.success(
            `${t("cart.coupon.apply", lang)}: -${formatPrice(d.discount, currency)}`
          );
        } else {
          toast.error(d.error || "Invalid coupon");
          setCouponDiscount(0);
        }
      });
  }

  async function placeOrder() {
    if (!name || !phone || !zone) {
      toast.error("Please fill name, phone, and district");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          district: zone.district,
          address,
          notes,
          items: items.map((i) => ({ id: i.id, qty: i.qty, priceTTC: i.priceTTC })),
          deliveryFee: zone.fee,
          discount: couponDiscount,
          couponCode,
          paymentMethod,
          isWholesale: !!(wholesaleUser && wholesaleUser.status === "approved"),
          wholesaleUserId: wholesaleUser?.id || null,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed");
      setPlaced(data.order);
      setStep("success");
      clear();
      setCouponDiscount(0);
      setCouponCode("");
    } catch (e: any) {
      toast.error(e.message || "Order failed");
    } finally {
      setPlacing(false);
    }
  }

  function closeAndReset() {
    setCartOpen(false);
    setTimeout(() => {
      setStep("review");
      setPlaced(null);
    }, 300);
  }

  const steps: { id: Step; label: string }[] = [
    { id: "review", label: t("checkout.step.review", lang) },
    { id: "delivery", label: t("checkout.step.delivery", lang) },
    { id: "payment", label: t("checkout.step.payment", lang) },
    { id: "confirm", label: t("checkout.step.confirm", lang) },
  ];

  return (
    <Sheet open={cartOpen} onOpenChange={(v) => (v ? setCartOpen(true) : closeAndReset())}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col bg-white"
      >
        <SheetHeader className="p-4 border-b border-pink-100 space-y-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-pink-800">
              <ShoppingBag size={20} />
              {step === "success"
                ? t("order.success.title", lang)
                : step === "review"
                ? t("cart.title", lang)
                : t("checkout.title", lang)}
            </SheetTitle>
            <button
              onClick={closeAndReset}
              className="p-1.5 rounded-full hover:bg-pink-50"
              aria-label={t("common.close", lang)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Step indicator */}
          {step !== "success" && (
            <div className="flex items-center gap-1 mt-3 text-xs">
              {steps.map((s, i) => {
                const active = step === s.id;
                const done = steps.findIndex((x) => x.id === step) > i;
                return (
                  <div key={s.id} className="flex items-center gap-1">
                    <div
                      className={`w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold ${
                        active
                          ? "bg-pink-600 text-white"
                          : done
                          ? "bg-green-500 text-white"
                          : "bg-pink-100 text-pink-500"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <span
                      className={`hidden sm:inline ${active ? "font-semibold text-pink-700" : "text-muted-foreground"}`}
                    >
                      {s.label}
                    </span>
                    {i < steps.length - 1 && (
                      <div className="w-4 h-px bg-pink-200 mx-0.5" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SheetHeader>

        {/* SUCCESS */}
        {step === "success" && placed ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-center">
            <CheckCircle2 size={72} className="mx-auto text-green-500" />
            <div>
              <h3 className="font-bold text-xl text-pink-800 mb-1">
                {t("order.success.title", lang)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("order.success.number", lang)}:{" "}
                <span className="font-mono font-bold text-pink-700">
                  {placed.orderNumber}
                </span>
              </p>
            </div>

            <div className="text-left bg-pink-50 rounded-xl p-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal (HT)</span>
                <span>{formatPrice(placed.subtotalHT, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT 18%</span>
                <span>{formatPrice(placed.vatAmount, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{formatPrice(placed.deliveryFee, currency)}</span>
              </div>
              {placed.discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>-{formatPrice(placed.discount, currency)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-pink-800 text-base">
                <span>{t("cart.total", lang)}</span>
                <span>{formatPrice(placed.totalTTC, currency)}</span>
              </div>
              {placed.mrcCode && (
                <div className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-pink-200">
                  MRC: <span className="font-mono">{placed.mrcCode}</span> · EBM Receipt: {placed.receiptNumber}
                </div>
              )}
            </div>

            {placed.paymentMethod === "whatsapp" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t("order.success.whatsapp", lang)}
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold transition-colors"
                >
                  <WhatsAppIcon size={20} />
                  {t("order.success.sendWhatsapp", lang)}
                </a>
              </div>
            )}

            <Button
              variant="outline"
              onClick={closeAndReset}
              className="w-full h-11 border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              {t("order.success.continue", lang)}
            </Button>
          </div>
        ) : items.length === 0 ? (
          /* EMPTY */
          <div className="flex-1 grid place-items-center p-8 text-center">
            <div className="space-y-3">
              <div className="text-7xl">🛒</div>
              <h3 className="font-semibold text-lg text-pink-800">
                {t("cart.empty", lang)}
              </h3>
              <Button
                onClick={closeAndReset}
                className="bg-pink-600 hover:bg-pink-700"
              >
                {t("cart.browse", lang)}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* REVIEW STEP */}
            {step === "review" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-xl border border-pink-100 hover:border-pink-200 transition-colors bg-white"
                  >
                    <div className="w-16 h-16 rounded-lg shrink-0 overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center">
                          <ShoppingCart size={24} className="text-pink-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm leading-tight line-clamp-2">
                        {item.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatPrice(item.priceTTC, currency)} · TTC
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-full border-pink-200"
                            onClick={() => setQty(item.id, item.qty - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {item.qty}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-full border-pink-200"
                            onClick={() => setQty(item.id, item.qty + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-pink-700">
                            {formatPrice(item.priceTTC * item.qty, currency)}
                          </div>
                          <button
                            onClick={() => remove(item.id)}
                            className="text-[10px] text-muted-foreground hover:text-red-500 inline-flex items-center gap-1"
                          >
                            <Trash2 size={10} /> {t("common.cancel", lang).toLowerCase()}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Coupon */}
                <div className="bg-pink-50/50 rounded-xl p-3 space-y-2">
                  <Label className="text-xs flex items-center gap-1 text-pink-700">
                    <Tag size={12} /> Coupon
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="WELCOME5"
                      className="h-9 bg-white border-pink-200 uppercase"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      size="sm"
                      className="h-9 bg-pink-600 hover:bg-pink-700"
                    >
                      {t("cart.coupon.apply", lang)}
                    </Button>
                  </div>
                  {couponDiscount > 0 && (
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Saved {formatPrice(couponDiscount, currency)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* DELIVERY STEP */}
            {step === "delivery" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="co-name" className="text-sm font-medium">
                    {t("checkout.name", lang)} *
                  </Label>
                  <Input
                    id="co-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 bg-pink-50/50 border-pink-100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-phone" className="text-sm font-medium">
                    {t("checkout.phone", lang)} *
                  </Label>
                  <Input
                    id="co-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 7XX XXX XXX"
                    className="h-11 bg-pink-50/50 border-pink-100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-email" className="text-sm font-medium">
                    {t("checkout.email", lang)}
                  </Label>
                  <Input
                    id="co-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-pink-50/50 border-pink-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("checkout.district", lang)} *
                  </Label>
                  <Select value={zoneId} onValueChange={setZoneId}>
                    <SelectTrigger className="h-11 bg-pink-50/50 border-pink-100">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((z) => (
                        <SelectItem key={z.id} value={z.id}>
                          {z.name} — {formatPrice(z.fee, currency)} ({z.etaHours}h)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-addr" className="text-sm font-medium">
                    {t("checkout.address", lang)}
                  </Label>
                  <Input
                    id="co-addr"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-11 bg-pink-50/50 border-pink-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-notes" className="text-sm font-medium">
                    {t("checkout.notes", lang)}
                  </Label>
                  <Input
                    id="co-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-11 bg-pink-50/50 border-pink-100"
                  />
                </div>
                {zone && (
                  <div className="flex items-center gap-2 text-xs bg-green-50 text-green-700 p-2 rounded-lg">
                    <Truck size={14} />
                    {t("checkout.delivery.estimate", lang)}: {zone.etaHours}h
                  </div>
                )}
              </div>
            )}

            {/* PAYMENT STEP */}
            {step === "payment" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === "whatsapp"
                        ? "border-[#25D366] bg-green-50/50"
                        : "border-pink-100 hover:bg-pink-50/50"
                    }`}
                  >
                    <RadioGroupItem value="whatsapp" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        <WhatsAppIcon size={16} className="text-[#25D366]" />
                        {t("checkout.payment.whatsapp", lang)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Order sent to shop via WhatsApp. Pay on delivery or via MoMo manually.
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === "momo"
                        ? "border-yellow-400 bg-yellow-50/50"
                        : "border-pink-100 hover:bg-pink-50/50"
                    }`}
                  >
                    <RadioGroupItem value="momo" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="text-xl">📱</span>
                        {t("checkout.payment.momo", lang)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pay via MTN Mobile Money (simulated demo)
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === "airtel"
                        ? "border-red-300 bg-red-50/50"
                        : "border-pink-100 hover:bg-pink-50/50"
                    }`}
                  >
                    <RadioGroupItem value="airtel" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="text-xl">📲</span>
                        {t("checkout.payment.airtel", lang)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pay via Airtel Money (simulated demo)
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === "cash"
                        ? "border-pink-400 bg-pink-50/50"
                        : "border-pink-100 hover:bg-pink-50/50"
                    }`}
                  >
                    <RadioGroupItem value="cash" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        <CreditCard size={16} />
                        {t("checkout.payment.cash", lang)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pay with cash when your order arrives
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            )}

            {/* CONFIRM STEP */}
            {step === "confirm" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="bg-pink-50/50 rounded-xl p-3 space-y-2 text-sm">
                  <h4 className="font-semibold text-pink-800 mb-1">Customer</h4>
                  <div>{name} · {phone}</div>
                  <div>{zone?.name} · {address || "—"}</div>
                  {email && <div className="text-muted-foreground">{email}</div>}
                  {notes && <div className="text-muted-foreground italic">"{notes}"</div>}
                </div>
                <div className="bg-white rounded-xl border border-pink-100 p-3 space-y-2 text-sm">
                  <h4 className="font-semibold text-pink-800 mb-1">Items ({items.length})</h4>
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs">
                      <span>
                         {item.name} × {item.qty}
                      </span>
                      <span>{formatPrice(item.priceTTC * item.qty, currency)}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-purple-50/50 rounded-xl p-3 text-sm">
                  <h4 className="font-semibold text-purple-800 mb-1">Payment</h4>
                  <div className="capitalize">{paymentMethod}</div>
                </div>
              </div>
            )}

            {/* FOOTER (totals + nav) */}
            <div className="border-t border-pink-100 p-4 space-y-3 bg-white">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal (HT)</span>
                  <span>{formatPrice(totals.subtotalHT, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("cart.vat", lang)}</span>
                  <span>{formatPrice(totals.vatAmount, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("cart.delivery", lang)}</span>
                  <span>{formatPrice(totals.deliveryFee, currency)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount</span>
                    <span>-{formatPrice(totals.discount, currency)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base text-pink-800 pt-1">
                  <span>{t("cart.total", lang)}</span>
                  <span>{formatPrice(totals.totalTTC, currency)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {step !== "review" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const idx = steps.findIndex((s) => s.id === step);
                      if (idx > 0) setStep(steps[idx - 1].id);
                    }}
                    className="flex-1 h-11 border-pink-200 text-pink-700"
                  >
                    <ArrowLeft size={16} className="mr-1" />
                    {t("checkout.back", lang)}
                  </Button>
                )}
                {step === "review" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={closeAndReset}
                      className="flex-1 h-11 border-pink-200 text-pink-700"
                    >
                      <ArrowLeft size={16} className="mr-1" />
                      {t("cart.continue", lang)}
                    </Button>
                    <Button
                      onClick={() => setStep("delivery")}
                      className="flex-1 h-11 bg-pink-600 hover:bg-pink-700"
                    >
                      {t("cart.checkout", lang)}
                      <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </>
                )}
                {step === "delivery" && (
                  <Button
                    onClick={() => name && phone && zoneId ? setStep("payment") : toast.error("Fill required fields")}
                    className="flex-1 h-11 bg-pink-600 hover:bg-pink-700"
                  >
                    {t("checkout.next", lang)}
                  </Button>
                )}
                {step === "payment" && (
                  <Button
                    onClick={() => setStep("confirm")}
                    className="flex-1 h-11 bg-pink-600 hover:bg-pink-700"
                  >
                    {t("checkout.next", lang)}
                  </Button>
                )}
                {step === "confirm" && (
                  <Button
                    onClick={placeOrder}
                    disabled={placing}
                    className="flex-1 h-11 bg-pink-600 hover:bg-pink-700"
                  >
                    {placing ? t("common.loading", lang) : t("checkout.placeOrder", lang)}
                  </Button>
                )}
              </div>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-10 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-semibold"
              >
                <WhatsAppIcon size={16} />
                {t("cart.orderWhatsapp", lang)}
              </a>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
