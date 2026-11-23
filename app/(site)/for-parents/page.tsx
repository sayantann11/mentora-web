import Link from "next/link";
import type { Metadata } from "next";
import { Eye, EyeOff, MessageCircleHeart, CalendarDays } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/Section";
import { ParentReportSample, TrustList } from "@/components/sections/blocks";
import { FaqList } from "@/components/ui/FaqList";
import { JsonLd } from "@/components/ui/JsonLd";
import { CtaBand } from "@/components/site/CtaBand";
import { coreFaqs } from "@/content/faq";
import { faqLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "For Parents: What You See and What Stays Private",
  description:
    "How Mentora balances your child’s privacy with your peace of mind: monthly progress reports, a safety status, and how you can support growth at home.",
  path: "/for-parents",
});

const parentFaqs = coreFaqs.slice(0, 4);

export default function ForParentsPage() {
  return (
    <>
      <JsonLd data={faqLd(parentFaqs)} />
      <section className="section pb-10">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "For parents", path: "/for-parents" }]} />
          <PageHero
            eyebrow="For parents"
            title={
              <>
                See them grow — <span className="accent">without reading their diary.</span>
              </>
            }
            lede="You know your child better than anyone. A mentor doesn’t replace you; they give your child one more safe adult to think out loud with — and give you a clearer picture of how they’re doing."
          />
        </div>
      </section>

      <section className="section pt-6" aria-labelledby="balance">
        <div className="container-x">
          <h2 id="balance" className="display-md max-w-2xl">Privacy for the child, visibility for you</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="card">
              <Eye aria-hidden className="text-sage" />
              <h3 className="mt-4 font-display text-2xl font-medium">What you see</h3>
              <ul className="mt-4 grid gap-2.5 text-ink-soft">
                <li>• Themes your child is working on</li>
                <li>• Goals they chose and how weekly actions went</li>
                <li>• Positive developments the mentor noticed</li>
                <li>• Practical suggestions for home</li>
                <li>• A Green / Yellow / Red safety status every month</li>
                <li>• Direct contact if there’s ever a safety concern</li>
              </ul>
            </div>
            <div className="card">
              <EyeOff aria-hidden className="text-violet" />
              <h3 className="mt-4 font-display text-2xl font-medium">What stays private</h3>
              <ul className="mt-4 grid gap-2.5 text-ink-soft">
                <li>• Transcripts or recordings of sessions</li>
                <li>• Word-for-word quotes from your child</li>
                <li>• Details about friends, crushes or private frustrations</li>
              </ul>
              <p className="mt-5 text-ink-soft">
                Why? Children only open up when they trust that their words won’t be repeated. That trust is what makes the mentoring work. Safety concerns are
                always the exception — see the <Link href="/safety" className="link">limits of confidentiality</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-mist" aria-labelledby="report">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 id="report" className="display-md">The monthly report</h2>
            <p className="mt-5 text-ink-soft">
              At the end of each month — starting after Week 4’s “Progress Review” — you receive a short update by email or WhatsApp. It takes two minutes to
              read and is written to be useful, not to impress.
            </p>
            <ul className="mt-6 grid gap-4">
              <li className="flex gap-3"><CalendarDays aria-hidden className="shrink-0 text-violet" /><span className="text-ink-soft"><strong className="text-ink">Monthly rhythm.</strong> Predictable, so you’re never wondering.</span></li>
              <li className="flex gap-3"><MessageCircleHeart aria-hidden className="shrink-0 text-violet" /><span className="text-ink-soft"><strong className="text-ink">A suggestion for home.</strong> One concrete thing you can do to support the goal your child is working on.</span></li>
            </ul>
          </div>
          <ParentReportSample />
        </div>
      </section>

      <section className="section" aria-labelledby="home">
        <div className="container-x grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 id="home" className="display-md">How you can help at home</h2>
            <p className="mt-5 text-ink-soft">Small things make the biggest difference to how much your child gets from mentoring:</p>
          </div>
          <ul className="grid gap-3">
            {[
              ["Protect the slot", "Treat the two weekly sessions like any other important appointment — a quiet room, headphones, and no interruptions."],
              ["Don’t debrief", "Resist asking “What did you talk about?” Try “Was it good?” and let your child share if they want to."],
              ["Notice the effort", "When your child tries the small action from their session, notice it — kindly and without fuss."],
              ["Tell us what you see", "If something changes at home or school, tell the coordinator. It helps the mentor understand the bigger picture."],
            ].map(([t, b]) => (
              <li key={t} className="card p-5">
                <strong className="text-ink">{t}.</strong> <span className="text-ink-soft">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-mist" aria-labelledby="trust">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 id="trust" className="display-md">Our promises to parents</h2>
          <TrustList />
        </div>
      </section>

      <section className="section" aria-labelledby="pfaq">
        <div className="container-x max-w-3xl">
          <h2 id="pfaq" className="display-md mb-8">Parent questions</h2>
          <FaqList faqs={parentFaqs} location="for-parents" />
          <p className="mt-6 text-ink-soft">
            Free reading: <Link href="/blog/talk-to-a-child-who-wont-open-up" className="link">how to talk to a child who won’t open up</Link>.
          </p>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
