import { describe, expect, it } from "vitest";
import { normaliseIndianPhone, proofSchema, trialSchema, utrSchema, enrollSchema } from "@/lib/validation";

describe("normaliseIndianPhone", () => {
  it.each([
    ["9876543210", "+919876543210"],
    ["+91 98765 43210", "+919876543210"],
    ["091-98765-43210", null],
    ["09876543210", "+919876543210"],
    ["919876543210", "+919876543210"],
    ["(987) 654-3210", "+919876543210"],
  ])("%s → %s", (input, out) => expect(normaliseIndianPhone(input)).toBe(out));

  it.each(["12345", "5876543210", "98765432101", "abcdefghij", "+1 415 555 0100", ""])("rejects %s", (bad) => expect(normaliseIndianPhone(bad)).toBeNull());
});

describe("UTR", () => {
  it("accepts 12 digits, tolerating spaces", () => {
    expect(utrSchema.parse("412345678901")).toBe("412345678901");
    expect(utrSchema.parse(" 4123 4567 8901 ")).toBe("412345678901");
  });
  it.each(["41234567890", "4123456789012", "41234567890A", ""])("rejects %s", (bad) => expect(utrSchema.safeParse(bad).success).toBe(false));
});

const validTrial = {
  parentName: "Priya Sharma",
  phone: "98765 43210",
  email: "",
  childFirstName: "Aarav",
  classGroup: "6-8",
  focusArea: "exam_stress",
  preferredSlots: ["weekday_evening"],
  consent: true,
};

describe("trial form", () => {
  it("accepts a valid submission", () => expect(trialSchema.safeParse(validTrial).success).toBe(true));
  it("requires the consent box to be ticked", () => expect(trialSchema.safeParse({ ...validTrial, consent: false }).success).toBe(false));
  it("only allows the child's first name", () => expect(trialSchema.safeParse({ ...validTrial, childFirstName: "Aarav Sharma" }).success).toBe(false));
  it("rejects unknown class groups", () => expect(trialSchema.safeParse({ ...validTrial, classGroup: "1-2" }).success).toBe(false));
  it("rejects invalid email if given", () => expect(trialSchema.safeParse({ ...validTrial, email: "nope" }).success).toBe(false));
  it("fails when the honeypot is filled", () => expect(trialSchema.safeParse({ ...validTrial, website: "http://spam" }).success).toBe(false));
  it("caps the free-text note", () => expect(trialSchema.safeParse({ ...validTrial, note: "x".repeat(501) }).success).toBe(false));
  it("ignores any client-supplied amount", () => {
    const r = enrollSchema.safeParse({ ...validTrial, email: "p@example.com", amountPaise: 1 });
    expect(r.success).toBe(true);
    expect(r.success && "amountPaise" in r.data).toBe(false);
  });
});

describe("proof form", () => {
  const now = new Date().toISOString();
  it("accepts a valid proof", () => expect(proofSchema.safeParse({ payerName: "Priya Sharma", utr: "412345678901", paidAt: now }).success).toBe(true));
  it("rejects a payment time in the future", () =>
    expect(proofSchema.safeParse({ payerName: "Priya", utr: "412345678901", paidAt: new Date(Date.now() + 3_600_000).toISOString() }).success).toBe(false));
});
