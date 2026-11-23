import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Protects /admin/*: requires a Supabase session whose email is in ADMIN_EMAILS.
 * Every admin page and server action re-checks via requireAdmin() (defence in depth).
 */
const PUBLIC_ADMIN = ["/admin/login", "/admin/auth/callback"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next({ request: req });
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  if (PUBLIC_ADMIN.some((p) => pathname.startsWith(p))) return res;

  if (process.env.NODE_ENV !== "production" && process.env.DEV_ADMIN_BYPASS === "true") return res;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const allow = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const toLogin = () => {
    const r = NextResponse.redirect(new URL("/admin/login", req.url));
    r.headers.set("X-Robots-Tag", "noindex, nofollow");
    return r;
  };
  if (!url || !anon) return toLogin();

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
    },
  });
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email || !allow.includes(email)) return toLogin();
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
