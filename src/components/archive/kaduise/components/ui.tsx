import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";

/* ------------------------------------------------------------------ *
 * shared IntersectionObserver for scroll reveals
 * ------------------------------------------------------------------ */
let obs: IntersectionObserver | null = null;
function getObs() {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return null;
  if (!obs) {
    obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("rv-in");
            obs?.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
  }
  return obs;
}

export function Reveal({
  as: Tag = "div",
  kind = "rv",
  delay = 0,
  className,
  children,
  id,
}: {
  as?: ElementType;
  kind?: "rv" | "rv-x" | "rv-sc";
  delay?: number;
  className?: string;
  children?: ReactNode;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = getObs();
    if (!o) {
      el.classList.add("rv-in");
      return;
    }
    o.observe(el);
    return () => o?.unobserve(el);
  }, []);
  return (
    <Tag
      id={id}
      ref={ref as never}
      className={cn(kind, className)}
      style={{ transitionDelay: `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * global svg filter defs — gives every rule & frame a hand-drawn wobble
 * ------------------------------------------------------------------ */
export function InkDefs() {
  return (
    <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
      <defs>
        <filter id="kadu-wobble" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.026" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="kadu-wobble-2" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="3" seed="22" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/** A box drawn with a wobbly ink rule + optional offset shadow. */
export function InkBox({
  children,
  className,
  inner,
  sw = 2,
  hard = true,
  strong = false,
}: {
  children?: ReactNode;
  className?: string;
  inner?: string;
  sw?: number;
  hard?: boolean;
  strong?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0", strong ? "wobble-2" : "wobble")}
      >
        <div
          className="absolute inset-0 border-ink"
          style={{
            borderStyle: "solid",
            borderWidth: sw,
            background: hard ? "transparent" : "var(--color-paper)",
          }}
        />
      </div>
      <div className={cn("relative", inner)}>{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * marquee
 * ------------------------------------------------------------------ */
export function Marquee({
  items,
  rev = false,
  className,
  sep = "✦",
}: {
  items: ReactNode[];
  rev?: boolean;
  className?: string;
  sep?: string;
}) {
  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-8 whitespace-nowrap">
          {it}
          <span className="text-[0.7em] opacity-45">{sep}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className={cn("marquee-track flex w-max", rev ? "animate-marquee-rev" : "animate-marquee")}
      >
        {row}
        {row}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * doodles — drawn for this page, in the sketchbook's own grammar
 * ------------------------------------------------------------------ */
type D = { className?: string; style?: CSSProperties };

export const Sparkle = ({ className, style }: D) => (
  <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden fill="none">
    <path
      d="M20 3c1.4 8.6 7.8 14.4 16.4 16.6C27.6 21.6 21.4 27 20 36.4 18.6 27 12.4 21.6 3.4 19.6 12 17.4 18.6 11.6 20 3Z"
      fill="currentColor"
    />
  </svg>
);

export const Star4 = ({ className, style }: D) => (
  <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M20 5c2 8.6 6.6 12.8 15 15.4-8.4 2.4-13 6.6-15 14.6-2-8-6.6-12.2-15-14.6C13.4 17.8 18 13.6 20 5Z" />
  </svg>
);

export const Fish = ({ className, style }: D) => (
  <svg viewBox="0 0 90 40" className={className} style={style} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round">
    <path d="M6 21c10-13 40-16 62-6 4 2 7 4 12 5-6 3-11 4-15 8C52 40 18 34 6 21Z" />
    <path d="M80 20c3 1 6 1 8-1-2 4-5 5-8 4" />
    <circle cx="20" cy="20" r="1.6" fill="currentColor" stroke="none" />
    <path d="M34 14c5 3 9 8 11 14" opacity=".55" />
  </svg>
);

export const Cat = ({ className, style }: D) => (
  <svg viewBox="0 0 80 60" className={className} style={style} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 46c-4-12 2-26 10-32l3 9c9-3 18-3 27 1l4-9c8 7 13 20 9 31-11 7-41 7-53 0Z" />
    <circle cx="30" cy="34" r="2" fill="currentColor" stroke="none" />
    <circle cx="50" cy="34" r="2" fill="currentColor" stroke="none" />
    <path d="M38 41c1.6 1.6 4 1.6 5.6 0M18 38l-9 2M18 43l-9 4M62 38l9 2M62 43l9 4" />
  </svg>
);

export const Squiggle = ({ className, style }: D) => (
  <svg viewBox="0 0 300 14" preserveAspectRatio="none" className={className} style={style} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <path d="M2 9c26-8 44 5 68-1s40-8 63-2 45 8 70 1 45-6 95-3" />
  </svg>
);

export const ArrowCurved = ({ className, style }: D) => (
  <svg viewBox="0 0 120 90" className={className} style={style} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 12c30 14 56 38 66 66" />
    <path d="M58 74c4 4 8 6 14 4M72 60c2 8 0 15-6 20" />
  </svg>
);

export const Signature = ({ className, style }: D) => (
  <svg viewBox="0 0 190 60" className={className} style={style} aria-hidden fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 46c6-18 10-28 12-36 1 12 0 24 2 32 4-6 9-12 15-16-6 8-9 14-9 20" />
    <path d="M44 12c-1 14-2 26 0 34 5-8 12-14 21-16-9 6-14 12-15 18" />
    <path d="M76 30c0-8 1-14 2-18 0 10 1 18 4 22 5 7 14 5 17-4 2-7 3-14 3-22" />
    <path d="M110 18c1 8 2 16 5 22 4 8 12 8 16 1 3-5 4-12 4-19" />
    <path d="M150 44c10-4 20-8 32-9" opacity=".7" />
  </svg>
);

export const Nib = ({ className }: D) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 38c6-14 14-22 26-28-2 12-8 22-18 30-4 3-8 3-8-2Z" />
    <path d="M18 38l10-16M6 44c8-2 14-6 18-11" />
  </svg>
);
export const Scanner = ({ className }: D) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="12" width="36" height="26" rx="2" />
    <path d="M6 20h36M14 28h20M12 34h10" />
    <path d="M16 8h16" />
  </svg>
);
export const Swatch = ({ className }: D) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 30c0-12 7-20 16-20s16 8 16 20" />
    <path d="M8 30h32v6a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-6Z" />
    <path d="M18 22v-4M26 22v-6M34 24l4-6" />
  </svg>
);
export const Plane = ({ className }: D) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22c14-6 26-10 40-14-8 12-16 20-26 26l-3-8Z" />
    <path d="M15 26l18-14M18 33c-4 3-7 6-8 10 4-1 7-3 10-6" />
  </svg>
);

/* social glyphs, hand-inked */
export const IconX = ({ className }: D) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
    <path d="M4 4l7.4 9.1L4.6 20M20 20l-7.3-9M20 4l-5 6.2M9.6 14.6L4 20" opacity=".95" />
  </svg>
);
export const IconIg = ({ className }: D) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.3" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
export const IconThreads = ({ className }: D) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
    <path d="M16 8c-1.6-1.4-4-1.8-6-.6-2.4 1.5-3 5-1 7 2.2 2.3 6.6 1.6 7.6-1.4" />
    <path d="M12 4c4 0 6.5 2.4 6.6 7.6.1 4.6-2.6 8-7 7.9C7 19.4 4 16 4.4 11" />
    <path d="M13.6 12.4c1.4.6 1.7 2.6.4 3.5-1.6 1.1-3.6-.5-3.5-2.6" />
  </svg>
);
export const IconExternal = ({ className }: D) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4h6v6M20 4l-8.5 8.5M18 14v4.5c0 1-.8 1.8-1.8 1.8H5.8C4.8 20.3 4 19.5 4 18.5V7.8C4 6.8 4.8 6 5.8 6H10" />
  </svg>
);
export const IconHeart = ({ className }: D) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20c-6-4.2-8.4-7.4-8.2-10.3C3.9 7 5.8 5 8.2 4.9c1.7 0 3 .9 3.8 2.3.8-1.4 2.1-2.3 3.8-2.3 2.4.1 4.3 2.1 4.4 4.8C20.4 12.6 18 15.8 12 20Z" />
  </svg>
);
export const IconChev = ({ className }: D) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 4l-5 8 5 8M15 4l5 8-5 8" />
  </svg>
);
export const IconClose = ({ className }: D) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
);
export const IconGrid = ({ className }: D) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round">
    <path d="M4 4h7v7H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 13h7v7H4z" />
  </svg>
);
export const IconSearch = ({ className }: D) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="M15 15l5 5" />
  </svg>
);
