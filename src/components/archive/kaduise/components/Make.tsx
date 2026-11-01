import { useEffect, useRef, useState } from "react";
import { MOTIFS, PROCESS, WORKS } from "@/components/archive/kaduise/data/works";
import { IconChev, Nib, Plane, Reveal, Scanner, Sparkle, Squiggle, Swatch } from "@/components/archive/kaduise/components/ui";
import { art } from "@/components/archive/kaduise/lib/art";

function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setSeen(true);
      return;
    }
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          o.disconnect();
        }
      },
      { threshold },
    );
    o.observe(el);
    return () => o.disconnect();
  }, [threshold]);
  return { ref, seen };
}

const ICONS = [Nib, Scanner, Swatch, Plane];

export function Make() {
  return (
    <section id="make" className="relative scroll-mt-16 overflow-hidden border-t-[2px] border-ink bg-paper-2/60 py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hatch opacity-[0.18]" />
      <div className="mx-auto max-w-[1560px] px-4 sm:px-7">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b-[2px] border-ink pb-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-soft">05 — how it's made</p>
            <h2 className="mt-2 font-display text-[12vw] leading-[0.9] tracking-tight sm:text-[7vw] lg:text-[5.2vw]">
              Ink on paper,
              <br className="sm:hidden" /> grey on screen
            </h2>
          </div>
          <p className="max-w-[40ch] text-[13px] leading-[1.95] text-ink-soft">
            Across these four steps almost all the colour gets thrown away. What survives is a line, some
            empty paper, and whichever single colour happened to be chosen that night.
          </p>
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <svg aria-hidden viewBox="0 0 1200 20" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-[54px] hidden h-5 w-full text-ink/25 lg:block wobble">
            <path d="M0 10h1200" stroke="currentColor" strokeWidth="2" strokeDasharray="14 10" fill="none" />
          </svg>
          {PROCESS.map((p, i) => {
            const Ico = ICONS[i];
            return (
              <Reveal key={p.no} delay={i * 110}>
                <div className="group relative h-full border-[2px] border-ink bg-paper p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[8px_10px_0_rgba(26,24,19,0.14)]">
                  <div className="flex items-start justify-between">
                    <span className="flex h-14 w-14 items-center justify-center border-[1.5px] border-ink bg-paper-2 text-ink transition-colors duration-300 group-hover:bg-ink group-hover:text-mustard">
                      <Ico className="h-7 w-7" />
                    </span>
                    <span className="num-outline font-display text-[38px] leading-none transition-all duration-300 group-hover:[-webkit-text-stroke:1.4px_var(--color-orange)]">
                      {p.no}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-[19px] leading-snug">{p.head}</h3>
                  <p lang="ja" className="mt-1 text-[10.5px] tracking-[0.08em] text-ash">{p.sub}</p>
                  <p className="mt-4 text-[13px] leading-[1.95] text-ink-soft">{p.body}</p>
                  <Squiggle className="mt-5 h-2.5 w-0 text-orange opacity-0 transition-all duration-500 group-hover:w-28 group-hover:opacity-100" />
                </div>
              </Reveal>
            );
          })}
        </div>

        <Motifs />
      </div>
    </section>
  );
}

/* ------------------------------------------------------- motifs --- */
function Motifs() {
  const { ref, seen } = useInView<HTMLDivElement>(0.25);
  const max = Math.max(...MOTIFS.map((m) => m.n));

  return (
    <div id="motifs" className="mt-24 scroll-mt-24 border-t-[2px] border-ink pt-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div ref={ref} className="lg:col-span-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-soft">06 — motifs</p>
          <h3 className="mt-2 font-display text-[30px] leading-tight sm:text-[40px]">
            She draws the same
            <br />
            things, over and over.
          </h3>
          <p className="mt-4 max-w-[46ch] text-[13.5px] leading-[1.95] text-ink-soft">
            Tagging the {WORKS.length} X posts collected here and counting them up: 30 have a girl in them, 14
            are ordinary life, 13 involve a star. Fold in the 2026 dailies and the first number only climbs.
            The same handful of things, altered very slightly each night.
          </p>

          <ul className="mt-8 space-y-4">
            {MOTIFS.map((m, i) => (
              <li key={m.en} className="group">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14px] font-bold tracking-wide">
                    {m.en}
                    <span lang="ja" className="ml-2 text-[11px] font-normal text-ash">{m.jp}</span>
                    <span className="ml-2 font-mono text-[10px] font-normal lowercase tracking-[0.1em] text-ash">
                      {m.note}
                    </span>
                  </span>
                  <span className="font-mono text-[12px] tabular-nums text-ink-soft">{m.n}</span>
                </div>
                <div className="relative mt-2 h-[14px] w-full border-y-[1.5px] border-ink/30">
                  <div
                    className="absolute inset-y-0 left-0 origin-left transition-transform duration-[1200ms] ease-out"
                    style={{
                      width: `${(m.n / max) * 100}%`,
                      background: m.color,
                      transform: seen ? "scaleX(1)" : "scaleX(0)",
                      transitionDelay: `${i * 90}ms`,
                      opacity: 0.9,
                    }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-full hatch opacity-0 transition-opacity duration-300 group-hover:opacity-40"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* then & now */}
        <div className="lg:col-span-5">
          <div className="relative border-[2px] border-ink bg-paper p-6 ink-shadow">
            <span className="tape absolute -top-3 right-8 h-7 w-20 rotate-3" />
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ash">then &amp; now — 2021 → 2026</p>
            <h4 className="mt-2 font-display text-[22px]">The line keeps changing.</h4>
            <p className="mt-2.5 text-[12.5px] leading-[1.9] text-ink-soft">
              Drag the handle to swap a drawing from 2021 for one from 2026. A whole city has been built in
              what used to be empty paper — and the figure is still grey.
            </p>
            <Compare />
          </div>

          <Reveal delay={120} className="mt-6 flex items-center gap-4 border-[1.5px] border-ink/40 bg-paper-2/70 p-4">
            <img src={art("livepaint")} alt="kaduise painting live at Design Festa" className="h-20 w-28 border-[1.5px] border-ink object-cover" loading="lazy" />
            <div>
              <p className="font-display text-[15px]">She paints in public, too.</p>
              <p className="mt-1 text-[12px] leading-[1.7] text-ink-soft">
                At Design Festa she painted “Live” in front of everyone, with originals covering the wall
                behind her.
              </p>
            </div>
            <Sparkle className="ml-auto hidden h-6 w-6 shrink-0 text-orange animate-twinkle sm:block" />
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------- 2021 ↔ 2026 comparison */
function Compare() {
  const [p, setP] = useState(52);
  const box = useRef<HTMLDivElement | null>(null);
  const drag = useRef(false);

  const move = (clientX: number) => {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setP(Math.min(98, Math.max(2, ((clientX - r.left) / r.width) * 100)));
  };

  useEffect(() => {
    const up = () => (drag.current = false);
    const mv = (e: MouseEvent) => drag.current && move(e.clientX);
    const tv = (e: TouchEvent) => drag.current && move(e.touches[0].clientX);
    window.addEventListener("mouseup", up);
    window.addEventListener("mousemove", mv);
    window.addEventListener("touchend", up);
    window.addEventListener("touchmove", tv, { passive: true });
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mousemove", mv);
      window.removeEventListener("touchend", up);
      window.removeEventListener("touchmove", tv);
    };
  }, []);

  return (
    <div className="mt-5">
      <div
        ref={box}
        onMouseDown={(e) => {
          drag.current = true;
          move(e.clientX);
        }}
        onTouchStart={(e) => {
          drag.current = true;
          move(e.touches[0].clientX);
        }}
        className="relative aspect-[3/2] w-full cursor-ew-resize touch-pan-y select-none overflow-hidden border-[1.5px] border-ink bg-paper"
      >
        <img src={art("px151457717")} alt="A drawing from 2026" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${p}%` }}>
          <img
            src={art("hitsujis")}
            alt="A drawing from 2021"
            className="absolute inset-y-0 left-0 h-full object-cover"
            style={{ width: `${(100 / p) * 100}%`, maxWidth: "none" }}
            loading="lazy"
          />
        </div>
        <span
          className="pointer-events-none absolute inset-y-0 w-[2px] bg-ink"
          style={{ left: `${p}%` }}
        >
          <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[2px] border-ink bg-mustard">
            <IconChev className="h-4 w-4" />
          </span>
        </span>
        <span className="pointer-events-none absolute bottom-2 left-2 border border-ink/50 bg-paper/90 px-2 py-0.5 font-mono text-[9.5px] tracking-[0.14em]">
          2021
        </span>
        <span className="pointer-events-none absolute bottom-2 right-2 border border-ink/50 bg-paper/90 px-2 py-0.5 font-mono text-[9.5px] tracking-[0.14em]">
          2026
        </span>
      </div>
      <input
        type="range"
        min={2}
        max={98}
        value={p}
        onChange={(e) => setP(Number(e.target.value))}
        aria-label="Compare a 2021 drawing with a 2026 drawing"
        className="mt-3 h-1 w-full cursor-ew-resize appearance-none bg-ink/20 accent-orange"
      />
      <p className="mt-3 text-[11.5px] leading-[1.8] text-ash">
        Left: “Whose dream should the sheep dream?”, May 2021. Right: the drawing from 30 October 2026.
      </p>
    </div>
  );
}
