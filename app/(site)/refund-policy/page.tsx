/* DRAFT: review with a qualified lawyer before launch. */
import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/content/site";
import { formatINR, getPlan, perSessionPaise } from "@/lib/pricing";

export const metadata: Metadata = pageMetadata({
  title: "Refund & Rescheduling Policy",
  description: "When Mentora refunds fees, how missed sessions are handled, and how refunds are paid back by UPI within 7 working days.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  const plan = getPlan();
  const per = formatINR(perSessionPaise(plan));
  return (
    <LegalPage title="Refund & Rescheduling Policy" path="/refund-policy" updated="22 November 2026">
      <p>We want every family to feel the fee was fair. This policy explains exactly what happens when plans change.</p>

      <h2>1. Free intro session</h2>
      <p>The introductory session is free. You don’t pay anything until you decide to enroll.</p>

      <h2>2. First-month guarantee</h2>
      <p>
        If, after your child’s <strong>first or second paid session</strong> in their first month, you feel Mentora isn’t right for them, tell us before the third
        session and we’ll refund all the unused sessions in that month ({per} per session).
      </p>

      <h2>3. Stopping later</h2>
      <p>
        There is no lock-in. You can stop at any time by not renewing. If you stop part-way through a paid month, we refund the unused sessions in that month at{" "}
        {per} per session, provided you give at least 48 hours’ notice before the next scheduled session.
      </p>

      <h2>4. Missed and rescheduled sessions</h2>
      <ul>
        <li><strong>12+ hours’ notice:</strong> we reschedule within the same or the following week.</li>
        <li><strong>Less than 12 hours’ notice or no-show:</strong> the session may be counted as used. We’ll always try to be flexible for illness or emergencies.</li>
        <li><strong>Mentor cancels:</strong> we reschedule, or refund that session if no suitable time is found.</li>
        <li>Unused sessions do not carry over beyond the following month.</li>
      </ul>

      <h2>5. If we end the service</h2>
      <p>If we pause or end mentoring (for example, for safeguarding reasons or if the pilot closes), we refund all unused sessions in the current month in full.</p>

      <h2>6. Wrong or duplicate payments</h2>
      <p>
        If you pay the wrong amount, pay twice for the same reference, or pay to us by mistake, contact us and we’ll refund the excess or duplicate amount in full
        once it appears in our statement.
      </p>

      <h2>7. How refunds are paid</h2>
      <ul>
        <li>Refunds are sent <strong>by UPI to the same UPI account the payment came from</strong>. We don’t refund in cash or to a different person’s account.</li>
        <li>We send refunds <strong>within 7 working days</strong> of approving the request, and email you the amount, date and UPI reference.</li>
        <li>The full fee for a month is {formatINR(plan.amountPaise)}; refunds never exceed what you paid for that month.</li>
      </ul>

      <h2>8. How to ask</h2>
      <p>
        Email <a href={`mailto:${site.email}`}>{site.email}</a> or message us on WhatsApp with your reference code (it looks like MNT-2611-ABCD). We’ll confirm within
        2 working days.
      </p>
    </LegalPage>
  );
}
