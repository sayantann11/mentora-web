import Link from "next/link";
import type { Metadata } from "next";
import { Brand } from "@/components/ui/Brand";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(50%_50%_at_80%_20%,#e6dbff,transparent)] px-5 py-16">
      <div className="max-w-lg text-center">
        <div className="flex justify-center">
          <Brand />
        </div>
        <p className="mt-12 font-display text-8xl leading-none font-medium text-lilac">404</p>
        <h1 className="mt-4 font-display text-4xl font-medium">This path doesn’t lead anywhere — yet.</h1>
        <p className="mt-4 text-ink-soft">The page you’re looking for has moved or never existed. Let’s get you back on track.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">Go to the homepage</Link>
          <Link href="/book-trial" className="btn btn-ghost">Book a free intro session</Link>
        </div>
      </div>
    </main>
  );
}
