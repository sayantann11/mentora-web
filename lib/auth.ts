import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { serverEnv } from "./env";

export async function supabaseAuthClient() {
  const { supabaseUrl, supabaseAnonKey } = serverEnv();
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a Server Component — middleware refreshes the session instead */
        }
      },
    },
  });
}

export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return serverEnv().adminEmails.includes(email.toLowerCase());
}

/** Returns the signed-in admin's email, or null. Checks BOTH a valid Supabase session and the allow-list. */
export async function currentAdmin(): Promise<string | null> {
  const env = serverEnv();
  if (env.devAdminBypass) return "dev-admin@localhost";
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null;
  const supabase = await supabaseAuthClient();
  const { data } = await supabase.auth.getUser(); // verifies the JWT with Supabase (not just the cookie)
  return isAllowedAdmin(data.user?.email) ? data.user!.email!.toLowerCase() : null;
}

/** Guard for admin pages and server actions. Enforced again here even though middleware also checks. */
export async function requireAdmin(): Promise<string> {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
