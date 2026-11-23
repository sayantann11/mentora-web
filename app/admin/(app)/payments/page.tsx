import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { audit, listEnrollments, listLeads, listPayments } from "@/lib/db";
import { fmtDateTime, waTemplates, waTo } from "@/lib/admin";
import { formatINR } from "@/lib/pricing";
import { screenshotUrl } from "@/lib/storage";
import { AdminHeader, Badge, Empty, Panel, td, th } from "@/components/admin/ui";
import { refundAction, rejectPaymentAction, verifyPaymentAction } from "../../actions";

export const metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const admin = await requireAdmin();
  const [payments, enrollments, leads] = await Promise.all([listPayments(), listEnrollments(), listLeads()]);
  const enr = new Map(enrollments.map((e) => [e.id, e]));
  const lead = new Map(leads.map((l) => [l.id, l]));
  const queue = payments.filter((p) => p.status === "submitted").sort((a, b) => (a.submitted_at ?? "").localeCompare(b.submitted_at ?? ""));
  const shots = new Map(await Promise.all(queue.filter((p) => p.screenshot_path).map(async (p) => [p.id, await screenshotUrl(p.screenshot_path!)] as const)));
  if (shots.size) await audit(admin, "screenshot.view", null, { payments: [...shots.keys()] });

  return (
    <>
      <AdminHeader title="Payments" actions={<a className="btn btn-ghost btn-sm" href="/admin/api/export?type=payments">Export ledger (CSV)</a>} />

      <Panel title={`Payments to verify (${queue.length})`}>
        <p role="note" className="mb-4 flex gap-2 rounded-xl border border-status-yellow/40 bg-peach/30 p-3 text-sm font-medium text-ink">
          <AlertTriangle aria-hidden size={18} className="shrink-0 text-status-yellow" />
          Confirm the credit in your bank/UPI app statement before verifying. Never rely on a screenshot alone.
        </p>
        {queue.length === 0 ? (
          <Empty>No payments waiting. New submissions appear here and are emailed to you.</Empty>
        ) : (
          <ul className="grid gap-4">
            {queue.map((p) => {
              const e = enr.get(p.enrollment_id);
              const l = e ? lead.get(e.lead_id) : undefined;
              const shot = shots.get(p.id);
              return (
                <li key={p.id} className="rounded-2xl border border-line p-4">
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                      <div><dt className="text-muted">Parent</dt><dd className="font-semibold">{l ? <Link href={`/admin/leads/${l.id}`} className="hover:text-violet">{l.parent_name}</Link> : "—"}</dd></div>
                      <div><dt className="text-muted">Child · class</dt><dd>{l?.child_first_name} · {l?.class_group}</dd></div>
                      <div><dt className="text-muted">Amount expected</dt><dd className="font-semibold">{formatINR(p.amount_paise)}</dd></div>
                      <div><dt className="text-muted">Reference</dt><dd className="font-mono">{p.reference_code}</dd></div>
                      <div><dt className="text-muted">UTR</dt><dd className="font-mono font-semibold">{p.utr}</dd></div>
                      <div><dt className="text-muted">Payer name</dt><dd>{p.payer_name}</dd></div>
                      <div><dt className="text-muted">Paid at (claimed)</dt><dd>{fmtDateTime(p.paid_at_claimed)}</dd></div>
                      <div><dt className="text-muted">Submitted</dt><dd>{fmtDateTime(p.submitted_at)}</dd></div>
                      <div><dt className="text-muted">Period</dt><dd>{p.period_start ?? "first month"}</dd></div>
                    </dl>
                    {shot ? (
                      <a href={shot} target="_blank" rel="noopener noreferrer" className="block w-32 justify-self-start" title="Opens a short-lived link">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={shot} alt="Payment screenshot submitted by parent" className="max-h-48 rounded-lg border border-line object-contain" />
                        <span className="text-xs text-muted">Screenshot (link expires in 2 min)</span>
                      </a>
                    ) : (
                      <span className="text-xs text-muted">No screenshot</span>
                    )}
                  </div>
                  <div className="mt-4 grid gap-3 border-t border-line pt-4 lg:grid-cols-2">
                    <form action={verifyPaymentAction} className="grid gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <label className="flex items-start gap-2 text-sm">
                        <input type="checkbox" name="confirm_statement" required className="mt-1 accent-[#2f7a4f]" />
                        I have seen {formatINR(p.amount_paise)} with UTR {p.utr} credited in my bank/UPI statement.
                      </label>
                      <button className="btn btn-sm justify-self-start bg-status-green text-white">Verify payment</button>
                    </form>
                    <form action={rejectPaymentAction} className="grid gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <input name="reason" required minLength={3} placeholder="Reason, e.g. UTR not found in statement" className="field py-2 text-sm" aria-label="Reject reason" />
                      <button className="btn btn-sm justify-self-start border border-status-red/40 text-status-red">Reject</button>
                    </form>
                  </div>
                  {l && e && l.phone_e164 !== "redacted" && (
                    <p className="mt-3 flex gap-4 text-xs">
                      <a className="link" target="_blank" rel="noopener noreferrer" href={waTo(l.phone_e164, waTemplates.verified(l, e))}>WhatsApp: confirmed message</a>
                      <a className="link" target="_blank" rel="noopener noreferrer" href={waTo(l.phone_e164, waTemplates.rejected(l, e))}>WhatsApp: please re-check</a>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <div className="mt-6">
        <Panel title="All payments">
          {payments.length === 0 ? (
            <Empty>No payments yet.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-line"><tr><th className={th}>Reference</th><th className={th}>Parent</th><th className={th}>Amount</th><th className={th}>Status</th><th className={th}>UTR</th><th className={th}>Verified</th><th className={th}>Receipt</th><th className={th}>Refund</th></tr></thead>
                <tbody className="divide-y divide-line">
                  {payments.map((p) => {
                    const e = enr.get(p.enrollment_id);
                    const l = e ? lead.get(e.lead_id) : undefined;
                    return (
                      <tr key={p.id}>
                        <td className={`${td} font-mono`}>{p.reference_code}<div className="text-xs text-muted">{p.period_start ?? "first month"}</div></td>
                        <td className={td}>{l?.parent_name ?? "—"}</td>
                        <td className={td}>{formatINR(p.amount_paise)}</td>
                        <td className={td}><Badge value={p.status} />{p.reject_reason && <div className="max-w-48 text-xs text-muted">{p.reject_reason}</div>}</td>
                        <td className={`${td} font-mono text-xs`}>{p.utr ?? "—"}</td>
                        <td className={td}>{fmtDateTime(p.verified_at)}<div className="text-xs text-muted">{p.verified_by}</div></td>
                        <td className={td}>{p.receipt_number && e ? <a className="link text-xs" href={`/receipt/${e.access_token}?p=${p.id}`} target="_blank">{p.receipt_number}</a> : "—"}</td>
                        <td className={td}>
                          {p.status === "verified" ? (
                            <form action={refundAction} className="flex flex-wrap gap-1">
                              <input type="hidden" name="id" value={p.id} />
                              <input name="amount" type="number" step="0.01" min="1" max={p.amount_paise / 100} placeholder="₹" className="w-20 rounded-lg border border-line px-2 py-1 text-xs" aria-label="Refund amount in rupees" required />
                              <input name="note" placeholder="Reason / UPI ref" className="w-36 rounded-lg border border-line px-2 py-1 text-xs" aria-label="Refund note" required />
                              <button className="rounded-lg bg-mist px-2 py-1 text-xs font-semibold">Record</button>
                            </form>
                          ) : p.status === "refunded" ? (
                            <span className="text-xs">{formatINR(p.refund_amount_paise ?? 0)} · {p.refund_note}</span>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-muted">Refunds are sent by you from your UPI app; this only records them. See the refund policy for timelines.</p>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
