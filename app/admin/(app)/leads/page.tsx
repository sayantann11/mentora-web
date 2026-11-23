import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listLeads, type Lead } from "@/lib/db";
import { leadStatuses } from "@/lib/validation";
import { fmtDateTime, istDate, waTemplates } from "@/lib/admin";
import { AdminHeader, Badge, ContactLinks, Empty, td, th } from "@/components/admin/ui";
import { updateLeadAction } from "../../actions";

export const metadata = { title: "Leads" };

type SP = { q?: string; status?: string; class?: string; source?: string; from?: string; to?: string };

function filter(leads: Lead[], sp: SP) {
  const q = sp.q?.toLowerCase().trim();
  return leads.filter((l) => {
    if (sp.status && l.status !== sp.status) return false;
    if (sp.class && l.class_group !== sp.class) return false;
    if (sp.source && (l.utm_source ?? "direct") !== sp.source) return false;
    if (sp.from && istDate(l.created_at) < sp.from) return false;
    if (sp.to && istDate(l.created_at) > sp.to) return false;
    if (q && ![l.parent_name, l.child_first_name, l.phone_e164, l.email ?? "", l.city ?? ""].some((v) => v.toLowerCase().includes(q))) return false;
    return true;
  });
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await searchParams;
  const all = await listLeads();
  const leads = filter(all, sp);
  const sources = [...new Set(all.map((l) => l.utm_source ?? "direct"))].sort();
  const exportQs = new URLSearchParams({ type: "leads", ...Object.fromEntries(Object.entries(sp).filter(([, v]) => v)) }).toString();

  return (
    <>
      <AdminHeader
        title="Leads"
        sub={`${leads.length} of ${all.length}`}
        actions={<a href={`/admin/api/export?${exportQs}`} className="btn btn-ghost btn-sm">Export CSV</a>}
      />
      <form className="mb-4 grid gap-2 rounded-2xl border border-line bg-white p-3 sm:grid-cols-3 lg:grid-cols-7" role="search">
        <input name="q" defaultValue={sp.q} placeholder="Search name, phone, email…" className="field py-2 lg:col-span-2" aria-label="Search" />
        <select name="status" defaultValue={sp.status ?? ""} className="field py-2" aria-label="Status">
          <option value="">All statuses</option>
          {leadStatuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <select name="class" defaultValue={sp.class ?? ""} className="field py-2" aria-label="Class group">
          <option value="">All classes</option>
          <option value="3-5">3–5</option><option value="6-8">6–8</option><option value="9-12">9–12</option>
        </select>
        <select name="source" defaultValue={sp.source ?? ""} className="field py-2" aria-label="Source">
          <option value="">All sources</option>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" name="from" defaultValue={sp.from} className="field py-2" aria-label="From date" />
        <div className="flex gap-2">
          <input type="date" name="to" defaultValue={sp.to} className="field py-2" aria-label="To date" />
          <button className="btn btn-primary btn-sm">Filter</button>
        </div>
      </form>
      {leads.length === 0 ? (
        <Empty>No leads match these filters.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[960px]">
            <thead className="border-b border-line bg-mist/60">
              <tr>
                <th className={th}>Parent / child</th>
                <th className={th}>Class · focus</th>
                <th className={th}>Source</th>
                <th className={th}>Created</th>
                <th className={th}>Status</th>
                <th className={th}>Next follow-up</th>
                <th className={th}>Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-mist/40">
                  <td className={td}>
                    <Link href={`/admin/leads/${l.id}`} className="font-semibold text-ink hover:text-violet">{l.parent_name}</Link>
                    <div className="text-xs text-muted">{l.child_first_name} · {l.phone_e164}</div>
                  </td>
                  <td className={td}>{l.class_group}<div className="text-xs text-muted">{l.focus_area?.replace(/_/g, " ") ?? "—"}</div></td>
                  <td className={td}>{l.utm_source ?? "direct"}<div className="text-xs text-muted">{l.utm_campaign ?? ""}</div></td>
                  <td className={td}>{fmtDateTime(l.created_at)}</td>
                  <td className={td}>
                    <form action={updateLeadAction} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={l.id} />
                      <select name="status" defaultValue={l.status} className="rounded-lg border border-line bg-white px-2 py-1 text-xs" aria-label={`Status for ${l.parent_name}`}>
                        {leadStatuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                      </select>
                      <button className="rounded-lg bg-mist px-2 py-1 text-xs font-semibold">Save</button>
                    </form>
                    {l.anonymized_at && <Badge value="anonymised" />}
                  </td>
                  <td className={td}>
                    <form action={updateLeadAction} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={l.id} />
                      <input type="date" name="next_followup_at" defaultValue={l.next_followup_at ? istDate(l.next_followup_at) : ""} className="rounded-lg border border-line px-2 py-1 text-xs" aria-label={`Follow-up date for ${l.parent_name}`} />
                      <button className="rounded-lg bg-mist px-2 py-1 text-xs font-semibold">Set</button>
                    </form>
                  </td>
                  <td className={td}>
                    <ContactLinks phone={l.phone_e164} email={l.email} message={l.status === "new" ? waTemplates.firstContact(l) : waTemplates.followUp(l)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
