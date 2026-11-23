import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listLeads, listTrials } from "@/lib/db";
import { fmtDateTime } from "@/lib/admin";
import { AdminHeader, Empty, td, th } from "@/components/admin/ui";
import { updateTrialAction } from "../../actions";

export const metadata = { title: "Intro sessions" };

export default async function TrialsPage() {
  await requireAdmin();
  const [trials, leads] = await Promise.all([listTrials(), listLeads()]);
  const byId = new Map(leads.map((l) => [l.id, l]));
  return (
    <>
      <AdminHeader title="Intro sessions" sub="Schedule new ones from a lead’s page." />
      {trials.length === 0 ? (
        <Empty>No intro sessions scheduled yet.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-line bg-mist/60"><tr><th className={th}>When (IST)</th><th className={th}>Family</th><th className={th}>Mentor</th><th className={th}>Outcome</th></tr></thead>
            <tbody className="divide-y divide-line">
              {trials.map((t) => {
                const l = byId.get(t.lead_id);
                return (
                  <tr key={t.id}>
                    <td className={td}>{fmtDateTime(t.scheduled_at)}</td>
                    <td className={td}>{l ? <Link className="font-semibold hover:text-violet" href={`/admin/leads/${l.id}`}>{l.parent_name}</Link> : "—"}<div className="text-xs text-muted">{l?.child_first_name} · {l?.class_group}</div></td>
                    <td className={td}>{t.mentor_name ?? "—"}</td>
                    <td className={td}>
                      <form action={updateTrialAction} className="flex flex-wrap items-center gap-1">
                        <input type="hidden" name="id" value={t.id} />
                        <select name="status" defaultValue={t.status} className="rounded-lg border border-line px-2 py-1 text-xs" aria-label="Outcome">
                          {["scheduled", "completed", "no_show", "cancelled"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                        </select>
                        <input name="notes" defaultValue={t.notes ?? ""} placeholder="Notes" className="rounded-lg border border-line px-2 py-1 text-xs" aria-label="Notes" />
                        <button className="rounded-lg bg-mist px-2 py-1 text-xs font-semibold">Save</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
