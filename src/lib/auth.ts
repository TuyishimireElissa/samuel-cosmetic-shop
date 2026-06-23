// Shared password hash (must match scripts/seed.ts)
// NOTE: This is a demo-grade hash. Use bcrypt/argon2 in production.

export function hashPassword(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return `sc$${(h >>> 0).toString(16)}$${s.length}`;
}

export function verifyPassword(raw: string, hash: string): boolean {
  return hashPassword(raw) === hash;
}

// Simple session token (demo only)
export function makeToken(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
