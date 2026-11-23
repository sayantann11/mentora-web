"use client";

/** First-touch marketing attribution, kept in sessionStorage and attached to lead forms. */
const KEY = "mentora-attribution-v1";
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type ClientAttribution = Partial<Record<(typeof UTM)[number] | "referrer" | "landing_page", string>>;

export function captureAttribution() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const url = new URL(window.location.href);
    const a: ClientAttribution = {};
    for (const k of UTM) {
      const v = url.searchParams.get(k);
      if (v) a[k] = v.slice(0, 150);
    }
    if (document.referrer && !document.referrer.startsWith(window.location.origin)) a.referrer = document.referrer.slice(0, 300);
    a.landing_page = (url.pathname + (url.search ? url.search : "")).slice(0, 300);
    sessionStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* storage unavailable */
  }
}

export function readAttribution(): ClientAttribution {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}
