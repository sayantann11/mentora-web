import { randomBytes, createHash, randomInt } from "node:crypto";

/** URL-safe random token. 32 bytes → 43 chars, ~256 bits of entropy (unguessable). */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

// No 0/O/1/I/L to avoid confusion when read aloud or typed into a payment note.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** Human-readable reference such as MNT-2611-K7Q4 (YYMM + 4 random chars). Not a secret. */
export function referenceCode(date = new Date()): string {
  const yy = String(date.getUTCFullYear()).slice(-2);
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `MNT-${yy}${mm}-${suffix}`;
}

export const REFERENCE_RE = /^MNT-\d{4}-[2-9A-HJKMNP-Z]{4}$/;

/** One-way hash of an IP address with a server secret — we never store raw IPs. */
export function hashIp(ip: string | null | undefined, salt: string): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
