"use server";

import { z } from "zod";
import { isAllowedAdmin, supabaseAuthClient } from "@/lib/auth";
import { limitByIp, UserError } from "@/lib/request";
import { site } from "@/content/site";

const GENERIC = "If that email is an approved admin, a sign-in link is on its way. Check your inbox.";

export async function sendMagicLink(_prev: unknown, formData: FormData): Promise<{ message: string }> {
  try {
    await limitByIp("admin-login", 5, 15 * 60_000);
  } catch (e) {
    return { message: e instanceof UserError ? e.message : GENERIC };
  }
  const parsed = z.email().safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  // Same response whether or not the email is allowed — no account enumeration.
  if (!parsed.success || !isAllowedAdmin(parsed.data)) return { message: GENERIC };
  const supabase = await supabaseAuthClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { shouldCreateUser: false, emailRedirectTo: `${site.url}/admin/auth/callback` },
  });
  if (error) console.error("[admin-login]", error.message);
  return { message: GENERIC };
}
