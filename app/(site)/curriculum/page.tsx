import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/Section";
import { CtaBand } from "@/components/site/CtaBand";
import { curriculum } from "@/content/framework";
import { tracks } from "@/content/programs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "The 10-Theme Life Skills Curriculum for Students",
  description:
    "From self-awareness to responsibility: the ten growth themes Mentora mentors work through with students in Classes 3–12, adapted to each age group.",
  path: "/curriculum",
});

export default function CurriculumPage() {
  return (
    <>
      <section className="section pb-10">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Curriculum", path: "/curriculum" }]} />
          <PageHero
            eyebrow="The growth curriculum"
            title={
              <>
                Ten questions every young person <span className="accent">deserves help answering.</span>
              </>
            }
            lede="After the first month, Session B follows a 10-theme life-skills curriculum. The themes are the same for every student; the language, activities and depth change with age — and the order adapts to your child’s goals."
          />
        </div>
      </section>
      <section className="section pt-6">
        <div className="container-x">
          <ol className="grid gap-4 md:grid-cols-2">
            {curriculum.map((c) => (
              <li key={c.n} className="card relative flex gap-6 overflow-hidden" data-reveal>
                <span aria-hidden className="font-display text-6xl leading-none font-medium text-lavender">{String(c.n).padStart(2, "0")}</span>
                <div>
                  <h2 className="font-display text-2xl font-medium">{c.theme}</h2>
                  <p className="mt-1 font-display text-lg text-violet italic">{c.question}</p>
                  <p className="mt-3 text-ink-soft">{c.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="section bg-mist" aria-labelledby="by-age">
        <div className="container-x">
          <h2 id="by-age" className="display-md max-w-2xl">How the themes change with age</h2>
          <p className="lede mt-4 max-w-2xl">Take “Resilience — how do I handle failure?” It sounds very different at 9 and at 16.</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {tracks.map((t) => (
              <article key={t.id} className="card">
                <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">{t.classes} · {t.name}</p>
                <h3 className="mt-2 font-display text-xl font-medium">{t.topics[0].title}</h3>
                <p className="mt-2 text-ink-soft">{t.topics[0].body}</p>
                <Link href={`/programs/${t.slug}`} className="link mt-4 inline-block text-sm">
                  All {t.classes} topics →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
