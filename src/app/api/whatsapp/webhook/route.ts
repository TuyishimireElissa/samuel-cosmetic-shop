import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "samuel-cosmetic-verify-2026";
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || "";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    if (APP_SECRET) {
      const signature = req.headers.get("x-hub-signature-256") || "";
      const expected = crypto.createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");
      if (signature !== `sha256=${expected}`) {
        return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 403 });
      }
    }

    const body = JSON.parse(rawBody);
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ ok: true, message: "ignored" });
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (value.messages && value.messages.length > 0) {
          const msg = value.messages[0];
          const from = msg.from;
          const text = msg.text?.body || "";
          console.log(`WhatsApp message from ${from}: ${text.substring(0, 100)}`);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
