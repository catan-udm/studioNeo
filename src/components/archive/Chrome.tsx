"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { logoMark, totalFrames } from "@/data";
import { cn } from "@/utils/cn";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const splashSeen = () => {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem("sankobite-splash-seen") === "1";
  } catch {
    return false;
  }
};

/** Thin reading-progress bar pinned to the very top of the viewport. */
export function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? Math.min(1, window.scrollY / h) * 100 : 0);
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    window.addEventListener("resize", fn);
    return () => {
      window.removeEventListener("scroll", fn);
      window.removeEventListener("resize", fn);
    };
  }, []);
  return (
    <div className="fixed top-0 inset-x-0 z-50 h-1 bg-transparent pointer-events-none" aria-hidden>
      <div
        className="h-full bg-gradient-to-r from-magenta via-coral to-miku transition-[width] duration-150 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Brief sticker-press intro while the inlined animations decode. */
export function Splash() {
  const [mounted, setMounted] = useState(false);
  const [done, setDone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (reduced() || splashSeen()) {
      setDone(true);
      setMounted(true);
      return;
    }
    setMounted(true);
    const a = window.setTimeout(() => setFading(true), 820);
    const b = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem("sankobite-splash-seen", "1");
      } catch {
        // The archive remains usable when browser storage is disabled.
      }
      setDone(true);
    }, 1320);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  if (!mounted || done) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] grid place-items-center bg-paper halftone transition-opacity duration-500",
        fading && "opacity-0"
      )}
      aria-hidden
    >
      <div className="text-center px-6">
        <span className="mx-auto mb-5 block w-20 h-20 rounded-full overflow-hidden border-[3px] border-ink shadow-[5px_6px_0_rgba(38,49,63,0.9)] spin-slow">
          <img src={logoMark} alt="" className="w-full h-full object-cover" />
        </span>
        <p className="font-display uppercase text-3xl md:text-5xl leading-none">
          sanko<span className="text-miku-deep">bite</span>
        </p>
        <p className="font-dot text-xs md:text-sm text-ink-soft mt-3 tracking-[0.3em]">
          LOADING {totalFrames} FRAMES<span className="caret">_</span>
        </p>
        <div className="mx-auto mt-5 h-2 w-52 border-[3px] border-ink bg-white overflow-hidden">
          <div className="h-full w-full origin-left bg-magenta" style={{ animation: "loadbar 0.9s ease-out forwards" }} />
        </div>
      </div>
      <style>{`@keyframes loadbar{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </div>
  );
}

/** Floating return-to-top sticker. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 700);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <a
      href="#top"
      aria-label="Back to top"
      className={cn(
        "fixed bottom-5 right-5 z-30 w-12 h-12 grid place-items-center rounded-full bg-sun border-[3px] border-ink shadow-[3px_4px_0_rgba(38,49,63,0.9)] transition-all duration-300 hover:bg-miku hover:-translate-y-1",
        show ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <ArrowUp className="w-5 h-5" aria-hidden />
    </a>
  );
}
