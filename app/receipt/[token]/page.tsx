import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEnrollmentByToken, getLead, getPayment } from "@/lib/db";
import { formatINR, getPlan } from "@/lib/pricing";
import { NOINDEX } from "@/lib/seo";
import { site } from "@/content/site";
import { BrandMark } from "@/components/ui/Brand";
import { PrintButton } from "@/components/ui/PrintButton";

export const metadata: Metadata = { title: "Payment receipt", robots: NOINDEX, referrer: "no-referrer" };
export const dynamic = "force-dynamic";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

/** Printable receipt. Access needs the enrollment's secret token AND a payment id belonging to it. */
export default async function ReceiptPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ p?: string }> }) {
  const [{ token }, { p }] = await Promise.all([params, searchParams]);
  const enrollment = await getEnrollmentByToken(token);
  if (!enrollment || !p || !/^[0-9a-f-]{36}$/i.test(p)) notFound();
  const payment = await getPayment(p);
  if (!payment || payment.enrollment_id !== enrollment.id || !payment.receipt_number || !payment.verified_at) notFound();
  const lead = await getLead(enrollment.lead_id);
  const plan = getPlan(enrollment.plan_code);

  return (
    <main className="min-h-screen bg-sand py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-[var(--shadow-soft)] sm:p-12 print:shadow-none">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrandMark className="h-10 w-10" />
            <div>
              <p className="font-display text-xl font-semibold">{site.legalName}</p>
              <p className="text-sm text-muted">{site.email}</p>
            </div>
          </div>
          <p className="text-right text-sm text-muted">
            Receipt
            <br />
            <strong className="font-mono text-base text-ink">{payment.receipt_number}</strong>
          </p>
        </div>
        <h1 className="mt-10 font-display text-3xl font-medium">Payment receipt</h1>
        <dl className="mt-6 grid gap-3 text-[0.98rem]">
          {[
            ["Receipt date", fmt(payment.verified_at)],
            ["Received from", lead?.parent_name ?? "—"],
            ["For", `${plan.name}${lead ? ` — ${lead.child_first_name}` : ""}`],
            ["Period", payment.period_start ? `1 month from ${fmt(payment.period_start)}` : "1 month"],
            ["Reference", payment.reference_code],
            ["Paid via", `UPI${payment.utr ? ` (UTR ${payment.utr})` : ""}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 border-b border-line pb-3">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right font-medium text-ink">{v}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-6 pt-2 text-xl">
            <dt className="font-semibold text-ink">Amount paid</dt>
            <dd className="font-display font-semibold text-ink">{formatINR(payment.amount_paise)}</dd>
          </div>
        </dl>
        {payment.status === "refunded" && payment.refund_amount_paise && (
          <p className="mt-4 rounded-xl bg-peach/40 p-3 text-sm">Refunded: {formatINR(payment.refund_amount_paise)} on {payment.refunded_at ? fmt(payment.refunded_at) : "—"}.</p>
        )}
        {/* TODO(accountant): if GST-registered, this must become a tax invoice with GSTIN, SAC code and tax breakup. */}
        <p className="mt-8 text-xs text-muted">This is a payment acknowledgement, not a tax invoice. Computer-generated; no signature required.</p>
        <div className="mt-8 print:hidden">
          <PrintButton />
        </div>
      </div>
    </main>
  );
}
