import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Ear, MessageCircleQuestion, Search, Lightbulb, Repeat, Heart } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/Section";
import { WeeklyRhythm, ProblemModel, FirstMonthStations } from "@/components/sections/blocks";
import { SessionClock } from "@/components/home/SessionClock";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqList } from "@/components/ui/FaqList";
import { JsonLd } from "@/components/ui/JsonLd";
import { mentorPrinciples } from "@/content/framework";
import { faqLd, pageMetadata } from "@/lib/seo";
import type { Faq } from "@/content/faq";

export const metadata: Metadata = pageMetadata({
  title: "How Mentora Works: Weekly 1-on-1 Mentoring",
  description:
    "Two 30-minute sessions a week — Life & Mind and Growth & Direction — following a structured framework that turns reflection into one small action each week.",
  path: "/how-it-works",
});

const icons = [Ear, MessageCircleQuestion, Search, Lightbulb, Repeat, Heart];

const faqs: Faq[] = [
  {
    q: "Is a session just chatting?",
    a: "No. Every session follows the same six-step structure — check-in, open conversation, deep dive, guidance, one action, wrap-up — so conversations are warm but purposeful, and each one ends with a concrete next step.",
  },
  {
    q: "Does the mentor give advice?",
    a: "Mentors help students think, rather than telling them what to do. They ask open questions, help the student see patterns and options, and let the student choose. Solutions a child creates are the ones they actually follow.",
  },
  {
    q: "What if my child has nothing to talk about?",
    a: "That happens, especially early on. Session B always has a growth topic from the curriculum ready, and mentors follow up on the last week’s action, so there’s always somewhere to start.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd data={faqLd(faqs)} />
      <section className="section pb-12">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "How it works", path: "/how-it-works" }]} />
          <PageHero
            eyebrow="How it works"
            title={
              <>
                Warm conversations, <span className="accent">with a structure underneath.</span>
              </>
            }
            lede="Mentora pairs your child with one dedicated mentor for two private 30-minute video sessions a week. Here’s exactly what happens — and why."
          >
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book-trial" className="btn btn-primary">
                Book a free intro session <ArrowRight aria-hidden size={18} />
              </Link>
              <Link href="/pricing" className="btn btn-ghost">See pricing</Link>
            </div>
          </PageHero>
        </div>
      </section>

      <section aria-labelledby="rhythm" className="section pt-8">
        <div className="container-x">
          <h2 id="rhythm" className="display-md max-w-2xl">The weekly rhythm: “How are you doing?” + “How are you growing?”</h2>
          <p className="lede mt-4 max-w-2xl">Two different conversations, every week, with the same trusted person.</p>
          <div className="mt-10">
            <WeeklyRhythm />
          </div>
        </div>
      </section>

      <section aria-labelledby="framework" className="section bg-mist">
        <div className="container-x">
          <h2 id="framework" className="display-md max-w-2xl">The 30-minute session framework</h2>
          <p className="lede mt-4 max-w-2xl">Each session moves from listening to one practical action. Tap a step to see what happens.</p>
          <div className="mt-12">
            <SessionClock />
          </div>
        </div>
      </section>

      <section aria-labelledby="model" className="section">
        <div className="container-x">
          <h2 id="model" className="display-md max-w-2xl">How mentors find the real problem</h2>
          <p className="lede mt-4 max-w-2xl">
            Mentors use a simple problem-solving model: <strong className="text-ink">Situation → Thought → Feeling → Behaviour → Consequence.</strong> It helps a
            student see that the story they tell themselves shapes what they do next.
          </p>
          <div className="mt-10">
            <ProblemModel />
          </div>
        </div>
      </section>

      <section aria-labelledby="approach" className="section bg-mist">
        <div className="container-x grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 id="approach" className="display-md">The mentor approach</h2>
            <p className="lede mt-4">
              A mentor is not a teacher, a parent or a secret friend. They are a steady, trained adult whose only job in that half hour is to understand
              your child and help them grow.
            </p>
            <p className="mt-5 font-display text-xl text-violet italic">Listen without judging. Guide without controlling.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {mentorPrinciples.map((p, i) => {
              const Icon = icons[i];
              return (
                <li key={p} className="card flex gap-4 p-5 sm:p-6">
                  <Icon aria-hidden className="shrink-0 text-violet" />
                  <span className="text-ink">{p}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section aria-labelledby="month" className="section">
        <div className="container-x">
          <h2 id="month" className="display-md max-w-2xl">The first month</h2>
          <p className="lede mt-4 max-w-2xl">
            The first eight sessions follow a set journey, ending with your first parent update. After that, sessions follow the{" "}
            <Link href="/curriculum" className="link">10-theme growth curriculum</Link>, adapted to your child’s goals.
          </p>
          <div className="mt-12">
            <FirstMonthStations />
          </div>
        </div>
      </section>

      <section aria-labelledby="hiw-faq" className="section pt-0">
        <div className="container-x max-w-3xl">
          <h2 id="hiw-faq" className="display-md mb-8">Common questions</h2>
          <FaqList faqs={faqs} location="how-it-works" />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
