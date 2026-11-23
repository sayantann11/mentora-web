import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listLeads } from "@/lib/db";
import { followupsDue, fmtDateTime, istDate, waTemplates } from "@/lib/admin";
import { AdminHeader, Badge, ContactLinks, Empty } from "@/components/admin/ui";
import { snoozeFollowupAction, updateLeadAction } from "../../actions";

export const metadata = { title: "Follow-ups today" };

export default async function FollowupsPage() {
  await requireAdmin();
  const due = followupsDue(await listLeads());
  const today = istDate();
  return (
    <>
      <AdminHeader title="Follow-ups due today" sub={`${due.length} to contact · overdue items first`} />
      {due.length === 0 ? (
        <Empty>You’re all caught up.</Empty>
      ) : (
        <ul className="grid gap-3">
          {due.map((l) => {
            const overdue = istDate(l.next_followup_at!) < today;
            const msg = l.status === "new" ? waTemplates.firstContact(l) : l.status === "trial_done" ? waTemplates.enrollLink(l) : waTemplates.followUp(l);
            return (
              <li key={l.id} className={`rounded-2xl border bg-white p-4 ${overdue ? "border-status-red/30" : "border-line"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/admin/leads/${l.id}`} className="text-lg font-semibold text-ink hover:text-violet">{l.parent_name}</Link>
                    <p className="text-sm text-muted">{l.child_first_name} · Classes {l.class_group} · {l.focus_area?.replace(/_/g, " ") ?? "—"} · {l.phone_e164}</p>
                    <p className="mt-1 flex items-center gap-2 text-xs">
                      <Badge value={l.status} />
                      <span className={overdue ? "font-semibold text-status-red" : "text-muted"}>{overdue ? "Overdue · " : ""}{fmtDateTime(l.next_followup_at)}</span>
                    </p>
                    {l.owner_notes && <p className="mt-2 max-w-xl text-sm text-ink-soft">📝 {l.owner_notes}</p>}
                  </div>
                  <ContactLinks phone={l.phone_e164} email={l.email} message={msg} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[1, 2, 7].map((d) => (
                    <form key={d} action={snoozeFollowupAction}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="days" value={d} />
                      <button className="rounded-lg bg-mist px-3 py-1.5 text-xs font-semibold">Contacted · follow up in {d}d</button>
                    </form>
                  ))}
                  <form action={updateLeadAction}>
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="lost_reason" value="No response" />
                    <button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:bg-mist">Mark lost (no response)</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
