import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { MobileNav } from "./MobileNav";
import { mainNav } from "./nav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-plum/[0.07] bg-cream/85 backdrop-blur-xl supports-[backdrop-filter]:bg-cream/70">
      <div className="container-x flex h-[72px] items-center justify-between gap-6">
        <Brand />
        <nav aria-label="Main" className="hidden items-center gap-7 text-[0.92rem] font-medium text-ink-soft lg:flex">
          {mainNav.map((n) => (
            <Link key={n.href} href={n.href} className="transition hover:text-violet">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/book-trial" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Book free intro session <ArrowRight aria-hidden size={16} />
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
