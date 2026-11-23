import Link from "next/link";
import { ArrowRight, Check, X, ShieldCheck, Layers, Sparkles } from "lucide-react";
import { site } from "@/content/site";
import { claimCopy } from "@/content/claims";
import { firstMonth, weeklySessions, supportLayers, problemModel } from "@/content/framework";
import { formatINR, getPlan, perSessionPaise } from "@/lib/pricing";

export function PricingCard({ showNotIncluded = false, headingLevel = "h3" }: { showNotIncluded?: boolean; headingLevel?: "h2" | "h3" }) {
  const plan = getPlan();
  const H = headingLevel;
  const included = [
    `${plan.sessionsPerMonth} private ${plan.sessionMinutes}-minute video sessions a month (2 a week)`,
    "A dedicated mentor matched to your child",
    "Age-tailored curriculum for Classes 3–12",
    "Personal goals and weekly progress tracking",
    "Monthly high-level parent update with a safety status",
    "Referral to qualified professionals when required",
    "A free introductory session before you decide",
  ];
  const notIncluded = ["Tuition or homework help", "Therapy, diagnosis or emergency support", "Psychometric tests or guaranteed results"];
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-plum/10 bg-white p-7 shadow-[var(--shadow-lift)] sm:p-10">
      <div aria-hidden className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-lavender blur-2xl" />
      <div className="relative">
        <p className="chip border-saffron/40 bg-peach/40 text-saffron-ink">
          <Sparkles aria-hidden size={14} /> Founding pilot batch, limited to {site.pilotSeats} students
        </p>
        <H className="mt-5 font-display text-2xl font-medium">Monthly 1-on-1 mentorship</H>
        <p className="mt-4 flex items-end gap-2">
          <span className="font-display text-6xl leading-none font-medium tracking-tight text-ink">{formatINR(plan.amountPaise)}</span>
          <span className="pb-1.5 text-muted">/ month</span>
        </p>
        <p className="mt-2 text-ink-soft">
          That’s <strong className="text-ink">{formatINR(perSessionPaise(plan))} per private session</strong>. Paid monthly by UPI. No lock-in, no auto-debit.
        </p>
        <ul className="mt-7 grid gap-3">
          {included.map((i) => (
            <li key={i} className="flex gap-3 text-ink-soft">
              <Check aria-hidden size={20} className="mt-0.5 shrink-0 text-sage" />
              {i}
            </li>
          ))}
        </ul>
        {showNotIncluded && (
          <>
            <p className="mt-7 text-sm font-semibold text-ink">Not included</p>
            <ul className="mt-3 grid gap-2">
              {notIncluded.map((i) => (
                <li key={i} className="flex gap-3 text-sm text-muted">
                  <X aria-hidden size={18} className="mt-0.5 shrink-0" />
                  {i}
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/book-trial" className="btn btn-primary flex-1">
            Book free intro session <ArrowRight aria-hidden size={18} />
          </Link>
          <Link href="/enroll" className="btn btn-ghost flex-1">
            Enroll &amp; pay
          </Link>
        </div>
        <p className="mt-4 text-center text-sm text-muted">Most families start with the free intro session. We’ll send your payment link afterwards.</p>
      </div>
    </div>
  );
}

const statusStyles = {
  Green: "bg-status-green",
  Yellow: "bg-status-yellow",
  Red: "bg-status-red",
} as const;

export function ParentReportSample() {
  return (
    <figure className="relative rounded-[1.75rem] border border-line bg-white p-6 shadow-[var(--shadow-lift)] sm:p-8">
      <div className="absolute -top-3 left-6 rounded-full bg-saffron px-3 py-1 text-xs font-bold tracking-wide text-ink uppercase">
        Illustrative example
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Monthly parent update · Month 1</p>
          <p className="mt-1 font-display text-xl font-medium">Aarav · Class 7 (sample)</p>
        </div>
        <p className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1.5 text-sm font-semibold text-status-green">
          <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${statusStyles.Green}`} /> Safety status: Green
        </p>
      </div>
      <dl className="mt-5 grid gap-5 text-[0.98rem]">
        <div>
          <dt className="font-semibold text-ink">Areas worked on</dt>
          <dd className="mt-1 text-ink-soft">Evening screen habits, nervousness before tests, and speaking up in class.</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Positive developments</dt>
          <dd className="mt-1 text-ink-soft">Tried a 30-minute phone-free study block on most weekdays and described feeling calmer before Friday’s maths test.</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Next month’s focus</dt>
          <dd className="mt-1 text-ink-soft">Asking for help early when a topic feels confusing.</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">A suggestion for home</dt>
          <dd className="mt-1 text-ink-soft">Notice and appreciate the effort on the evening routine, rather than focusing only on marks.</dd>
        </div>
      </dl>
      <figcaption className="mt-6 border-t border-line pt-4 text-sm text-muted">
        This is a made-up example to show the format. Real updates never include transcripts or quotes from private conversations.
      </figcaption>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted" aria-label="Safety status legend">
        {(["Green", "Yellow", "Red"] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span aria-hidden className={`h-2 w-2 rounded-full ${statusStyles[s]}`} />
            {s}: {s === "Green" ? "no concerns" : s === "Yellow" ? "something to watch, discussed with you" : "safeguarding protocol activated"}
          </span>
        ))}
      </div>
    </figure>
  );
}

export function WeeklyRhythm() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {weeklySessions.map((s) => (
        <article key={s.id} className="glass p-7 sm:p-9" data-reveal>
          <div className="flex items-center justify-between">
            <span className="chip">Session {s.id} · weekly · 30 min</span>
            <span aria-hidden className="font-display text-6xl leading-none text-lilac">{s.id}</span>
          </div>
          <h3 className="mt-5 font-display text-[1.75rem] font-medium">{s.name}</h3>
          <p className="mt-1 font-display text-lg text-violet italic">{s.question}</p>
          <p className="mt-4 text-ink-soft">{s.body}</p>
          <ul className="mt-5 grid gap-2">
            {s.points.map((p) => (
              <li key={p} className="flex gap-2.5 text-ink-soft">
                <Check aria-hidden size={18} className="mt-1 shrink-0 text-sage" />
                {p}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export function FirstMonthStations() {
  return (
    <ol className="relative grid gap-5 md:grid-cols-4">
      <span aria-hidden className="absolute top-7 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-lilac via-violet to-saffron md:block" />
      {firstMonth.map((w) => (
        <li key={w.week} className="relative" data-reveal>
          <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full border-4 border-cream bg-plum font-display text-xl text-white shadow-[var(--shadow-soft)]">
            {w.week}
          </span>
          <div className="glass mt-4 p-6">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Week {w.week}</p>
            <h3 className="mt-1 font-display text-2xl font-medium">{w.name}</h3>
            <p className="mt-2 text-[0.98rem] text-ink-soft">{w.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SupportLayers() {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {supportLayers.map((l, i) => (
        <li key={l.name} className={`rounded-[var(--radius-card)] border p-6 ${i === 0 ? "border-plum/20 bg-plum text-white" : "border-line bg-white"}`}>
          <Layers aria-hidden className={i === 0 ? "text-saffron" : "text-violet"} />
          <p className={`mt-4 text-xs font-semibold tracking-[0.14em] uppercase ${i === 0 ? "text-lilac" : "text-muted"}`}>
            Layer {i + 1} · {l.who}
          </p>
          <h3 className={`mt-1 font-display text-xl font-medium ${i === 0 ? "text-white" : ""}`}>{l.name}</h3>
          <p className={`mt-2 text-[0.97rem] ${i === 0 ? "text-white/85" : "text-ink-soft"}`}>{l.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function ProblemModel() {
  return (
    <div className="glass p-6 sm:p-8">
      <ol className="grid gap-3 sm:grid-cols-5">
        {problemModel.steps.map((s, i) => (
          <li key={s} className="relative rounded-2xl bg-white p-4 text-center shadow-[var(--shadow-soft)]">
            <p className="text-xs font-semibold tracking-[0.14em] text-violet uppercase">{s}</p>
            <p className="mt-2 font-display text-lg leading-snug text-ink">{problemModel.example[i]}</p>
            {i < 4 && (
              <ArrowRight aria-hidden size={18} className="absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 text-lilac sm:block" />
            )}
          </li>
        ))}
      </ol>
      <p className="mt-5 text-ink-soft">
        The mentor identifies the underlying pattern before suggesting anything. Change the thought (“I’ll fail” → “I can do one chapter tonight”), and the
        feeling, behaviour and consequence start to shift too.
      </p>
    </div>
  );
}

export function TrustList() {
  const items = [
    claimCopy.mentors,
    "A written safeguarding and escalation protocol",
    "Your child’s conversations stay private; you get a monthly overview",
    "No off-platform contact, social media or gifts between mentors and students",
    "A free intro session before any payment",
    "Month-to-month. No lock-in, no auto-debit",
  ];
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((t) => (
        <li key={t} className="flex gap-3 rounded-2xl border border-line bg-white/80 p-4 text-ink-soft">
          <ShieldCheck aria-hidden size={20} className="mt-0.5 shrink-0 text-sage" />
          {t}
        </li>
      ))}
    </ul>
  );
}
