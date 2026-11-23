import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listEnrollments, listLeads, listPayments, listTrials } from "@/lib/db";
import { computeStats, followupsDue, renewalsDue, waTemplates, fmtDateTime } from "@/lib/admin";
import { formatINR } from "@/lib/pricing";
import { AdminHeader, Badge, ContactLinks, Empty, Panel } from "@/components/admin/ui";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  await requireAdmin();
  const [leads, trials, enrollments, payments] = await Promise.all([listLeads(), listTrials(), listEnrollments(), listPayments()]);
  const s = computeStats(leads, trials, enrollments, payments);
  const due = followupsDue(leads).slice(0, 8);
  const renewals = renewalsDue(enrollments);
  const leadById = new Map(leads.map((l) => [l.id, l]));
  const maxSource = Math.max(1, ...s.bySource.map(([, n]) => n));

  const tiles = [
    { label: "Leads this week", value: String(s.leadsThisWeek) },
    { label: "Intro → enrolled", value: s.conversionPct === null ? "—" : `${s.conversionPct}%`, sub: `${s.convertedFromTrial} of ${s.trials} intro sessions` },
    { label: "Revenue this month", value: formatINR(s.revenueMonth), sub: "verified, net of refunds" },
    { label: "Active students", value: String(s.active) },
  ];

  return (
    <>
      <AdminHeader title="Dashboard" sub={new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long" })} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-muted">{t.label}</p>
            <p className="mt-1 font-display text-3xl font-medium text-ink">{t.value}</p>
            {t.sub && <p className="mt-1 text-xs text-muted">{t.sub}</p>}
          </div>
        ))}
      </div>

      {s.toVerify > 0 && (
        <Link href="/admin/payments" className="mt-4 flex items-center justify-between rounded-2xl bg-plum px-5 py-4 text-white">
          <span><strong>{s.toVerify}</strong> payment{s.toVerify > 1 ? "s" : ""} waiting for verification</span>
          <span className="font-semibold">Open queue →</span>
        </Link>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Follow-ups due today" action={<Link href="/admin/followups" className="link text-sm">All →</Link>}>
          {due.length === 0 ? (
            <Empty>Nothing due. 🎉</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {due.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link href={`/admin/leads/${l.id}`} className="font-semibold text-ink hover:text-violet">{l.parent_name}</Link>{" "}
                    <span className="text-sm text-muted">· {l.child_first_name}, Classes {l.class_group}</span>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                      <Badge value={l.status} /> due {fmtDateTime(l.next_followup_at)}
                    </div>
                  </div>
                  <ContactLinks phone={l.phone_e164} email={l.email} message={l.status === "new" ? waTemplates.firstContact(l) : l.status === "trial_done" ? waTemplates.enrollLink(l) : waTemplates.followUp(l)} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Leads by source">
          {s.bySource.length === 0 ? (
            <Empty>No leads yet.</Empty>
          ) : (
            <ul className="grid gap-2.5" aria-label="Number of leads by source">
              {s.bySource.map(([src, n]) => (
                <li key={src} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-sm" title={`${src}: ${n} lead${n > 1 ? "s" : ""}`}>
                  <span className="truncate text-ink-soft">{src}</span>
                  <span className="h-3 rounded-r-[4px] bg-violet" style={{ width: `${(n / maxSource) * 100}%`, minWidth: 4 }} aria-hidden />
                  <span className="font-semibold text-ink tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Renewals due in the next 7 days" action={<Link href="/admin/enrollments" className="link text-sm">Manage →</Link>}>
          {renewals.length === 0 ? (
            <Empty>No renewals due this week.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {renewals.map((e) => {
                const l = leadById.get(e.lead_id);
                return (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <span>
                      <strong>{l?.parent_name}</strong> · {l?.child_first_name} · {e.reference_code}
                    </span>
                    <span className="text-muted">due {e.next_renewal_date}</span>
                    {l && <ContactLinks phone={l.phone_e164} email={l.email} message={waTemplates.renewal(l, e)} />}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
