import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
import { bustCache } from "@/lib/cache";

export async function PUT(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const settings = await db.siteSetting.update({ where: { id: "singleton" }, data: body });
    // Bust the settings cache so the new logo/name appears immediately
    bustCache("/api/settings");
    return NextResponse.json({ ok: true, settings });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
