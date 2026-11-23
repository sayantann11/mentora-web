import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { NOINDEX } from "@/lib/seo";
import { TrackView } from "@/components/site/TrackView";
import { WhatsAppLink } from "@/components/site/WhatsAppLink";
import { getPlan } from "@/lib/pricing";

export const metadata: Metadata = { title: "Payment details received", robots: NOINDEX, referrer: "no-referrer" };

export default function PaymentSubmittedPage() {
  return (
    <section className="section">
      {/* Not a purchase event — the purchase is only real once the admin verifies it. */}
      <TrackView event="submit_payment_proof" params={{ value: getPlan().amountPaise / 100, currency: "INR" }} />
      <div className="container-x max-w-2xl">
        <div className="card text-center">
          <CheckCircle2 aria-hidden size={52} className="mx-auto text-sage" />
          <h1 className="mt-4 font-display text-4xl font-medium">We’ve received your payment details</h1>
          <p className="mx-auto mt-4 max-w-md text-ink-soft">
            Thank you! We’ll check the payment against our UPI statement and confirm within a few hours. You’ll get an email as soon as it’s verified, and our
            coordinator will confirm your child’s session slots on WhatsApp.
          </p>
          <p className="mt-3 text-sm text-muted">Please don’t pay again for the same reference.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <WhatsAppLink location="payment_submitted" className="btn btn-primary">Message us on WhatsApp</WhatsAppLink>
            <Link href="/for-parents" className="btn btn-ghost">What happens next</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
