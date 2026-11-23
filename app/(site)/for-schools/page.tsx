import type { Metadata } from "next";
import { School, Users, LineChart, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/Section";
import { SchoolForm } from "@/components/forms/SchoolForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Student Mentoring Programmes for Schools",
  description:
    "Bring structured 1-on-1 life-skills mentoring to your students. Mentora works with schools across India on confidence, exam resilience and career direction.",
  path: "/for-schools",
});

const points = [
  { icon: Users, title: "1-on-1, not another assembly", body: "Every participating student gets a dedicated mentor and a private, regular conversation — the format that actually changes habits." },
  { icon: School, title: "Complements your counsellor", body: "Mentors handle everyday growth so your counsellor can focus on students who need specialised support. Clear referral paths both ways." },
  { icon: LineChart, title: "Aggregate, anonymised insight", body: "Termly summaries of themes across the cohort — never individual students’ private conversations." },
  { icon: ShieldCheck, title: "Safeguarding built in", body: "Parental consent, a written escalation protocol and strict mentor conduct rules, aligned with your school’s own policies." },
];

export default function ForSchoolsPage() {
  return (
    <section className="section">
      <div className="container-x">
        <Breadcrumbs items={[{ name: "For schools", path: "/for-schools" }]} />
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <PageHero
              eyebrow="For schools"
              title={
                <>
                  A mentor for every student <span className="accent">who needs one.</span>
                </>
              }
              lede="We’re exploring partnerships with a small number of schools for structured mentoring programmes. If you’re a principal, counsellor or coordinator, we’d love to hear what your students need."
            />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {points.map((p) => (
                <li key={p.title} className="card p-6">
                  <p.icon aria-hidden className="text-violet" />
                  <h2 className="mt-3 font-display text-xl font-medium">{p.title}</h2>
                  <p className="mt-2 text-[0.97rem] text-ink-soft">{p.body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">School programmes are in early design. Formats and pricing are agreed individually with each school.</p>
          </div>
          <div className="card self-start">
            <h2 className="font-display text-2xl font-medium">School enquiry</h2>
            <p className="mt-2 mb-6 text-ink-soft">No student data is collected here — just how to reach you.</p>
            <SchoolForm />
          </div>
        </div>
      </div>
    </section>
  );
}
