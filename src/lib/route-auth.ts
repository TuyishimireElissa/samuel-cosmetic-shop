import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const DEV_SECRET = "samuel-cosmetic-shop-dev-secret-CHANGE-IN-PRODUCTION";
const TOKEN_TTL = 24 * 60 * 60 * 1000;

function getSecret(): string {
  return process.env.SESSION_SECRET || DEV_SECRET;
}

export function checkAuth(req: NextRequest): { ok: true; payload: any } | { ok: false; response: NextResponse } {
  const authHeader = req.headers.get("authorization") || "";
  const xToken = req.headers.get("x-admin-token") || "";
  
  let token = "";
  if (authHeader.startsWith("Bearer ")) token = authHeader.slice(7);
  else if (xToken) token = xToken;

  if (!token || !token.includes(".")) {
    return { ok: false, response: NextResponse.json({ ok: false, error: "unauthorized", message: "No token" }, { status: 401 }) };
  }

  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) {
    return { ok: false, response: NextResponse.json({ ok: false, error: "unauthorized", message: "Invalid token format" }, { status: 401 }) };
  }

  try {
    const expectedSig = createHmac("sha256", getSecret()).update(payloadB64).digest();
    const providedSig = Buffer.from(sigB64, "base64url");
    
    if (expectedSig.length !== providedSig.length || !timingSafeEqual(expectedSig, providedSig)) {
      return { ok: false, response: NextResponse.json({ ok: false, error: "unauthorized", message: "Invalid signature" }, { status: 401 }) };
    }

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (Date.now() - payload.iat > TOKEN_TTL) {
      return { ok: false, response: NextResponse.json({ ok: false, error: "unauthorized", message: "Token expired" }, { status: 401 }) };
    }

    return { ok: true, payload };
  } catch (e: any) {
    return { ok: false, response: NextResponse.json({ ok: false, error: "unauthorized", message: e?.message || "Verification error" }, { status: 401 }) };
  }
}
