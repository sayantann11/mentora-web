import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/Section";
import { CtaBand } from "@/components/site/CtaBand";
import { tracks } from "@/content/programs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mentoring Programs for Classes 3–5, 6–8 and 9–12",
  description:
    "Three age-tailored mentoring tracks — Foundation, Growth and Direction — each covering the real challenges children face at that stage. Free intro session.",
  path: "/programs",
});

export default function ProgramsPage() {
  return (
    <>
      <section className="section pb-10">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Programs", path: "/programs" }]} />
          <PageHero
            eyebrow="Programs"
            title={
              <>
                One mentor. <span className="accent">Three stages of growing up.</span>
              </>
            }
            lede="The structure stays the same — two private sessions a week with one dedicated mentor. What changes is the language, the activities and the topics, matched to your child’s age."
          />
        </div>
      </section>
      <section className="section pt-6">
        <div className="container-x grid gap-6 lg:grid-cols-3">
          {tracks.map((t) => (
            <article key={t.id} className="card flex flex-col overflow-hidden p-0">
              <div className="h-36" style={{ background: `radial-gradient(80% 120% at 80% 0%, ${t.palette.b}, transparent), linear-gradient(135deg, ${t.palette.a}55, ${t.palette.c}33)` }} aria-hidden />
              <div className="flex flex-1 flex-col p-7">
                <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
                  {t.name} · {t.ages}
                </p>
                <h2 className="mt-2 font-display text-3xl font-medium">{t.classes}</h2>
                <p className="mt-2 font-display text-lg text-violet italic">{t.headline}</p>
                <p className="mt-4 text-ink-soft">{t.summary}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {t.focus.map((f) => (
                    <li key={f} className="chip">{f}</li>
                  ))}
                </ul>
                <Link href={`/programs/${t.slug}`} className="btn btn-primary mt-auto w-full translate-y-0 pt-3" style={{ marginTop: "1.75rem" }}>
                  Explore {t.classes} <ArrowRight aria-hidden size={18} />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <p className="container-x mt-10 text-ink-soft">
          All three tracks draw on the same <Link href="/curriculum" className="link">10-theme growth curriculum</Link> and follow the same{" "}
          <Link href="/how-it-works" className="link">30-minute session framework</Link>.
        </p>
      </section>
      <CtaBand />
    </>
  );
}
