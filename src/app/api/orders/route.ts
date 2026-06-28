import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
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
    if (phone) {
      // Security: when filtering by phone, rate-limit by IP to slow enumeration.
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const rl = rateLimit(`orders-lookup:${ip}`);
      if (!rl.ok) {
        return NextResponse.json(
          { ok: false, error: "rate_limited", message: "Too many requests. Try again in a minute." },
          { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
        );
      }
      where.customerPhone = phone;
    }
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
      isWholesale = false,
      wholesaleUserId = null,
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
    const itemsSnapshot: any[] = [];
    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.id } });
      if (!product) continue;
      const qty = Math.max(1, Number(item.qty) || 1);
      // SECURITY FIX (SHOP-005): Never trust client-supplied prices.
      // The server computes the correct price based on whether the buyer
      // is an approved wholesale customer. The client's priceTTC is ignored.
      const isApprovedWholesale = isWholesale && wholesaleUserId;
      let itemPrice: number;
      if (isApprovedWholesale && product.wholesalePrice > 0) {
        itemPrice = product.wholesalePrice;
      } else {
        itemPrice = product.sellingPrice;
      }
      cartLines.push({ id: product.id, qty, priceTTC: itemPrice });
      itemsSnapshot.push({
        id: product.id,
        sku: product.sku,
        nameEn: product.nameEn,
        nameFr: product.nameFr,
        nameRw: product.nameRw,
        emoji: product.emoji,
        qty,
        priceTTC: itemPrice,
        priceHT: priceHT(itemPrice),
        vatAmount: vatAmount(itemPrice),
        lineTTC: itemPrice * qty,
      });
      // SHOP-006 fix: check stock before decrement — don't allow negative stock.
      if (product.stockQty < qty) {
        return NextResponse.json(
          { ok: false, error: `Insufficient stock for ${product.nameEn}. Only ${product.stockQty} left.` },
          { status: 400 }
        );
      }
      // decrement stock + increment sales count
      await db.product.update({
        where: { id: product.id },
        data: {
          stockQty: { decrement: qty },
          salesCount: { increment: qty },
        },
      });
    }

    // SECURITY FIX (SHOP-005): Re-validate coupon server-side.
    // The client sends a `discount` value, but we must NOT trust it.
    // If a couponCode is provided, look it up and compute the discount here.
    let serverDiscount = 0;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && coupon.usesCount < coupon.maxUses) {
        const now = new Date();
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > now;
        const notBeforeStart = new Date(coupon.validFrom) <= now;
        if (notExpired && notBeforeStart) {
          const subtotalTTC = cartLines.reduce((s, l) => s + l.priceTTC * l.qty, 0);
          if (subtotalTTC >= coupon.minOrder) {
            if (coupon.type === "percent") {
              serverDiscount = Math.round((subtotalTTC * coupon.value) / 100);
              if (coupon.maxDiscount && serverDiscount > coupon.maxDiscount) {
                serverDiscount = coupon.maxDiscount;
              }
            } else {
              serverDiscount = Math.min(coupon.value, subtotalTTC);
            }
          }
        }
      }
    }

    const totals = calcCartTotals(cartLines, deliveryFee, serverDiscount);
    const orderNum = orderNumber();
    const mrc = generateMRC(orderNum, totals.totalTTC);

    // Increment coupon usage if applicable
    if (couponCode && serverDiscount > 0) {
      await db.coupon.updateMany({
        where: { code: couponCode },
        data: { usesCount: { increment: 1 } },
      }).catch(() => {});
    }

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
        // API-021 fix: cash = unpaid (COD), online = pending (awaiting gateway).
        paymentStatus: paymentMethod === "cash" ? "unpaid" : "pending",
        status: "pending",
        notes,
        mrcCode: mrc,
        receiptNumber: `EBM-${orderNum}`,
        itemsJson: JSON.stringify(itemsSnapshot),
        isWholesale,
        wholesaleUserId: wholesaleUserId || null,
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
