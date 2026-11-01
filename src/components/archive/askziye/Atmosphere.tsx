import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { useToast } from "./lib";

export function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------- preloader: the studio seal pressing down ---------- */
export function Preloader() {
  const [hide, setHide] = useState(false);
  const [gone, setGone] = useState(() => reducedMotion());
  useEffect(() => {
    if (gone) return;
    const t1 = setTimeout(() => setHide(true), 1200);
    const t2 = setTimeout(() => setGone(true), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [gone]);
  if (gone) return null;
  return (
    <div
      className={cn(
        "fixed inset-0 z-[300] grid place-items-center bg-paper transition-opacity duration-700",
        hide && "opacity-0",
      )}
      aria-hidden
    >
      <div className="flex items-center gap-8">
        <span className="seal seal-stamp h-20 w-20 text-sm">ASK</span>
        <p className="vertical-rl font-display text-sm tracking-[0.6em] text-ink-soft">偶尔画画</p>
      </div>
    </div>
  );
}

/* ---------- brush cursor: a cinnabar tip that stamps the paper ---------- */
export function BrushCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || reducedMotion()) return;
    setOn(true);
    document.body.classList.add("brush");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;

    const stamp = (cx: number, cy: number) => {
      const s = document.createElement("span");
      s.className = "stamp";
      s.style.left = `${cx}px`;
      s.style.top = `${cy}px`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 950);
    };
    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const hot = !!t.closest("a,button,input,select,textarea,label,[role=button]");
      if (ring.current) ring.current.dataset.hot = hot ? "1" : "0";
    };
    const down = (e: MouseEvent) => stamp(e.clientX, e.clientY);
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate(${x - 3}px, ${y - 3}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx - 15}px, ${ry - 15}px)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("mousemove", move, { passive: true });
    addEventListener("mouseover", over, { passive: true });
    addEventListener("mousedown", down);
    raf = requestAnimationFrame(loop);
    return () => {
      document.body.classList.remove("brush");
      removeEventListener("mousemove", move);
      removeEventListener("mouseover", over);
      removeEventListener("mousedown", down);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!on) return null;
  return (
    <>
      <div ref={ring} className="cursor-ring pointer-events-none fixed left-0 top-0 z-[200]" aria-hidden />
      <div ref={dot} className="cursor-dot pointer-events-none fixed left-0 top-0 z-[201] h-1.5 w-1.5 rounded-full" aria-hidden />
    </>
  );
}

/* ---------- drifting petals (plum / camellia) ---------- */
const PETAL_COLORS = ["#b44738", "#e4c4b6", "#b89a6a", "#8e3328", "#a39480"];
const PETAL_SEEDS = [
  { left: 12, dur: 22, delay: -4, size: 11, o: 0.35 },
  { left: 28, dur: 28, delay: -18, size: 8, o: 0.28 },
  { left: 45, dur: 19, delay: -9, size: 14, o: 0.42 },
  { left: 63, dur: 31, delay: -24, size: 10, o: 0.3 },
  { left: 78, dur: 24, delay: -12, size: 13, o: 0.38 },
  { left: 88, dur: 20, delay: -6, size: 9, o: 0.25 },
  { left: 6, dur: 33, delay: -21, size: 15, o: 0.4 },
  { left: 35, dur: 18, delay: -15, size: 12, o: 0.33 },
  { left: 52, dur: 26, delay: -8, size: 8, o: 0.29 },
  { left: 71, dur: 21, delay: -27, size: 14, o: 0.44 },
  { left: 84, dur: 29, delay: -3, size: 10, o: 0.31 },
  { left: 19, dur: 25, delay: -16, size: 12, o: 0.36 },
  { left: 93, dur: 23, delay: -22, size: 9, o: 0.27 },
  { left: 40, dur: 30, delay: -11, size: 13, o: 0.39 },
];

export function Petals() {
  const [off] = useState(() => reducedMotion());
  const petals = useMemo(
    () =>
      PETAL_SEEDS.map((s, i) => ({
        ...s,
        c: PETAL_COLORS[i % PETAL_COLORS.length],
      })),
    [],
  );
  if (off) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.72,
            background: p.c,
            opacity: p.o,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------- self-drawing ink stroke ---------- */
export function InkStroke({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 12" fill="none" className={className} aria-hidden>
      <path
        className="ink-path"
        d="M3 8 C 40 3, 90 10, 130 6 S 190 4, 197 5"
        stroke="var(--live)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        className="ink-path ink-path-2"
        d="M6 9.5 C 60 6, 120 11, 194 6.5"
        stroke="var(--live)"
        strokeWidth="1.1"
        strokeOpacity=".5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------- plum branch line art ---------- */
export function PlumBranch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden>
      <path d="M190 190 C 150 150, 130 140, 108 100 C 90 68, 92 40, 70 14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M128 128 C 150 120, 165 118, 184 122" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M96 82 C 84 76, 74 78, 60 70" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {[
        [70, 14],
        [96, 80],
        [184, 122],
        [130, 126],
      ].map(([cx, cy], i) => (
        <g key={i}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx={cx}
              cy={cy - 7}
              rx="4.6"
              ry="6.4"
              stroke="currentColor"
              strokeWidth="1.2"
              transform={`rotate(${a} ${cx} ${cy - 7})`}
            />
          ))}
          <circle cx={cx} cy={cy} r="2" fill="var(--color-gold)" />
        </g>
      ))}
      <path d="M108 100 c 8 6, 18 6, 26 2 c -6 10 -18 12 -26 8" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/* ---------- the studio cat (she loves cats, so she has one) ---------- */
export function StudioCat() {
  const toast = useToast();
  const [purr, setPurr] = useState(false);
  return (
    <div className="flex flex-col items-center gap-2" title="the studio cat — try petting her">
      <button
        aria-label="Pet the studio cat"
        className={cn("text-ink/70 transition hover:text-cinnabar", purr && "cat-purr")}
        onClick={() => {
          setPurr(true);
          toast("喵 — she approves");
          setTimeout(() => setPurr(false), 900);
        }}
      >
        <svg viewBox="0 0 120 84" className="h-16 w-20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path className="cat-tail" d="M96 66 C 112 62, 116 50, 110 40" />
          <path d="M34 66 C 34 52, 48 46, 62 46 C 82 46, 96 54, 96 66" />
          <path d="M20 66 C 20 58, 26 52, 34 52" />
          <circle cx="30" cy="38" r="14" />
          <path d="M20 30 L 16 16 L 27 24 M40 30 L 45 15 L 33 24" />
          <path className="cat-eyes" d="M24 38 h 3 M33 38 h 3" strokeWidth="2.4" />
          <path d="M29 44 l 2 2 l 2 -2" strokeWidth="1.6" />
          <path d="M6 40 h 14 M8 46 h 12" strokeWidth="1.1" opacity=".5" />
          <path d="M14 70 h 90" opacity=".4" />
        </svg>
      </button>
      <p className="text-[9px] tracking-[0.3em] text-taupe uppercase">猫 · the studio cat</p>
    </div>
  );
}
