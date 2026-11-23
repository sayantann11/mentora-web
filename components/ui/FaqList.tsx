"use client";

import { Plus } from "lucide-react";
import type { Faq } from "@/content/faq";
import { track } from "@/lib/analytics";

export function FaqList({ faqs, location }: { faqs: Faq[]; location: string }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
      {faqs.map((f) => (
        <details
          key={f.q}
          className="group"
          onToggle={(e) => {
            if ((e.currentTarget as HTMLDetailsElement).open) track("faq_expand", { question: f.q.slice(0, 80), location });
          }}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-left font-display text-[1.15rem] font-medium text-ink transition hover:bg-mist/60 [&::-webkit-details-marker]:hidden">
            {f.q}
            <Plus aria-hidden size={20} className="shrink-0 text-violet transition-transform duration-300 group-open:rotate-45" />
          </summary>
          <div className="px-6 pb-6 text-[1rem] leading-relaxed text-ink-soft">{f.a}</div>
        </details>
      ))}
    </div>
  );
}
