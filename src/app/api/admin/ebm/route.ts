import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/route-auth";
import { db } from "@/lib/db";
import { bustCache } from "@/lib/cache";
export async function GET() {
  try {
    const s = await db.siteSetting.findUnique({ where: { id: "singleton" } });
    if (!s) return NextResponse.json({ ok: false, error: "no_settings" }, { status: 500 });
    return NextResponse.json({ ok: true, config: { apiUrl: (s as any).ebmApiUrl || "", hasToken: !!(s as any).ebmToken, sdcId: (s as any).ebmSdcId || s.sdcId, tin: s.tin }, live: !!(s as any).ebmApiUrl && !!(s as any).ebmToken });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e?.message }, { status: 500 }); }
}
export async function PUT(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json(); const { apiUrl = "", apiToken = "", sdcId = "", tin = "" } = body;
    const s = await db.siteSetting.findUnique({ where: { id: "singleton" } });
    const newToken = apiToken || ((s as any)?.ebmToken || "");
    const updated: any = await db.siteSetting.update({ where: { id: "singleton" }, data: { ...(Object.keys(s as any).includes("ebmApiUrl") ? { ebmApiUrl: apiUrl, ebmToken: newToken, ebmSdcId: sdcId } : {}), tin } });
    bustCache("/api/settings");
    return NextResponse.json({ ok: true, config: { apiUrl: updated.ebmApiUrl || apiUrl, hasToken: !!(updated.ebmToken || newToken), sdcId: updated.ebmSdcId || sdcId, tin: updated.tin }, live: !!(apiUrl && newToken) });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e?.message }, { status: 500 }); }
}
export async function DELETE() {
  try {
    const s = await db.siteSetting.findUnique({ where: { id: "singleton" } });
    if (s && Object.keys(s as any).includes("ebmApiUrl")) await (db.siteSetting.update as any)({ where: { id: "singleton" }, data: { ebmApiUrl: "", ebmToken: "", ebmSdcId: "" } });
    bustCache("/api/settings");
    return NextResponse.json({ ok: true, live: false });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e?.message }, { status: 500 }); }
}
