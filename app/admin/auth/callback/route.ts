import { NextResponse, type NextRequest } from "next/server";
import { isAllowedAdmin, supabaseAuthClient } from "@/lib/auth";

/** Magic-link landing: exchanges the one-time code for a session cookie, then re-checks the allow-list. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/admin/login?error=1", req.url));
  const supabase = await supabaseAuthClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !isAllowedAdmin(data.user?.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url));
  }
  return NextResponse.redirect(new URL("/admin", req.url));
}
