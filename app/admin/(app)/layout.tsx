import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { followupsDue } from "@/lib/admin";
import { listLeads, listPayments } from "@/lib/db";
import { NavLink } from "@/components/admin/ui";
import { BrandMark } from "@/components/ui/Brand";
import { signOutAction } from "../actions";
import { serverEnv, supabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Mentora admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [leads, submitted] = await Promise.all([listLeads(), listPayments("submitted")]);
  const due = followupsDue(leads).length;
  const env = serverEnv();
  return (
    <div className="min-h-screen bg-mist lg:grid lg:grid-cols-[230px_1fr]">
      <aside className="bg-plum-deep p-4 text-white lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center gap-2 px-2 py-2">
          <BrandMark className="h-8 w-8" />
          <span className="font-display text-lg font-semibold">mentora admin</span>
        </div>
        <nav aria-label="Admin" className="mt-4 grid gap-0.5">
          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/followups" count={due}>Follow-ups today</NavLink>
          <NavLink href="/admin/leads">Leads</NavLink>
          <NavLink href="/admin/trials">Intro sessions</NavLink>
          <NavLink href="/admin/payments" count={submitted.length}>Payments</NavLink>
          <NavLink href="/admin/enrollments">Enrollments & renewals</NavLink>
          <NavLink href="/admin/schools">School enquiries</NavLink>
          <NavLink href="/admin/audit">Audit log</NavLink>
        </nav>
        <div className="mt-6 border-t border-white/10 px-2 pt-4 text-xs text-white/60">
          <p className="truncate">{admin}</p>
          <form action={signOutAction}>
            <button type="submit" className="mt-2 text-white/80 underline">Sign out</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 p-4 sm:p-8">
        {!supabaseConfigured() && (
          <p className="mb-4 rounded-xl bg-peach/50 px-4 py-2 text-sm text-ink">
            Dev mode: using the local JSON database (.data/db.json){env.devAdminBypass ? " and DEV_ADMIN_BYPASS" : ""}. Configure Supabase before launch.
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
