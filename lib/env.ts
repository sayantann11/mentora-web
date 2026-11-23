import "server-only";

/** Server-only environment. Nothing here is ever exposed to the browser. */
export function serverEnv() {
  const e = process.env;
  return {
    supabaseUrl: e.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: e.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    supabaseServiceRoleKey: e.SUPABASE_SERVICE_ROLE_KEY ?? "",
    resendApiKey: e.RESEND_API_KEY ?? "",
    emailFrom: e.EMAIL_FROM ?? "Mentora <hello@mentora.example>",
    adminNotifyEmail: e.ADMIN_NOTIFY_EMAIL ?? "",
    adminEmails: (e.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
    turnstileSecret: e.TURNSTILE_SECRET_KEY ?? "",
    upiId: e.UPI_ID ?? "",
    upiPayeeName: e.UPI_PAYEE_NAME ?? "",
    /** Some UPI apps reject `tr=` on personal (non-merchant) VPAs. Set to "false" if payments fail. */
    upiIncludeTr: (e.UPI_INCLUDE_TR ?? "true") !== "false",
    ipHashSalt: e.IP_HASH_SALT ?? "dev-only-salt-change-me",
    cronSecret: e.CRON_SECRET ?? "",
    devAdminBypass: e.NODE_ENV !== "production" && e.DEV_ADMIN_BYPASS === "true",
    isVercel: Boolean(e.VERCEL),
  };
}

export function supabaseConfigured() {
  const { supabaseUrl, supabaseServiceRoleKey } = serverEnv();
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}
