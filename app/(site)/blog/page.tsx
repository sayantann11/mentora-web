import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/Section";
import { GuideSignup } from "@/components/forms/GuideSignup";
import { posts } from "@/content/posts";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Parenting Blog: Exams, Confidence, Screens & Careers",
  description:
    "Practical, honest articles for parents of school students in India — exam stress, screen time, confidence, stream choice and talking with your child.",
  path: "/blog",
});

const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default function BlogIndex() {
  const [first, ...rest] = posts;
  return (
    <>
      <section className="section pb-10">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Blog", path: "/blog" }]} />
          <PageHero
            eyebrow="The Mentora blog"
            title={
              <>
                Honest, practical reading <span className="accent">for parents.</span>
              </>
            }
            lede="Short guides on the things families actually worry about — written plainly, with ideas you can try this week."
          />
        </div>
      </section>
      <section className="section pt-4">
        <div className="container-x">
          <Link href={`/blog/${first.slug}`} className="card group grid gap-6 p-8 transition hover:-translate-y-1 md:grid-cols-[1.2fr_1fr] md:p-10">
            <div>
              <p className="chip">{first.tag} · {first.readMinutes} min read</p>
              <h2 className="display-md mt-5 group-hover:text-violet">{first.title}</h2>
              <p className="mt-4 text-ink-soft">{first.description}</p>
              <p className="mt-6 inline-flex items-center gap-2 font-semibold text-violet">
                Read article <ArrowRight aria-hidden size={18} />
              </p>
            </div>
            <div aria-hidden className="hidden rounded-3xl bg-[radial-gradient(70%_80%_at_70%_30%,#c9b6ee,transparent),linear-gradient(135deg,#f6d9b7,#efe9f7)] md:block" />
          </Link>
          <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="card group flex h-full flex-col p-7 transition hover:-translate-y-1">
                  <p className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">
                    {p.tag} · <time dateTime={p.date}>{fmt(p.date)}</time>
                  </p>
                  <h2 className="mt-3 font-display text-2xl leading-snug font-medium group-hover:text-violet">{p.title}</h2>
                  <p className="mt-3 text-[0.98rem] text-ink-soft">{p.description}</p>
                  <p className="mt-auto pt-5 text-sm font-semibold text-violet">{p.readMinutes} min read →</p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-16">
            <GuideSignup />
          </div>
        </div>
      </section>
    </>
  );
}
