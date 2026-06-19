import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() { try { const messages = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }); return NextResponse.json({ ok: true, messages }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }