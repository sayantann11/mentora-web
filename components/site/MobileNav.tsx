"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { mainNav } from "./nav";

const extra = [
  { href: "/curriculum", label: "Curriculum" },
  { href: "/about", label: "About" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink"
      >
        {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
      </button>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="absolute inset-x-3 top-[76px] rounded-2xl border border-line bg-white p-3 shadow-[var(--shadow-lift)]">
          <ul className="grid">
            {[...mainNav, ...extra].map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="block rounded-xl px-4 py-3 text-base font-medium text-ink hover:bg-mist">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/book-trial" className="btn btn-primary mt-2 w-full">
            Book free intro session
          </Link>
        </nav>
      )}
    </div>
  );
}
