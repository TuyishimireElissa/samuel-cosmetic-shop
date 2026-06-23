// WhatsApp helper for Samuel Cosmetic Shop

export const SHOP_WHATSAPP = "250790215965";
export const SHOP_EMAIL = "samuelcosmeticshop@gmail.com";
export const SHOP_NAME = "Samuel Cosmetic Shop";
export const SHOP_LOCATION = "Kigali, Rwanda";
export const SHOP_TIN = "102345678";
export const SHOP_SDC_ID = "SCS-EBM-001";

export const WHATSAPP_LINK = `https://wa.me/${SHOP_WHATSAPP}`;

export function whatsappUrl(phone: string, message: string): string {
  const clean = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function shopWhatsappUrl(message: string): string {
  return `https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export interface OrderWhatsAppItem {
  name: string;
  qty: number;
  priceTTC: number;
}

export function buildOrderMessage(opts: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  district: string;
  address?: string;
  items: OrderWhatsAppItem[];
  subtotalTTC: number;
  deliveryFee: number;
  discount: number;
  totalTTC: number;
  paymentMethod: string;
  notes?: string;
}): string {
  const lines: string[] = [];
  lines.push(`*${SHOP_NAME} - ORDER ${opts.orderNumber}*`);
  lines.push("");
  lines.push(`👤 *Name:* ${opts.customerName}`);
  lines.push(`📱 *Phone:* ${opts.customerPhone}`);
  lines.push(`📍 *District:* ${opts.district}`);
  if (opts.address) lines.push(`🏠 *Address:* ${opts.address}`);
  lines.push("");
  lines.push("*Items:*");
  opts.items.forEach((item, i) => {
    lines.push(
      `${i + 1}. ${item.name} x${item.qty} — RWF ${Math.round(item.priceTTC * item.qty).toLocaleString("en-US")}`
    );
  });
  lines.push("");
  lines.push(`💰 *Subtotal (TTC):* RWF ${Math.round(opts.subtotalTTC).toLocaleString("en-US")}`);
  if (opts.discount > 0)
    lines.push(`🏷️ *Discount:* -RWF ${Math.round(opts.discount).toLocaleString("en-US")}`);
  lines.push(`🚚 *Delivery:* RWF ${Math.round(opts.deliveryFee).toLocaleString("en-US")}`);
  lines.push(`✅ *TOTAL:* RWF ${Math.round(opts.totalTTC).toLocaleString("en-US")}`);
  lines.push("");
  lines.push(`💳 *Payment:* ${opts.paymentMethod}`);
  if (opts.notes) lines.push(`📝 *Notes:* ${opts.notes}`);
  lines.push("");
  lines.push("_Murakoze! Tugiye gukorera byihuse._");
  return lines.join("\n");
}
