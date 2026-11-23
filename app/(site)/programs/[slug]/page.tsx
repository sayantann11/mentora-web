import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqList } from "@/components/ui/FaqList";
import { JsonLd } from "@/components/ui/JsonLd";
import { CtaBand } from "@/components/site/CtaBand";
import { FirstMonthStations } from "@/components/sections/blocks";
import { getTrack, tracks } from "@/content/programs";
import { posts } from "@/content/posts";
import { faqLd, pageMetadata, serviceLd } from "@/lib/seo";
import { formatINR, getPlan } from "@/lib/pricing";

export const dynamicParams = false;

export function generateStaticParams() {
  return tracks.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = getTrack((await params).slug);
  if (!t) return {};
  return pageMetadata({ title: t.seoTitle, description: t.seoDescription, path: `/programs/${t.slug}` });
}

export default async function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = getTrack((await params).slug);
  if (!t) notFound();
  const others = tracks.filter((x) => x.id !== t.id);
  const related = posts.filter((p) => p.tracks.includes(t.id)).slice(0, 3);
  const faqs = t.parentConcerns.map((c) => ({ q: c.q, a: c.a }));

  return (
    <>
      <JsonLd
        data={[
          serviceLd({ name: `1-on-1 mentoring for ${t.classes}`, description: t.seoDescription, path: `/programs/${t.slug}`, audience: `Parents of students in ${t.classes}` }),
          faqLd(faqs),
        ]}
      />
      <section className="relative overflow-hidden section pb-16">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{ background: `radial-gradient(50% 60% at 85% 20%, ${t.palette.b}aa, transparent 70%), radial-gradient(40% 50% at 10% 90%, ${t.palette.a}33, transparent 70%)` }}
        />
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Programs", path: "/programs" }, { name: t.classes, path: `/programs/${t.slug}` }]} />
          <p className="eyebrow">
            {t.name} track · {t.ages}
          </p>
          <h1 className="display-xl mt-4 max-w-4xl">
            Mentoring for {t.classes}: <span className="accent">{t.headline.toLowerCase()}</span>
          </h1>
          <p className="lede mt-6 max-w-2xl">{t.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/book-trial?class=${t.classGroup}`} className="btn btn-primary">
              Book a free intro session <ArrowRight aria-hidden size={18} />
            </Link>
            <Link href="/pricing" className="btn btn-ghost">
              {formatINR(getPlan().amountPaise)}/month · see what’s included
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="topics" className="section pt-8">
        <div className="container-x">
          <h2 id="topics" className="display-md">What mentors work on in {t.classes}</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.topics.map((topic) => (
              <li key={topic.title} className="card p-6">
                <span aria-hidden className="block h-1.5 w-10 rounded-full" style={{ background: t.palette.a }} />
                <h3 className="mt-4 font-display text-xl font-medium">{topic.title}</h3>
                <p className="mt-2 text-[0.98rem] text-ink-soft">{topic.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="conversations" className="section bg-mist">
        <div className="container-x">
          <h2 id="conversations" className="display-md">What a conversation might look like</h2>
          <p className="lede mt-4 max-w-2xl">Examples of the kind of thing a student might bring up — and how a mentor responds. These are illustrative, not real students.</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {t.sampleConversations.map((c) => (
              <figure key={c.prompt} className="card">
                <MessageCircle aria-hidden className="text-violet" />
                <blockquote className="mt-4 font-display text-2xl leading-snug font-medium text-ink">{c.prompt}</blockquote>
                <figcaption className="mt-4 text-ink-soft">
                  <strong className="text-ink">How the mentor helps: </strong>
                  {c.approach}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="first-month" className="section">
        <div className="container-x">
          <h2 id="first-month" className="display-md">The first month for a {t.classes.replace("Classes", "Class")} student</h2>
          <div className="mt-12">
            <FirstMonthStations />
          </div>
        </div>
      </section>

      <section aria-labelledby="concerns" className="section bg-mist">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 id="concerns" className="display-md">Questions parents of {t.classes} ask</h2>
            <p className="mt-4 text-ink-soft">
              More answers on the <Link href="/for-parents" className="link">for parents</Link> and <Link href="/safety" className="link">safety</Link> pages.
            </p>
          </div>
          <FaqList faqs={faqs} location={`program_${t.slug}`} />
        </div>
      </section>

      <section aria-labelledby="related" className="section">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          {related.length > 0 && (
            <div>
              <h2 id="related" className="font-display text-2xl font-medium">Reading for parents</h2>
              <ul className="mt-5 grid gap-3">
                {related.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="card flex items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5">
                      <span className="font-medium text-ink">{p.title}</span>
                      <ArrowRight aria-hidden size={18} className="shrink-0 text-violet" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h2 className="font-display text-2xl font-medium">Other age groups</h2>
            <ul className="mt-5 grid gap-3">
              {others.map((o) => (
                <li key={o.id}>
                  <Link href={`/programs/${o.slug}`} className="card flex items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5">
                    <span>
                      <span className="block font-medium text-ink">{o.classes} · {o.name}</span>
                      <span className="block text-sm text-muted">{o.headline}</span>
                    </span>
                    <ArrowRight aria-hidden size={18} className="shrink-0 text-violet" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <CtaBand title={`Find out if a mentor is right for your ${t.classes.replace("Classes", "Class")} child.`} />
    </>
  );
}
