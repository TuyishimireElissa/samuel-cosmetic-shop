import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/session";

const PUBLIC_ADMIN_PATHS = ["/api/admin/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/api/admin/")) return NextResponse.next();
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname === p)) return NextResponse.next();

  const authHeader = req.headers.get("authorization") || "";
  const xToken = req.headers.get("x-admin-token") || "";
  const cookieToken = req.cookies.get("sc_session")?.value || "";

  let token = "";
  if (authHeader.startsWith("Bearer ")) token = authHeader.slice(7);
  else if (xToken) token = xToken;
  else if (cookieToken) token = cookieToken;

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { ok: false, error: "unauthorized", message: "Valid admin session required." },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = { 
  matcher: ["/api/admin/:path*"],
  runtime: "nodejs",
};
