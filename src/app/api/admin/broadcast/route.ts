import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
export async function POST(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const { message } = await req.json(); if (!message) return NextResponse.json({ ok: false, error: "no_message" }, { status: 400 }); const active = await db.subscriber.findMany({ where: { isActive: true } }); for (const sub of active) { await db.notificationLog.create({ data: { recipientPhone: sub.phone, type: "whatsapp", templateKey: "broadcast", message, status: "sent" } }); await db.subscriber.update({ where: { id: sub.id }, data: { totalReceived: { increment: 1 }, lastMessageAt: new Date() } }); } return NextResponse.json({ ok: true, sent: active.length }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }