import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarHeart, MessageCircle, ShieldCheck, Video } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { TrialForm } from "@/components/forms/TrialForm";
import { SafetyDisclaimer } from "@/components/site/Disclaimer";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/content/site";

export const metadata: Metadata = pageMetadata({
  title: "Book a Free Intro Mentoring Session",
  description: "Book a free 1-on-1 introductory session with a Mentora mentor for your child (Classes 3–12). No payment needed — we’ll reply on WhatsApp within 24 hours.",
  path: "/book-trial",
});

const steps = [
  { icon: MessageCircle, title: "We message you on WhatsApp", body: "Within 24 hours, to find a time that works for your family." },
  { icon: Video, title: "A relaxed first conversation", body: "Your child meets a mentor on a video call. You can join at the start to say hello and ask questions." },
  { icon: CalendarHeart, title: "You decide — no pressure", body: "If it feels right, we send your enrollment link. If not, that’s completely fine." },
];

export default function BookTrialPage() {
  return (
    <section className="section">
      <div className="container-x">
        <Breadcrumbs items={[{ name: "Book a free intro session", path: "/book-trial" }]} />
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Free introductory session</p>
            <h1 className="display-lg mt-4">
              Let’s see if a mentor <span className="accent">feels right for your child.</span>
            </h1>
            <p className="lede mt-5">One free 1-on-1 conversation before you decide anything. Founding pilot batch, limited to {site.pilotSeats} students.</p>
            <ol className="mt-10 grid gap-6">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lavender text-violet">
                    <s.icon aria-hidden size={20} />
                  </span>
                  <span>
                    <strong className="block text-ink">{i + 1}. {s.title}</strong>
                    <span className="text-ink-soft">{s.body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-10 flex gap-3 rounded-2xl border border-line bg-white p-4 text-sm text-ink-soft">
              <ShieldCheck aria-hidden size={20} className="shrink-0 text-sage" />
              We only ask for your child’s first name and class group. Your details are used to arrange the session — never sold, never used for ads.
            </p>
            <div className="mt-4">
              <SafetyDisclaimer />
            </div>
          </div>
          <div className="card">
            <h2 className="mb-6 font-display text-2xl font-medium">Your details</h2>
            <Suspense fallback={<TrialForm />}>
              <TrialForm readClassFromUrl />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
