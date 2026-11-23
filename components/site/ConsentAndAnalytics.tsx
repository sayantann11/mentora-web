"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { getConsent, setConsent, type ConsentValue } from "@/lib/analytics";
import { captureAttribution } from "@/lib/attribution";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_ENABLE_META_PIXEL === "true" ? process.env.NEXT_PUBLIC_META_PIXEL_ID : undefined;
const ADS_ID = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_ADS === "true" ? process.env.NEXT_PUBLIC_GOOGLE_ADS_ID : undefined;

/** Pages that handle a child's data: no ad pixels here, ever (DPDP — no tracking of children). */
const CHILD_DATA_PATHS = ["/book-trial", "/enroll", "/pay", "/payment", "/lp", "/admin", "/receipt"];

export function ConsentAndAnalytics() {
  const pathname = usePathname() ?? "/";
  const [consent, setLocal] = useState<ConsentValue | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    captureAttribution();
    const c = getConsent();
    setLocal(c);
    setOpen(c === null);
    setReady(true);
    const onChange = (e: Event) => setLocal((e as CustomEvent<ConsentValue>).detail);
    const onOpen = () => setOpen(true);
    window.addEventListener("mentora:consent-changed", onChange);
    window.addEventListener("mentora:open-consent", onOpen);
    return () => {
      window.removeEventListener("mentora:consent-changed", onChange);
      window.removeEventListener("mentora:open-consent", onOpen);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const granted = consent === "granted";
  const childPage = CHILD_DATA_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const choose = (v: ConsentValue) => {
    setConsent(v);
    setLocal(v);
    setOpen(false);
  };

  return (
    <>
      {granted && <Analytics />}
      {granted && GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
          <Script id="ga-init" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true,allow_google_signals:false,allow_ad_personalization_signals:false});${ADS_ID && !childPage ? `gtag('config','${ADS_ID}');` : ""}`}
          </Script>
        </>
      )}
      {granted && META_PIXEL_ID && !childPage && (
        <Script id="meta-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}

      {ready && open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="consent-title"
          className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-lift)] sm:bottom-5"
        >
          <p id="consent-title" className="font-display text-lg font-medium text-ink">Your privacy, your choice</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            We use essential cookies to run this site. With your permission we’d also use privacy-friendly analytics to understand
            which pages help parents. We never track children or sell data.{" "}
            <a className="link" href="/privacy">Privacy policy</a>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => choose("denied")}>
              Essential only
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => choose("granted")}>
              Allow analytics
            </button>
          </div>
        </div>
      )}
    </>
  );
}
