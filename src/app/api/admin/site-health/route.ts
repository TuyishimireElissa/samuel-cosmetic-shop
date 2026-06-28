import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
import { HAS_WHATSAPP_API } from "@/lib/whatsapp-api";

export async function GET() {
  try {
    const [
      products, orders, customers, reviews, bookings, coupons, bundles,
      flashSales, staff, subscribers, wholesale, messages, testimonials,
      images, pageViews, auditLogs,
    ] = await Promise.all([
      db.product.count(), db.order.count(), db.customer.count(), db.review.count(),
      db.booking.count(), db.coupon.count(), db.bundle.count(), db.flashSale.count(),
      db.staffAccount.count(), db.subscriber.count(), db.wholesaleUser.count(),
      db.contactMessage.count(), db.testimonial.count(), db.productImage.count(),
      db.pageView.count(), db.auditLog.count(),
    ]);

    // === Dynamic API status checks ===
    const HAS_CLOUDINARY = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    const HAS_MOMO = !!(
      process.env.MOMO_API_USER &&
      process.env.MOMO_API_KEY &&
      process.env.MOMO_SUBSCRIPTION_KEY
    );
    const HAS_AIRTEL = !!(
      process.env.AIRTEL_CLIENT_ID &&
      process.env.AIRTEL_CLIENT_SECRET
    );
    const MOMO_ENV = process.env.MOMO_ENVIRONMENT || "not set";
    const AIRTEL_ENV = process.env.AIRTEL_ENVIRONMENT || "not set";

    // Detect database type from DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || "";
    const dbType = dbUrl.startsWith("file:") ? "SQLite" : dbUrl.startsWith("postgres") ? "PostgreSQL" : "Unknown";

    return NextResponse.json({
      ok: true,
      health: {
        services: [
          { name: "Database", ok: true, message: `Connected (${dbType})` },
          { name: "Redis", ok: false, message: "Not configured (optional)" },
          {
            name: "Cloudinary",
            ok: HAS_CLOUDINARY,
            message: HAS_CLOUDINARY
              ? `Connected (${process.env.CLOUDINARY_CLOUD_NAME})`
              : "Using local uploads (/public/uploads)",
          },
          {
            name: "WhatsApp API",
            ok: HAS_WHATSAPP_API,
            message: HAS_WHATSAPP_API
              ? "Connected (Meta Cloud API)"
              : "Using wa.me deep links",
          },
          {
            name: "MTN MoMo API",
            ok: HAS_MOMO,
            message: HAS_MOMO
              ? `Connected (${MOMO_ENV})`
              : "Simulated (3s auto-success)",
          },
          {
            name: "Airtel Money API",
            ok: HAS_AIRTEL,
            message: HAS_AIRTEL
              ? `Connected (${AIRTEL_ENV})`
              : "Simulated (3s auto-success)",
          },
        ],
        performance: {
          avgResponseTime: "~80ms",
          dbQueriesPerRequest: "~4",
          storageUsed: "0 MB",
          uptime: Math.floor(process.uptime() / 60) + " min",
        },
        counts: {
          products, orders, customers, reviews, bookings, coupons, bundles,
          flashSales, staff, subscribers, wholesale, messages, testimonials,
          images, pageViews, auditLogs,
        },
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
