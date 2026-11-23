import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { GuideSignup } from "@/components/forms/GuideSignup";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Free Guide: 5 Conversations to Have With Your Child",
  description: "A free, practical guide for parents of Classes 3–12: five conversation starters to try this week, with what to say and what to avoid.",
  path: "/guide",
});

export default function GuidePage() {
  return (
    <section className="section">
      <div className="container-x max-w-5xl">
        <Breadcrumbs items={[{ name: "Free parent guide", path: "/guide" }]} />
        <GuideSignup />
        <p className="mt-6 text-ink-soft">
          Prefer to read it now? <Link href="/guide/five-conversations" className="link">Open the guide</Link>.
        </p>
      </div>
    </section>
  );
}
