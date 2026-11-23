/*
 * DRAFT FOR REVIEW — the free lead-magnet guide. Please review and edit the wording before promoting it.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { PrintButton } from "@/components/ui/PrintButton";

export const metadata: Metadata = pageMetadata({
  title: "5 Conversations to Have With Your Child This Week",
  description: "Five short, practical conversations for parents of school students — what to ask, how to listen, and what to avoid saying.",
  path: "/guide/five-conversations",
});

const conversations = [
  {
    title: "The “best and hardest” conversation",
    why: "It invites your child to share both good and difficult moments without feeling interrogated.",
    ask: ["“What was the best part of your week?”", "“What was the hardest part?”", "“Is there anything I could do to make next week easier?”"],
    avoid: "Jumping in to fix the hard part straight away. Just listen and reflect back what you heard.",
    age: "Works for every age. For Classes 3–5, try it at bedtime with a drawing.",
  },
  {
    title: "The “what are you good at” conversation",
    why: "Children often know their weaknesses better than their strengths. Naming strengths builds real confidence.",
    ask: ["“What’s something you’re better at now than last year?”", "“What do your friends come to you for?”", "“Which subject or activity makes time fly?”"],
    avoid: "Comparing with siblings or classmates, even positively (“You’re smarter than…”).",
    age: "For Classes 9–12, connect it to future choices: “Where could that strength be useful?”",
  },
  {
    title: "The “worry jar” conversation",
    why: "Worries shrink when they’re said out loud and taken seriously.",
    ask: ["“Is anything on your mind that you haven’t had a chance to talk about?”", "“On a scale of 1 to 10, how big is that worry?”", "“What’s one small thing that might make it a bit smaller?”"],
    avoid: "“Don’t be silly, that’s nothing to worry about.” It feels big to them.",
    age: "For younger children, write worries on slips of paper and put them in a jar to talk about together.",
  },
  {
    title: "The “screens, honestly” conversation",
    why: "Understanding your child’s screen use works better than policing it.",
    ask: ["“What do you enjoy most on your phone?”", "“When do you find it hardest to put it down?”", "“What would a good balance look like to you?”"],
    avoid: "Opening with a ban or a lecture. Agree on one small experiment together instead, like a phone-free dinner.",
    age: "Most useful for Classes 6–12.",
  },
  {
    title: "The “you are more than marks” conversation",
    why: "Many children believe their parents’ love depends on results. Hearing otherwise, in words, is powerful.",
    ask: ["“I want you to know I’m proud of how hard you work, whatever the marks say.”", "“What would you like me to notice more about you?”"],
    avoid: "Following it immediately with “…but you still need to study more.” Let it land.",
    age: "Especially important in exam years (Classes 9–12).",
  },
];

export default function FiveConversations() {
  return (
    <section className="section">
      <div className="container-x max-w-3xl">
        <Breadcrumbs items={[{ name: "Free guide", path: "/guide" }, { name: "5 conversations", path: "/guide/five-conversations" }]} />
        <p className="eyebrow">Free guide for parents</p>
        <h1 className="display-lg mt-4">5 conversations to have with your child this week</h1>
        <p className="lede mt-5">Ten minutes each. No special skills needed — just curiosity, patience and a phone in another room.</p>
        <div className="mt-6 print:hidden">
          <PrintButton />
        </div>
        <ol className="mt-12 grid gap-8">
          {conversations.map((c, i) => (
            <li key={c.title} className="card">
              <p className="text-xs font-semibold tracking-[0.14em] text-violet uppercase">Conversation {i + 1}</p>
              <h2 className="mt-2 font-display text-2xl font-medium">{c.title}</h2>
              <p className="mt-3 text-ink-soft"><strong className="text-ink">Why it helps: </strong>{c.why}</p>
              <p className="mt-4 font-semibold text-ink">Try asking</p>
              <ul className="mt-2 grid gap-1.5 text-ink-soft">
                {c.ask.map((a) => <li key={a}>• {a}</li>)}
              </ul>
              <p className="mt-4 text-ink-soft"><strong className="text-ink">Avoid: </strong>{c.avoid}</p>
              <p className="mt-2 text-sm text-muted">{c.age}</p>
            </li>
          ))}
        </ol>
        <div className="card mt-10 bg-mist">
          <h2 className="font-display text-2xl font-medium">Three listening habits that make every conversation work</h2>
          <ol className="mt-4 grid gap-2 text-ink-soft">
            <li><strong className="text-ink">1. Side by side beats face to face.</strong> Talk while walking, cooking or driving.</li>
            <li><strong className="text-ink">2. Reflect before you respond.</strong> “That sounds frustrating” before any advice.</li>
            <li><strong className="text-ink">3. Leave the door open.</strong> “I’m here if you want to talk later” is a complete answer.</li>
          </ol>
        </div>
        <p className="mt-8 text-sm text-muted">
          This guide is general information, not professional advice. If you’re worried about your child’s safety, call 112, or Tele-MANAS on 14416 for free 24×7
          support.
        </p>
        <p className="mt-6 text-ink-soft">
          Want a trained mentor to have these conversations with your child every week? <Link href="/book-trial" className="link">Book a free intro session</Link>.
        </p>
      </div>
    </section>
  );
}
