import "server-only";
import QRCode from "qrcode";
import { serverEnv } from "@/lib/env";
import { appLinks, isValidVpa } from "./upi";

/**
 * Payment provider abstraction. Today: direct UPI (QR + VPA, manual verification).
 * Tomorrow: a gateway (e.g. Razorpay + UPI Autopay) can implement the same interface,
 * returning a hosted-checkout URL and confirming via webhook instead of manual proof.
 */
export interface PaymentInstructions {
  method: "upi_direct";
  amountPaise: number;
  reference: string;
  upiId: string;
  payeeName: string;
  qrSvg: string; // inline SVG, generated server-side
  links: { any: string; gpay: string; phonepe: string; paytm: string };
}

export interface PaymentProvider {
  readonly id: "upi_direct" | "razorpay";
  /** Whether confirmation is automatic (webhook) or manual (admin verification). */
  readonly confirmation: "manual" | "webhook";
  getInstructions(input: { amountPaise: number; reference: string }): Promise<PaymentInstructions>;
}

export class UpiDirectProvider implements PaymentProvider {
  readonly id = "upi_direct" as const;
  readonly confirmation = "manual" as const;

  async getInstructions({ amountPaise, reference }: { amountPaise: number; reference: string }): Promise<PaymentInstructions> {
    const { upiId, upiPayeeName, upiIncludeTr } = serverEnv();
    if (!upiId || !isValidVpa(upiId) || !upiPayeeName) throw new Error("UPI_ID / UPI_PAYEE_NAME are not configured");
    const links = appLinks({ upiId, payeeName: upiPayeeName, amountPaise, reference, includeTr: upiIncludeTr });
    const qrSvg = await QRCode.toString(links.any, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      color: { dark: "#221a30", light: "#ffffff" },
    });
    return { method: "upi_direct", amountPaise, reference, upiId, payeeName: upiPayeeName, qrSvg, links };
  }
}

export function paymentProvider(): PaymentProvider {
  return new UpiDirectProvider();
}

export function upiConfigured() {
  const { upiId, upiPayeeName } = serverEnv();
  return Boolean(upiId && isValidVpa(upiId) && upiPayeeName);
}
