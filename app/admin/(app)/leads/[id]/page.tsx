import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getLead, listEnrollments, listPayments, listTrials, db, type Consent } from "@/lib/db";
import { leadStatuses } from "@/lib/validation";
import { fmtDateTime, istDate, waTemplates, waTo } from "@/lib/admin";
import { formatINR } from "@/lib/pricing";
import { site } from "@/content/site";
import { AdminHeader, Badge, ContactLinks, Panel } from "@/components/admin/ui";
import { CopyButton } from "@/components/pay/CopyButton";
import { anonymizeLeadAction, createEnrollmentAction, scheduleTrialAction, updateLeadAction } from "../../../actions";

export const metadata = { title: "Lead" };

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const lead = await getLead(id);
  if (!lead) notFound();
  const [trials, enrollments, payments, consent] = await Promise.all([
    listTrials().then((t) => t.filter((x) => x.lead_id === id)),
    listEnrollments().then((e) => e.filter((x) => x.lead_id === id)),
    listPayments(),
    lead.consent_id ? db().get<Consent>("consents", lead.consent_id) : Promise.resolve(null),
  ]);
  const enrollUrl = `${site.url}/enroll?lead=${lead.enroll_token}`;
  const redacted = Boolean(lead.anonymized_at);

  return (
    <>
      <Link href="/admin/leads" className="text-sm text-muted hover:text-violet">← All leads</Link>
      <AdminHeader
        title={lead.parent_name}
        sub={<>Child: {lead.child_first_name} · Classes {lead.class_group} · created {fmtDateTime(lead.created_at)}</>}
        actions={<div className="flex items-center gap-2"><Badge value={lead.status} /><ContactLinks phone={lead.phone_e164} email={lead.email} message={waTemplates.followUp(lead)} /></div>}
      />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-6">
          <Panel title="Details">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {[
                ["WhatsApp", lead.phone_e164],
                ["Email", lead.email ?? "—"],
                ["Focus area", lead.focus_area?.replace(/_/g, " ") ?? "—"],
                ["Preferred slots", lead.preferred_slots.map((s) => s.replace(/_/g, " ")).join(", ") || "—"],
                ["City", lead.city ?? "—"],
                ["Heard from", lead.heard_from ?? "—"],
                ["Source / medium", `${lead.utm_source ?? "direct"} / ${lead.utm_medium ?? "—"}`],
                ["Campaign", lead.utm_campaign ?? "—"],
                ["Landing page", lead.landing_page ?? "—"],
                ["Referrer", lead.referrer ?? "—"],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-muted">{k}</dt><dd className="break-words font-medium text-ink">{v}</dd></div>
              ))}
            </dl>
            {lead.note && <p className="mt-4 rounded-xl bg-mist p-3 text-sm"><strong>Parent’s note:</strong> {lead.note}</p>}
            {consent && <p className="mt-3 text-xs text-muted">Consent: {consent.purpose} · policy {consent.policy_version} · {fmtDateTime(consent.accepted_at)}</p>}
          </Panel>

          <Panel title="Status, follow-up & notes">
            <form action={updateLeadAction} className="grid gap-3">
              <input type="hidden" name="id" value={lead.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">Status
                  <select name="status" defaultValue={lead.status} className="field mt-1 py-2">
                    {leadStatuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </label>
                <label className="text-sm">Next follow-up
                  <input type="datetime-local" name="next_followup_at" defaultValue={lead.next_followup_at ? new Date(new Date(lead.next_followup_at).getTime() + 5.5 * 3600_000).toISOString().slice(0, 16) : ""} className="field mt-1 py-2" />
                </label>
              </div>
              <label className="text-sm">Private notes
                <textarea name="owner_notes" defaultValue={lead.owner_notes ?? ""} className="field mt-1 min-h-28" />
              </label>
              <button className="btn btn-primary btn-sm justify-self-start">Save</button>
            </form>
          </Panel>

          <Panel title="Intro session">
            {trials.length > 0 && (
              <ul className="mb-4 grid gap-2 text-sm">
                {trials.map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded-xl bg-mist px-3 py-2">
                    <span>{fmtDateTime(t.scheduled_at)} · {t.mentor_name ?? "mentor TBC"}</span>
                    <Badge value={t.status} />
                  </li>
                ))}
              </ul>
            )}
            <form action={scheduleTrialAction} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input type="hidden" name="lead_id" value={lead.id} />
              <input type="datetime-local" name="scheduled_at" required className="field py-2" aria-label="Intro session date and time (IST)" />
              <input name="mentor_name" placeholder="Mentor name" className="field py-2" aria-label="Mentor name" />
              <button className="btn btn-primary btn-sm">Schedule</button>
            </form>
          </Panel>
        </div>

        <div className="grid content-start gap-6">
          <Panel title="Enroll & pay">
            <p className="text-sm text-ink-soft">Send the parent their personal enrollment link after the intro session:</p>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-mist p-2">
              <code className="min-w-0 flex-1 truncate text-xs">{enrollUrl}</code>
              <CopyButton value={enrollUrl} label="enrollment link" />
            </div>
            {!redacted && (
              <a href={waTo(lead.phone_e164, waTemplates.enrollLink(lead))} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm mt-3 w-full">
                Send enrollment link on WhatsApp
              </a>
            )}
            {enrollments.map((e) => {
              const ps = payments.filter((p) => p.enrollment_id === e.id);
              const payUrl = `${site.url}/pay/${e.access_token}`;
              return (
                <div key={e.id} className="mt-4 rounded-xl border border-line p-3 text-sm">
                  <div className="flex items-center justify-between"><strong className="font-mono">{e.reference_code}</strong><Badge value={e.status} /></div>
                  <p className="mt-1 text-muted">Renewal: {e.next_renewal_date ?? "—"}</p>
                  <ul className="mt-2 grid gap-1">
                    {ps.map((p) => <li key={p.id} className="flex justify-between text-xs"><span>{p.period_start ?? "first month"} · {formatINR(p.amount_paise)}</span><Badge value={p.status} /></li>)}
                  </ul>
                  <div className="mt-2 flex items-center gap-2"><code className="min-w-0 flex-1 truncate text-xs">{payUrl}</code><CopyButton value={payUrl} label="payment link" /></div>
                  {!redacted && <a href={waTo(lead.phone_e164, waTemplates.payLink(lead, e))} target="_blank" rel="noopener noreferrer" className="link mt-2 inline-block text-xs">Send pay link on WhatsApp</a>}
                </div>
              );
            })}
            {enrollments.length === 0 && (
              <form action={createEnrollmentAction} className="mt-3">
                <input type="hidden" name="lead_id" value={lead.id} />
                <button className="btn btn-primary btn-sm w-full">Create enrollment + pay link now</button>
              </form>
            )}
          </Panel>

          <Panel title="Mark as lost">
            <form action={updateLeadAction} className="flex gap-2">
              <input type="hidden" name="id" value={lead.id} />
              <select name="lost_reason" className="field py-2" aria-label="Reason" defaultValue="">
                <option value="" disabled>Reason…</option>
                {["Price", "Timing / schedule", "Child not interested", "Chose another service", "No response", "Not a fit", "Other"].map((r) => <option key={r}>{r}</option>)}
              </select>
              <button className="btn btn-ghost btn-sm">Mark lost</button>
            </form>
            {lead.lost_reason && <p className="mt-2 text-sm text-muted">Lost: {lead.lost_reason}</p>}
          </Panel>

          <Panel title="Data request: anonymise">
            {redacted ? (
              <p className="text-sm text-muted">Anonymised on {fmtDateTime(lead.anonymized_at)}.</p>
            ) : (
              <form action={anonymizeLeadAction} className="grid gap-2">
                <input type="hidden" name="id" value={lead.id} />
                <p className="text-sm text-ink-soft">Removes the parent’s name, phone, email, child’s name and notes. Payment records stay for accounting. This can’t be undone.</p>
                <input name="confirm" placeholder="Type ANONYMISE to confirm" className="field py-2" required pattern="ANONYMISE" aria-label="Type ANONYMISE to confirm" />
                <button className="btn btn-sm border border-status-red/40 text-status-red">Anonymise lead</button>
              </form>
            )}
          </Panel>
          <p className="text-xs text-muted">Last follow-up date: {lead.next_followup_at ? istDate(lead.next_followup_at) : "—"}</p>
        </div>
      </div>
    </>
  );
}
