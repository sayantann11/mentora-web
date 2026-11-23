import Link from "next/link";
import type { Metadata } from "next";
import { Mail, MessageCircle, School, ShieldAlert } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/Section";
import { SafetyDisclaimer } from "@/components/site/Disclaimer";
import { WhatsAppLink } from "@/components/site/WhatsAppLink";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/content/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact Mentora",
  description: "Get in touch with Mentora on WhatsApp or email — questions about mentoring, payments, privacy requests or school partnerships.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <section className="section">
      <div className="container-x">
        <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} />
        <PageHero eyebrow="Contact" title={<>We’re happy to <span className="accent">talk it through.</span></>} lede="The quickest way to reach us is WhatsApp. We usually reply within a few hours, 9 am – 8 pm IST." />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="card">
            <MessageCircle aria-hidden className="text-violet" />
            <h2 className="mt-3 font-display text-2xl font-medium">WhatsApp</h2>
            <p className="mt-2 text-ink-soft">Questions about mentoring, scheduling or payments.</p>
            <WhatsAppLink location="contact" className="btn btn-primary mt-5">Chat on WhatsApp</WhatsAppLink>
          </div>
          <div className="card">
            <Mail aria-hidden className="text-violet" />
            <h2 className="mt-3 font-display text-2xl font-medium">Email</h2>
            <p className="mt-2 text-ink-soft">For anything you’d rather write in detail.</p>
            <a href={`mailto:${site.email}`} className="btn btn-ghost mt-5">{site.email}</a>
          </div>
          <div className="card">
            <ShieldAlert aria-hidden className="text-violet" />
            <h2 className="mt-3 font-display text-2xl font-medium">Privacy & data requests</h2>
            <p className="mt-2 text-ink-soft">
              To access, correct or delete your data, or withdraw consent, email our Grievance Officer at{" "}
              <a className="link" href={`mailto:${site.grievance.email}`}>{site.grievance.email}</a>. We respond within 7 days. See the{" "}
              <Link href="/privacy" className="link">privacy policy</Link>.
            </p>
          </div>
          <div className="card">
            <School aria-hidden className="text-violet" />
            <h2 className="mt-3 font-display text-2xl font-medium">Schools</h2>
            <p className="mt-2 text-ink-soft">Interested in a programme for your students?</p>
            <Link href="/for-schools" className="btn btn-ghost mt-5">School enquiry form</Link>
          </div>
        </div>
        <div className="mt-10 max-w-3xl">
          <SafetyDisclaimer />
        </div>
      </div>
    </section>
  );
}
