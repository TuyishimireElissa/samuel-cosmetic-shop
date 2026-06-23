import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const monthParam = url.searchParams.get("month"); // YYYY-MM
    let start: Date, end: Date;
    if (monthParam) {
      const [y, m] = monthParam.split("-").map(Number);
      start = new Date(y, m - 1, 1);
      end = new Date(y, m, 0, 23, 59, 59);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: "cancelled" },
      },
      orderBy: { createdAt: "asc" },
    });

    const rows = orders.map((o) => {
      const items = JSON.parse(o.itemsJson || "[]") as any[];
      return {
        date: o.createdAt.toISOString(),
        receiptNumber: o.receiptNumber || "",
        orderNumber: o.orderNumber,
        customer: o.customerName,
        customerPhone: o.customerPhone,
        subtotalHT: o.subtotalHT,
        vatAmount: o.vatAmount,
        totalTTC: o.totalTTC,
        mrcCode: o.mrcCode || "",
        itemCount: items.reduce((s: number, i: any) => s + i.qty, 0),
      };
    });

    const totals = {
      collected: rows.reduce((s, r) => s + r.vatAmount, 0),
      salesHT: rows.reduce((s, r) => s + r.subtotalHT, 0),
      salesTTC: rows.reduce((s, r) => s + r.totalTTC, 0),
      orderCount: rows.length,
    };

    return NextResponse.json({ ok: true, rows, totals, start, end });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
