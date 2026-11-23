import "server-only";
import { headers } from "next/headers";
import { hashIp } from "./ids";
import { serverEnv } from "./env";
import { rateLimit } from "./rateLimit";

export async function requestMeta() {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  return {
    ipHash: hashIp(ip, serverEnv().ipHashSalt),
    userAgent: (h.get("user-agent") ?? "").slice(0, 300) || null,
  };
}

/** Rate-limit by hashed IP. Throws a user-safe error when exceeded. */
export async function limitByIp(scope: string, limit: number, windowMs: number) {
  const { ipHash } = await requestMeta();
  const r = rateLimit(`${scope}:${ipHash ?? "unknown"}`, limit, windowMs);
  if (!r.ok) throw new UserError(`Too many attempts. Please try again in ${Math.ceil(r.retryAfterSec / 60)} minute(s).`);
}

/** An error whose message is safe to show to the visitor. */
export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function toActionError(e: unknown): { ok: false; error: string } {
  if (e instanceof UserError) return { ok: false, error: e.message };
  console.error("[action] unexpected error", e);
  return { ok: false, error: "Something went wrong on our side. Please try again, or message us on WhatsApp." };
}
