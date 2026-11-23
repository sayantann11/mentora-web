import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { currentPayment, getEnrollmentByToken, getLead } from "@/lib/db";
import { paymentProvider, upiConfigured } from "@/lib/payments/provider";
import { formatINR } from "@/lib/pricing";
import { NOINDEX } from "@/lib/seo";
import { CopyButton } from "@/components/pay/CopyButton";
import { PayButtons } from "@/components/pay/PayButtons";
import { ProofForm } from "@/components/pay/ProofForm";
import { TrackView } from "@/components/site/TrackView";
import { WhatsAppLink } from "@/components/site/WhatsAppLink";
import { existsSync } from "node:fs";
import path from "node:path";

export const metadata: Metadata = { title: "Pay by UPI", robots: NOINDEX, referrer: "no-referrer" };
export const dynamic = "force-dynamic";

export default async function PayPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  // `ref` is the unguessable access token — the readable reference code is only displayed.
  const enrollment = await getEnrollmentByToken(ref);
  if (!enrollment) notFound();
  const [payment, lead] = await Promise.all([currentPayment(enrollment.id), getLead(enrollment.lead_id)]);
  if (!payment) notFound();

  const amount = formatINR(payment.amount_paise);
  const hasStaticQr = existsSync(path.join(process.cwd(), "public", "upi-qr.png"));

  if (payment.status === "submitted") {
    return (
      <StatusShell icon={<Clock aria-hidden className="text-violet" size={44} />} title="Payment under verification">
        We received your payment details for <strong>{payment.reference_code}</strong> ({amount}) and are checking them against our UPI statement. This usually
        takes a few hours during the day. You’ll get a confirmation email. Please don’t pay again for this reference.
      </StatusShell>
    );
  }
  if (payment.status === "verified" || payment.status === "refunded") {
    return (
      <StatusShell icon={<CheckCircle2 aria-hidden className="text-sage" size={44} />} title={payment.status === "verified" ? "You’re all paid up" : "This payment was refunded"}>
        Reference <strong>{payment.reference_code}</strong>.{" "}
        {payment.status === "verified" && enrollment.next_renewal_date ? <>Your next renewal is due on {enrollment.next_renewal_date}. We’ll send you a reminder.</> : null}{" "}
        {payment.status === "verified" && (
          <Link className="link" href={`/receipt/${ref}?p=${payment.id}`}>View receipt</Link>
        )}
      </StatusShell>
    );
  }

  if (!upiConfigured()) {
    return (
      <StatusShell icon={<AlertTriangle aria-hidden className="text-status-yellow" size={44} />} title="Payments are being set up">
        Our UPI details aren’t configured yet. Please message us on WhatsApp and we’ll help you complete your enrollment. Your reference is{" "}
        <strong>{payment.reference_code}</strong>.
      </StatusShell>
    );
  }

  const ins = await paymentProvider().getInstructions({ amountPaise: payment.amount_paise, reference: payment.reference_code });

  return (
    <section className="section pt-12">
      <TrackView event="view_pay_page" params={{ value: payment.amount_paise / 100, currency: "INR" }} />
      <div className="container-x">
        <p className="eyebrow">Enroll · step 2 of 2</p>
        <h1 className="display-lg mt-4">
          Pay {amount} by UPI{lead ? <span className="accent"> for {lead.child_first_name}</span> : null}
        </h1>
        <p className="lede mt-4 max-w-2xl">
          {payment.period_start ? `Renewal for the month starting ${payment.period_start}. ` : ""}Use any UPI app — Google Pay, PhonePe, Paytm, BHIM or your
          bank’s app. The amount and reference are pre-filled when you scan.
        </p>

        {payment.status === "rejected" && (
          <div role="alert" className="mt-6 flex max-w-3xl gap-3 rounded-2xl border border-status-yellow/30 bg-peach/30 p-4 text-ink">
            <AlertTriangle aria-hidden className="shrink-0 text-status-yellow" />
            <p className="m-0">
              We couldn’t match your earlier submission{payment.reject_reason ? ` (${payment.reject_reason.replace(/\s*\[submitted UTR:.*\]$/, "")})` : ""}. If you’ve
              already paid, please re-check the 12-digit UTR in your UPI app and submit again below — don’t pay twice.
            </p>
          </div>
        )}

        <ol className="mt-8 grid gap-3 text-sm font-semibold text-ink-soft sm:grid-cols-3">
          {["1. Scan the QR or copy the UPI ID", `2. Pay ${amount} with the reference in the note`, "3. Come back and tell us you’ve paid"].map((s) => (
            <li key={s} className="rounded-2xl border border-line bg-white px-4 py-3">{s}</li>
          ))}
        </ol>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="card">
            <div className="grid gap-6 sm:grid-cols-[minmax(0,240px)_1fr] sm:items-center">
              <figure className="mx-auto w-full max-w-[260px]">
                <div
                  className="rounded-2xl border border-line bg-white p-3 [&_svg]:h-auto [&_svg]:w-full"
                  role="img"
                  aria-label={`UPI QR code to pay ${amount} to ${ins.payeeName} with reference ${ins.reference}`}
                  dangerouslySetInnerHTML={{ __html: ins.qrSvg }}
                />
                <figcaption className="mt-2 text-center text-xs text-muted">Scan with any UPI app</figcaption>
              </figure>
              <dl className="grid gap-4">
                <div>
                  <dt className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">Amount</dt>
                  <dd className="font-display text-4xl font-medium text-ink">{amount}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">Pay to (payee name)</dt>
                  <dd className="text-lg font-semibold text-ink">{ins.payeeName}</dd>
                </div>
              </dl>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-mist p-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">UPI ID</p>
                  <p className="truncate font-mono text-lg font-semibold text-ink">{ins.upiId}</p>
                </div>
                <CopyButton value={ins.upiId} label="UPI ID" />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-saffron/50 bg-peach/20 p-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.12em] text-saffron-ink uppercase">Your reference</p>
                  <p className="font-mono text-lg font-semibold text-ink">{ins.reference}</p>
                  <p className="text-sm text-ink-soft">Please write this reference in the payment note.</p>
                </div>
                <CopyButton value={ins.reference} label="reference code" />
              </div>
              <PayButtons links={ins.links} amountLabel={amount} />
              {hasStaticQr && (
                <details className="rounded-2xl border border-line p-4 text-sm">
                  <summary className="cursor-pointer font-semibold text-ink">QR not scanning? Use our static QR</summary>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/upi-qr.png" alt={`Static UPI QR code for ${ins.payeeName}`} width={240} height={240} className="mx-auto mt-3 rounded-xl" />
                  <p className="mt-2 text-muted">With this QR, please type the amount ({amount}) and the reference ({ins.reference}) yourself.</p>
                </details>
              )}
            </div>
          </div>

          <div className="card" id="proof">
            <h2 className="font-display text-2xl font-medium">I’ve paid</h2>
            <p className="mt-2 mb-6 text-ink-soft">Enter the details from your UPI app so we can match your payment.</p>
            <ProofForm token={ref} />
            <ul className="mt-6 grid gap-2 border-t border-line pt-5 text-sm text-ink-soft">
              <li className="flex gap-2"><ShieldCheck aria-hidden size={16} className="mt-0.5 shrink-0 text-sage" /> No lock-in, no auto-debit. You pay month by month.</li>
              <li className="flex gap-2"><Clock aria-hidden size={16} className="mt-0.5 shrink-0 text-sage" /> We verify payments manually, usually within a few hours.</li>
              <li className="flex gap-2">
                <ShieldCheck aria-hidden size={16} className="mt-0.5 shrink-0 text-sage" />
                <span>
                  Questions? <WhatsAppLink location="pay_page" message={`Hi Mentora, I have a question about payment ${ins.reference}.`} className="link">Message us on WhatsApp</WhatsAppLink>.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusShell({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <div className="container-x max-w-2xl">
        <div className="card text-center">
          <div className="flex justify-center">{icon}</div>
          <h1 className="mt-4 font-display text-3xl font-medium">{title}</h1>
          <p className="mt-3 text-ink-soft">{children}</p>
          <div className="mt-6 flex justify-center">
            <WhatsAppLink location="pay_status" className="btn btn-ghost">Message us on WhatsApp</WhatsAppLink>
          </div>
        </div>
      </div>
    </section>
  );
}
