import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function GET() { try { const notifications = await db.adminNotification.findMany({ orderBy: { createdAt: "desc" }, take: 50 }); return NextResponse.json({ ok: true, notifications }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }