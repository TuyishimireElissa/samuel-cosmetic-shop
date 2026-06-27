import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bustCache } from "@/lib/cache";

export async function PUT(req: NextRequest) {
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
