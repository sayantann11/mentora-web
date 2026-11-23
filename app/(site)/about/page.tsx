import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/Section";
import { CtaBand } from "@/components/site/CtaBand";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/content/site";

export const metadata: Metadata = pageMetadata({
  title: "About Mentora: Our Story and Philosophy",
  description: "Why Mentora exists, what we believe about children and growing up, and the people behind India’s 1-on-1 student mentorship pilot.",
  path: "/about",
});

const beliefs = [
  ["Every child needs a trusted adult", "Not to fix them — to listen, ask good questions and believe in them."],
  ["The relationship is the product", "Video calls are just the delivery. What helps is a steady relationship, week after week."],
  ["Small steps beat big lectures", "One practical action a week, chosen by the student, adds up to real change."],
  ["Privacy and safety go together", "Children need a private space to be honest — and clear rules that keep them safe."],
];

export default function AboutPage() {
  return (
    <>
      <section className="section pb-10">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "About", path: "/about" }]} />
          <PageHero
            eyebrow="About Mentora"
            title={
              <>
                Listen without judging. <span className="accent">Guide without controlling.</span>
              </>
            }
            lede="Mentora began with a simple observation: Indian children have tutors for every subject, but very few have someone whose job is to help them with life itself."
          />
        </div>
      </section>
      <section className="section pt-4">
        <div className="container-x grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="prose-mentora">
            <h2>Why we started</h2>
            <p>
              Schools cover the syllabus and tuition covers the gaps. Yet the things that shape a young person most — confidence, friendships, handling stress,
              making decisions, knowing what they want — are mostly left to chance. Many children carry worries quietly because they don’t want to disappoint
              anyone at home.
            </p>
            <p>
              We believe a steady, trained mentor — someone who isn’t a parent, a teacher or a classmate — can make a real difference. Two short conversations a
              week, with the same person, focused on how the child is doing and how they’re growing.
            </p>
            <h2>Starting small, on purpose</h2>
            <p>
              We’re running a founding pilot with no more than {site.pilotSeats} students. That lets us match every child carefully, learn from every family and
              improve the programme before we grow. We’ll measure what matters: whether students look forward to sessions, complete their small weekly actions,
              and whether parents see meaningful change.
            </p>
            {/* TODO: replace this section with the founder's real story in their own words. */}
            <h2>The people behind Mentora</h2>
            <p>
              <strong>TODO:</strong> Founder name, photo and a short, honest bio — background, why this matters to them, and their role in the pilot. Do not add
              qualifications or experience that can’t be verified.
            </p>
            <h2>Our mentors</h2>
            <p>
              <strong>TODO:</strong> Add real mentor profiles (first name, photo, short bio, languages) once mentors are confirmed and have consented to being
              featured. Until then we describe how mentors are selected and trained on the <Link href="/safety">safety page</Link>.
            </p>
          </div>
          <aside>
            <h2 className="font-display text-2xl font-medium">What we believe</h2>
            <ul className="mt-6 grid gap-4">
              {beliefs.map(([t, b]) => (
                <li key={t} className="card p-6">
                  <p className="font-display text-xl font-medium">{t}</p>
                  <p className="mt-2 text-ink-soft">{b}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
