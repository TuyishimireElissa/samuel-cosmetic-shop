import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { phone, name } = await req.json();
    if (!phone) return NextResponse.json({ ok: false, error: "missing_phone" }, { status: 400 });

    // Validate Rwandan phone format
    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!/^(\+250|0)?7\d{8}$/.test(cleanPhone)) {
      return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 400 });
    }

    // Normalize to +250 format
    const normalized = cleanPhone.startsWith("+") ? cleanPhone : (cleanPhone.startsWith("0") ? "+250" + cleanPhone.slice(1) : "+250" + cleanPhone);

    const subscriber = await db.subscriber.upsert({
      where: { phone: normalized },
      update: { name: name || undefined, isActive: true, unsubscribedAt: null },
      create: { phone: normalized, name: name || "", source: "newsletter", isActive: true },
    });

    return NextResponse.json({ ok: true, subscriber });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "server_error" }, { status: 500 });
  }
}
