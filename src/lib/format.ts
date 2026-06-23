// Currency formatting (RWF default) and EBM VAT calculations (RRA compliant)

export type Currency = "RWF" | "USD" | "EUR" | "KES" | "UGX";

export const CURRENCIES: { code: Currency; symbol: string; flag: string }[] = [
  { code: "RWF", symbol: "RWF", flag: "🇷🇼" },
  { code: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", flag: "🇪🇺" },
  { code: "KES", symbol: "KSh", flag: "🇰🇪" },
  { code: "UGX", symbol: "USh", flag: "🇺🇬" },
];

// Hardcoded fallback rates (1 RWF = X)
export const RATES: Record<Currency, number> = {
  RWF: 1,
  USD: 0.00073,
  EUR: 0.00067,
  KES: 0.094,
  UGX: 2.71,
};

export function formatPrice(rwf: number, currency: Currency = "RWF"): string {
  const converted = rwf * RATES[currency];
  const rounded =
    currency === "RWF" ? Math.round(converted) : Math.round(converted * 100) / 100;
  const formatted = rounded.toLocaleString("en-US");
  const cur = CURRENCIES.find((c) => c.code === currency);
  return `${cur?.symbol} ${formatted}`;
}

// ── RRA EBM VAT calculations ────────────────────────────────────────────
// selling_price (TTC) = customer pays (includes 18% VAT)
// selling_price_ht = selling_price × 100/118
// vat_amount = selling_price × 18/118
// gross_profit_ht = selling_price_ht - cost_price
// profit_margin_pct = gross_profit_ht / selling_price_ht × 100

export const VAT_RATE = 18;

export function priceHT(sellingPriceTTC: number): number {
  return Math.round((sellingPriceTTC * 100) / 118 * 100) / 100;
}

export function vatAmount(sellingPriceTTC: number): number {
  return Math.round((sellingPriceTTC * 18) / 118 * 100) / 100;
}

export function grossProfitHT(sellingPriceTTC: number, costPrice: number): number {
  return Math.round((priceHT(sellingPriceTTC) - costPrice) * 100) / 100;
}

export function profitMarginPct(sellingPriceTTC: number, costPrice: number): number {
  const ht = priceHT(sellingPriceTTC);
  if (ht === 0) return 0;
  return Math.round(((ht - costPrice) / ht) * 1000) / 10;
}

export interface CartLine {
  id: string;
  qty: number;
  priceTTC: number; // selling price TTC
}

export interface CartTotals {
  subtotalHT: number;
  vatAmount: number;
  subtotalTTC: number;
  deliveryFee: number;
  discount: number;
  totalTTC: number;
  itemCount: number;
}

export function calcCartTotals(
  lines: CartLine[],
  deliveryFee = 0,
  discount = 0
): CartTotals {
  let subtotalTTC = 0;
  let itemCount = 0;
  for (const line of lines) {
    subtotalTTC += line.priceTTC * line.qty;
    itemCount += line.qty;
  }
  const subtotalHT = priceHT(subtotalTTC);
  const vatAmt = vatAmount(subtotalTTC);
  const totalTTC = Math.max(0, subtotalTTC + deliveryFee - discount);
  return {
    subtotalHT,
    vatAmount: vatAmt,
    subtotalTTC,
    deliveryFee,
    discount,
    totalTTC,
    itemCount,
  };
}

export function orderNumber(): string {
  const d = new Date();
  const ymd =
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `SC-${ymd}-${rand}`;
}

// MRC code: deterministic short hash for EBM receipt
export function generateMRC(orderNumber: string, totalTTC: number): string {
  const input = `${orderNumber}-${totalTTC}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  const code = Math.abs(hash).toString(36).toUpperCase().padStart(8, "0").slice(0, 8);
  return `MRC-${code}`;
}
