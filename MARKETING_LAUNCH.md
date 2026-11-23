# Marketing launch

## Day 0 — set-up
- [ ] **Google Search Console:** add the domain property (DNS TXT record), submit `https://<domain>/sitemap.xml`, request indexing for `/`, `/pricing`, the three program pages.
- [ ] **Google Business Profile:** category "Educational consultant" / "Tutoring service" (closest fit), *service-area business* with your address hidden, service area = India. Add the website, WhatsApp number, hours, the real description (no claims you can't prove), logo and real photos. Never post fake reviews; ask real pilot parents only after they've had a month.
- [ ] **GA4:** create a property, set `NEXT_PUBLIC_GA_ID`. Mark `submit_trial_form` as a key event. `submit_payment_proof` is *not* a purchase; record real revenue only from verified payments (admin CSV).
- [ ] **WhatsApp Business:** profile with logo, description, hours, a greeting message and quick replies matching the admin templates. Catalogue item "Monthly mentorship — ₹2,000" (optional).
- [ ] **Instagram / LinkedIn:** create profiles, add them to `content/site.ts → social`.

## Ad campaigns (optional)
- Use the landing pages: `/lp/exam-stress`, `/lp/screen-time`, `/lp/confidence`, `/lp/mentor`. Always add UTMs, e.g. `?utm_source=instagram&utm_medium=paid&utm_campaign=exam-stress-nov`. Attribution is saved on each lead and shown in admin "Leads by source".
- Meta Pixel / Google Ads tags are off by default (`NEXT_PUBLIC_ENABLE_META_PIXEL`, `NEXT_PUBLIC_ENABLE_GOOGLE_ADS`). Even when enabled they load only after consent and **never** on pages that collect a child's data. Target ads at **parents**, never at children.
- Meta and Google restrict ads touching on mental health; keep copy about life skills, habits and confidence, not diagnosis or treatment.

## First 30 days content plan
| Week | Website | Social (3 posts/week) | WhatsApp / offline |
|---|---|---|---|
| 1 | Launch; share the free guide `/guide` | Founder intro (real story); "What is a mentor?"; one tip from the guide | Personal message to 30 parents you know; ask for introductions, not sales |
| 2 | Publish 1 new blog post | Carousel: the 30-minute session; "Tutor vs mentor vs counsellor"; a parent tip | 2 school counsellors / PTA groups: offer a free 20-min parent talk |
| 3 | Publish 1 new blog post | "Your child's first month" (Know Me → Progress Review); screen-time tip; Q&A | Run the parent talk; collect guide sign-ups (with consent) |
| 4 | Update FAQ with real questions you received | Behind the scenes: how mentors are trained; exam-season tips; pilot seats update (true numbers only) | Follow up every lead; ask enrolled parents for honest feedback |

Measure weekly in `/admin`: leads by source, intro → enrolled conversion, follow-ups cleared.
