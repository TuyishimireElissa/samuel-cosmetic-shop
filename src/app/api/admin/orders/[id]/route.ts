import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
import { sendOrderConfirmation, sendOrderShipped, sendPaymentReceived, HAS_WHATSAPP_API } from "@/lib/whatsapp-api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const order = await db.order.findUnique({ where: { id } });
    if (!order)
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    return NextResponse.json({
      ok: true,
      order: { ...order, items: JSON.parse(order.itemsJson || "[]") },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const allowed = ["status", "paymentStatus", "notes"];
    const data: any = {};
    for (const k of allowed) if (k in body) data[k] = body[k];

    // Get previous state to detect changes
    const before = await db.order.findUnique({ where: { id } });
    const updated = await db.order.update({ where: { id }, data });

    // Send WhatsApp notifications on status changes
    if (HAS_WHATSAPP_API && before) {
      try {
        // Status changed to "confirmed"
        if (body.status === "confirmed" && before.status !== "confirmed") {
          await sendOrderConfirmation({
            to: updated.customerPhone,
            customerName: updated.customerName,
            orderNumber: updated.orderNumber,
            totalAmount: updated.totalTTC,
            deliveryLocation: updated.district,
          });
        }
        // Status changed to "shipped"
        if (body.status === "shipped" && before.status !== "shipped") {
          await sendOrderShipped({
            to: updated.customerPhone,
            orderNumber: updated.orderNumber,
            deliveryLocation: updated.district,
            etaHours: 24,
          });
        }
        // Payment marked as paid
        if (body.paymentStatus === "paid" && before.paymentStatus !== "paid") {
          await sendPaymentReceived({
            to: updated.customerPhone,
            orderNumber: updated.orderNumber,
            amount: updated.totalTTC,
          });
        }
      } catch (waErr: any) {
        console.warn("WhatsApp notification failed:", waErr?.message);
      }
    }

    // Create admin notification for status changes
    if (body.status && before && before.status !== body.status) {
      await db.adminNotification.create({
        data: {
          type: "order",
          title: `Order ${updated.orderNumber} → ${body.status}`,
          body: `${updated.customerName} · ${updated.totalTTC} RWF`,
          link: `/admin/orders`,
        },
      });
    }

    return NextResponse.json({ ok: true, order: updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
