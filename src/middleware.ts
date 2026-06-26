import { NextRequest, NextResponse } from "next/server";
const DEV_SECRET = "samuel-cosmetic-shop-dev-secret-CHANGE-IN-PRODUCTION";
const TOKEN_TTL = 24 * 60 * 60 * 1000;
function getSecret(): string { return process.env.SESSION_SECRET || DEV_SECRET; }
function b64urlToBytes(s: string): Uint8Array {
  const padded = s + "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
async function verifyToken(token: string): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return false;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(getSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const sigBytes = b64urlToBytes(sigB64);
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payloadB64));
    if (!valid) return false;
    const payloadJson = new TextDecoder().decode(b64urlToBytes(payloadB64));
    const payload = JSON.parse(payloadJson);
    if (Date.now() - payload.iat > TOKEN_TTL) return false;
    return true;
  } catch { return false; }
}
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
  if (!(await verifyToken(token))) return NextResponse.json({ ok: false, error: "unauthorized", message: "Valid admin session required." }, { status: 401 });
  return NextResponse.next();
}
export const config = { matcher: ["/api/admin/:path*"] };
