# Launch checklist — the steps only you can do

## 1. Accounts & infrastructure
- [ ] **Supabase:** create a project (Mumbai region if available). Run `supabase/migrations/20261122000000_init.sql` then `…000100_storage.sql` in the SQL editor.
- [ ] Supabase **Auth → Providers → Email:** keep magic link on; **disable "Allow new users to sign up"**. **Auth → Users:** invite each admin email. **URL configuration:** Site URL = `https://<domain>`, add redirect `https://<domain>/admin/auth/callback`.
- [ ] Copy the Supabase URL, anon key and **service-role key** into Vercel env (service-role must NOT start with `NEXT_PUBLIC_`).
- [ ] Run `node --env-file=.env.local scripts/check-rls.mjs` — everything must say "blocked".
- [ ] **Resend:** verify your sending domain (SPF/DKIM DNS records), create an API key, set `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL`.
- [ ] **Cloudflare Turnstile:** create a widget for your domain; set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` (forms fail closed in production without the secret).
- [ ] Generate `IP_HASH_SALT` and `CRON_SECRET` (`openssl rand -hex 32`).
- [ ] **Vercel:** import the repo, set all env vars from `.env.example`, set `NEXT_PUBLIC_SITE_URL` to the final domain, add the domain + DNS. Confirm the cron job appears under Settings → Cron Jobs.
- [ ] Make sure `DEV_ADMIN_BYPASS` is **not** set in Vercel.

## 2. Payments
- [ ] Set `UPI_ID` — prefer a **business/merchant VPA**; personal VPAs used for business collections can be limited by banks/apps.
- [ ] Set `UPI_PAYEE_NAME` **exactly** as your UPI app shows it.
- [ ] Export your static QR from your UPI app and save it as `public/upi-qr.png` (shown as a fallback).
- [ ] **Real test:** enroll as a test parent, pay a small real amount (temporarily set the price low in `lib/pricing.ts`, or pay ₹2,000) from Android **and** iPhone, try the QR, the copy button and the deep link; submit the UTR; verify in admin; confirm the email + receipt; then refund it from your UPI app and record the refund. Restore the price.
- [ ] Try a duplicate UTR and an oversized/non-image upload — both must be rejected.
- [ ] If payments fail with an error about the transaction reference, set `UPI_INCLUDE_TR=false`.
- [ ] Ask an accountant about **GST registration**, invoicing format and record-keeping. Until then receipts say "not a tax invoice".

## 3. Content & facts (search the code for `TODO`)
- [ ] `content/site.ts`: legal business name, monitored contact email, WhatsApp number (`NEXT_PUBLIC_WHATSAPP_NUMBER`, digits with country code), **Grievance Officer** name/email, social links.
- [ ] `app/(site)/about/page.tsx`: founder story, photo and honest bio; real mentor profiles (with their consent).
- [ ] `app/(site)/safety/page.tsx`: make the vetting steps match exactly what you do. Have the safeguarding protocol reviewed by a child-safeguarding professional.
- [ ] `content/claims.ts`: flip a flag to `true` only when the claim is literally true (e.g. after police verification of every mentor).
- [ ] Review the free guide draft: `app/(site)/guide/five-conversations/page.tsx`.
- [ ] Re-confirm helpline numbers (Tele-MANAS 14416 / 1-800-891-4416, 112, Childline 1098) shortly before launch.

## 4. Legal (lawyer review required)
- [ ] Privacy policy (`app/(site)/privacy`), Terms (`/terms`), Refund policy (`/refund-policy`), consent texts (`content/consent.ts` — bump `POLICY_VERSION` if changed). Confirm DPDP Rules 2025 requirements for verifiable parental consent, cross-border transfer and breach notification. Add jurisdiction to the Terms.
- [ ] Data-processing terms with Supabase, Vercel, Resend, Cloudflare, Google.

## 5. Go-live checks
- [ ] PageSpeed Insights (mobile) on `/`, `/pricing`, one blog post on the live URL — targets: Perf ≥ 90, others 100, LCP < 2.5 s, CLS < 0.05.
- [ ] Test with reduced motion turned on and on a low-end Android phone (the 3D should be replaced by the static poster).
- [ ] Google Search Console + sitemap submission; Google Business Profile (see `MARKETING_LAUNCH.md`).
- [ ] Submit a real intro-session request; confirm it appears in `/admin` → Follow-ups today, the WhatsApp link opens with the pre-filled message, and both emails arrive.
- [ ] Bookmark `/admin/followups` and `/admin/payments` on your phone.
