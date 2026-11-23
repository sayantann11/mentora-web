import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/Section";
import { PricingCard, TrustList } from "@/components/sections/blocks";
import { FaqList } from "@/components/ui/FaqList";
import { JsonLd } from "@/components/ui/JsonLd";
import { CtaBand } from "@/components/site/CtaBand";
import { TrackView } from "@/components/site/TrackView";
import { pricingFaqs } from "@/content/faq";
import { faqLd, pageMetadata, serviceLd } from "@/lib/seo";
import { formatINR, getPlan, perSessionPaise } from "@/lib/pricing";

export const metadata: Metadata = pageMetadata({
  title: "Pricing: ₹2,000/month for 8 Mentoring Sessions",
  description:
    "Founding pilot pricing: ₹2,000 a month for 8 private 30-minute mentoring sessions (₹250 per session). Pay by UPI, month to month, no lock-in. Free intro session.",
  path: "/pricing",
});

export default function PricingPage() {
  const plan = getPlan();
  const rows: [string, string][] = [
    ["Monthly fee", formatINR(plan.amountPaise)],
    ["Sessions per month", `${plan.sessionsPerMonth} (2 a week)`],
    ["Session length", `${plan.sessionMinutes} minutes, 1-on-1 video`],
    ["Cost per session", formatINR(perSessionPaise(plan))],
    ["Parent updates", "Monthly, with safety status"],
    ["Commitment", "Month to month — no lock-in"],
    ["Payment", "UPI (any app), paid manually each month"],
  ];
  return (
    <>
      <TrackView event="view_pricing" />
      <JsonLd data={[serviceLd(), faqLd(pricingFaqs)]} />
      <section className="section pb-10">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Pricing", path: "/pricing" }]} />
          <PageHero
            eyebrow="Pilot pricing"
            title={
              <>
                One simple plan. <span className="accent">No surprises.</span>
              </>
            }
            lede="During the founding pilot every family gets the same plan: a dedicated mentor, eight private sessions a month and a monthly parent update."
          />
        </div>
      </section>
      <section className="section pt-4">
        <div className="container-x grid items-start gap-12 lg:grid-cols-[1.05fr_1fr]">
          <PricingCard showNotIncluded headingLevel="h2" />
          <div>
            <h2 className="display-md">The breakdown</h2>
            <table className="mt-6 w-full border-collapse text-left">
              <caption className="sr-only">Pilot plan details</caption>
              <tbody>
                {rows.map(([k, v]) => (
                  <tr key={k} className="border-b border-line">
                    <th scope="row" className="py-3.5 pr-4 font-medium text-ink-soft">{k}</th>
                    <td className="py-3.5 text-right font-semibold text-ink">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="mt-12 font-display text-2xl font-medium">What Mentora is not</h3>
            <p className="mt-3 text-ink-soft">
              We don’t teach school subjects, and we don’t provide therapy, diagnosis or emergency care. When a child needs specialised help, we refer families
              to qualified professionals. Read more about our <Link href="/safety" className="link">three layers of support</Link>.
            </p>
            <h3 className="mt-10 font-display text-2xl font-medium">How payment works</h3>
            <ol className="mt-4 grid gap-3 text-ink-soft">
              <li><strong className="text-ink">1. Free intro session.</strong> Your child meets a mentor. No payment needed.</li>
              <li><strong className="text-ink">2. Your payment link.</strong> If you’d like to continue, we send a personal link with a UPI QR code, our UPI ID and your reference code.</li>
              <li><strong className="text-ink">3. Pay and confirm.</strong> Pay {formatINR(plan.amountPaise)} from any UPI app, then enter the transaction ID (UTR) on the same page.</li>
              <li><strong className="text-ink">4. You’re in.</strong> We verify the payment (usually within a few hours) and confirm your schedule.</li>
            </ol>
            <p className="mt-4 text-sm text-muted">
              See our <Link href="/refund-policy" className="link">refund policy</Link> for missed sessions and refunds.
            </p>
          </div>
        </div>
      </section>
      <section className="section bg-mist" aria-labelledby="trust">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 id="trust" className="display-md">What you can count on</h2>
          <TrustList />
        </div>
      </section>
      <section className="section" aria-labelledby="pricing-faq">
        <div className="container-x max-w-3xl">
          <h2 id="pricing-faq" className="display-md mb-8">Pricing questions</h2>
          <FaqList faqs={pricingFaqs} location="pricing" />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
