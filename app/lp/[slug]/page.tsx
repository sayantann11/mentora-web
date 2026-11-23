import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { TrialForm } from "@/components/forms/TrialForm";
import { SafetyDisclaimer } from "@/components/site/Disclaimer";
import { claimCopy } from "@/content/claims";
import { site } from "@/content/site";
import { formatINR, getPlan } from "@/lib/pricing";
import { NOINDEX } from "@/lib/seo";

/**
 * Ad-campaign landing pages: no navigation, one form, fast. Add a new campaign by adding
 * an entry here and pointing ads at /lp/<slug>?utm_source=...&utm_campaign=...
 * Noindexed so they never compete with the real SEO pages.
 */
const campaigns: Record<string, { headline: string; sub: string; bullets: string[]; classGroup?: "3-5" | "6-8" | "9-12" }> = {
  "exam-stress": {
    headline: "Board exams coming up? Give your teen a calm weekly anchor.",
    sub: "A dedicated mentor, two private 30-minute video sessions a week — for stress, discipline and perspective.",
    bullets: ["Plan the week, protect sleep, handle pressure", "Not tuition, not therapy — a trusted mentor", "Monthly update for parents"],
    classGroup: "9-12",
  },
  "screen-time": {
    headline: "Endless scrolling, missed homework? There’s a better way than bans.",
    sub: "A mentor helps your pre-teen understand their own habits and build a routine they actually keep.",
    bullets: ["Co-created phone-free study blocks", "Peer pressure, comparison and confidence", "Monthly update for parents"],
    classGroup: "6-8",
  },
  confidence: {
    headline: "Help your child find their voice.",
    sub: "Gentle, playful 1-on-1 sessions to build confidence, express feelings and make friends.",
    bullets: ["Stories, games and tiny habit challenges", "Handling losing, anger and shyness", "Monthly update for parents"],
    classGroup: "3-5",
  },
  mentor: {
    headline: "A personal mentor for your child’s journey through school and life.",
    sub: "Two private 30-minute video sessions every week with one dedicated mentor. Classes 3–12.",
    bullets: ["Confidence, habits, emotions and direction", "Not tuition, not therapy — a trusted mentor", "Monthly update for parents"],
  },
};

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(campaigns).map((slug) => ({ slug }));
}

export const metadata: Metadata = { title: "Free intro mentoring session", robots: NOINDEX };

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = campaigns[(await params).slug];
  if (!c) notFound();
  return (
    <div className="min-h-screen bg-[radial-gradient(60%_50%_at_90%_0%,#e6dbff,transparent),radial-gradient(40%_40%_at_0%_100%,#f6d9b7aa,transparent)]">
      <header className="container-x flex h-20 items-center">
        <Brand />
      </header>
      <main className="container-x grid gap-10 pb-16 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:pt-8">
        <div>
          <p className="eyebrow">Founding pilot · limited to {site.pilotSeats} students</p>
          <h1 className="display-lg mt-4">{c.headline}</h1>
          <p className="lede mt-5">{c.sub}</p>
          <ul className="mt-8 grid gap-3">
            {c.bullets.map((b) => (
              <li key={b} className="flex gap-3 text-ink-soft"><Check aria-hidden className="mt-0.5 shrink-0 text-sage" /> {b}</li>
            ))}
            <li className="flex gap-3 text-ink-soft"><ShieldCheck aria-hidden className="mt-0.5 shrink-0 text-sage" /> {claimCopy.mentors}</li>
          </ul>
          <p className="mt-8 text-ink-soft">
            {formatINR(getPlan().amountPaise)}/month for 8 sessions after a <strong className="text-ink">free intro session</strong>. No lock-in.
          </p>
          <div className="mt-8 hidden lg:block">
            <SafetyDisclaimer />
          </div>
        </div>
        <div className="card">
          <h2 className="mb-5 font-display text-2xl font-medium">Book your free intro session</h2>
          <TrialForm defaultClass={c.classGroup} compact />
        </div>
        <div className="lg:hidden">
          <SafetyDisclaimer />
        </div>
      </main>
    </div>
  );
}
