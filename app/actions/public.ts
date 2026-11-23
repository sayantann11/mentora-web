"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { Consent } from "@/lib/db";
import { enrollSchema, guideSchema, normaliseIndianPhone, proofSchema, schoolSchema, trialSchema } from "@/lib/validation";
import { limitByIp, requestMeta, toActionError, UserError, type ActionResult } from "@/lib/request";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  createEnrollment,
  db,
  createLead,
  createSchoolEnquiry,
  currentPayment,
  getEnrollmentByToken,
  getLead,
  getLeadByEnrollToken,
  recordConsent,
  subscribeGuide,
  submitProof,
  updateLead,
} from "@/lib/db";
import { emails } from "@/lib/email";
import { site } from "@/content/site";
import { validateScreenshot } from "@/lib/fileSignature";
import { uploadScreenshot } from "@/lib/storage";
import { randomToken } from "@/lib/ids";

const attributionSchema = z
  .object({
    utm_source: z.string().max(100).optional(),
    utm_medium: z.string().max(100).optional(),
    utm_campaign: z.string().max(150).optional(),
    utm_term: z.string().max(150).optional(),
    utm_content: z.string().max(150).optional(),
    referrer: z.string().max(300).optional(),
    landing_page: z.string().max(300).optional(),
  })
  .partial()
  .catch({});
export type Attribution = z.infer<typeof attributionSchema>;

function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? "form");
    out[k] ??= i.message;
  }
  return out;
}

const invalid = (err: z.ZodError) => ({ ok: false as const, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(err) });

// ───────────── Free intro session ─────────────
export async function submitTrialAction(raw: unknown, rawAttribution: unknown): Promise<ActionResult<{ firstName: string }>> {
  try {
    const parsed = trialSchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    const input = parsed.data;
    if (input.website) return { ok: true, data: { firstName: input.childFirstName } }; // honeypot: pretend success
    await limitByIp("trial", 5, 60 * 60_000);
    if (!(await verifyTurnstile(input.turnstileToken))) throw new UserError("The spam check failed. Please refresh the page and try again.");

    const meta = await requestMeta();
    const attr = attributionSchema.parse(rawAttribution ?? {});
    const consent = await recordConsent("trial", meta);
    const lead = await createLead({
      parent_name: input.parentName,
      phone_e164: normaliseIndianPhone(input.phone)!,
      email: input.email || null,
      child_first_name: input.childFirstName,
      class_group: input.classGroup,
      focus_area: input.focusArea,
      preferred_slots: input.preferredSlots,
      city: input.city || null,
      heard_from: input.heardFrom || null,
      note: input.note || null,
      utm_source: attr.utm_source ?? null,
      utm_medium: attr.utm_medium ?? null,
      utm_campaign: attr.utm_campaign ?? null,
      utm_term: attr.utm_term ?? null,
      utm_content: attr.utm_content ?? null,
      referrer: attr.referrer ?? null,
      landing_page: attr.landing_page ?? null,
      consent_id: consent.id,
    });
    // Link consent → lead (best effort)
    await db().update<Consent>("consents", consent.id, { lead_id: lead.id }).catch(() => undefined);

    await Promise.all([
      lead.email ? emails.trialConfirmation(lead.email, lead.parent_name, lead.child_first_name) : Promise.resolve(true),
      emails.newLeadAlert(lead, `${site.url}/admin/leads/${lead.id}`),
    ]);
    return { ok: true, data: { firstName: lead.child_first_name } };
  } catch (e) {
    return toActionError(e);
  }
}

// ───────────── Enroll → creates enrollment + first payment, then redirects to /pay/<token> ─────────────
export async function submitEnrollAction(raw: unknown, rawAttribution: unknown): Promise<ActionResult> {
  let token: string;
  try {
    const parsed = enrollSchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    const input = parsed.data;
    if (input.website) throw new UserError("Spam check failed.");
    await limitByIp("enroll", 5, 60 * 60_000);
    if (!(await verifyTurnstile(input.turnstileToken))) throw new UserError("The spam check failed. Please refresh the page and try again.");

    const meta = await requestMeta();
    const phone = normaliseIndianPhone(input.phone)!;
    let lead = input.leadToken ? await getLeadByEnrollToken(input.leadToken) : null;
    if (lead && lead.anonymized_at) lead = null;
    const consent = await recordConsent("enroll", meta, lead?.id ?? null);

    if (lead) {
      lead = await updateLead(lead.id, {
        parent_name: input.parentName,
        phone_e164: phone,
        email: input.email,
        child_first_name: input.childFirstName,
        class_group: input.classGroup,
        consent_id: consent.id,
      });
    } else {
      const attr = attributionSchema.parse(rawAttribution ?? {});
      lead = await createLead({
        parent_name: input.parentName,
        phone_e164: phone,
        email: input.email,
        child_first_name: input.childFirstName,
        class_group: input.classGroup,
        focus_area: null,
        preferred_slots: [],
        city: null,
        heard_from: null,
        note: "Enrolled directly via /enroll",
        utm_source: attr.utm_source ?? null,
        utm_medium: attr.utm_medium ?? null,
        utm_campaign: attr.utm_campaign ?? null,
        utm_term: attr.utm_term ?? null,
        utm_content: attr.utm_content ?? null,
        referrer: attr.referrer ?? null,
        landing_page: attr.landing_page ?? null,
        consent_id: consent.id,
      });
    }
    const { enrollment } = await createEnrollment(lead.id);
    token = enrollment.access_token;
  } catch (e) {
    return toActionError(e);
  }
  redirect(`/pay/${token}`);
}

// ───────────── "I've paid" proof (multipart: fields + optional screenshot) ─────────────
export async function submitProofAction(accessToken: string, formData: FormData): Promise<ActionResult> {
  try {
    await limitByIp("proof", 8, 60 * 60_000);
    const enrollment = await getEnrollmentByToken(accessToken);
    if (!enrollment) throw new UserError("This payment link is not valid. Please use the link we sent you.");
    const payment = await currentPayment(enrollment.id);
    if (!payment || (payment.status !== "awaiting_payment" && payment.status !== "rejected"))
      throw new UserError(payment?.status === "submitted" ? "We’ve already received your payment details and are verifying them." : "There’s nothing to pay on this link right now.");

    const parsed = proofSchema.safeParse({
      payerName: formData.get("payerName"),
      utr: formData.get("utr"),
      paidAt: formData.get("paidAt"),
    });
    if (!parsed.success) return invalid(parsed.error);

    let screenshotPath: string | null = null;
    const file = formData.get("screenshot");
    if (file instanceof File && file.size > 0) {
      await limitByIp("upload", 6, 60 * 60_000);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const check = validateScreenshot(bytes);
      if (!check.ok) return { ok: false, error: check.error, fieldErrors: { screenshot: check.error } };
      screenshotPath = await uploadScreenshot(`${enrollment.id}/${payment.id}-${randomToken(8)}.${check.kind.ext}`, bytes, check.kind.mime);
    }

    const result = await submitProof(payment.id, { ...parsed.data, screenshotPath });
    if (!result.ok) {
      if (result.reason === "duplicate_utr")
        return { ok: false, error: "This transaction ID has already been submitted.", fieldErrors: { utr: "This UTR has already been used. Please check the number in your UPI app." } };
      throw new UserError("We couldn’t record this payment. Please contact us on WhatsApp.");
    }

    const lead = await getLead(enrollment.lead_id);
    await Promise.all([
      lead?.email ? emails.proofReceived(lead.email, lead.parent_name, enrollment.reference_code, payment.amount_paise) : Promise.resolve(true),
      emails.proofAlert(enrollment.reference_code, parsed.data.utr, payment.amount_paise, `${site.url}/admin/payments`),
    ]);
  } catch (e) {
    return toActionError(e);
  }
  redirect("/payment/submitted");
}

// ───────────── Schools ─────────────
export async function submitSchoolAction(raw: unknown): Promise<ActionResult> {
  try {
    const parsed = schoolSchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    const s = parsed.data;
    if (s.website) return { ok: true, data: undefined };
    await limitByIp("school", 4, 60 * 60_000);
    if (!(await verifyTurnstile(s.turnstileToken))) throw new UserError("The spam check failed. Please refresh and try again.");
    const consent = await recordConsent("school", await requestMeta());
    await createSchoolEnquiry({
      school_name: s.schoolName,
      contact_name: s.contactName,
      role: s.role,
      email: s.email,
      phone_e164: normaliseIndianPhone(s.phone)!,
      students: s.students,
      city: s.city,
      message: s.message || null,
      status: "new",
      consent_id: consent.id,
    });
    await emails.schoolAlert(s.schoolName, s.city, s.students);
    return { ok: true, data: undefined };
  } catch (e) {
    return toActionError(e);
  }
}

// ───────────── Free guide ─────────────
export async function subscribeGuideAction(raw: unknown): Promise<ActionResult> {
  try {
    const parsed = guideSchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    if (parsed.data.website) return { ok: true, data: undefined };
    await limitByIp("guide", 5, 60 * 60_000);
    const consent = await recordConsent("guide", await requestMeta());
    await subscribeGuide(parsed.data.email, consent.id);
    await emails.guide(parsed.data.email, `${site.url}/guide/five-conversations`);
    return { ok: true, data: undefined };
  } catch (e) {
    return toActionError(e);
  }
}
