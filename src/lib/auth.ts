import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
const BCRYPT_ROUNDS = 10;
const LEGACY_PREFIX = "sc$";
function legacyHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return `${LEGACY_PREFIX}${(h >>> 0).toString(16)}$${s.length}`;
}
export function hashPassword(s: string): string { return bcrypt.hashSync(s, BCRYPT_ROUNDS); }
export function verifyPassword(raw: string, hash: string): boolean {
  if (!hash) return false;
  if (hash.startsWith(LEGACY_PREFIX)) return legacyHash(raw) === hash;
  try { return bcrypt.compareSync(raw, hash); } catch { return false; }
}
export function isLegacyHash(hash: string): boolean { return hash.startsWith(LEGACY_PREFIX); }
export function makeToken(): string { return randomBytes(32).toString("base64url"); }
