"use client";

/**
 * Consent-gated analytics. Events are dropped silently until the visitor accepts
 * non-essential cookies. Never send personal data (names, phone numbers) as params.
 */
export type AnalyticsEvent =
  | "view_pricing"
  | "start_trial_form"
  | "submit_trial_form"
  | "click_whatsapp"
  | "view_pay_page"
  | "submit_payment_proof"
  | "faq_expand"
  | "subscribe_guide"
  | "submit_school_enquiry";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    va?: (...args: unknown[]) => void;
  }
}

export const CONSENT_KEY = "mentora-consent-v1";
export type ConsentValue = "granted" | "denied";

export function getConsent(): ConsentValue | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: ConsentValue) {
  try {
    window.localStorage.setItem(CONSENT_KEY, v);
  } catch {
    /* storage blocked — consent stays session-only */
  }
  window.dispatchEvent(new CustomEvent("mentora:consent-changed", { detail: v }));
}

export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === "undefined" || getConsent() !== "granted") return;
  window.gtag?.("event", event, params);
  // Purchase-like event is only sent after admin verification, never from the browser.
  if (event === "submit_trial_form") window.fbq?.("track", "Lead");
}
