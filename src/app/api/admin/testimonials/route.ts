import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() { try { const testimonials = await db.testimonial.findMany({ orderBy: { createdAt: "desc" } }); return NextResponse.json({ ok: true, testimonials }); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); } }