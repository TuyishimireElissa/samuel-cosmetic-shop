/**
 * WhatsApp Business Cloud API Helper
 * Sends messages via Meta's WhatsApp Business API.
 * Falls back gracefully when credentials are not configured.
 */

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v18.0";

export const HAS_WHATSAPP_API = !!(WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID);

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "").replace(/^0/, "250");
}

export async function sendWhatsAppText(to: string, message: string): Promise<{ ok: boolean; data?: any; error?: string }> {
  if (!HAS_WHATSAPP_API) {
    console.log("[WhatsApp API not configured] Would send to", to, ":", message.substring(0, 80) + "...");
    return { ok: false, error: "whatsapp_not_configured" };
  }
  try {
    const phone = normalizePhone(to);
    const res = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("WhatsApp API error:", data);
      return { ok: false, error: JSON.stringify(data) };
    }
    return { ok: true, data };
  } catch (e: any) {
    console.error("WhatsApp send error:", e?.message);
    return { ok: false, error: e?.message };
  }
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string = "en",
  components: any[] = []
): Promise<{ ok: boolean; data?: any; error?: string }> {
  if (!HAS_WHATSAPP_API) {
    console.log(`[WhatsApp API not configured] Would send template "${templateName}" to`, to);
    return { ok: false, error: "whatsapp_not_configured" };
  }
  try {
    const phone = normalizePhone(to);
    const res = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("WhatsApp template API error:", data);
      return { ok: false, error: JSON.stringify(data) };
    }
    return { ok: true, data };
  } catch (e: any) {
    console.error("WhatsApp template send error:", e?.message);
    return { ok: false, error: e?.message };
  }
}

export async function sendOrderConfirmation(opts: {
  to: string;
  customerName: string;
  orderNumber: string;
  totalAmount: number;
  deliveryLocation: string;
  languageCode?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const components = [
    {
      type: "body",
      parameters: [
        { type: "text", text: opts.customerName },
        { type: "text", text: opts.orderNumber },
        { type: "text", text: String(Math.round(opts.totalAmount)) },
        { type: "text", text: opts.deliveryLocation },
      ],
    },
  ];
  return sendWhatsAppTemplate(opts.to, "order_confirmation", opts.languageCode || "en", components);
}

export async function sendOrderShipped(opts: {
  to: string;
  orderNumber: string;
  deliveryLocation: string;
  etaHours: number;
  languageCode?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const components = [
    {
      type: "body",
      parameters: [
        { type: "text", text: opts.orderNumber },
        { type: "text", text: opts.deliveryLocation },
        { type: "text", text: String(opts.etaHours) },
      ],
    },
  ];
  return sendWhatsAppTemplate(opts.to, "order_shipped", opts.languageCode || "en", components);
}

export async function sendPaymentReceived(opts: {
  to: string;
  orderNumber: string;
  amount: number;
  languageCode?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const components = [
    {
      type: "body",
      parameters: [
        { type: "text", text: opts.orderNumber },
        { type: "text", text: String(Math.round(opts.amount)) },
      ],
    },
  ];
  return sendWhatsAppTemplate(opts.to, "payment_received", opts.languageCode || "en", components);
}
