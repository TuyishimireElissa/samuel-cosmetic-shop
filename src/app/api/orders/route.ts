import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  priceHT,
  vatAmount,
  calcCartTotals,
  orderNumber,
  generateMRC,
  type CartLine,
} from "@/lib/format";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const phone = url.searchParams.get("phone");
    const where: any = {};
    if (phone) where.customerPhone = phone;
    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ ok: true, orders });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail = "",
      district,
      address = "",
      notes = "",
      items = [],
      deliveryFee = 0,
      discount = 0,
      couponCode = "",
      paymentMethod = "whatsapp",
    } = body;

    if (!customerName || !customerPhone || !district) {
      return NextResponse.json(
        { ok: false, error: "missing_required_fields" },
        { status: 400 }
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "empty_cart" },
        { status: 400 }
      );
    }

    // Build cart lines & snapshot items
    const cartLines: CartLine[] = [];
    const itemsSnapshot = [];
    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.id } });
      if (!product) continue;
      const qty = Math.max(1, Number(item.qty) || 1);
      cartLines.push({ id: product.id, qty, priceTTC: product.sellingPrice });
      itemsSnapshot.push({
        id: product.id,
        sku: product.sku,
        nameEn: product.nameEn,
        nameFr: product.nameFr,
        nameRw: product.nameRw,
        emoji: product.emoji,
        qty,
        priceTTC: product.sellingPrice,
        priceHT: priceHT(product.sellingPrice),
        vatAmount: vatAmount(product.sellingPrice),
        lineTTC: product.sellingPrice * qty,
      });
      // decrement stock + increment sales count
      await db.product.update({
        where: { id: product.id },
        data: {
          stockQty: { decrement: qty },
          salesCount: { increment: qty },
        },
      });
    }

    const totals = calcCartTotals(cartLines, deliveryFee, discount);
    const orderNum = orderNumber();
    const mrc = generateMRC(orderNum, totals.totalTTC);

    // Upsert customer
    let customer = await db.customer.findUnique({ where: { phone: customerPhone } });
    const earnedPoints = Math.floor(totals.totalTTC / 100);
    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          district,
          totalOrders: 1,
          totalSpent: totals.totalTTC,
          loyaltyPoints: earnedPoints,
          lastOrderAt: new Date(),
        },
      });
      // Record loyalty earn txn
      if (earnedPoints > 0) {
        await db.loyaltyTransaction.create({
          data: {
            customerId: customer.id,
            type: "earn",
            points: earnedPoints,
            balance: earnedPoints,
            reason: "first_order",
            createdBy: "system",
          },
        });
      }
    } else {
      const newTotal = customer.totalSpent + totals.totalTTC;
      const newOrders = customer.totalOrders + 1;
      // Tier upgrade
      let tier = customer.tier;
      if (newTotal >= 500000) tier = "platinum";
      else if (newTotal >= 200000) tier = "gold";
      else if (newTotal >= 50000) tier = "silver";
      // 1 loyalty point per 100 RWF
      const earnedPts = Math.floor(totals.totalTTC / 100);
      const newPoints = customer.loyaltyPoints + earnedPts;
      customer = await db.customer.update({
        where: { id: customer.id },
        data: {
          name: customerName,
          email: customerEmail || customer.email,
          district,
          totalSpent: newTotal,
          totalOrders: newOrders,
          tier,
          loyaltyPoints: newPoints,
          lastOrderAt: new Date(),
        },
      });
      if (earnedPts > 0) {
        await db.loyaltyTransaction.create({
          data: {
            customerId: customer.id,
            type: "earn",
            points: earnedPts,
            balance: newPoints,
            reason: "order_placed",
            createdBy: "system",
          },
        });
      }
    }

    const order = await db.order.create({
      data: {
        orderNumber: orderNum,
        customerId: customer.id,
        customerName,
        customerPhone,
        customerEmail,
        district,
        address,
        subtotalHT: totals.subtotalHT,
        vatAmount: totals.vatAmount,
        deliveryFee,
        discount,
        totalTTC: totals.totalTTC,
        paymentMethod,
        paymentStatus: paymentMethod === "cash" ? "pending" : "pending",
        status: "pending",
        notes,
        mrcCode: mrc,
        receiptNumber: `EBM-${orderNum}`,
        itemsJson: JSON.stringify(itemsSnapshot),
      },
    });

    // Increment coupon use if applicable
    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode } });
      if (coupon) {
        await db.coupon.update({
          where: { id: coupon.id },
          data: { usesCount: { increment: 1 } },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalTTC: order.totalTTC,
        subtotalHT: order.subtotalHT,
        vatAmount: order.vatAmount,
        deliveryFee: order.deliveryFee,
        discount: order.discount,
        mrcCode: order.mrcCode,
        receiptNumber: order.receiptNumber,
        status: order.status,
        paymentMethod: order.paymentMethod,
        items: itemsSnapshot,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
