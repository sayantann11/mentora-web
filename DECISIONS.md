# Decisions

Defaults chosen during the build, and why. Change any of them freely — each lists where it lives.

## Plan (as built)

- **Architecture:** Next.js 15 App Router on Vercel. All real content is server-rendered HTML; client components are small islands (forms, tabs, session clock, consent banner, 3D backdrop). Writes only happen in server actions / route handlers using the Supabase service-role key.
- **Data model:** `leads → trial_sessions`, `leads → enrollments → payments` (one payment row per month), `consents`, `school_enquiries`, `guide_subscribers`, `admin_audit_log`. Schema: `supabase/migrations/20261122000000_init.sql`.
- **Risks identified up front:** 3D vs. Lighthouse targets; manual UPI verification doesn't scale; children's-data compliance (DPDP); unverifiable trust claims in the old homepage. Each is handled below.

## Stack & versions

| Decision | Why |
|---|---|
| Upgraded starter's Next **15.5.6 → 15.5.29** and React 19.1.1 → 19.1.10 | 15.5.6 has published critical advisories (RSC RCE, DoS, source exposure). Stayed on 15.x to match the brief. |
| `postcss` npm override to ≥ 8.5.23 | Next 15 bundles a vulnerable PostCSS; `npm audit` now reports 0 vulnerabilities. |
| **No GSAP, no Framer Motion, no Lenis** in the final build | Scroll choreography drives the 3D camera from a plain scroll-progress value (no library needed); reveals use IntersectionObserver + CSS. Lenis was tried and removed: it added main-thread work on the homepage and smooth-scroll hijacking hurts accessibility. |
| No `@react-three/postprocessing` | Not cheap enough for mobile targets. |
| MDX via `@next/mdx` + `remark-gfm`; post metadata in `content/posts.ts` | Zero runtime MDX parsing; static pages. |
| Zod 4 with `z.config({ jitless: true })` | Our CSP has no `unsafe-eval`; Zod's JIT probe would otherwise log CSP violations. |
| Fonts: Fraunces (display, SOFT + opsz axes) + DM Sans, via `next/font` | Expressive, warm serif + the starter's body font. Dropped the WONK axis to save bytes. The **₹ glyph is served from a local system font** (`"Mentora Rupee"` @font-face with `unicode-range: U+20B9`) — otherwise every page downloaded ~120 KB of latin-ext font files for one character. |
| The `frontend-design` skill named in the brief | Not available in this environment; design decisions were made directly (tokens in `app/globals.css`). |

## Design

- **Palette:** kept the starter's plum/purple identity, warmed with saffron + peach (from the old HTML's gold accents) and sage for "safe/positive". Tokens on `@theme` in `app/globals.css`. Light theme only (brief targets parents on phones; no dark mode requested).
- **3D concept — "the growth journey":** a winding path of 15 soft pebble stepping-stones (one instanced mesh) rising as you scroll, three larger "key" stones (Listen · Understand · Grow) that light up as you pass story sections, gently drifting orbs, and a warm light at the end. Procedural geometry only — no `.glb`, no textures, no HDR download. The age-track selector recolours the whole scene (and the CSS poster) per track.
- **Performance guardrails:** a CSS poster is always the first paint. WebGL loads only **after the first user interaction** (or after 8 s on wide screens), and only if: no reduced-motion, no Save-Data/2G, ≥ 4 GB device memory, ≥ 4 cores, WebGL available. The WebGL capability probe itself is deferred (creating a test context costs ~800 ms on software-GL devices). `PerformanceMonitor` lowers DPR on decline and falls back to the poster on repeated drops or context loss; rendering pauses when the tab is hidden.
- **Glass cards** use solid translucent fills, not `backdrop-filter` — measurably cheaper on mid-range phones.

## Honesty rules

- `content/claims.ts` holds every trust claim as a flag. **All default to `false`**, so the site shows softer wording ("Mentors are selected and trained…"). Flip a flag only when it is literally true.
- No testimonials, ratings, student counts or results anywhere. No `AggregateRating`/`Review` schema. The sample parent report and sample conversations are labelled **"Illustrative example"**.
- The Safety page describes a vetting process (interview, reference checks, training). **Edit it to match what you actually do** (marked `TODO`).
- Helplines verified via web search on 22 Nov 2026: Tele-MANAS **14416 / 1-800-891-4416** (MoHFW), emergency **112**, Childline **1098**.

## Product defaults I chose (change if you disagree)

| Default | Where |
|---|---|
| Pilot size 20 — single value | `content/site.ts → pilotSeats` |
| Price ₹2,000 / 8 sessions, in paise, server-side only | `lib/pricing.ts` |
| Reference code format `MNT-YYMM-XXXX` (4 random chars, no 0/O/1/I/L); unguessable 256-bit `access_token` in the `/pay/<token>` URL | `lib/ids.ts` |
| Refund policy: unused sessions refunded at ₹250 each; first-month guarantee before session 3; 48 h notice; refunds by UPI to the source account within 7 working days | `app/(site)/refund-policy/page.tsx`, `content/faq.ts` |
| Rescheduling: 12 h notice | refund policy + terms |
| New leads get a same-day follow-up so they appear in "Follow-ups due today" | `lib/db/index.ts → createLead` |
| Retention: screenshots deleted 30 days after verification/rejection; unconverted leads anonymised after 12 months; enrollments marked lapsed 7 days after an unpaid renewal | `app/api/cron/cleanup/route.ts` |
| Rejecting a payment frees its UTR (kept in the reject reason) so a corrected/genuine submission can use it | `lib/db/index.ts → rejectPayment` |
| Receipts are payment acknowledgements, not tax invoices (until GST is settled) | `app/receipt/[token]/page.tsx` |
| Blog author shown as "the Mentora team" | `lib/seo.ts`, blog page |
| Consent banner: "Essential only" is the primary button; nothing non-essential loads before a choice | `components/site/ConsentAndAnalytics.tsx` |
| No ad pixels ever load on pages that handle a child's data (`/book-trial`, `/enroll`, `/pay`, `/lp`, …) even after consent | same file |

## Development-only conveniences

- **Local JSON DB** (`lib/db/localAdapter.ts`) mirrors the SQL unique constraints so the whole flow — and the test suite — runs without Supabase. It throws on Vercel.
- **`DEV_ADMIN_BYPASS=true`** skips admin login only when `NODE_ENV !== "production"`. Verified: a production build redirects `/admin` to `/admin/login` even with the flag set.

## Measured results (local production build, Lighthouse 12 mobile, simulated throttling)

| Page | Perf | A11y | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 92 | 100 | 100 | 100 | 3.0 s | 0 | 110 ms |
| `/pricing` | 93 | 100 | 100 | 100 | 3.0 s | 0.001 | 50 ms |
| `/blog/exam-stress-class-9-to-12` | 91 | 100 | 100 | 100 | 3.2 s | 0.042 | 50 ms |
| `/book-trial` | 91 | 100 | 100 | 100 | 3.3 s | 0 | 50 ms |

**Not yet met:** LCP < 2.5 s. These runs were against `next start` on a Windows dev machine (~450 ms TTFB); on Vercel's CDN, static pages have far lower TTFB. Re-measure on the deployed URL (PageSpeed Insights); if LCP is still above 2.5 s, the next lever is dropping the Fraunces preload on pages whose LCP element is body text.
