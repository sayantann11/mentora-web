# Security & data protection

## Principles
- The browser never talks to the database. All reads/writes go through server actions / route handlers using the **service-role key** (server-only env var, never `NEXT_PUBLIC_`). A scan of the built client bundle found no server secrets.
- **RLS is enabled and forced on every table**, with **no policies** and `revoke all` from `anon` and `authenticated`. The receipt-number function is executable only by `service_role`. The storage bucket is private. Verify with `node --env-file=.env.local scripts/check-rls.mjs` — every line must say "blocked".
- Every input is validated with zod on the client **and again on the server** (`lib/validation.ts`).

## Admin access
- Supabase Auth email magic link with `shouldCreateUser: false` (no public sign-up — also disable sign-ups in the Supabase dashboard).
- Allow-list `ADMIN_EMAILS`, enforced in `middleware.ts` **and** again in every admin page, server action and API route (`requireAdmin()` / `currentAdmin()`), using `supabase.auth.getUser()` (verifies the JWT with Supabase).
- Login responses are identical for allowed and unknown emails (no account enumeration); login is rate-limited (5 / 15 min / IP).
- Audit log (`admin_audit_log`): lead edits, verifications, rejections, refunds, renewals, CSV exports, screenshot views, anonymisations, cron runs.
- CSV export neutralises spreadsheet formula injection (`=`, `+`, `-`, `@`).

## Abuse protection
- Cloudflare Turnstile on public forms (server-verified; required in production — a missing secret on Vercel production fails closed).
- Honeypot field on every form.
- In-memory per-instance rate limits by hashed IP (trial 5/h, enroll 5/h, proof 8/h, uploads 6/h, school 4/h, guide 5/h). **Limitation:** per serverless instance; move to Upstash Redis if abuse appears.
- Uploads: ≤ 3 MB, JPEG/PNG/WebP verified by magic bytes, random object names, private bucket, signed URLs (2 min).

## HTTP headers (`next.config.ts`)
CSP (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `form-action 'self'`, explicit allow-list for Turnstile, GA, Vercel Analytics, optional Meta), HSTS (2 years, preload), `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`. Admin responses add `X-Robots-Tag: noindex` and `Cache-Control: no-store`; payment pages send `Referrer-Policy: no-referrer`.
**Trade-off:** `script-src` includes `'unsafe-inline'` because Next.js injects inline bootstrap scripts; moving to per-request nonces would force every page to render dynamically (losing static/CDN caching). Revisit if the threat model changes.

## Children's data (DPDP Act 2023 / DPDP Rules 2025)
- Parent submits every form and ticks an unticked consent box; the exact text shown + policy version + time + **hashed** IP + user agent are stored in `consents`.
- Child data limited to **first name and class group**. Free-text box warns against sensitive details.
- No ad pixels on any page that handles child data; analytics only after consent, with Google signals and ad personalisation off.
- Data-rights path: Grievance Officer email on Privacy/Contact pages; admin "Anonymise lead" action for erasure requests.
- Retention (daily cron, `CRON_SECRET` bearer): screenshots deleted 30 days after verification; unconverted leads anonymised after 12 months.

## Breach response (draft — review with your lawyer)
1. **Contain** (within hours): rotate `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CRON_SECRET`, `TURNSTILE_SECRET_KEY`; revoke admin sessions in Supabase; disable affected features.
2. **Assess:** use the Supabase logs and `admin_audit_log` to work out what data, whose, and when.
3. **Notify:** inform affected parents and the **Data Protection Board of India** as required by the DPDP Rules (the Rules set the content and timelines — confirm current requirements with your lawyer). Notify CERT-In where its directions apply.
4. **Fix and record:** root cause, remediation, and a written incident record.

## Reporting
Security concerns: email the address in `NEXT_PUBLIC_CONTACT_EMAIL`. Consider adding `/.well-known/security.txt` once the domain is live.
