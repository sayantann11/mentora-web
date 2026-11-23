import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpenCheck, Users, Smartphone, CloudRain, HeartHandshake, ShieldCheck, CalendarCheck, Sparkles } from "lucide-react";
import { StoryBackdrop } from "@/components/home/StoryBackdrop";
import { TrackSelector } from "@/components/home/TrackSelector";
import { SessionClock } from "@/components/home/SessionClock";
import { PricingCard, ParentReportSample, WeeklyRhythm, FirstMonthStations, SupportLayers, TrustList } from "@/components/sections/blocks";
import { FaqList } from "@/components/ui/FaqList";
import { JsonLd } from "@/components/ui/JsonLd";
import { CtaBand } from "@/components/site/CtaBand";
import { SafetyDisclaimer } from "@/components/site/Disclaimer";
import { coreFaqs } from "@/content/faq";
import { site } from "@/content/site";
import { claimCopy } from "@/content/claims";
import { faqLd, pageMetadata, serviceLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mentora — 1-on-1 Online Mentor for Students, Classes 3–12",
  absoluteTitle: true,
  description:
    "A dedicated mentor for your child: two private 30-minute video sessions a week to build confidence, habits, emotional intelligence and direction. Free intro session.",
  path: "/",
});

const worries = [
  { icon: BookOpenCheck, title: "Exam & marks anxiety", body: "“What if I disappoint my parents?” Fear of failure quietly turns into procrastination and overwhelm." },
  { icon: Users, title: "Peer pressure & comparison", body: "Fitting in, being left out, and measuring themselves against classmates every single day." },
  { icon: Smartphone, title: "Screens & routines", body: "Phones that pull attention, late nights and the struggle to stay disciplined without constant reminders." },
  { icon: CloudRain, title: "Unspoken self-doubt", body: "Feelings kept inside until they show up as irritability, low confidence or withdrawal." },
];

const helpWith = [
  "Confidence & self-esteem",
  "Study habits & screen discipline",
  "Exam stress & emotional balance",
  "Peer pressure & communication",
  "Career & future direction",
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={[serviceLd({ path: "/" }), faqLd(coreFaqs)]} />
      <StoryBackdrop />

      <div id="story">
        {/* ─── Hero ─── */}
        <section data-station="0" aria-labelledby="hero-title" className="relative flex min-h-[calc(100svh-72px)] items-center py-16 sm:py-20">
          <div className="container-x">
            <div className="max-w-[640px]">
              <p className="eyebrow animate-rise">For Classes 3–12 · 1-on-1 online mentorship</p>
              <h1 id="hero-title" className="display-xl mt-5 animate-rise [animation-delay:80ms]">
                A personal mentor for your child’s journey through <span className="accent">school and life.</span>
              </h1>
              <p className="lede mt-6 max-w-[540px] animate-rise [animation-delay:160ms]">
                Two private 30-minute video sessions every week with one dedicated mentor — to build confidence, healthy habits, emotional
                intelligence and direction. Beyond marks.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 animate-rise [animation-delay:240ms]">
                <Link href="/book-trial" className="btn btn-primary">
                  Book a free intro session <ArrowRight aria-hidden size={18} />
                </Link>
                <Link href="/how-it-works" className="btn btn-ghost">
                  See how it works
                </Link>
              </div>
              <ul className="mt-10 flex flex-wrap gap-2 animate-rise [animation-delay:320ms]">
                <li className="chip"><ShieldCheck aria-hidden size={14} className="text-sage" /> {claimCopy.mentorsShort}</li>
                <li className="chip"><HeartHandshake aria-hidden size={14} className="text-sage" /> Safe, non-judgemental space</li>
                <li className="chip"><CalendarCheck aria-hidden size={14} className="text-sage" /> Monthly parent updates</li>
              </ul>
              <p className="mt-10 font-display text-lg text-ink-soft italic">“{site.philosophy}”</p>
            </div>
          </div>
          <p aria-hidden className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 gap-5 text-[0.7rem] font-semibold tracking-[0.3em] text-muted uppercase sm:flex">
            <span>Listen</span>·<span>Understand</span>·<span>Grow</span>
          </p>
        </section>

        {/* ─── Why ─── */}
        <section data-station="1" aria-labelledby="why-title" className="section">
          <div className="container-x">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
              <div data-reveal>
                <p className="eyebrow">Why Mentora exists</p>
                <h2 id="why-title" className="display-lg mt-4">
                  Tutors teach subjects. <span className="accent">Who guides their life?</span>
                </h2>
                <p className="lede mt-6">
                  Schools and tuitions cover the syllabus. But every day, children carry worries they hesitate to share at home — afraid of a
                  lecture, a comparison or disappointing someone they love.
                </p>
                <p className="mt-5 text-ink-soft">
                  Mentora gives them a trusted adult who listens first, understands deeply and helps them think clearly.{" "}
                  <strong className="text-ink">The video call is the delivery mechanism; the relationship is the product.</strong>
                </p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {worries.map((w) => (
                  <li key={w.title} className="glass p-6 transition hover:-translate-y-1" data-reveal>
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lavender text-violet">
                      <w.icon aria-hidden size={20} />
                    </span>
                    <h3 className="mt-5 font-display text-xl font-medium">{w.title}</h3>
                    <p className="mt-2 text-[0.97rem] text-ink-soft">{w.body}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass mt-12 flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center" data-reveal>
              <p className="shrink-0 font-display text-xl font-medium text-ink">What we help with</p>
              <ul className="flex flex-wrap gap-2">
                {helpWith.map((h) => (
                  <li key={h} className="chip px-4 py-2 text-sm">{h}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section data-station="2" aria-labelledby="how-title" className="section">
          <div className="container-x">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl" data-reveal>
                <p className="eyebrow">How it works every week</p>
                <h2 id="how-title" className="display-lg mt-4">
                  Two conversations. <span className="accent">One steady relationship.</span>
                </h2>
              </div>
              <p className="max-w-md text-ink-soft" data-reveal>
                Not random chatting. Each week has a rhythm — one session about how your child is doing, one about how they are growing.
              </p>
            </div>
            <div className="mt-12">
              <WeeklyRhythm />
            </div>
          </div>
        </section>

        {/* ─── The 30-minute session ─── */}
        <section data-station="3" aria-labelledby="session-title" className="section">
          <div className="container-x">
            <div className="max-w-2xl" data-reveal>
              <p className="eyebrow">Inside every session</p>
              <h2 id="session-title" className="display-lg mt-4">
                Thirty minutes, <span className="accent">thoughtfully shaped.</span>
              </h2>
              <p className="lede mt-5">A simple structure that respects your child’s voice and ends with one small, practical step.</p>
            </div>
            <div className="mt-12">
              <SessionClock />
            </div>
          </div>
        </section>

        {/* ─── Age tracks ─── */}
        <section data-station="4" aria-labelledby="tracks-title" className="section">
          <div className="container-x">
            <div className="max-w-2xl" data-reveal>
              <p className="eyebrow">Tailored by stage</p>
              <h2 id="tracks-title" className="display-lg mt-4">
                A Class 4 child and a Class 11 teen <span className="accent">live in different worlds.</span>
              </h2>
              <p className="lede mt-5">Choose your child’s class group to see what mentors focus on.</p>
            </div>
            <div className="mt-10">
              <TrackSelector />
            </div>
          </div>
        </section>

        {/* ─── First month ─── */}
        <section data-station="5" aria-labelledby="month-title" className="section">
          <div className="container-x">
            <div className="mx-auto max-w-2xl text-center" data-reveal>
              <p className="eyebrow justify-center">The first 30 days</p>
              <h2 id="month-title" className="display-lg mt-4">
                Your child’s <span className="accent">first month</span>
              </h2>
              <p className="lede mt-5">Trust is built step by step. Here’s how the first eight sessions unfold.</p>
            </div>
            <div className="mt-14">
              <FirstMonthStations />
            </div>
          </div>
        </section>
      </div>

      {/* ─── Safety ─── */}
      <section aria-labelledby="safety-title" className="section relative bg-mist">
        <div className="container-x grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div data-reveal>
            <p className="eyebrow">Safety, boundaries &amp; transparency</p>
            <h2 id="safety-title" className="display-lg mt-4">
              You stay informed. <span className="accent">They keep a safe space.</span>
            </h2>
            <p className="lede mt-5">
              Children only speak honestly when they know their words won’t be repeated. Parents deserve clear visibility into growth and safety.
              We designed Mentora for both.
            </p>
            <div className="mt-8">
              <TrustList />
            </div>
            <Link href="/safety" className="link mt-7 inline-flex items-center gap-1.5">
              Read our safeguarding approach <ArrowRight aria-hidden size={16} />
            </Link>
          </div>
          <div data-reveal>
            <ParentReportSample />
          </div>
        </div>
        <div className="container-x mt-16">
          <h3 className="font-display text-2xl font-medium" data-reveal>Three layers of support, with clear boundaries</h3>
          <div className="mt-6">
            <SupportLayers />
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section aria-labelledby="pricing-title" className="section bg-cream">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div data-reveal>
            <p className="eyebrow">Simple, transparent pilot pricing</p>
            <h2 id="pricing-title" className="display-lg mt-4">
              Less than a tuition hour. <span className="accent">Far more personal.</span>
            </h2>
            <p className="lede mt-5">
              We’re welcoming our founding batch of {site.pilotSeats} students with careful mentor matching and hands-on attention. Start with a free
              intro session — your child meets a mentor before you pay anything.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 text-ink-soft">
              <Sparkles aria-hidden size={18} className="text-saffron" /> Month to month. Stop whenever you like.
            </p>
          </div>
          <div data-reveal>
            <PricingCard />
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section aria-labelledby="faq-title" className="section bg-cream pt-0">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div data-reveal>
            <p className="eyebrow">Questions parents ask</p>
            <h2 id="faq-title" className="display-lg mt-4">Frequently asked questions</h2>
            <p className="mt-5 text-ink-soft">
              Still unsure? <Link href="/contact" className="link">Contact us</Link> or read <Link href="/for-parents" className="link">what parents see</Link>.
            </p>
            <div className="mt-8">
              <SafetyDisclaimer />
            </div>
          </div>
          <FaqList faqs={coreFaqs} location="home" />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
