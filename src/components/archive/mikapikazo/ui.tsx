"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { palettes, type Palette } from "@/mikapikazoData";

/* ---------- print furniture ---------- */

function burstPath(points: number, outer: number, inner: number) {
  const step = Math.PI / points;
  let d = "";
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * step - Math.PI / 2;
    d += `${i === 0 ? "M" : "L"}${(50 + Math.cos(a) * r).toFixed(2)} ${(50 + Math.sin(a) * r).toFixed(2)}`;
  }
  return `${d}Z`;
}

export function Starburst({
  className = "",
  points = 16,
  inner = 37,
}: {
  className?: string;
  points?: number;
  inner?: number;
}) {
  const d = useMemo(() => burstPath(points, 50, inner), [points, inner]);
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

/** printer's registration cross — the motif that ties the sheet together */
export function RegMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="20" r="3.4" fill="currentColor" />
      <path d="M20 0v13M20 27v13M0 20h13M27 20h13" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/** decorative jacket barcode (not a real product code) */
export function Barcode({ className = "" }: { className?: string }) {
  const bars = useMemo(() => {
    const seed = [3, 1, 2, 1, 4, 1, 1, 2, 3, 1, 2, 4, 1, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 2, 1, 3, 1];
    let x = 0;
    return seed.map((w, i) => {
      const rect = { x, w, filled: i % 2 === 0 };
      x += w + 1;
      return rect;
    });
  }, []);
  const width = bars.reduce((sum, b) => sum + b.w + 1, 0);
  return (
    <svg viewBox={`0 0 ${width} 34`} className={className} aria-hidden="true" focusable="false">
      {bars.filter((b) => b.filled).map((b, i) => (
        <rect key={i} x={b.x} y="0" width={b.w} height="34" fill="currentColor" />
      ))}
    </svg>
  );
}

export function Ticker({
  items,
  reverse = false,
  className = "",
  duration = 32,
}: {
  items: string[];
  reverse?: boolean;
  className?: string;
  duration?: number;
}) {
  const row = (key: string, hidden: boolean) => (
    <div className="flex shrink-0 items-center" key={key} aria-hidden={hidden}>
      {items.map((item, i) => (
        <span className="flex items-center" key={`${key}-${i}`}>
          <span className="whitespace-nowrap font-display text-[clamp(20px,2.4vw,34px)] tracking-wide">
            {item}
          </span>
          <Starburst className="mx-5 h-4 w-4 shrink-0 md:h-5 md:w-5" points={8} inner={26} />
        </span>
      ))}
    </div>
  );

  return (
    <div className={`group/ticker overflow-hidden ${className}`}>
      <div
        className="flex w-max group-hover/ticker:[animation-play-state:paused]"
        style={{
          animation: `marquee ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {row("a", false)}
        {row("b", true)}
        {row("c", true)}
      </div>
    </div>
  );
}

/* ---------- hooks ---------- */

export function useReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
}

function read(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

export function usePalette(): [Palette, (id: string) => void] {
  const [id, setId] = useState<string>(() => read("mpz-palette", palettes[0].id));
  const palette = palettes.find((p) => p.id === id) ?? palettes[0];

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--pop", palette.pop);
    root.setProperty("--pop2", palette.pop2);
    root.setProperty("--pop3", palette.pop3);
    root.setProperty("--on-pop", palette.onPop);
    root.setProperty("--on-pop2", palette.onPop2);
    root.setProperty("--on-pop3", palette.onPop3);
    write("mpz-palette", palette.id);
  }, [palette]);

  return [palette, setId];
}

/** the signature control: live saturation across every printed image */
export function useChroma(): [number, (value: number) => void] {
  const [chroma, setChroma] = useState<number>(() => {
    const stored = Number(read("mpz-chroma", "100"));
    return Number.isFinite(stored) ? Math.min(180, Math.max(30, stored)) : 100;
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--chroma", String(chroma / 100));
    write("mpz-chroma", String(chroma));
  }, [chroma]);

  return [chroma, setChroma];
}

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return progress;
}

export function usePointerParallax(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3));
        el.style.setProperty("--my", ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3));
      });
    };
    const onLeave = () => {
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ref]);
}

/** a registration mark trails the pointer on desktop */
export function useRegCursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      el.classList.add("on");
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const onDown = () => el.classList.add("press");
    const onUp = () => el.classList.remove("press");
    const onLeave = () => el.classList.remove("on");

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
}
