import { beforeAll, describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * End-to-end payment state machine against the local adapter (same unique constraints
 * as the SQL migration). Runs in an isolated temp directory.
 */
type Db = typeof import("@/lib/db");
let m: Db;

beforeAll(async () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.VERCEL;
  delete process.env.RENDER;
  delete process.env.HOSTED;
  process.chdir(mkdtempSync(path.join(tmpdir(), "mentora-test-")));
  m = await import("@/lib/db");
});

async function newLead(phone = "+919876543210") {
  return m.createLead({
    parent_name: "Priya Sharma",
    phone_e164: phone,
    email: "priya@example.com",
    child_first_name: "Aarav",
    class_group: "6-8",
    focus_area: "exam_stress",
    preferred_slots: [],
    city: null,
    heard_from: null,
    note: null,
    utm_source: "instagram",
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    referrer: null,
    landing_page: "/",
    consent_id: null,
  });
}

const proof = (utr: string) => ({ payerName: "Priya Sharma", utr, paidAt: new Date().toISOString(), screenshotPath: null });

describe("enrollment + UPI payment flow", () => {
  it("creates an enrollment with a server-side amount, readable reference and secret token", async () => {
    const lead = await newLead();
    const { enrollment, payment } = await m.createEnrollment(lead.id);
    expect(enrollment.amount_paise).toBe(200000);
    expect(payment.amount_paise).toBe(200000);
    expect(enrollment.reference_code).toMatch(/^MNT-\d{4}-[A-Z0-9]{4}$/);
    expect(enrollment.access_token.length).toBeGreaterThanOrEqual(43);
    expect(enrollment.status).toBe("awaiting_payment");
    expect(await m.getEnrollmentByToken(enrollment.access_token)).not.toBeNull();
  });

  it("does not find an enrollment by its readable reference or a guessed token", async () => {
    const lead = await newLead();
    const { enrollment } = await m.createEnrollment(lead.id);
    expect(await m.getEnrollmentByToken(enrollment.reference_code)).toBeNull();
    expect(await m.getEnrollmentByToken("x".repeat(43))).toBeNull();
    expect(await m.getEnrollmentByToken("../../etc/passwd")).toBeNull();
  });

  it("submit → verify → active, with renewal one month later", async () => {
    const lead = await newLead();
    const { enrollment, payment } = await m.createEnrollment(lead.id);
    const r = await m.submitProof(payment.id, proof("100000000001"));
    expect(r.ok).toBe(true);
    expect((await m.getEnrollment(enrollment.id))!.status).toBe("payment_submitted");

    const v = await m.verifyPayment(payment.id, "admin@example.com");
    expect(v).not.toBeNull();
    expect(v!.payment.status).toBe("verified");
    expect(v!.payment.receipt_number).toMatch(/^MNT-R-\d{4}-\d{5}$/);
    expect(v!.enrollment.status).toBe("active");
    expect(v!.enrollment.next_renewal_date).not.toBeNull();
    expect((await m.getLead(lead.id))!.status).toBe("enrolled");
  });

  it("verification is idempotent (double-click safe)", async () => {
    const lead = await newLead();
    const { payment } = await m.createEnrollment(lead.id);
    await m.submitProof(payment.id, proof("100000000002"));
    const first = await m.verifyPayment(payment.id, "a@x.com");
    const second = await m.verifyPayment(payment.id, "a@x.com");
    expect(first).not.toBeNull();
    expect(second).toBeNull();
  });

  it("rejects a UTR that was already claimed by another payment", async () => {
    const a = await m.createEnrollment((await newLead()).id);
    const b = await m.createEnrollment((await newLead()).id);
    expect((await m.submitProof(a.payment.id, proof("100000000003"))).ok).toBe(true);
    const dup = await m.submitProof(b.payment.id, proof("100000000003"));
    expect(dup).toEqual({ ok: false, reason: "duplicate_utr" });
  });

  it("cannot submit proof twice for the same payment while under verification", async () => {
    const { payment } = await m.createEnrollment((await newLead()).id);
    expect((await m.submitProof(payment.id, proof("100000000004"))).ok).toBe(true);
    expect(await m.submitProof(payment.id, proof("100000000005"))).toEqual({ ok: false, reason: "not_payable" });
  });

  it("reject frees the UTR and allows a corrected resubmission", async () => {
    const { enrollment, payment } = await m.createEnrollment((await newLead()).id);
    await m.submitProof(payment.id, proof("100000000006"));
    const rej = await m.rejectPayment(payment.id, "a@x.com", "UTR not in statement");
    expect(rej!.status).toBe("rejected");
    expect(rej!.utr).toBeNull();
    expect((await m.getEnrollment(enrollment.id))!.status).toBe("awaiting_payment");
    expect((await m.submitProof(payment.id, proof("100000000007"))).ok).toBe(true);
  });

  it("opens a renewal payment that starts at the previous renewal date", async () => {
    const { enrollment, payment } = await m.createEnrollment((await newLead()).id);
    await m.submitProof(payment.id, proof("100000000008"));
    const v = await m.verifyPayment(payment.id, "a@x.com");
    const r = await m.openRenewal(enrollment.id);
    expect(r!.payment.period_start).toBe(v!.renewal);
    expect(r!.payment.amount_paise).toBe(200000);
    const again = await m.openRenewal(enrollment.id);
    expect(again!.payment.id).toBe(r!.payment.id); // idempotent

    await m.submitProof(r!.payment.id, proof("100000000009"));
    const v2 = await m.verifyPayment(r!.payment.id, "a@x.com");
    expect(v2!.periodStart).toBe(v!.renewal);
    expect(v2!.enrollment.next_renewal_date! > v!.renewal).toBe(true);
  });

  it("refunds cannot exceed the amount paid", async () => {
    const { payment } = await m.createEnrollment((await newLead()).id);
    await m.submitProof(payment.id, proof("100000000010"));
    await m.verifyPayment(payment.id, "a@x.com");
    await expect(m.recordRefund(payment.id, "a@x.com", 300000, "too much")).rejects.toThrow();
    const ok = await m.recordRefund(payment.id, "a@x.com", 150000, "6 unused sessions");
    expect(ok!.status).toBe("refunded");
  });

  it("anonymises a lead for data-rights requests", async () => {
    const lead = await newLead();
    const a = await m.anonymizeLead(lead.id);
    expect(a.parent_name).toBe("Redacted");
    expect(a.phone_e164).toBe("redacted");
    expect(a.email).toBeNull();
    expect(a.anonymized_at).not.toBeNull();
  });
});
