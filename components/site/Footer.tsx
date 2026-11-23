import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import { site } from "@/content/site";
import { SafetyDisclaimer } from "./Disclaimer";
import { WhatsAppLink } from "./WhatsAppLink";
import { CookieSettingsButton } from "./CookieSettingsButton";

const cols: { title: string; links: [string, string][] }[] = [
  {
    title: "Programme",
    links: [
      ["/how-it-works", "How it works"],
      ["/programs/classes-3-5", "Classes 3–5"],
      ["/programs/classes-6-8", "Classes 6–8"],
      ["/programs/classes-9-12", "Classes 9–12"],
      ["/curriculum", "Curriculum"],
      ["/pricing", "Pricing"],
    ],
  },
  {
    title: "Families",
    links: [
      ["/for-parents", "For parents"],
      ["/safety", "Safety & privacy"],
      ["/blog", "Blog"],
      ["/guide", "Free parent guide"],
      ["/for-schools", "For schools"],
      ["/about", "About"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["/privacy", "Privacy policy"],
      ["/terms", "Terms"],
      ["/refund-policy", "Refund policy"],
      ["/contact", "Contact"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-plum-deep text-white/80">
      <div className="container-x grid gap-12 pt-16 pb-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Brand light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/75">
            {site.tagline}
            <span className="block pt-2 font-display text-base text-white italic">{site.philosophy}</span>
          </p>
          <div className="mt-6 flex flex-col gap-2 text-sm">
            <a href={`mailto:${site.email}`} className="hover:text-white">
              {site.email}
            </a>
            <WhatsAppLink location="footer" className="hover:text-white">
              Chat on WhatsApp
            </WhatsAppLink>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold text-white">{c.title}</p>
            <ul className="mt-4 grid gap-2.5 text-sm">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
              {c.title === "Legal" && (
                <li>
                  <CookieSettingsButton />
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-x pb-8">
        <SafetyDisclaimer tone="dark" />
        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 pb-16 text-xs text-white/65 sm:flex-row sm:pb-0">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <p>Online 1-on-1 mentorship for school students across India.</p>
        </div>
      </div>
    </footer>
  );
}
