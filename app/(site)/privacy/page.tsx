/*
 * DRAFT: review with a qualified lawyer before launch (DPDP Act 2023 + DPDP Rules 2025, IT Act 2000).
 * Keep this page, content/consent.ts (POLICY_VERSION) and actual data practices in sync.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/content/site";
import { POLICY_VERSION } from "@/content/consent";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Mentora collects, uses, protects and deletes personal data — including our approach to children’s data and verifiable parental consent.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" path="/privacy" updated="22 November 2026">
      <p>
        This policy explains how {site.legalName} (“Mentora”, “we”) handles personal data when you use this website and our mentorship service. We wrote it to be
        read, not skimmed. Policy version: <code>{POLICY_VERSION}</code>.
      </p>

      <h2>1. The short version</h2>
      <ul>
        <li>A <strong>parent or legal guardian</strong> — never a child — books, consents and pays.</li>
        <li>About your child, we collect only their <strong>first name and class group</strong> through this website.</li>
        <li>We don’t sell data, and we don’t use your child’s data for advertising or behavioural tracking.</li>
        <li>You can access, correct or delete your data, or withdraw consent, at any time.</li>
      </ul>

      <h2>2. What we collect</h2>
      <table>
        <thead>
          <tr><th>Data</th><th>Why</th><th>Kept for</th></tr>
        </thead>
        <tbody>
          <tr><td>Parent name, WhatsApp number, email (optional on the intro form), city (optional)</td><td>To arrange the intro session and contact you</td><td>12 months if you don’t enroll</td></tr>
          <tr><td>Child’s first name, class group, focus area, preferred time slots</td><td>To match a mentor and plan sessions</td><td>As above, or while enrolled + 12 months</td></tr>
          <tr><td>Payment details you submit: payer name, UPI transaction ID (UTR), payment time, optional screenshot</td><td>To verify your payment</td><td>Screenshots: deleted 30 days after verification. Payment records: as required by tax law (typically 8 years)</td></tr>
          <tr><td>Consent records (policy version, text shown, time, a one-way hash of your IP address, browser type)</td><td>To prove valid parental consent</td><td>For as long as we hold the related data</td></tr>
          <tr><td>Session notes, goals and safety status kept by the mentor</td><td>To deliver mentoring and follow our safeguarding protocol</td><td>While enrolled + 12 months, unless a safeguarding concern requires longer</td></tr>
          <tr><td>Marketing source (UTM tags, referring site, landing page)</td><td>To understand which channels help families find us</td><td>With the lead record</td></tr>
          <tr><td>Analytics (only if you allow it)</td><td>To improve the website</td><td>Per the analytics provider’s retention</td></tr>
        </tbody>
      </table>
      <p>We never ask for your child’s phone number, email, photo, school name, health information or surname through this website. Please don’t enter sensitive details in free-text boxes.</p>

      <h2>3. Children’s data and parental consent</h2>
      <p>
        Under India’s Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025, a child is anyone under 18, and we must obtain verifiable consent from
        a parent or legal guardian before processing a child’s personal data. That’s why every form on this site is completed by the parent, includes an unticked
        consent box describing exactly what we collect and why, and is recorded with the version of the notice shown. We confirm parent identity during the
        WhatsApp follow-up and intro session before mentoring begins. We do not track children’s behaviour online or show them targeted advertising.
      </p>

      <h2>4. What stays private in sessions</h2>
      <p>
        Mentoring conversations are private between the mentor and the student. Parents receive a monthly high-level update and safety status, not transcripts. The
        exception is safety: if we believe a child may be at risk of harm, we follow our safeguarding protocol, which can include informing parents, emergency
        services or qualified professionals. See <Link href="/safety">Safety & safeguarding</Link>.
      </p>

      <h2>5. Who we share data with</h2>
      <p>We share data only with service providers that help us run Mentora, under contract and only for that purpose:</p>
      <ul>
        <li><strong>Supabase</strong> — database and private file storage.</li>
        <li><strong>Vercel</strong> — website hosting.</li>
        <li><strong>Resend</strong> — transactional email.</li>
        <li><strong>Cloudflare Turnstile</strong> — spam protection on forms.</li>
        <li><strong>Google Analytics / Vercel Analytics</strong> — only if you accept analytics cookies.</li>
        <li><strong>WhatsApp (Meta)</strong> — when you choose to message us there.</li>
      </ul>
      {/* TODO(lawyer): confirm data-processing terms and cross-border transfer position for each provider. */}
      <p>Some providers may store data outside India. We will also disclose data where required by law, or to protect a child’s safety.</p>

      <h2>6. Cookies</h2>
      <p>
        We use essential storage to run the site and remember your cookie choice. Analytics and any advertising tags load only if you choose “Allow analytics”, and
        advertising pixels never load on pages where you enter your child’s details. You can change your choice any time via “Cookie settings” in the footer.
      </p>

      <h2>7. Your rights</h2>
      <p>You can ask us to:</p>
      <ul>
        <li>give you a summary of the personal data we hold and how we use it;</li>
        <li>correct or update inaccurate data;</li>
        <li>erase your data (we may keep minimal payment records where the law requires);</li>
        <li>withdraw consent — this stops future processing but doesn’t affect what was lawful before;</li>
        <li>nominate someone to exercise these rights on your behalf.</li>
      </ul>
      <p>
        Email our Grievance Officer, {site.grievance.name}, at <a href={`mailto:${site.grievance.email}`}>{site.grievance.email}</a>. We aim to respond within 7
        days. If you’re not satisfied, you may approach the Data Protection Board of India.
      </p>

      <h2>8. Security</h2>
      <p>
        Data is encrypted in transit, stored in a database that blocks all public access, and accessible only to authorised staff through a protected admin
        dashboard with an audit log. Payment screenshots are stored privately and viewed only through short-lived links. If a breach affecting your data occurs,
        we will inform you and the Data Protection Board as required by law.
      </p>

      <h2>9. Changes</h2>
      <p>If we change this policy materially, we’ll update the version and date above and, where required, ask for your consent again.</p>
    </LegalPage>
  );
}
