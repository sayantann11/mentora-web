"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, supabaseAuthClient } from "@/lib/auth";
import {
  anonymizeLead,
  audit,
  createEnrollment,
  createTrial,
  getEnrollment,
  getLead,
  openRenewal,
  recordRefund,
  rejectPayment,
  updateLead,
  updateTrial,
  verifyPayment,
  db,
  type SchoolEnquiry,
  type Enrollment,
} from "@/lib/db";
import { leadStatuses } from "@/lib/validation";
import { emails } from "@/lib/email";
import { site } from "@/content/site";
import { serverEnv } from "@/lib/env";

const uuid = z.uuid();
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
/** datetime-local (IST, no zone) -> ISO */
const istToIso = (v: string) => (v ? new Date(`${v.length === 10 ? `${v}T10:00` : v}:00+05:30`).toISOString() : null);

function refresh(...paths: string[]) {
  ["/admin", ...paths].forEach((p) => revalidatePath(p));
}

// ───────────── leads ─────────────
export async function updateLeadAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = uuid.parse(str(fd, "id"));
  const patch: Record<string, unknown> = {};
  if (fd.has("status")) patch.status = z.enum(leadStatuses).parse(str(fd, "status"));
  if (fd.has("next_followup_at")) patch.next_followup_at = istToIso(str(fd, "next_followup_at"));
  if (fd.has("owner_notes")) patch.owner_notes = str(fd, "owner_notes").slice(0, 4000) || null;
  if (fd.has("lost_reason")) {
    patch.lost_reason = str(fd, "lost_reason").slice(0, 300) || "Not specified";
    patch.status = "lost";
    patch.next_followup_at = null;
  }
  await updateLead(id, patch);
  await audit(admin, "lead.update", id, { fields: Object.keys(patch) });
  refresh("/admin/leads", `/admin/leads/${id}`, "/admin/followups");
}

export async function snoozeFollowupAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = uuid.parse(str(fd, "id"));
  const days = z.coerce.number().int().min(0).max(30).parse(str(fd, "days"));
  const d = new Date(Date.now() + days * 86_400_000);
  const lead = await getLead(id);
  await updateLead(id, { next_followup_at: d.toISOString(), ...(lead?.status === "new" ? { status: "contacted" as const } : {}) });
  await audit(admin, "lead.snooze", id, { days });
  refresh("/admin/leads", "/admin/followups");
}

export async function anonymizeLeadAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = uuid.parse(str(fd, "id"));
  if (str(fd, "confirm") !== "ANONYMISE") throw new Error("Type ANONYMISE to confirm");
  await anonymizeLead(id);
  await audit(admin, "lead.anonymize", id);
  refresh("/admin/leads", `/admin/leads/${id}`);
}

export async function scheduleTrialAction(fd: FormData) {
  const admin = await requireAdmin();
  const leadId = uuid.parse(str(fd, "lead_id"));
  const when = istToIso(str(fd, "scheduled_at"));
  if (!when) throw new Error("Pick a date and time");
  await createTrial({ lead_id: leadId, scheduled_at: when, mentor_name: str(fd, "mentor_name") || null, status: "scheduled", notes: null });
  await updateLead(leadId, { status: "trial_scheduled", next_followup_at: when });
  await audit(admin, "trial.create", leadId);
  refresh("/admin/leads", `/admin/leads/${leadId}`, "/admin/trials");
}

export async function updateTrialAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = uuid.parse(str(fd, "id"));
  const status = z.enum(["scheduled", "completed", "no_show", "cancelled"]).parse(str(fd, "status"));
  const t = await updateTrial(id, { status, notes: str(fd, "notes") || null });
  if (status === "completed") await updateLead(t.lead_id, { status: "trial_done", next_followup_at: new Date().toISOString() });
  await audit(admin, "trial.update", id, { status });
  refresh("/admin/trials", `/admin/leads/${t.lead_id}`);
}

export async function createEnrollmentAction(fd: FormData) {
  const admin = await requireAdmin();
  const leadId = uuid.parse(str(fd, "lead_id"));
  const { enrollment } = await createEnrollment(leadId);
  await audit(admin, "enrollment.create", enrollment.id, { leadId });
  refresh(`/admin/leads/${leadId}`, "/admin/enrollments");
}

// ───────────── payments ─────────────
export async function verifyPaymentAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = uuid.parse(str(fd, "id"));
  if (fd.get("confirm_statement") !== "on") throw new Error("Confirm you checked your bank/UPI statement");
  const res = await verifyPayment(id, admin);
  if (res) {
    await audit(admin, "payment.verify", id, { reference: res.payment.reference_code, utr: res.payment.utr });
    const lead = await getLead(res.enrollment.lead_id);
    if (lead?.email)
      await emails.paymentVerified(
        lead.email,
        lead.parent_name,
        res.enrollment.reference_code,
        res.payment.amount_paise,
        `${site.url}/receipt/${res.enrollment.access_token}?p=${res.payment.id}`,
        res.periodStart,
        res.renewal,
      );
  }
  refresh("/admin/payments", "/admin/enrollments");
}

export async function rejectPaymentAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = uuid.parse(str(fd, "id"));
  const reason = z.string().min(3, "Give a reason").max(300).parse(str(fd, "reason"));
  const p = await rejectPayment(id, admin, reason);
  if (p) {
    await audit(admin, "payment.reject", id, { reason });
    const enr = await getEnrollment(p.enrollment_id);
    const lead = enr ? await getLead(enr.lead_id) : null;
    if (enr && lead?.email) await emails.paymentRejected(lead.email, lead.parent_name, enr.reference_code, reason, `${site.url}/pay/${enr.access_token}`);
  }
  refresh("/admin/payments");
}

export async function refundAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = uuid.parse(str(fd, "id"));
  const rupees = z.coerce.number().positive().max(100000).parse(str(fd, "amount"));
  const note = z.string().min(3).max(300).parse(str(fd, "note"));
  await recordRefund(id, admin, Math.round(rupees * 100), note);
  await audit(admin, "payment.refund", id, { rupees, note });
  refresh("/admin/payments");
}

export async function sendRenewalAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = uuid.parse(str(fd, "enrollment_id"));
  const r = await openRenewal(id);
  if (!r) throw new Error("Enrollment has no renewal date");
  const lead = await getLead(r.enrollment.lead_id);
  if (lead?.email)
    await emails.renewalReminder(lead.email, lead.parent_name, lead.child_first_name, r.enrollment.next_renewal_date!, `${site.url}/pay/${r.enrollment.access_token}`, r.payment.amount_paise);
  await audit(admin, "renewal.send", id, { payment: r.payment.id });
  refresh("/admin/enrollments", "/admin/payments");
}

export async function setEnrollmentStatusAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = uuid.parse(str(fd, "id"));
  const status = z.enum(["active", "lapsed", "cancelled"]).parse(str(fd, "status"));
  await db().update<Enrollment>("enrollments", id, { status });
  await audit(admin, "enrollment.status", id, { status });
  refresh("/admin/enrollments");
}

export async function updateSchoolAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = uuid.parse(str(fd, "id"));
  const status = z.enum(["new", "contacted", "closed"]).parse(str(fd, "status"));
  await db().update<SchoolEnquiry>("school_enquiries", id, { status });
  await audit(admin, "school.status", id, { status });
  refresh("/admin/schools");
}

export async function signOutAction() {
  if (!serverEnv().devAdminBypass) {
    const supabase = await supabaseAuthClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
