import "server-only";
import { serverEnv } from "./env";

/**
 * Verifies a Cloudflare Turnstile token. If no secret is configured (local dev),
 * verification is skipped — in production the secret MUST be set (see LAUNCH_CHECKLIST.md).
 */
export async function verifyTurnstile(token: string, ipHint?: string | null): Promise<boolean> {
  const { turnstileSecret, isVercel } = serverEnv();
  if (!turnstileSecret) {
    if (isVercel && process.env.VERCEL_ENV === "production") {
      console.error("[turnstile] TURNSTILE_SECRET_KEY missing in production");
      return false;
    }
    return true;
  }
  if (!token) return false;
  const body = new URLSearchParams({ secret: turnstileSecret, response: token });
  if (ipHint) body.set("remoteip", ipHint);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, cache: "no-store" });
    const json = (await res.json()) as { success?: boolean };
    return Boolean(json.success);
  } catch (e) {
    console.error("[turnstile] verification request failed", e);
    return false;
  }
}
