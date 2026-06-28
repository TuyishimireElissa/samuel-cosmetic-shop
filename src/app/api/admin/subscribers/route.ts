import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function GET(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response; try { const subscribers = await db.subscriber.findMany({ orderBy: { subscribedAt: "desc" } }); return NextResponse.json({ ok: true, subscribers }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }