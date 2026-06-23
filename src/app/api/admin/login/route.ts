import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, makeToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "missing_credentials" },
        { status: 400 }
      );
    }
    const admin = await db.adminUser.findUnique({ where: { username } });
    if (!admin || !admin.isActive || !verifyPassword(password, admin.passwordHash)) {
      return NextResponse.json(
        { ok: false, error: "invalid_credentials" },
        { status: 401 }
      );
    }
    await db.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });
    const token = makeToken();
    return NextResponse.json({
      ok: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
        email: admin.email,
        avatar: admin.avatar,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
