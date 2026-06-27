import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Run queries SEQUENTIALLY to avoid exhausting Supabase connection pool (max 15)
    const allOrders = await db.order.findMany({
      select: { totalTTC: true, createdAt: true, status: true, district: true, paymentMethod: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const products = await db.product.findMany({
      select: { id: true, nameEn: true, emoji: true, stockQty: true, lowStockThreshold: true, salesCount: true, sellingPrice: true },
    });

    const customers = await db.customer.count();

    // Calculate stats from the already-fetched data (no extra DB queries)
    const todayOrders = allOrders.filter((o) => o.createdAt >= startOfDay);
    const monthOrders = allOrders.filter((o) => o.createdAt >= startOfMonth);
    const yearOrders = allOrders.filter((o) => o.createdAt >= startOfYear);
    const lowStockProducts = products.filter((p) => p.stockQty <= 5 && p.stockQty > 0);

    const revenueToday = todayOrders.reduce((s, o) => s + o.totalTTC, 0);
    const revenueMonth = monthOrders.reduce((s, o) => s + o.totalTTC, 0);
    const revenueYear = yearOrders.reduce((s, o) => s + o.totalTTC, 0);
    const revenueAll = allOrders.reduce((s, o) => s + o.totalTTC, 0);

    // Last 7 days revenue series
    const days: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayOrders = allOrders.filter((o) => o.createdAt.toISOString().slice(0, 10) === key);
      days.push({
        date: key,
        revenue: dayOrders.reduce((s, o) => s + o.totalTTC, 0),
        orders: dayOrders.length,
      });
    }

    // Top products by sales count
    const topProducts = [...products]
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.nameEn,
        emoji: p.emoji,
        salesCount: p.salesCount,
        revenue: p.salesCount * p.sellingPrice,
      }));

    // Orders by district
    const districtMap = new Map<string, { count: number; revenue: number }>();
    for (const o of allOrders) {
      const entry = districtMap.get(o.district) || { count: 0, revenue: 0 };
      entry.count++;
      entry.revenue += o.totalTTC;
      districtMap.set(o.district, entry);
    }
    const districtStats = Array.from(districtMap.entries())
      .map(([district, v]) => ({ district, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    // Status breakdown
    const statusMap: Record<string, number> = {};
    for (const o of allOrders) {
      statusMap[o.status] = (statusMap[o.status] || 0) + 1;
    }

    return NextResponse.json({
      ok: true,
      analytics: {
        revenueToday,
        revenueMonth,
        revenueYear,
        revenueAll,
        ordersToday: todayOrders.length,
        ordersMonth: monthOrders.length,
        ordersAll: allOrders.length,
        customers,
        productsCount: products.length,
        lowStockCount: lowStockProducts.length,
        days,
        topProducts,
        districtStats,
        statusBreakdown: statusMap,
        lowStockProducts,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
