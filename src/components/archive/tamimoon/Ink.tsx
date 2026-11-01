"use client";

import { useMemo } from "react";
import { useInViewOnce } from "@/lib/tamimoonMotion";
import { cn } from "@/utils/cn";

/* Loose ink strokes that draw themselves when scrolled into view.
   All paths overshoot and never close — like the linework in the paintings. */

const PATHS = {
  underline: { vb: "0 0 400 24", d: "M4 15C58 6 118 19 186 10S306 14 397 5" },
  underline2: { vb: "0 0 400 24", d: "M3 8C70 16 130 4 200 12S330 6 398 16" },
  circle: {
    vb: "0 0 320 130",
    d: "M176 9C84 -2 8 36 22 80C38 124 160 132 244 100C316 72 306 18 232 9C196 5 160 9 132 20",
  },
  cross: { vb: "0 0 60 60", d: "M6 10C20 24 38 40 54 52M52 8C40 22 24 40 8 54" },
  arrow: {
    vb: "0 0 120 60",
    d: "M4 38C30 14 70 12 108 28M108 28C98 20 92 14 90 6M108 28C98 30 90 36 84 46",
  },
} as const;

export function Ink({
  kind = "underline",
  className,
  stroke = 3.5,
  delay = 0,
}: {
  kind?: keyof typeof PATHS;
  className?: string;
  stroke?: number;
  delay?: number;
}) {
  const { ref, seen } = useInViewOnce<SVGSVGElement>(0.4);
  const p = PATHS[kind];
  return (
    <svg
      ref={ref}
      viewBox={p.vb}
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
      style={{ ["--d" as string]: `${delay}ms` }}
      className={cn("ink-line pointer-events-none", seen && "is-drawn", className)}
    >
      <path
        d={p.d}
        pathLength={1}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* A fringe of hair strands hanging from the top edge of a section. */
export function Fringe({ className, count = 46 }: { className?: string; count?: number }) {
  const { ref, seen } = useInViewOnce<SVGSVGElement>(0.15);

  const strands = useMemo(() => {
    let s = 7;
    const rnd = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    return Array.from({ length: count }, (_, i) => {
      const x = (i / (count - 1)) * 1200 + (rnd() - 0.5) * 22;
      const len = 40 + Math.pow(rnd(), 1.6) * 200;
      const sway = (rnd() - 0.5) * 34;
      const sw = 1 + rnd() * 2.1;
      return {
        d: `M${x.toFixed(1)} -4C${(x + sway * 0.3).toFixed(1)} ${(len * 0.35).toFixed(1)} ${(x + sway).toFixed(1)} ${(len * 0.7).toFixed(1)} ${(x + sway * 0.6).toFixed(1)} ${len.toFixed(1)}`,
        sw,
        delay: Math.round(rnd() * 500),
      };
    });
  }, [count]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 1200 250"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
      className={cn("ink-line pointer-events-none absolute inset-x-0 top-0 z-10 w-full", seen && "is-drawn", className)}
    >
      {strands.map((s, i) => (
        <path
          key={i}
          d={s.d}
          pathLength={1}
          stroke="currentColor"
          strokeWidth={s.sw}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ ["--d" as string]: `${s.delay}ms` }}
        />
      ))}
    </svg>
  );
}
