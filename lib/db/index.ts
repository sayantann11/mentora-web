import "server-only";
import { serverEnv, supabaseConfigured } from "@/lib/env";
import { randomToken, referenceCode } from "@/lib/ids";
import { addMonths, getPlan } from "@/lib/pricing";
import { POLICY_VERSION, consentText, type ConsentPurpose } from "@/content/consent";
import { UniqueViolationError, type DbAdapter } from "./adapter";
import { supabaseAdapter } from "./supabaseAdapter";
import { localAdapter } from "./localAdapter";
import type { AuditEntry, Consent, Enrollment, GuideSubscriber, Lead, NewLead, Payment, SchoolEnquiry, TrialSession } from "./types";

export { UniqueViolationError };
export type * from "./types";

export function db(): DbAdapter {
  if (supabaseConfigured()) return supabaseAdapter;
  if (serverEnv().isHosted) throw new Error("Supabase env vars are required in hosted deployments (the local JSON DB is dev-only).");
  return localAdapter;
}

const nowIso = () => new Date().toISOString();
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

// ───────────── consents ─────────────
export async function recordConsent(purpose: ConsentPurpose, meta: { ipHash: string | null; userAgent: string | null }, leadId: string | null = null) {
  return db().insert<Consent>("consents", {
    lead_id: leadId,
    policy_version: POLICY_VERSION,
    purpose,
    text_shown: consentText[purpose],
    accepted_at: nowIso(),
    ip_hash: meta.ipHash,
    user_agent: meta.userAgent,
  });
}

// ───────────── leads ─────────────
export async function createLead(input: Omit<NewLead, "enroll_token">): Promise<Lead> {
  return db().insert<Lead>("leads", {
    ...input,
    enroll_token: randomToken(24),
    status: "new",
    lost_reason: null,
    owner_notes: null,
    // Default follow-up: same day, so it lands in "Follow-ups due today".
    next_followup_at: nowIso(),
    anonymized_at: null,
  } as Omit<Lead, "id" | "created_at">);
}

export const getLead = (id: string) => db().get<Lead>("leads", id);
export const getLeadByEnrollToken = (token: string) => (token.length >= 20 ? db().findOne<Lead>("leads", "enroll_token", token) : Promise.resolve(null));
export const updateLead = (id: string, patch: Partial<Lead>) => db().update<Lead>("leads", id, patch);
export const listLeads = () => db().list<Lead>("leads", { order: { field: "created_at" }, limit: 2000 });

/** Data-rights erasure: strips personal data but keeps the row so payment records stay consistent. */
export async function anonymizeLead(id: string) {
  return db().update<Lead>("leads", id, {
    parent_name: "Redacted",
    phone_e164: "redacted",
    email: null,
    child_first_name: "Redacted",
    city: null,
    heard_from: null,
    note: null,
    owner_notes: null,
    referrer: null,
    landing_page: null,
    next_followup_at: null,
    anonymized_at: nowIso(),
  });
}

// ───────────── trials ─────────────
export const createTrial = (t: Omit<TrialSession, "id" | "created_at">) => db().insert<TrialSession>("trial_sessions", t);
export const listTrials = () => db().list<TrialSession>("trial_sessions", { order: { field: "scheduled_at", ascending: true } });
export const updateTrial = (id: string, patch: Partial<TrialSession>) => db().update<TrialSession>("trial_sessions", id, patch);

// ───────────── enrollments & payments ─────────────
export async function createEnrollment(leadId: string, planCode = getPlan().code): Promise<{ enrollment: Enrollment; payment: Payment }> {
  const plan = getPlan(planCode);
  let enrollment: Enrollment | null = null;
  for (let attempt = 0; attempt < 5 && !enrollment; attempt++) {
    try {
      enrollment = await db().insert<Enrollment>("enrollments", {
        lead_id: leadId,
        plan_code: plan.code,
        amount_paise: plan.amountPaise, // server-side price, never from the client
        currency: "INR",
        status: "awaiting_payment",
        start_date: null,
        next_renewal_date: null,
        reference_code: referenceCode(),
        access_token: randomToken(32),
      } as Omit<Enrollment, "id" | "created_at">);
    } catch (e) {
      if (!(e instanceof UniqueViolationError)) throw e; // retry on reference collision
    }
  }
  if (!enrollment) throw new Error("Could not allocate a unique reference code");
  const payment = await openPayment(enrollment, null);
  return { enrollment, payment };
}

function openPayment(enrollment: Enrollment, periodStart: string | null) {
  return db().insert<Payment>("payments", {
    enrollment_id: enrollment.id,
    reference_code: enrollment.reference_code,
    period_start: periodStart,
    amount_paise: enrollment.amount_paise,
    status: "awaiting_payment",
    payer_name: null,
    utr: null,
    paid_at_claimed: null,
    screenshot_path: null,
    screenshot_deleted_at: null,
    submitted_at: null,
    verified_by: null,
    verified_at: null,
    reject_reason: null,
    refund_amount_paise: null,
    refund_note: null,
    refunded_at: null,
    receipt_number: null,
  } as Omit<Payment, "id" | "created_at">);
}

export const getEnrollment = (id: string) => db().get<Enrollment>("enrollments", id);
export const getEnrollmentByToken = (token: string) =>
  /^[A-Za-z0-9_-]{32,64}$/.test(token) ? db().findOne<Enrollment>("enrollments", "access_token", token) : Promise.resolve(null);
export const listEnrollments = () => db().list<Enrollment>("enrollments", { order: { field: "created_at" } });
export const updateEnrollment = (id: string, patch: Partial<Enrollment>) => db().update<Enrollment>("enrollments", id, patch);
export const listPayments = (status?: Payment["status"]) =>
  db().list<Payment>("payments", { eq: status ? { status } : undefined, order: { field: "created_at" } });
export const getPayment = (id: string) => db().get<Payment>("payments", id);
export const paymentsForEnrollment = (enrollmentId: string) =>
  db().list<Payment>("payments", { eq: { enrollment_id: enrollmentId }, order: { field: "created_at" } });

/** The payment the parent should act on now: newest one that is awaiting/submitted/rejected. */
export async function currentPayment(enrollmentId: string): Promise<Payment | null> {
  const all = await paymentsForEnrollment(enrollmentId);
  return all.find((p) => p.status === "awaiting_payment" || p.status === "submitted" || p.status === "rejected") ?? all[0] ?? null;
}

export type ProofResult = { ok: true; payment: Payment } | { ok: false; reason: "duplicate_utr" | "not_payable" };

/** Records "I've paid". Atomic on status, and a UTR can only ever be claimed once (DB unique constraint). */
export async function submitProof(paymentId: string, proof: { payerName: string; utr: string; paidAt: string; screenshotPath: string | null }): Promise<ProofResult> {
  const existing = await db().findOne<Payment>("payments", "utr", proof.utr);
  if (existing && existing.id !== paymentId) return { ok: false, reason: "duplicate_utr" };
  const patch: Partial<Payment> = {
    status: "submitted",
    payer_name: proof.payerName,
    utr: proof.utr,
    paid_at_claimed: new Date(proof.paidAt).toISOString(),
    screenshot_path: proof.screenshotPath,
    submitted_at: nowIso(),
    reject_reason: null,
  };
  try {
    const updated =
      (await db().updateWhere<Payment>("payments", paymentId, { status: "awaiting_payment" }, patch)) ??
      (await db().updateWhere<Payment>("payments", paymentId, { status: "rejected" }, patch));
    if (!updated) return { ok: false, reason: "not_payable" };
    const enr = await getEnrollment(updated.enrollment_id);
    if (enr && enr.status === "awaiting_payment") await updateEnrollment(enr.id, { status: "payment_submitted" });
    return { ok: true, payment: updated };
  } catch (e) {
    if (e instanceof UniqueViolationError) return { ok: false, reason: "duplicate_utr" };
    throw e;
  }
}

/** Admin verifies a submitted payment. Idempotent: verifying twice is a no-op returning null. */
export async function verifyPayment(paymentId: string, admin: string) {
  const before = await getPayment(paymentId);
  if (!before || before.status !== "submitted") return null;
  const receipt = await db().nextReceiptNumber();
  const verifiedAt = nowIso();
  const payment = await db().updateWhere<Payment>("payments", paymentId, { status: "submitted" }, {
    status: "verified",
    verified_by: admin,
    verified_at: verifiedAt,
    receipt_number: receipt,
  });
  if (!payment) return null;
  const enr = (await getEnrollment(payment.enrollment_id))!;
  // A renewal starts where the previous period ended; a first payment starts today.
  const start = payment.period_start ? new Date(payment.period_start) : enr.next_renewal_date && enr.status === "active" ? new Date(enr.next_renewal_date) : new Date();
  const renewal = addMonths(start, getPlan(enr.plan_code).billingPeriodMonths);
  if (!payment.period_start) await db().update<Payment>("payments", payment.id, { period_start: isoDate(start) });
  const enrollment = await updateEnrollment(enr.id, {
    status: "active",
    start_date: enr.start_date ?? isoDate(start),
    next_renewal_date: isoDate(renewal),
  });
  await updateLead(enr.lead_id, { status: "enrolled" });
  return { payment: { ...payment, period_start: payment.period_start ?? isoDate(start) }, enrollment, periodStart: isoDate(start), renewal: isoDate(renewal) };
}

export async function rejectPayment(paymentId: string, admin: string, reason: string) {
  const before = await getPayment(paymentId);
  if (!before || before.status !== "submitted") return null;
  const payment = await db().updateWhere<Payment>("payments", paymentId, { status: "submitted" }, {
    status: "rejected",
    reject_reason: `${reason} [submitted UTR: ${before.utr ?? "—"}]`,
    verified_by: admin,
    // Free the UTR so a corrected submission (or the genuine owner) can use it.
    utr: null,
  });
  if (!payment) return null;
  const enr = await getEnrollment(payment.enrollment_id);
  if (enr && enr.status === "payment_submitted") await updateEnrollment(enr.id, { status: "awaiting_payment" });
  return payment;
}

export async function recordRefund(paymentId: string, admin: string, amountPaise: number, note: string) {
  const p = await getPayment(paymentId);
  if (!p || p.status !== "verified") return null;
  if (amountPaise <= 0 || amountPaise > p.amount_paise) throw new Error("Refund amount must be between ₹0.01 and the amount paid");
  return db().update<Payment>("payments", paymentId, {
    status: "refunded",
    refund_amount_paise: amountPaise,
    refund_note: `${note} (recorded by ${admin})`,
    refunded_at: nowIso(),
  });
}

/** Creates next month's payment row for an active enrollment (idempotent: returns the open one if it exists). */
export async function openRenewal(enrollmentId: string) {
  const enr = await getEnrollment(enrollmentId);
  if (!enr || !enr.next_renewal_date) return null;
  const open = (await paymentsForEnrollment(enrollmentId)).find((p) => p.status === "awaiting_payment" || p.status === "submitted");
  if (open) return { enrollment: enr, payment: open };
  const payment = await openPayment(enr, enr.next_renewal_date);
  return { enrollment: enr, payment };
}

// ───────────── schools, guide, audit ─────────────
export const createSchoolEnquiry = (s: Omit<SchoolEnquiry, "id" | "created_at">) => db().insert<SchoolEnquiry>("school_enquiries", s);
export const listSchoolEnquiries = () => db().list<SchoolEnquiry>("school_enquiries", { order: { field: "created_at" } });

export async function subscribeGuide(email: string, consentId: string | null) {
  try {
    return await db().insert<GuideSubscriber>("guide_subscribers", { email: email.toLowerCase(), consent_id: consentId, unsubscribed_at: null });
  } catch (e) {
    if (e instanceof UniqueViolationError) return db().findOne<GuideSubscriber>("guide_subscribers", "email", email.toLowerCase());
    throw e;
  }
}

export async function audit(actor: string, action: string, target: string | null = null, detail: Record<string, unknown> | null = null) {
  try {
    await db().insert<AuditEntry>("admin_audit_log", { actor, action, target, detail });
  } catch (e) {
    console.error("[audit] failed to write", e);
  }
}
export const listAudit = () => db().list<AuditEntry>("admin_audit_log", { order: { field: "created_at" }, limit: 200 });
