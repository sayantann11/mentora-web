import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export function LegalPage({ title, path, updated, children }: { title: string; path: string; updated: string; children: ReactNode }) {
  return (
    <section className="section">
      <div className="container-x max-w-3xl">
        <Breadcrumbs items={[{ name: title, path }]} />
        <h1 className="display-lg">{title}</h1>
        <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>
        <div className="prose-mentora mt-8">{children}</div>
      </div>
    </section>
  );
}
