import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function GET(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const url = new URL(req.url); const status = url.searchParams.get("status"); const where = {}; if (status && status !== "all") where.status = status; const users = await db.wholesaleUser.findMany({ where, orderBy: { createdAt: "desc" } }); return NextResponse.json({ ok: true, users }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }