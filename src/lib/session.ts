import { createHmac, timingSafeEqual } from "crypto";
const DEV_SECRET = "samuel-cosmetic-shop-dev-secret-CHANGE-IN-PRODUCTION";
const TOKEN_TTL = 24 * 60 * 60 * 1000;
function getSecret(): string { return process.env.SESSION_SECRET || DEV_SECRET; }
function b64url(buf: Buffer | string): string { return Buffer.from(buf).toString("base64url"); }
function fromB64url(s: string): Buffer { return Buffer.from(s, "base64url"); }
export interface TokenPayload { id: string; type: "admin" | "staff"; role?: string; iat: number; }
export function issueToken(payload: Omit<TokenPayload, "iat">): string {
  const fullPayload: TokenPayload = { ...payload, iat: Date.now() };
  const payloadB64 = b64url(JSON.stringify(fullPayload));
  const sig = createHmac("sha256", getSecret()).update(payloadB64).digest();
  return `${payloadB64}.${sig.toString("base64url")}`;
}
export function verifyToken(token: string): TokenPayload | null {
  if (!token || !token.includes(".")) return null;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;
  const expectedSig = createHmac("sha256", getSecret()).update(payloadB64).digest();
  const providedSig = fromB64url(sigB64);
  if (expectedSig.length !== providedSig.length) return null;
  if (!timingSafeEqual(expectedSig, providedSig)) return null;
  try {
    const payload = JSON.parse(fromB64url(payloadB64).toString("utf8")) as TokenPayload;
    if (Date.now() - payload.iat > TOKEN_TTL) return null;
    return payload;
  } catch { return null; }
}
