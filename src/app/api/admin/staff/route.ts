import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
export async function GET() { try { const staff = await db.staffAccount.findMany({ orderBy: { createdAt: "desc" } }); return NextResponse.json({ ok: true, staff }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }
export async function POST(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;
 try { const body = await req.json(); const { password, ...data } = body; if (password) data.passwordHash = hashPassword(password); if (Array.isArray(data.permissions)) data.permissions = JSON.stringify(data.permissions); const staff = await db.staffAccount.create({ data }); return NextResponse.json({ ok: true, staff }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }