"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { tracks, type TrackId } from "@/content/programs";
import { setTrack } from "@/lib/sceneStore";

/**
 * Accessible tabs (WAI-ARIA tabs pattern). All three panels are server-rendered into the DOM
 * (hidden ones use the `hidden` attribute) so every topic is crawlable.
 */
export function TrackSelector() {
  const [active, setActive] = useState<TrackId>("growth");
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (tid: TrackId, focus = false) => {
    setActive(tid);
    setTrack(tid);
    if (focus) refs.current[tracks.findIndex((t) => t.id === tid)]?.focus();
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = tracks.length;
    const next = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next >= 0) {
      e.preventDefault();
      select(tracks[next].id, true);
    }
  };

  return (
    <div>
      <div role="tablist" aria-label="Choose your child’s class group" className="glass inline-flex w-full flex-wrap gap-1 p-1.5 sm:w-auto">
        {tracks.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${id}-tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`${id}-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => select(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={`flex-1 rounded-[1.1rem] px-4 py-3 text-left transition sm:flex-none sm:px-6 ${
              active === t.id ? "bg-plum text-white shadow-[var(--shadow-soft)]" : "text-ink-soft hover:bg-white"
            }`}
          >
            <span className="block text-[0.7rem] font-semibold tracking-[0.14em] uppercase opacity-80">{t.name}</span>
            <span className="block font-display text-lg font-medium">{t.classes}</span>
          </button>
        ))}
      </div>

      {tracks.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${id}-panel-${t.id}`}
          aria-labelledby={`${id}-tab-${t.id}`}
          hidden={active !== t.id}
          tabIndex={0}
          className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_1fr]"
        >
          <div className="glass p-7 sm:p-9">
            <p className="chip" style={{ borderColor: t.palette.b }}>
              <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: t.palette.a }} />
              {t.ages} · {t.name} stage
            </p>
            <h3 className="display-md mt-5">{t.headline}</h3>
            <p className="mt-4 text-ink-soft">{t.summary}</p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {t.topics.slice(0, 4).map((topic) => (
                <li key={topic.title} className="rounded-2xl border border-line bg-white/80 px-4 py-3">
                  <span className="block font-semibold text-ink">{topic.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted">{topic.body}</span>
                </li>
              ))}
            </ul>
            <Link href={`/programs/${t.slug}`} className="link mt-6 inline-flex items-center gap-1.5">
              Explore the {t.classes} programme <ArrowRight aria-hidden size={16} />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <figure className="glass flex-1 p-7">
              <MessageCircle aria-hidden className="text-violet" />
              <p className="mt-3 text-xs font-semibold tracking-[0.14em] text-muted uppercase">Sample topic</p>
              <blockquote className="mt-2 font-display text-xl leading-snug font-medium text-ink">{t.sampleConversations[0].prompt}</blockquote>
              <figcaption className="mt-4 text-[0.98rem] text-ink-soft">{t.sampleConversations[0].approach}</figcaption>
            </figure>
            <Link href={`/book-trial?class=${t.classGroup}`} className="btn btn-primary w-full">
              Book a free intro session for {t.classes} <ArrowRight aria-hidden size={18} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
