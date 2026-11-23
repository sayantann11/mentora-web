"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Progressive scroll reveal: content is fully visible without JS; this only adds motion
 * to elements that start BELOW the fold. Uses IntersectionObserver only (no forced layout).
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)");
    let first = true;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          // In the first batch, anything already on screen is shown without animating.
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
        if (first) {
          first = false;
          document.documentElement.classList.add("reveal-ready");
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
