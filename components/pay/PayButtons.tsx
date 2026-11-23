"use client";

import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";

type Platform = "android" | "ios" | "desktop" | null;

/** "Pay with any UPI app" deep links. Only shown on phones; desktop users scan the QR instead. */
export function PayButtons({ links, amountLabel }: { links: { any: string; gpay: string; phonepe: string; paytm: string }; amountLabel: string }) {
  const [platform, setPlatform] = useState<Platform>(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setPlatform(/Android/i.test(ua) ? "android" : /iPhone|iPad|iPod/i.test(ua) ? "ios" : "desktop");
  }, []);

  if (platform === null) return null;
  if (platform === "desktop")
    return (
      <p className="flex gap-2 rounded-xl bg-mist p-4 text-sm text-ink-soft">
        <Smartphone aria-hidden size={18} className="shrink-0 text-violet" /> On a computer? Scan the QR code with any UPI app on your phone, or copy the UPI ID.
      </p>
    );

  const open = (href: string) => {
    setTried(true);
    window.location.href = href;
  };

  return (
    <div className="grid gap-3">
      <button type="button" onClick={() => open(links.any)} className="btn btn-primary w-full text-base">
        <Smartphone aria-hidden size={18} /> Pay {amountLabel} with any UPI app
      </button>
      {platform === "android" && (
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => open(links.gpay)} className="btn btn-ghost btn-sm">GPay</button>
          <button type="button" onClick={() => open(links.phonepe)} className="btn btn-ghost btn-sm">PhonePe</button>
          <button type="button" onClick={() => open(links.paytm)} className="btn btn-ghost btn-sm">Paytm</button>
        </div>
      )}
      {(tried || platform === "ios") && (
        <p className="text-sm text-muted" role="status">
          {platform === "ios"
            ? "On iPhone, UPI links don’t always open an app. If nothing happens, copy the UPI ID below and paste it in your UPI app, or scan the QR from another device."
            : "Didn’t open? Copy the UPI ID below into your UPI app, or scan the QR code from another phone."}
        </p>
      )}
    </div>
  );
}
