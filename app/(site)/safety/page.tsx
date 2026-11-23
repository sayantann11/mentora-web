import Link from "next/link";
import type { Metadata } from "next";
import { Lock, ShieldAlert, UserCheck, MessageSquareOff, Gift, Eye, ClipboardCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/Section";
import { ParentReportSample, SupportLayers } from "@/components/sections/blocks";
import { SafetyDisclaimer } from "@/components/site/Disclaimer";
import { CtaBand } from "@/components/site/CtaBand";
import { claims, claimCopy } from "@/content/claims";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Safety, Safeguarding & Privacy for Your Child",
  description:
    "How Mentora keeps children safe: mentor selection and rules, limits of confidentiality, a written escalation protocol, privacy for the child and monthly parent reports.",
  path: "/safety",
});

const rules = [
  { icon: MessageSquareOff, title: "No off-platform contact", body: "Mentors never contact students by personal phone, WhatsApp, DM or email. All scheduling goes through the parent and the Mentora coordinator." },
  { icon: Eye, title: "No social media", body: "Mentors don’t follow, friend or message students on any social platform, during or after the programme." },
  { icon: Gift, title: "No gifts", body: "Mentors don’t give or accept gifts or money. The relationship is professional, warm and bounded." },
  { icon: Lock, title: "No secrets that put a child at risk", body: "Mentors are not secret friends. Students know from the first session what stays private — and what doesn’t." },
];

export default function SafetyPage() {
  return (
    <>
      <section className="section pb-10">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Safety & privacy", path: "/safety" }]} />
          <PageHero
            eyebrow="Safety & safeguarding"
            title={
              <>
                A safe space for your child. <span className="accent">Clear rules for everyone.</span>
              </>
            }
            lede="Mentoring only works when a child feels safe enough to be honest — and when parents can trust the adult on the other side of the screen. This page explains exactly how we protect both."
          />
          <div className="mt-8 max-w-3xl">
            <SafetyDisclaimer />
          </div>
        </div>
      </section>

      <section className="section pt-6" aria-labelledby="layers">
        <div className="container-x">
          <h2 id="layers" className="display-md">Three layers of support</h2>
          <p className="lede mt-4 max-w-2xl">
            Mentora is non-clinical. We are clear about what we do, and we have a referral path for everything we don’t.
          </p>
          <div className="mt-10">
            <SupportLayers />
          </div>
        </div>
      </section>

      <section className="section bg-mist" aria-labelledby="mentors">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <h2 id="mentors" className="display-md">How mentors are selected and trained</h2>
            <p className="mt-5 text-ink-soft">{claimCopy.mentors}. Our process for the founding pilot:</p>
            <ol className="mt-5 grid gap-3 text-ink-soft">
              <li className="flex gap-3"><UserCheck aria-hidden className="mt-0.5 shrink-0 text-violet" /> <span><strong className="text-ink">Application and interview</strong> focused on listening skills, judgement and genuine interest in young people.</span></li>
              <li className="flex gap-3"><UserCheck aria-hidden className="mt-0.5 shrink-0 text-violet" /> <span><strong className="text-ink">Reference checks</strong> before a mentor is matched with any student.</span></li>
              <li className="flex gap-3"><ClipboardCheck aria-hidden className="mt-0.5 shrink-0 text-violet" /> <span><strong className="text-ink">Training</strong> in the session framework, open questioning, age-appropriate communication, the code of conduct and the safeguarding protocol.</span></li>
              <li className="flex gap-3"><ClipboardCheck aria-hidden className="mt-0.5 shrink-0 text-violet" /> <span><strong className="text-ink">Ongoing review.</strong> {claimCopy.supervision}.</span></li>
              {claims.mentorsBackgroundChecked && (
                <li className="flex gap-3"><UserCheck aria-hidden className="mt-0.5 shrink-0 text-violet" /> <span><strong className="text-ink">Background verification</strong> for every mentor.</span></li>
              )}
            </ol>
            {/* TODO: replace with the exact, current vetting steps before launch. Only describe steps you actually perform. */}
          </div>
          <div>
            <h2 className="display-md">Mentor rules</h2>
            <ul className="mt-6 grid gap-3">
              {rules.map((r) => (
                <li key={r.title} className="card flex gap-4 p-5">
                  <r.icon aria-hidden className="shrink-0 text-violet" />
                  <span>
                    <strong className="block text-ink">{r.title}</strong>
                    <span className="text-[0.97rem] text-ink-soft">{r.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="confidentiality">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 id="confidentiality" className="display-md">The limits of confidentiality</h2>
            <p className="mt-5 text-ink-soft">
              In the very first session, the mentor explains to your child — in age-appropriate words — what stays private and what doesn’t:
            </p>
            <div className="mt-6 grid gap-4">
              <div className="card p-6">
                <p className="font-semibold text-ink">What stays private</p>
                <p className="mt-2 text-ink-soft">
                  The details of everyday conversations — a friendship problem, a crush, a frustration with a teacher or with you. Parents don’t receive
                  transcripts or quotes. This privacy is what makes honest conversation possible.
                </p>
              </div>
              <div className="card border-status-red/20 p-6">
                <p className="flex items-center gap-2 font-semibold text-ink"><ShieldAlert aria-hidden size={18} className="text-status-red" /> What we must act on</p>
                <p className="mt-2 text-ink-soft">
                  If a child may be at risk of harm — self-harm or suicidal thoughts, abuse, serious distress, or danger to others — the mentor follows the
                  safeguarding protocol. Safety always comes before confidentiality.
                </p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="display-md">The escalation protocol</h2>
            <ol className="mt-6 grid gap-4">
              {[
                ["Immediate danger", "If a child is in immediate danger, the mentor contacts emergency services (112) and the parent straight away."],
                ["Mentor raises a concern", "The mentor stays calm, listens, doesn’t promise secrecy, and records the concern factually the same day."],
                ["Review by the Mentora lead", "The concern is reviewed by the safeguarding lead, who decides the next step and the safety status (Yellow or Red)."],
                ["Parents are informed", `${claimCopy.alerts}. We explain what we noticed and what we recommend, while protecting the child’s dignity.`],
                ["Referral", "Where needed we recommend qualified professionals — a counsellor, psychologist, psychiatrist or doctor — and share helpline numbers."],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-plum font-display text-white">{i + 1}</span>
                  <span>
                    <strong className="block text-ink">{title}</strong>
                    <span className="text-ink-soft">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
            {/* TODO: have the safeguarding protocol reviewed by a qualified child-safeguarding professional before launch. */}
          </div>
        </div>
      </section>

      <section className="section bg-mist" aria-labelledby="report">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 id="report" className="display-md">The monthly parent report</h2>
            <p className="mt-5 text-ink-soft">
              Every month you receive a short, structured update: areas worked on, positive developments, the next focus, and practical suggestions for home
              — plus a Green / Yellow / Red safety status.
            </p>
            <ul className="mt-5 grid gap-2 text-ink-soft">
              <li><strong className="text-status-green">Green</strong> — no concerns.</li>
              <li><strong className="text-status-yellow">Yellow</strong> — something worth watching; we discuss it with you.</li>
              <li><strong className="text-status-red">Red</strong> — the safeguarding protocol has been activated and you have been contacted directly.</li>
            </ul>
            <p className="mt-6 text-ink-soft">
              More on <Link href="/for-parents" className="link">what parents see</Link>.
            </p>
          </div>
          <ParentReportSample />
        </div>
      </section>

      <section className="section" aria-labelledby="privacy">
        <div className="container-x max-w-3xl">
          <h2 id="privacy" className="display-md">Your family’s data</h2>
          <ul className="prose-mentora mt-4">
            <li>A parent or guardian — never the child — books, consents and pays.</li>
            <li>We collect only your child’s <strong>first name and class group</strong>. No child phone number, email or health details.</li>
            <li>No advertising pixels on any page where you enter your child’s details, and analytics only with your consent.</li>
            <li>Access to records is limited to the people who need it, and you can ask us to access, correct or delete your data at any time.</li>
          </ul>
          <p className="mt-4 text-ink-soft">
            Full details in our <Link href="/privacy" className="link">privacy policy</Link>.
          </p>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
