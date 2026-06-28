import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function GET(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response; try { const bookings = await db.booking.findMany({ orderBy: { createdAt: "desc" }, take: 100 }); return NextResponse.json({ ok: true, bookings }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }