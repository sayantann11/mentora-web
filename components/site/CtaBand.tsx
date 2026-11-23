import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { WhatsAppLink } from "./WhatsAppLink";

export function CtaBand({
  title = "Start with one free conversation.",
  body = "Book a free introductory session. Your child meets a mentor, you ask every question you have, and only then do you decide.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden bg-plum py-20 text-white sm:py-24">
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-violet/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 -bottom-52 h-[520px] w-[520px] rounded-full bg-saffron/25 blur-3xl" />
      <div className="container-x relative text-center">
        <p className="eyebrow justify-center text-lilac">Founding pilot batch · limited to {site.pilotSeats} students</p>
        <h2 id="cta-title" className="display-lg mx-auto mt-4 max-w-3xl text-white">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">{body}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/book-trial" className="btn btn-saffron">
            Book a free intro session <ArrowRight aria-hidden size={18} />
          </Link>
          <WhatsAppLink location="cta_band" className="btn border border-white/30 text-white hover:bg-white/10">
            Chat on WhatsApp
          </WhatsAppLink>
        </div>
        <p className="mt-5 text-sm text-white/70">No payment needed to book. No lock-in later.</p>
      </div>
    </section>
  );
}
