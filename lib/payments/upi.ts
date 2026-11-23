import { upiAmount } from "@/lib/pricing";

export interface UpiLinkInput {
  upiId: string;
  payeeName: string;
  amountPaise: number;
  reference: string;
  includeTr?: boolean;
}

const VPA_RE = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9.\-]{1,64}$/;

export function isValidVpa(vpa: string) {
  return VPA_RE.test(vpa);
}

/** Percent-encode per RFC 3986 (spaces as %20, which UPI apps handle more reliably than '+'). */
const enc = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

/**
 * upi://pay?pa=<VPA>&pn=<payee>&am=2000.00&cu=INR&tn=<ref>&tr=<ref>
 * The amount is server-side and fixed; the reference goes in both the note (tn) and transaction ref (tr).
 */
export function buildUpiUri({ upiId, payeeName, amountPaise, reference, includeTr = true }: UpiLinkInput, scheme = "upi://pay"): string {
  if (!isValidVpa(upiId)) throw new Error("Invalid UPI ID");
  const parts = [`pa=${enc(upiId)}`, `pn=${enc(payeeName)}`, `am=${upiAmount(amountPaise)}`, "cu=INR", `tn=${enc(reference)}`];
  if (includeTr) parts.push(`tr=${enc(reference)}`);
  return `${scheme}?${parts.join("&")}`;
}

/** App-specific intents (Android). Fall back to the generic upi:// link everywhere else. */
export function appLinks(input: UpiLinkInput) {
  return {
    any: buildUpiUri(input),
    gpay: buildUpiUri(input, "tez://upi/pay"),
    phonepe: buildUpiUri(input, "phonepe://pay"),
    paytm: buildUpiUri(input, "paytmmp://pay"),
  };
}
