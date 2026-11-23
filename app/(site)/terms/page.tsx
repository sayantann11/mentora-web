/* DRAFT: review with a qualified lawyer before launch. */
import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/content/site";
import { formatINR, getPlan } from "@/lib/pricing";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms for using Mentora’s website and 1-on-1 student mentorship service, including scope, conduct, payments and safeguarding.",
  path: "/terms",
});

export default function TermsPage() {
  const plan = getPlan();
  return (
    <LegalPage title="Terms of Service" path="/terms" updated="22 November 2026">
      <p>These terms are an agreement between you (the parent or legal guardian) and {site.legalName} (“Mentora”). By enrolling, you agree to them.</p>

      <h2>1. The service</h2>
      <p>
        Mentora provides non-clinical, 1-on-1 life-skills mentorship for school students in Classes 3–12, delivered online by video. The pilot plan includes{" "}
        {plan.sessionsPerMonth} sessions of {plan.sessionMinutes} minutes per month, a dedicated mentor, goal tracking and a monthly parent update.
      </p>
      <h2>2. What Mentora is not</h2>
      <p>
        Mentora is <strong>not</strong> tuition, therapy, counselling, psychological assessment, medical advice or an emergency service. Mentors do not diagnose or
        treat any condition. Where we believe a child needs specialised support, we will recommend that the family consult a qualified professional. In an
        emergency, call 112. For free 24×7 mental-health support, call Tele-MANAS on 14416 or 1-800-891-4416.
      </p>
      <h2>3. Eligibility and consent</h2>
      <p>
        Only a parent or legal guardian may enroll a child, provide consent and make payments. You confirm that the information you provide is accurate and that you
        have authority to consent on the child’s behalf.
      </p>
      <h2>4. Fees and payment</h2>
      <ul>
        <li>The pilot fee is {formatINR(plan.amountPaise)} per month, paid in advance by UPI to the UPI ID shown on your personal payment page.</li>
        <li>Your enrollment becomes active once we have verified your payment. There is no automatic renewal or auto-debit; each month requires a new payment.</li>
        <li>Prices may change for future months with at least 14 days’ notice. Pilot pricing applies only while the pilot runs.</li>
        <li>Refunds and missed sessions are covered by our <Link href="/refund-policy">Refund Policy</Link>.</li>
      </ul>
      {/* TODO(accountant): add GST details if/when registered. */}
      <h2>5. Sessions and scheduling</h2>
      <ul>
        <li>We agree fixed weekly slots with you. Please give at least 12 hours’ notice to reschedule.</li>
        <li>The child should join from a quiet space at home with a reliable connection. A parent should be reachable during sessions.</li>
        <li>If a mentor must cancel, we will reschedule or provide a substitute session.</li>
      </ul>
      <h2>6. Conduct and safeguarding</h2>
      <ul>
        <li>Mentors and students communicate only through Mentora-arranged sessions. Please don’t share personal contact details or social-media handles with mentors.</li>
        <li>Sessions must not be recorded by families without the mentor’s and Mentora’s written agreement.</li>
        <li>We follow a written safeguarding protocol. If we believe a child may be at risk, we may contact parents, emergency services or appropriate professionals.</li>
        <li>We may pause or end the service if there is abusive behaviour towards a mentor, or if continuing is not in the child’s interest — with a pro-rata refund of unused sessions.</li>
      </ul>
      <h2>7. Confidentiality</h2>
      <p>
        Session content is confidential between mentor and student, subject to the limits explained on our <Link href="/safety">Safety page</Link>. Parents receive
        monthly high-level updates, not transcripts.
      </p>
      <h2>8. Liability</h2>
      <p>
        We provide the service with reasonable care and skill. We don’t guarantee specific outcomes (such as marks, admissions or behaviour changes). To the extent
        permitted by law, our total liability for any claim is limited to the fees you paid in the month the claim arose.
      </p>
      <h2>9. Changes and contact</h2>
      <p>
        We may update these terms; material changes will be notified by email or WhatsApp. Questions: <a href={`mailto:${site.email}`}>{site.email}</a>. These terms
        are governed by the laws of India. {/* TODO(lawyer): add jurisdiction city. */}
      </p>
    </LegalPage>
  );
}
