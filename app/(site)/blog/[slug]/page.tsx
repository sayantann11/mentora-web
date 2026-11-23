import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { GuideSignup } from "@/components/forms/GuideSignup";
import { CtaBand } from "@/components/site/CtaBand";
import { getPost, posts } from "@/content/posts";
import { tracks } from "@/content/programs";
import { articleLd, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const meta = pageMetadata({ title: post.seoTitle, description: post.description, path: `/blog/${post.slug}`, ogType: "article" });
  return { ...meta, openGraph: { ...meta.openGraph, type: "article", publishedTime: post.date } };
}

const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const { default: Body } = await import(`@/content/blog/${slug}.mdx`);
  const more = posts.filter((p) => p.slug !== slug).slice(0, 3);
  const programs = tracks.filter((t) => post.tracks.includes(t.id));

  return (
    <>
      <JsonLd data={articleLd(post)} />
      <article>
        <header className="section pb-10">
          <div className="container-x max-w-4xl">
            <Breadcrumbs items={[{ name: "Blog", path: "/blog" }, { name: post.tag, path: `/blog/${post.slug}` }]} />
            <p className="chip">{post.tag} · {post.readMinutes} min read</p>
            <h1 className="mt-5 text-[clamp(2.1rem,4.6vw,3.6rem)] font-medium">{post.title}</h1>
            <p className="lede mt-5">{post.description}</p>
            <p className="mt-6 text-sm text-muted">
              By the Mentora team · <time dateTime={post.date}>{fmt(post.date)}</time>
            </p>
          </div>
        </header>
        <div className="container-x grid max-w-6xl gap-12 pb-16 lg:grid-cols-[1fr_280px]">
          <div className="prose-mentora">
            <Body />
            <p className="mt-10 rounded-2xl border border-line bg-white p-5 text-sm">
              This article is general information for parents, not medical or psychological advice. If you’re worried about your child’s safety or mental
              health, please speak to a qualified professional.
            </p>
          </div>
          <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <p className="font-display text-xl font-medium">Want a mentor for your child?</p>
              <p className="mt-2 text-sm text-ink-soft">Two private 30-minute sessions a week. Start with a free intro session.</p>
              <Link href="/book-trial" className="btn btn-primary btn-sm mt-4 w-full">Book free intro session</Link>
            </div>
            {programs.length > 0 && (
              <div className="card p-6">
                <p className="text-sm font-semibold text-ink">Related programmes</p>
                <ul className="mt-3 grid gap-2 text-sm">
                  {programs.map((t) => (
                    <li key={t.id}>
                      <Link href={`/programs/${t.slug}`} className="link">{t.classes} · {t.name}</Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/pricing" className="link">Pricing</Link>
                  </li>
                </ul>
              </div>
            )}
          </aside>
        </div>
      </article>
      <section className="section bg-mist" aria-labelledby="more">
        <div className="container-x">
          <h2 id="more" className="display-md">Keep reading</h2>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {more.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="card group flex h-full flex-col p-6 transition hover:-translate-y-1">
                  <p className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">{p.tag}</p>
                  <p className="mt-2 font-display text-xl font-medium group-hover:text-violet">{p.title}</p>
                  <p className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet">
                    Read <ArrowRight aria-hidden size={16} />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-14">
            <GuideSignup />
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
