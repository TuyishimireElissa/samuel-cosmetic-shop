import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function GET(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response; try { const messages = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }); return NextResponse.json({ ok: true, messages }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }