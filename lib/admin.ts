import { site } from "@/content/site";
import { formatINR } from "./pricing";
import type { Enrollment, Lead, Payment, TrialSession } from "./db/types";

const digits = (e164: string) => e164.replace(/\D/g, "");

export function waTo(phoneE164: string, message: string) {
  return `https://wa.me/${digits(phoneE164)}?text=${encodeURIComponent(message)}`;
}

export const waTemplates = {
  firstContact: (l: Lead) =>
    `Hi ${l.parent_name.split(" ")[0]}, this is the Mentora team 👋 Thank you for requesting a free intro session for ${l.child_first_name}. Which day and time this week would suit you for a 30-minute video call?`,
  followUp: (l: Lead) =>
    `Hi ${l.parent_name.split(" ")[0]}, just checking in from Mentora. Would you still like to schedule ${l.child_first_name}'s free intro session? Happy to answer any questions.`,
  enrollLink: (l: Lead) =>
    `Hi ${l.parent_name.split(" ")[0]}, it was lovely meeting ${l.child_first_name}! If you'd like to continue, here's your personal enrollment link: ${site.url}/enroll?lead=${l.enroll_token} — it shows the UPI payment details. No lock-in.`,
  payLink: (l: Lead, e: Enrollment) =>
    `Hi ${l.parent_name.split(" ")[0]}, here is your personal Mentora payment page for ${l.child_first_name}: ${site.url}/pay/${e.access_token} (reference ${e.reference_code}, ${formatINR(e.amount_paise)}).`,
  verified: (l: Lead, e: Enrollment) =>
    `Hi ${l.parent_name.split(" ")[0]}, we've received and verified your payment (${e.reference_code}). Thank you! We'll confirm ${l.child_first_name}'s session slots and mentor shortly.`,
  renewal: (l: Lead, e: Enrollment) =>
    `Hi ${l.parent_name.split(" ")[0]}, ${l.child_first_name}'s Mentora month ends on ${e.next_renewal_date}. To continue, please pay ${formatINR(e.amount_paise)} here: ${site.url}/pay/${e.access_token}. Reply if you'd like to pause — no lock-in.`,
  rejected: (l: Lead, e: Enrollment) =>
    `Hi ${l.parent_name.split(" ")[0]}, we couldn't match your payment for ${e.reference_code} yet. Could you double-check the 12-digit UTR in your UPI app? You can resubmit here: ${site.url}/pay/${e.access_token}`,
};

/** CSV cell, protected against formula injection in Excel/Sheets. */
export function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  return [columns.join(","), ...rows.map((r) => columns.map((c) => csvCell(r[c])).join(","))].join("\r\n");
}

const IST = "Asia/Kolkata";
export function istDate(d: Date | string = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(d));
}
export function fmtDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { timeZone: IST, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function computeStats(leads: Lead[], trials: TrialSession[], enrollments: Enrollment[], payments: Payment[], now = new Date()) {
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const monthKey = istDate(now).slice(0, 7);
  const live = leads.filter((l) => !l.anonymized_at);
  const leadsThisWeek = live.filter((l) => new Date(l.created_at) >= weekAgo).length;
  const trialLeadIds = new Set(trials.filter((t) => t.status === "completed").map((t) => t.lead_id));
  live.filter((l) => l.status === "trial_done" || l.status === "enrolled").forEach((l) => trialLeadIds.add(l.id));
  const enrolledLeadIds = new Set(enrollments.filter((e) => e.status === "active" || e.status === "lapsed").map((e) => e.lead_id));
  const convertedFromTrial = [...trialLeadIds].filter((id) => enrolledLeadIds.has(id)).length;
  const revenueMonth = payments
    .filter((p) => (p.status === "verified" || p.status === "refunded") && p.verified_at && istDate(p.verified_at).startsWith(monthKey))
    .reduce((s, p) => s + p.amount_paise - (p.refund_amount_paise ?? 0), 0);
  const bySource = new Map<string, number>();
  live.forEach((l) => {
    let k = l.utm_source || "direct";
    if (!l.utm_source && l.referrer) {
      try {
        k = new URL(l.referrer).hostname.replace(/^www\./, "");
      } catch {
        k = "referral";
      }
    }
    bySource.set(k, (bySource.get(k) ?? 0) + 1);
  });
  return {
    leadsThisWeek,
    trials: trialLeadIds.size,
    convertedFromTrial,
    conversionPct: trialLeadIds.size ? Math.round((convertedFromTrial / trialLeadIds.size) * 100) : null,
    revenueMonth,
    active: enrollments.filter((e) => e.status === "active").length,
    toVerify: payments.filter((p) => p.status === "submitted").length,
    bySource: [...bySource.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
  };
}

export function followupsDue(leads: Lead[], now = new Date()) {
  const endOfToday = new Date(`${istDate(now)}T23:59:59+05:30`);
  return leads
    .filter((l) => !l.anonymized_at && l.next_followup_at && new Date(l.next_followup_at) <= endOfToday && l.status !== "enrolled" && l.status !== "lost")
    .sort((a, b) => a.next_followup_at!.localeCompare(b.next_followup_at!));
}

export function renewalsDue(enrollments: Enrollment[], days = 7, now = new Date()) {
  const limit = istDate(new Date(now.getTime() + days * 86_400_000));
  return enrollments.filter((e) => e.status === "active" && e.next_renewal_date && e.next_renewal_date <= limit).sort((a, b) => a.next_renewal_date!.localeCompare(b.next_renewal_date!));
}
