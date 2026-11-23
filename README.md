# Mentora — website, lead capture, UPI payments & admin

Production website for **Mentora**, a 1-on-1 online mentorship service for school students (Classes 3–12) in India.
Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · React Three Fiber · Supabase · Resend · direct UPI.

> ⚖️ **Before launch:** have a qualified lawyer review the privacy policy, terms, consent text (`content/consent.ts`) and refund policy, and settle GST registration and invoicing with an accountant. See `LAUNCH_CHECKLIST.md`.

## Quick start (local, no external services needed)

```bash
npm install
cp .env.example .env.local     # then set DEV_ADMIN_BYPASS=true, UPI_ID and UPI_PAYEE_NAME
npm run dev                    # http://localhost:3000
```

Without Supabase env vars the app uses a **development-only JSON database** in `.data/` (git-ignored), stores uploads in
`.data/uploads`, and logs emails to the terminal instead of sending them. With `DEV_ADMIN_BYPASS=true` (ignored in production)
`/admin` opens without sign-in. The local DB refuses to run on Vercel.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm test` | Vitest: pricing, validation, UPI links, file signatures, CSV safety, the full payment state machine |
| `node --env-file=.env.local scripts/check-rls.mjs` | Proves the anon key cannot read/write any table (run after Supabase setup) |

## Going live (summary — details in `LAUNCH_CHECKLIST.md`)

1. Create a Supabase project → run `supabase/migrations/*.sql` (SQL editor or `supabase db push`).
2. In Supabase Auth: disable public sign-ups, add each admin as a user, set Site URL + redirect URL `https://<domain>/admin/auth/callback`.
3. Fill every variable in `.env.example` in Vercel project settings. Put your UPI QR image at `public/upi-qr.png` (optional fallback).
4. Deploy to Vercel. `vercel.json` schedules the daily retention job (`/api/cron/cleanup`, needs `CRON_SECRET`).
5. Run `scripts/check-rls.mjs`, then do one real ₹1–₹2,000 test payment end-to-end and refund it.

## Project map

```
app/
  (site)/            public pages (header/footer layout) — home, programs, pricing, safety, blog, legal, book-trial, enroll, pay…
  admin/             login + magic-link callback; (app)/ = protected dashboard; api/ = CSV export, dev screenshot proxy
  api/cron/cleanup   daily retention job
  actions/public.ts  server actions for every public form (validated again server-side)
  lp/[slug]          ad landing pages (no nav, one form, noindex)
components/          site chrome, home (3D backdrop, track selector, session clock), forms, pay, admin, ui
content/             site.ts (brand/contact), claims.ts (trust flags), programs.ts, framework.ts, faq.ts, posts.ts, consent.ts, blog/*.mdx
lib/                 pricing.ts (server-side amounts), validation.ts (zod), db/ (adapter + domain logic), payments/ (UPI + provider interface),
                     email.ts, storage.ts, auth.ts, seo.ts, analytics.ts, rateLimit.ts, turnstile.ts, fileSignature.ts
supabase/migrations  schema, RLS lockdown, private storage bucket
tests/               vitest suites
```

## Key docs

- `DECISIONS.md` — architecture, defaults chosen, trade-offs
- `PAYMENTS.md` — the direct-UPI flow, its honest limits, and how to add a gateway later
- `SECURITY.md` — threat model, RLS, CSP, rate limits, retention, breach response
- `SEO_PLAN.md` — keyword → page map, structured data, content plan
- `MARKETING_LAUNCH.md` — Google Business Profile, Search Console, first 30 days
- `LAUNCH_CHECKLIST.md` — every manual step only the owner can do (and every `TODO`)
