"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import Script from "next/script";

export function Field({ label, error, hint, required, children, id }: { label: string; error?: string; hint?: ReactNode; required?: boolean; children: ReactNode; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {required ? <span aria-hidden className="text-status-red">*</span> : <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** a11y props for an input inside <Field>. */
export function describe(id: string, error?: string, hint?: boolean) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}

/** Hidden honeypot field. Humans never see or fill it; naive bots do. */
export function Honeypot({ register }: { register: (name: "website") => object }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </label>
    </div>
  );
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Cloudflare Turnstile. Renders nothing (and the server skips verification) when no site key is configured in dev. */
export function Turnstile({ onToken }: { onToken: (t: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const id = useId();

  const mount = () => {
    if (!SITE_KEY || !ref.current || !window.turnstile || widget.current) return;
    widget.current = window.turnstile.render(ref.current, {
      sitekey: SITE_KEY,
      theme: "light",
      appearance: "interaction-only",
      callback: (t: string) => onToken(t),
      "expired-callback": () => onToken(""),
      "error-callback": () => onToken(""),
    });
  };

  useEffect(() => {
    mount();
    return () => {
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!SITE_KEY) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={mount} id={`ts-${id}`} />
      <div ref={ref} />
    </>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-xl border border-status-red/30 bg-status-red/5 px-4 py-3 text-sm font-medium text-status-red">
      {message}
    </div>
  );
}
