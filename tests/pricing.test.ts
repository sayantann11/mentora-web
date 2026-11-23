import { describe, expect, it } from "vitest";
import { addMonths, formatINR, getPlan, perSessionPaise, upiAmount, PLANS } from "@/lib/pricing";

describe("pricing", () => {
  it("pilot plan is ₹2,000 for 8 sessions, stored in paise", () => {
    const p = getPlan();
    expect(p.amountPaise).toBe(200000);
    expect(p.sessionsPerMonth).toBe(8);
    expect(p.currency).toBe("INR");
    expect(Number.isInteger(p.amountPaise)).toBe(true);
  });

  it("per-session price is ₹250", () => {
    expect(perSessionPaise()).toBe(25000);
    expect(formatINR(perSessionPaise())).toBe("₹250");
  });

  it("formats INR with Indian grouping", () => {
    expect(formatINR(200000)).toBe("₹2,000");
    expect(formatINR(1234567800)).toBe("₹1,23,45,678");
    expect(formatINR(200050)).toBe("₹2,000.50");
  });

  it("produces the exact UPI amount string", () => {
    expect(upiAmount(200000)).toBe("2000.00");
    expect(upiAmount(5)).toBe("0.05");
    expect(() => upiAmount(0)).toThrow();
    expect(() => upiAmount(12.5)).toThrow();
  });

  it("rejects unknown plans (amount never comes from the client)", () => {
    expect(() => getPlan("free_forever")).toThrow();
    expect(Object.keys(PLANS)).toEqual(["pilot_monthly"]);
  });

  it("adds months with end-of-month clamping", () => {
    expect(addMonths(new Date("2026-01-31T00:00:00Z"), 1).toISOString().slice(0, 10)).toBe("2026-02-28");
    expect(addMonths(new Date("2028-01-31T00:00:00Z"), 1).toISOString().slice(0, 10)).toBe("2028-02-29");
    expect(addMonths(new Date("2026-11-22T00:00:00Z"), 1).toISOString().slice(0, 10)).toBe("2026-12-22");
    expect(addMonths(new Date("2026-12-15T00:00:00Z"), 1).toISOString().slice(0, 10)).toBe("2027-01-15");
  });
});
