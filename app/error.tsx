"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Brand } from "@/components/ui/Brand";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="grid min-h-screen place-items-center px-5 py-16">
      <div className="max-w-lg text-center">
        <div className="flex justify-center">
          <Brand />
        </div>
        <h1 className="mt-12 font-display text-4xl font-medium">Something went wrong on our side.</h1>
        <p className="mt-4 text-ink-soft">Sorry about that. Please try again — and if it keeps happening, message us on WhatsApp and we’ll help directly.</p>
        {error.digest && <p className="mt-2 font-mono text-xs text-muted">Error reference: {error.digest}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-primary">Try again</button>
          <Link href="/" className="btn btn-ghost">Go to the homepage</Link>
        </div>
      </div>
    </main>
  );
}
