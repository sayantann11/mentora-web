import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  as: Tag = "h2",
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  id?: string;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} data-reveal>
      {eyebrow && <p className={`eyebrow ${align === "center" ? "justify-center" : ""}`}>{eyebrow}</p>}
      <Tag id={id} className={`${Tag === "h1" ? "display-xl" : "display-lg"} mt-4`}>{title}</Tag>
      {lede && <p className="lede mt-5">{lede}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, lede, children }: { eyebrow: string; title: ReactNode; lede: ReactNode; children?: ReactNode }) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display-xl mt-4">{title}</h1>
      <p className="lede mt-6 max-w-2xl">{lede}</p>
      {children}
    </div>
  );
}
