"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { sceneState, onSceneChange } from "@/lib/sceneStore";
import { tracks } from "@/content/programs";

const JourneyScene = dynamic(() => import("@/components/three/JourneyScene"), { ssr: false, loading: () => null });

type Nav = Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };

function canRun3D(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Nav;
  if (nav.connection?.saveData) return false;
  if (nav.connection?.effectiveType && /(^|-)2g$/.test(nav.connection.effectiveType)) return false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return false;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4) return false;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return false;
    (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return false;
  }
  return true;
}

/**
 * Fixed decorative backdrop for the homepage story. Always paints a CSS poster first;
 * upgrades to WebGL only after load + idle on capable devices. Purely decorative.
 */
export function StoryBackdrop() {
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Track colours → CSS variables for the poster (and section accents).
  useEffect(() => {
    const apply = () => {
      const t = tracks.find((x) => x.id === sceneState.track)!;
      const s = document.documentElement.style;
      s.setProperty("--track-a", t.palette.a);
      s.setProperty("--track-b", t.palette.b);
      s.setProperty("--track-c", t.palette.c);
    };
    apply();
    return onSceneChange(apply);
  }, []);

  // Scroll progress, current station and pointer parallax (writes to a plain object; no re-renders).
  useEffect(() => {
    const story = document.getElementById("story");
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const end = story ? story.offsetTop + story.offsetHeight - window.innerHeight : document.body.scrollHeight;
        const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, end)));
        sceneState.progress = p;
        if (root.current) {
          const afterHero = Math.min(1, window.scrollY / window.innerHeight);
          const pastEnd = Math.min(1, Math.max(0, (window.scrollY - end) / 400));
          root.current.style.opacity = String((1 - 0.4 * afterHero) * (1 - pastEnd));
        }
      });
    };
    const stations = Array.from(document.querySelectorAll<HTMLElement>("[data-station]"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) sceneState.station = Number((e.target as HTMLElement).dataset.station);
        }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stations.forEach((s) => io.observe(s));
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      sceneState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  // Defer the WebGL upgrade: never during the initial load. It starts on the visitor's first
  // interaction (pointer move, scroll, touch, key) — or, on wide screens, after a quiet period.
  // The CSS poster is shown until then, so first paint, LCP and TBT are unaffected.
  useEffect(() => {
    // Cheap checks only at mount; the WebGL probe (creating a context is expensive on
    // software-GL devices) runs later, after the first interaction.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let done = false;
    const events = ["pointermove", "pointerdown", "scroll", "touchstart", "keydown", "wheel"] as const;
    const go = () => {
      if (done) return;
      done = true;
      cleanup();
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      const start = () => {
        if (canRun3D()) setEnabled(true);
      };
      if (ric) ric(start, { timeout: 800 });
      else setTimeout(start, 100);
    };
    const timer = window.innerWidth >= 768 ? window.setTimeout(go, 8000) : 0;
    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, go));
      clearTimeout(timer);
    };
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    return () => {
      done = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-300">
      <div className="hero-poster absolute inset-0">
        <div className="absolute inset-0 overflow-hidden">
          <span className="poster-stone" style={{ width: 170, height: 58, right: "14%", top: "62%" }} />
          <span className="poster-stone" style={{ width: 120, height: 42, right: "30%", top: "48%" }} />
          <span className="poster-stone" style={{ width: 84, height: 30, right: "20%", top: "34%" }} />
          <span className="absolute h-40 w-40 rounded-full bg-white/80 blur-2xl" style={{ right: "8%", top: "10%" }} />
        </div>
      </div>
      {enabled && !failed && (
        <div className="absolute inset-0 animate-[fade-in_1.4s_ease_both]">
          <JourneyScene onFail={() => setFailed(true)} />
        </div>
      )}
      {/* Legibility wash behind the copy column */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(251_248_243/0.92)_0%,rgb(251_248_243/0.55)_45%,transparent_75%)] max-md:bg-[linear-gradient(180deg,rgb(251_248_243/0.55)_0%,rgb(251_248_243/0.8)_55%)]" />
    </div>
  );
}
