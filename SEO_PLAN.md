# SEO plan

## Technical SEO (built)
- Metadata API on every page: unique title (≤ 60 chars incl. "| Mentora"), description (≤ 155), canonical, Open Graph + Twitter; `metadataBase`; `<html lang="en-IN">`.
- Dynamic OG images: `app/opengraph-image.tsx` and one per blog post.
- `app/sitemap.ts` (26 URLs) and `app/robots.ts` (disallows `/admin`, `/api`, `/pay`, `/payment`, `/enroll`, `/receipt`, `/lp`). Payment, admin, receipt and landing pages are also `noindex`.
- JSON-LD (validated by parsing every block): `Organization`, `WebSite` (all pages); `Service` + `Offer` (₹2,000 INR / month) on home, pricing and each program; `FAQPage` where FAQs are visible; `BreadcrumbList` on inner pages; `Article` on posts. **No `AggregateRating`/`Review`.**
- One `h1` per page, server-rendered content (checked with curl), internal links between programs ↔ curriculum ↔ blog ↔ pricing, `next/font` (no layout shift), no render-blocking third-party scripts.
- Lighthouse SEO = 100 on `/`, `/pricing`, a blog post and `/book-trial`.

## Keyword → page map

Search volumes were **not** verified — this environment has no keyword-volume tool. Before investing in content, check each cluster in **Google Keyword Planner** (free with a Google Ads account) and **Search Console** after launch, then re-prioritise.

| Cluster (examples) | Intent | Target page |
|---|---|---|
| online mentor for school students India; 1-on-1 mentoring for kids; personal mentor for child | Commercial | `/` |
| life skills coaching for students; life skills classes online for kids | Commercial | `/curriculum`, `/how-it-works` |
| student mentorship programme price; mentoring for kids cost India | Commercial | `/pricing` |
| confidence building for children; how to build confidence in child class 4 | Informational → commercial | `/programs/classes-3-5`, blog: building confidence |
| peer pressure help for teenager; screen addiction in teenagers; screen time rules for 12 year old | Informational | `/programs/classes-6-8`, blog: screen time |
| exam stress help for class 10; board exam anxiety tips for parents | Informational | `/programs/classes-9-12`, blog: exam stress |
| career guidance for class 9–12; how to choose stream after 10th | Informational | `/programs/classes-9-12`, blog: choosing a stream |
| mentor vs tutor vs counsellor; does my child need a counsellor | Informational | blog: mentor vs tutor vs counsellor |
| child won't talk to me; how to talk to teenager who won't open up | Informational | blog: talk to a child who won't open up, `/for-parents` |
| student mentoring programme for schools | B2B | `/for-schools` |

## Content plan (next 3 months)
Publish 2 posts a month, each answering one real parent question, 800–1,200 words, ending with a soft CTA and links to the matching program page. Ideas: "Is my child's anxiety normal?", "How much screen time for a Class 7 student?", "What to do after a bad board result", "Sibling rivalry in Classes 3–5", "Helping a shy child make friends at a new school", "Study timetable that actually works for Class 9", "When to see a child psychologist (and when a mentor is enough)". Use Search Console queries to pick the next topics.

## Local / brand
Create a Google Business Profile as an online service (no storefront address shown) — see `MARKETING_LAUNCH.md`. Add `sameAs` profile URLs to `content/site.ts → social` once they exist.
