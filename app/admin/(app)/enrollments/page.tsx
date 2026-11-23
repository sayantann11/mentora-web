import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listEnrollments, listLeads, listPayments } from "@/lib/db";
import { renewalsDue, waTemplates, waTo, fmtDateTime } from "@/lib/admin";
import { formatINR } from "@/lib/pricing";
import { AdminHeader, Badge, Empty, Panel, td, th } from "@/components/admin/ui";
import { sendRenewalAction, setEnrollmentStatusAction } from "../../actions";

export const metadata = { title: "Enrollments & renewals" };

export default async function EnrollmentsPage() {
  await requireAdmin();
  const [enrollments, leads, payments] = await Promise.all([listEnrollments(), listLeads(), listPayments()]);
  const lead = new Map(leads.map((l) => [l.id, l]));
  const due = renewalsDue(enrollments);
  const openFor = (id: string) => payments.find((p) => p.enrollment_id === id && (p.status === "awaiting_payment" || p.status === "submitted"));
  const groups = {
    pending: enrollments.filter((e) => e.status === "awaiting_payment" || e.status === "payment_submitted"),
    active: enrollments.filter((e) => e.status === "active"),
    other: enrollments.filter((e) => e.status === "lapsed" || e.status === "cancelled"),
  };
  const failed = payments.filter((p) => p.status === "rejected");

  return (
    <>
      <AdminHeader title="Enrollments & renewals" sub={`${groups.active.length} active · ${groups.pending.length} pending payment`} />
      <Panel title="Renewals due in the next 7 days">
        {due.length === 0 ? (
          <Empty>No renewals due this week.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {due.map((e) => {
              const l = lead.get(e.lead_id);
              const open = openFor(e.id);
              return (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span><strong>{l?.parent_name}</strong> · {l?.child_first_name} · <span className="font-mono">{e.reference_code}</span> · due <strong>{e.next_renewal_date}</strong></span>
                  <span className="flex flex-wrap items-center gap-2">
                    {open ? <Badge value={open.status} /> : null}
                    <form action={sendRenewalAction}>
                      <input type="hidden" name="enrollment_id" value={e.id} />
                      <button className="btn btn-primary btn-sm">{open ? "Re-send email reminder" : "Create next month + email"}</button>
                    </form>
                    {l && l.phone_e164 !== "redacted" && (
                      <a href={waTo(l.phone_e164, waTemplates.renewal(l, e))} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">WhatsApp reminder</a>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted">“Create next month” adds a new payment row on the same /pay link, so the parent’s link always shows the current amount due.</p>
      </Panel>

      {failed.length > 0 && (
        <div className="mt-6">
          <Panel title="Rejected / failed payments">
            <ul className="grid gap-2 text-sm">
              {failed.map((p) => <li key={p.id} className="flex justify-between gap-3"><span className="font-mono">{p.reference_code}</span><span className="text-muted">{p.reject_reason}</span></li>)}
            </ul>
          </Panel>
        </div>
      )}

      {(["pending", "active", "other"] as const).map((g) => (
        <div key={g} className="mt-6">
          <Panel title={g === "pending" ? "Pending payment" : g === "active" ? "Active (paid)" : "Lapsed / cancelled"}>
            {groups[g].length === 0 ? (
              <Empty>None.</Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="border-b border-line"><tr><th className={th}>Family</th><th className={th}>Reference</th><th className={th}>Amount</th><th className={th}>Status</th><th className={th}>Start</th><th className={th}>Next renewal</th><th className={th}>Change</th></tr></thead>
                  <tbody className="divide-y divide-line">
                    {groups[g].map((e) => {
                      const l = lead.get(e.lead_id);
                      return (
                        <tr key={e.id}>
                          <td className={td}>{l ? <Link href={`/admin/leads/${l.id}`} className="font-semibold hover:text-violet">{l.parent_name}</Link> : "—"}<div className="text-xs text-muted">{l?.child_first_name} · {l?.class_group}</div></td>
                          <td className={`${td} font-mono`}>{e.reference_code}<div className="text-xs text-muted">{fmtDateTime(e.created_at)}</div></td>
                          <td className={td}>{formatINR(e.amount_paise)}</td>
                          <td className={td}><Badge value={e.status} /></td>
                          <td className={td}>{e.start_date ?? "—"}</td>
                          <td className={td}>{e.next_renewal_date ?? "—"}</td>
                          <td className={td}>
                            <form action={setEnrollmentStatusAction} className="flex gap-1">
                              <input type="hidden" name="id" value={e.id} />
                              <select name="status" defaultValue={e.status === "active" || e.status === "lapsed" || e.status === "cancelled" ? e.status : "active"} className="rounded-lg border border-line px-2 py-1 text-xs" aria-label="Enrollment status">
                                <option value="active">active</option><option value="lapsed">lapsed</option><option value="cancelled">cancelled</option>
                              </select>
                              <button className="rounded-lg bg-mist px-2 py-1 text-xs font-semibold">Set</button>
                            </form>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      ))}
    </>
  );
}
