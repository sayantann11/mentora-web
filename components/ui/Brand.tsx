import Link from "next/link";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={className}>
      <rect width="40" height="40" rx="13" fill="#3f2d63" />
      <path d="M10 28V17.5a4.5 4.5 0 0 1 9 0V28m0-10.5a4.5 4.5 0 0 1 9 0V28" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="31" cy="28" r="2.6" fill="#e9a23b" />
    </svg>
  );
}

export function Brand({ light = false, href = "/" }: { light?: boolean; href?: string }) {
  return (
    <Link href={href} aria-label="Mentora — home" className={`inline-flex items-center gap-2.5 ${light ? "text-white" : "text-ink"}`}>
      <BrandMark className="h-9 w-9" />
      <span className="font-display text-[1.6rem] leading-none font-semibold tracking-[-0.04em]" style={{ fontVariationSettings: '"SOFT" 100, "opsz" 48' }}>
        mentora<span className="text-saffron">.</span>
      </span>
    </Link>
  );
}
