"use client";

import type React from "react";
import { ArrowDown, Play } from "lucide-react";
import { artworks, totalFrames, links } from "@/data";
import { CrossMark, CountUp } from "./ui";

const bySlug = (s: string) => artworks.find((a) => a.slug === s)!;

function FloatSticker({
  slug,
  className,
  tilt,
  delay,
  label,
  onSelectWork,
}: {
  slug: string;
  className: string;
  tilt: number;
  delay: number;
  label: string;
  onSelectWork?: (slugOrId: string) => void;
}) {
  const a = bySlug(slug);
  return (
    <div className={`absolute ${className}`}>
      <a
        href="#works"
        onClick={(e) => {
          if (onSelectWork) {
            e.preventDefault();
            onSelectWork(a.id);
          }
        }}
        className="block w-full h-full sticker sticker-hover rounded-2xl overflow-hidden floaty"
        style={{ "--tilt": `${tilt}deg`, animationDelay: `${delay}s` } as React.CSSProperties}
        title={`${a.titleJp} — ${a.titleEn} (click to inspect loop)`}
      >
        <img src={a.src} alt={`${a.titleJp} (${a.titleEn}) — animated ugoira by sankobite`} className="w-full h-full object-cover" />
        <span className="absolute bottom-1.5 left-1.5 bg-paper/95 border-2 border-ink px-1.5 py-0.5 font-dot text-[10px] leading-none">
          {label}
        </span>
      </a>
    </div>
  );
}

export function Hero({ onSelectWork }: { onSelectWork?: (slugOrId: string) => void }) {
  return (
    <section id="top" className="relative halftone pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden">
      {/* ambient marks */}
      <CrossMark className="absolute top-32 left-[6%] text-ink/20 w-7 h-7" />
      <CrossMark className="absolute bottom-24 left-[42%] text-magenta/40 w-6 h-6" />
      <CrossMark className="absolute top-24 right-[8%] text-miku/50 w-8 h-8" />
      <span className="hidden lg:block absolute right-4 top-40 font-dot text-ink/15 text-6xl [writing-mode:vertical-rl] select-none" aria-hidden>
        うごイラ・スタンプ・初音ミク
      </span>
      <div className="absolute -top-20 -left-24 w-80 h-80 rounded-full bg-miku/15 blur-3xl" aria-hidden />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-magenta/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-6 items-center">
        {/* type block */}
        <div>
          <p className="inline-flex items-center gap-2 bg-ink text-paper font-dot text-xs md:text-sm px-3 py-1.5 mb-6 border-[3px] border-ink shadow-[3px_3px_0_var(--color-magenta)]">
            <Play className="w-3.5 h-3.5 text-miku" aria-hidden />
            ILLUSTRATOR × ANIMATOR × STICKER MAKER — PHILIPPINES
          </p>

          <h1 className="font-display uppercase leading-[0.86] text-[clamp(3.4rem,10vw,7.5rem)]">
            <span className="block">sanko</span>
            <span className="block text-outline">bite</span>
          </h1>
          <p className="font-dot text-xl md:text-2xl mt-3 text-ink-soft tracking-[0.3em]">さんこばいと</p>

          <p className="mt-6 max-w-lg text-base md:text-lg font-medium text-ink-soft leading-relaxed">
            A fan-made archive celebrating the ugoira of <strong className="text-ink">sankobite</strong> — chibi
            Hatsune Miku looping through the songs of DECO*27, one hand-drawn frame at a time. Every animation
            below is the artist&apos;s actual work, crawled from their Pixiv and portfolio.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#works"
              className="inline-flex items-center gap-2 bg-magenta text-white font-display uppercase text-sm md:text-base px-6 py-3.5 border-[3px] border-ink shadow-[5px_5px_0_var(--color-ink)] hover:shadow-[2px_2px_0_var(--color-ink)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              Watch the loops <ArrowDown className="w-4 h-4" aria-hidden />
            </a>
            <a
              href={links.blog}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white font-display uppercase text-sm md:text-base px-6 py-3.5 border-[3px] border-ink shadow-[5px_5px_0_var(--color-miku)] hover:shadow-[2px_2px_0_var(--color-miku)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              Official site
            </a>
          </div>

          {/* stats strip */}
          <dl className="mt-10 grid grid-cols-3 max-w-md divide-x-[3px] divide-ink border-[3px] border-ink bg-white shadow-[5px_5px_0_rgba(38,49,63,0.9)]">
            {[
              { n: <CountUp to={artworks.length} />, l: "ugoira archived" },
              { n: <CountUp to={totalFrames} />, l: "frames drawn" },
              { n: <>6th</>, l: "PIXIV Daily Ugoira" },
            ].map((s) => (
              <div key={s.l} className="px-3 py-3 text-center">
                <dt className="sr-only">{s.l}</dt>
                <dd className="font-display text-2xl md:text-3xl text-miku-deep tabular-nums">{s.n}</dd>
                <dd className="font-dot text-[10px] md:text-xs text-ink-soft mt-1 leading-tight">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* sticker collage */}
        <div className="relative h-[420px] sm:h-[500px] lg:h-[560px]" aria-label="Animated sticker collage">
          <div className="absolute inset-6 border-2 border-dashed border-ink/25 rounded-[2rem]" aria-hidden />
          <FloatSticker slug="hibana" label="ヒバナ" className="w-48 h-48 sm:w-60 sm:h-60 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20" tilt={-3} delay={0} onSelectWork={onSelectWork} />
          <FloatSticker slug="vampire" label="ヴァンパイア" className="w-32 h-32 sm:w-40 sm:h-40 left-0 top-6 z-10" tilt={-8} delay={0.7} onSelectWork={onSelectWork} />
          <FloatSticker slug="rabbit-hole" label="ラビットホール" className="w-32 h-32 sm:w-40 sm:h-40 right-0 top-0 z-10" tilt={7} delay={1.3} onSelectWork={onSelectWork} />
          <FloatSticker slug="devil-1" label="デビルじゃないもん" className="w-28 h-28 sm:w-36 sm:h-36 left-2 bottom-4 z-10" tilt={6} delay={2} onSelectWork={onSelectWork} />
          <FloatSticker slug="zombie" label="ゾンビ" className="w-28 h-28 sm:w-36 sm:h-36 right-2 bottom-8 z-10" tilt={-6} delay={1.6} onSelectWork={onSelectWork} />
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 font-dot text-xs bg-sun border-2 border-ink px-2 py-1 rotate-[-2deg] z-30">
            100% real frames ↓
          </span>
        </div>
      </div>
    </section>
  );
}
