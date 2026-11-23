"use client";

import { useState } from "react";
import { sessionFlow } from "@/content/framework";

const R = 132;
const C = 160;
const COLORS = ["#b9a3dd", "#9a80d0", "#6a4ea3", "#3f2d63", "#e9a23b", "#5fb3a6"];

function arc(fromMin: number, toMin: number, r = R) {
  const a0 = (fromMin / 30) * Math.PI * 2 - Math.PI / 2;
  const a1 = (toMin / 30) * Math.PI * 2 - Math.PI / 2;
  const gap = 0.025;
  const x0 = C + r * Math.cos(a0 + gap);
  const y0 = C + r * Math.sin(a0 + gap);
  const x1 = C + r * Math.cos(a1 - gap);
  const y1 = C + r * Math.sin(a1 - gap);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/** Radial 30-minute clock. The list beside it is the accessible source of truth; the SVG is decorative. */
export function SessionClock() {
  const [active, setActive] = useState(0);
  const seg = sessionFlow[active];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div className="relative mx-auto w-full max-w-[380px]">
        <svg viewBox="0 0 320 320" aria-hidden className="w-full drop-shadow-[0_24px_40px_rgb(63_45_99/0.18)]">
          <circle cx={C} cy={C} r={R + 26} fill="rgb(255 255 255 / 0.7)" />
          {sessionFlow.map((s, i) => (
            <path
              key={s.name}
              d={arc(s.from, s.to)}
              fill="none"
              stroke={COLORS[i]}
              strokeWidth={i === active ? 34 : 24}
              strokeLinecap="round"
              style={{ transition: "stroke-width .35s ease, opacity .35s ease", opacity: i === active ? 1 : 0.55, cursor: "pointer" }}
              onMouseEnter={() => setActive(i)}
            />
          ))}
          {[0, 5, 10, 15, 20, 25].map((m) => {
            const a = (m / 30) * Math.PI * 2 - Math.PI / 2;
            return (
              <text key={m} x={C + (R - 38) * Math.cos(a)} y={C + (R - 38) * Math.sin(a) + 4} textAnchor="middle" fontSize="11" fill="#675f73" fontWeight={600}>
                {m}
              </text>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div className="max-w-[150px]">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
              {seg.from}–{seg.to} min
            </p>
            <p className="mt-1 font-display text-2xl leading-tight font-medium text-ink">{seg.name}</p>
          </div>
        </div>
      </div>

      <ol className="grid gap-2.5">
        {sessionFlow.map((s, i) => (
          <li key={s.name}>
            <button
              type="button"
              onClick={() => setActive(i)}
              onFocus={() => setActive(i)}
              aria-pressed={i === active}
              className={`flex w-full items-start gap-4 rounded-2xl border px-5 py-4 text-left transition ${
                i === active ? "border-violet/30 bg-white shadow-[var(--shadow-soft)]" : "border-transparent bg-white/50 hover:bg-white/80"
              }`}
            >
              <span aria-hidden className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ background: COLORS[i] }} />
              <span>
                <span className="block text-xs font-semibold tracking-[0.12em] text-muted uppercase">
                  {s.from}–{s.to} min · Step {i + 1}
                </span>
                <span className="mt-0.5 block font-display text-lg font-medium text-ink">{s.title}</span>
                <span className="mt-1 block text-[0.97rem] text-ink-soft">{s.body}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
