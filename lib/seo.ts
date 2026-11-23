import type { Metadata } from "next";
import { site } from "@/content/site";
import type { Faq } from "@/content/faq";
import { getPlan } from "@/lib/pricing";

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogType?: "website" | "article";
  absoluteTitle?: boolean;
}

export function pageMetadata({ title, description, path, noindex, ogType = "website", absoluteTitle }: PageMetaInput): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: ogType, siteName: site.name, locale: "en_IN" },
    twitter: { card: "summary_large_image", title, description },
    robots: noindex ? { index: false, follow: false, nocache: true } : undefined,
  };
}

export const NOINDEX: Metadata["robots"] = { index: false, follow: false, nocache: true };

const abs = (path: string) => `${site.url}${path}`;

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": abs("/#organization"),
    name: site.name,
    url: site.url,
    logo: abs("/mentora-logo.svg"),
    email: site.email,
    description: site.description,
    areaServed: { "@type": "Country", name: "India" },
    slogan: site.philosophy,
    ...(site.social.length ? { sameAs: site.social } : {}),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": abs("/#website"),
    name: site.name,
    url: site.url,
    inLanguage: "en-IN",
    publisher: { "@id": abs("/#organization") },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function faqLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function serviceLd(opts: { name?: string; description?: string; path?: string; audience?: string } = {}) {
  const plan = getPlan();
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name ?? "1-on-1 online mentorship for school students",
    serviceType: "Life-skills mentoring",
    description: opts.description ?? site.description,
    provider: { "@id": abs("/#organization") },
    areaServed: { "@type": "Country", name: "India" },
    audience: { "@type": "Audience", audienceType: opts.audience ?? "Parents of students in Classes 3–12" },
    url: abs(opts.path ?? "/pricing"),
    offers: {
      "@type": "Offer",
      name: plan.name,
      price: (plan.amountPaise / 100).toFixed(2),
      priceCurrency: "INR",
      availability: "https://schema.org/LimitedAvailability",
      url: abs("/pricing"),
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: (plan.amountPaise / 100).toFixed(2),
        priceCurrency: "INR",
        unitText: "MONTH",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
      },
    },
  };
}

export function articleLd(post: { title: string; description: string; slug: string; date: string; updated?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    mainEntityOfPage: abs(`/blog/${post.slug}`),
    image: abs(`/blog/${post.slug}/opengraph-image`),
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: `${site.name} team`, url: site.url },
    publisher: { "@id": abs("/#organization") },
  };
}
