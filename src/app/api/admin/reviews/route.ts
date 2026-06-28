import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function GET(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "all";
    const where: any = {};
    // ADMIN-033 fix: "pending" should NOT include hidden reviews.
    if (status === "pending") { where.isApproved = false; where.isHidden = false; }
    else if (status === "approved") where.isApproved = true;
    else if (status === "hidden") where.isHidden = true;
    const reviews = await db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { product: { select: { id: true, nameEn: true, emoji: true } } }
    });
    return NextResponse.json({ ok: true, reviews });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
export async function PATCH(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
  try {
    const { id, action, reply } = await req.json();
    const data: any = {};
    if (action === "approve") data.isApproved = true;
    else if (action === "reject" || action === "hide") { data.isApproved = false; data.isHidden = true; }
    else if (action === "reply") data.adminReply = reply || "";
    else if (action === "delete") {
      // ADMIN-006 fix: recalculate product rating AFTER delete (was missing).
      const review = await db.review.findUnique({ where: { id } });
      await db.review.delete({ where: { id } });
      if (review) {
        const reviews = await db.review.findMany({
          where: { productId: review.productId, isApproved: true, isHidden: false }
        });
        const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
        await db.product.update({
          where: { id: review.productId },
          data: { ratingAvg: Math.round(avg * 100) / 100, ratingCount: reviews.length }
        });
      }
      return NextResponse.json({ ok: true });
    }
    const updated = await db.review.update({ where: { id }, data });
    if (["approve", "reject", "hide"].includes(action)) {
      const reviews = await db.review.findMany({
        where: { productId: updated.productId, isApproved: true, isHidden: false }
      });
      const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
      await db.product.update({
        where: { id: updated.productId },
        data: { ratingAvg: Math.round(avg * 100) / 100, ratingCount: reviews.length }
      });
    }
    return NextResponse.json({ ok: true, review: updated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
