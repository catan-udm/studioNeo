"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function CountUp({ to, duration = 1400 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    setVal(0);
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(to * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return <span ref={ref}>{val.toLocaleString()}</span>;
}

export function Marquee({
  items,
  reverse = false,
  dark = false,
}: {
  items: string[];
  reverse?: boolean;
  dark?: boolean;
}) {
  const row = [...items, ...items, ...items, ...items];
  return (
    <div
      className={cn(
        "overflow-hidden border-y-[3px] border-ink py-2.5 select-none",
        dark ? "bg-ink text-paper" : "bg-sun text-ink"
      )}
      aria-hidden
    >
      <div className={cn("flex w-max whitespace-nowrap", reverse ? "marquee-track-rev" : "marquee-track")}>
        {[0, 1].map((half) => (
          <div key={half} className="flex">
            {row.map((t, i) => (
              <span key={`${half}-${i}`} className="font-dot text-sm md:text-base tracking-wider mx-5 flex items-center gap-5">
                {t} <span className={dark ? "text-miku" : "text-magenta-deep"}>★</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectionHeading({
  kicker,
  title,
  jp,
  dark = false,
}: {
  kicker: string;
  title: string;
  jp: string;
  dark?: boolean;
}) {
  return (
    <Reveal className="mb-10 md:mb-14">
      <p className={cn("font-dot text-sm md:text-base tracking-[0.25em] mb-3", dark ? "text-miku" : "text-magenta-deep")}>
        ▸ {kicker}
      </p>
      <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
        <h2
          className={cn(
            "font-display text-4xl md:text-6xl uppercase leading-[0.95]",
            dark ? "text-paper" : "text-ink"
          )}
        >
          {title}
        </h2>
        <span className={cn("font-dot text-lg md:text-2xl pb-1", dark ? "text-paper/50" : "text-ink-soft")}>{jp}</span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="h-[3px] w-16 bg-magenta" />
        <span className="h-[3px] w-8 bg-miku" />
        <span className="h-[3px] w-3 bg-sun" />
      </div>
    </Reveal>
  );
}

export function CrossMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3v18M3 12h18" />
    </svg>
  );
}
