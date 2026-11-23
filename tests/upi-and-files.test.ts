import { describe, expect, it } from "vitest";
import { buildUpiUri, appLinks, isValidVpa } from "@/lib/payments/upi";
import { detectImage, validateScreenshot, MAX_SCREENSHOT_BYTES } from "@/lib/fileSignature";
import { referenceCode, REFERENCE_RE, randomToken, hashIp } from "@/lib/ids";
import { csvCell, toCsv } from "@/lib/admin";

describe("UPI deep link", () => {
  const base = { upiId: "mentora@okicici", payeeName: "Mentora Mentorship", amountPaise: 200000, reference: "MNT-2611-K7Q4" };

  it("builds the exact upi://pay link with amount and reference", () => {
    expect(buildUpiUri(base)).toBe("upi://pay?pa=mentora%40okicici&pn=Mentora%20Mentorship&am=2000.00&cu=INR&tn=MNT-2611-K7Q4&tr=MNT-2611-K7Q4");
  });
  it("can omit tr for personal VPAs", () => {
    expect(buildUpiUri({ ...base, includeTr: false })).not.toContain("tr=");
  });
  it("produces app-specific intents", () => {
    const l = appLinks(base);
    expect(l.gpay.startsWith("tez://upi/pay?")).toBe(true);
    expect(l.phonepe.startsWith("phonepe://pay?")).toBe(true);
    expect(l.paytm.startsWith("paytmmp://pay?")).toBe(true);
  });
  it("rejects invalid VPAs and injection attempts", () => {
    expect(isValidVpa("mentora@okicici")).toBe(true);
    expect(isValidVpa("bad vpa@x")).toBe(false);
    expect(() => buildUpiUri({ ...base, upiId: "a@b&am=1" })).toThrow();
  });
  it("encodes a payee name with special characters safely", () => {
    expect(buildUpiUri({ ...base, payeeName: "A&B (Mentora)" })).toContain("pn=A%26B%20%28Mentora%29");
  });
});

const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(16).fill(0)]);

describe("screenshot signature check", () => {
  it("detects JPEG, PNG and WebP by magic bytes", () => {
    expect(detectImage(bytes(0xff, 0xd8, 0xff, 0xe0))?.mime).toBe("image/jpeg");
    expect(detectImage(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))?.mime).toBe("image/png");
    expect(detectImage(bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50))?.mime).toBe("image/webp");
  });
  it("rejects a PDF / HTML / executable renamed to .png", () => {
    expect(validateScreenshot(new TextEncoder().encode("%PDF-1.7 ......")).ok).toBe(false);
    expect(validateScreenshot(new TextEncoder().encode("<html><script>alert(1)</script>")).ok).toBe(false);
    expect(validateScreenshot(bytes(0x4d, 0x5a, 0x90, 0x00)).ok).toBe(false);
  });
  it("rejects oversized and empty files", () => {
    const big = new Uint8Array(MAX_SCREENSHOT_BYTES + 1);
    big.set([0xff, 0xd8, 0xff]);
    expect(validateScreenshot(big)).toEqual({ ok: false, error: "The screenshot must be 3 MB or smaller." });
    expect(validateScreenshot(new Uint8Array()).ok).toBe(false);
  });
});

describe("ids", () => {
  it("reference codes are readable and well-formed", () => {
    for (let i = 0; i < 200; i++) expect(referenceCode(new Date("2026-11-22T00:00:00Z"))).toMatch(/^MNT-2611-/);
    expect(referenceCode()).toMatch(REFERENCE_RE);
  });
  it("access tokens are long and unique", () => {
    const set = new Set(Array.from({ length: 1000 }, () => randomToken(32)));
    expect(set.size).toBe(1000);
    expect([...set][0].length).toBeGreaterThanOrEqual(43);
  });
  it("hashes IPs one-way with a salt", () => {
    expect(hashIp("1.2.3.4", "s")).toMatch(/^[0-9a-f]{64}$/);
    expect(hashIp("1.2.3.4", "s")).not.toBe(hashIp("1.2.3.4", "t"));
    expect(hashIp(null, "s")).toBeNull();
  });
});

describe("CSV export", () => {
  it("neutralises spreadsheet formula injection", () => {
    expect(csvCell("=HYPERLINK(\"http://evil\")")).toBe("\"'=HYPERLINK(\"\"http://evil\"\")\"");
    expect(csvCell("+91 98765")).toBe("'+91 98765");
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)");
  });
  it("quotes commas and newlines", () => {
    expect(toCsv([{ a: "x,y", b: "line1\nline2" }], ["a", "b"])).toBe('a,b\r\n"x,y","line1\nline2"');
  });
});
