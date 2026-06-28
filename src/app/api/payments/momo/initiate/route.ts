import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { orderId, phoneNumber, amount } = await req.json();
    if (!phoneNumber || !amount) return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });

    // Validate phone format (Rwandan)
    const cleanPhone = phoneNumber.replace(/[\s-]/g, "");
    if (!/^(\+250|0)?7\d{8}$/.test(cleanPhone)) {
      return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 400 });
    }

    // Create transaction record
    const providerRef = "MOMO-" + Date.now();
    const txn = await db.moMoTransaction.create({
      data: {
        orderId: orderId || null,
        phoneNumber: cleanPhone,
        amount: Number(amount),
        status: "pending",
        providerRef,
      },
    });

    // In production, this would call the MTN MoMo Collection API:
    // POST https://momodeveloper.mtn.com/collection/v1_0/requesttopay
    // For now, we simulate by marking as success after a delay.
    // When real API keys are configured (MOMO_API_USER, MOMO_API_KEY), replace this.
    setTimeout(async () => {
      try {
        await db.moMoTransaction.update({ where: { id: txn.id }, data: { status: "success" } });
        if (orderId) {
          const orderExists = await db.order.findUnique({ where: { id: orderId }, select: { id: true } });
          if (orderExists) {
            await db.order.update({ where: { id: orderId }, data: { paymentStatus: "paid", paymentRef: providerRef } });
          }
        }
      } catch {}
    }, 3000);

    return NextResponse.json({
      ok: true,
      reference: providerRef,
      transactionId: txn.id,
      status: "pending",
      provider: "simulation",
      live: false,
      instructions: {
        title: "MTN MoMo Payment",
        steps: [
          "Check your phone for a payment request",
          "Enter your MoMo PIN to approve",
          "Wait for confirmation SMS",
        ],
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "server_error" }, { status: 500 });
  }
}
