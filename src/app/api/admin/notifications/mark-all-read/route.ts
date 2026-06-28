import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function PATCH() { try { await db.adminNotification.updateMany({ where: { isRead: false }, data: { isRead: true } }); return NextResponse.json({ ok: true }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }