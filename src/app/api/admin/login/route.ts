import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, isLegacyHash, hashPassword } from "@/lib/auth";
import { issueToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "missing_credentials" }, { status: 400 });
    }

    // 1. Try admin user
    const admin = await db.adminUser.findUnique({ where: { username } });
    if (admin && admin.isActive && verifyPassword(password, admin.passwordHash)) {
      if (isLegacyHash(admin.passwordHash)) {
        await db.adminUser.update({ where: { id: admin.id }, data: { passwordHash: hashPassword(password) } });
      }
      await db.adminUser.update({ where: { id: admin.id }, data: { lastLogin: new Date() } });
      const token = issueToken({ id: admin.id, type: "admin" });
      return NextResponse.json({
        ok: true, token,
        user: { id: admin.id, username: admin.username, fullName: admin.fullName, email: admin.email, avatar: admin.avatar, type: "admin", permissions: ["*"] },
      });
    }

    // 2. Try staff
    const staff = await db.staffAccount.findUnique({ where: { username } });
    if (staff && staff.isActive && verifyPassword(password, staff.passwordHash)) {
      if (isLegacyHash(staff.passwordHash)) {
        await db.staffAccount.update({ where: { id: staff.id }, data: { passwordHash: hashPassword(password) } });
      }
      await db.staffAccount.update({ where: { id: staff.id }, data: { lastLogin: new Date() } });
      const permissions = typeof staff.permissions === "string" ? JSON.parse(staff.permissions) : (staff.permissions || []);
      const token = issueToken({ id: staff.id, type: "staff", role: staff.role });
      return NextResponse.json({
        ok: true, token,
        user: { id: staff.id, username: staff.username, fullName: staff.name, type: "staff", role: staff.role, permissions },
      });
    }

    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "server_error" }, { status: 500 });
  }
}
