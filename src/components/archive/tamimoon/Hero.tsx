"use client";

import { useCallback, useEffect, useState } from "react";
import { slides } from "@/tamimoonData";
import { prefersReducedMotion } from "@/lib/tamimoonMotion";
import { cn } from "@/utils/cn";
import ArtImg from "./ArtImg";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "./Icons";
import { Ink } from "./Ink";

const DUR = 6500;

export default function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const n = slides.length;

  const next = useCallback(() => setI((v) => (v + 1) % n), [n]);
  const prev = useCallback(() => setI((v) => (v - 1 + n) % n), [n]);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion()) return;
    const t = window.setTimeout(next, DUR);
    return () => window.clearTimeout(t);
  }, [i, paused, next]);

  const s = slides[i];

  return (
    <section
      id="cover"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="relative isolate min-h-[100svh] overflow-hidden transition-colors duration-[1100ms] ease-[cubic-bezier(.6,0,.2,1)]"
      style={{ backgroundColor: s.field, color: s.ink }}
    >
      <div className="relative mx-auto flex min-h-[100svh] max-w-[1680px] flex-col px-4 pt-20 pb-5 sm:px-8 sm:pt-24">
        <h1 className="sr-only">tamimoon — illustrator, @tami_moon02</h1>

        <div className="grid flex-1 grid-cols-12 gap-x-4">
          {/* intro */}
          <div className="relative z-30 col-span-12 flex flex-col lg:col-span-4">
            <div
              className={cn(
                "transition-all duration-1000 delay-300",
                ready ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
              )}
            >
              <p className="tracked text-[11px]">
                tamimoon
                <span className="relative ml-3 inline-block h-2.5 w-24 align-middle">
                  <Ink kind="underline" className="absolute inset-0 h-full w-full" stroke={2} />
                </span>
              </p>
              <p className="wide-md mt-5 max-w-[17ch] text-[clamp(1.5rem,2.6vw,2.4rem)] leading-[1.02]">
                They are there.
              </p>
              <p className="mt-4 max-w-[34ch] text-[13.5px] leading-relaxed opacity-75">
                Illustrator. She draws women through fashion — heavy-lidded, a little aloof, dressed
                as themselves — and runs an agency for the ones she has invented.
              </p>
              <p className="jp mt-3 text-[12.5px] opacity-60">ファッションを軸に女性を描くアーティスト</p>
            </div>
          </div>

          {/* artwork stack */}
          <div className="relative col-span-12 mt-6 flex items-end justify-end lg:col-span-8 lg:mt-0">
            <div
              className={cn(
                "relative aspect-[4/5] h-[54svh] transition-all duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] sm:h-[60svh] lg:h-[68svh]",
                ready ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
              )}
            >
              {slides.map((sl, k) => (
                <div
                  key={sl.key}
                  className={cn("wipe absolute inset-0", k === i ? "is-on z-10" : "z-0")}
                  aria-hidden={k !== i}
                >
                  <ArtImg
                    src={sl.src}
                    alt={sl.alt}
                    pos={sl.pos}
                    tone={sl.field}
                    label={sl.title}
                    eager={k < 2}
                    className="h-full w-full"
                  />
                </div>
              ))}
              {/* a wobbly hand-drawn frame, offset like a misregistered print */}
              <span
                className="hand-frame pointer-events-none absolute -inset-2.5 z-20 border-[3px] transition-colors duration-[1100ms]"
                style={{ borderColor: s.ink }}
                aria-hidden
              />
            </div>
          </div>
        </div>

        {/* giant title — sits on the face, like the IDENTITY cover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[4.2rem] z-20 px-4 sm:bottom-20 sm:px-8">
          <div className="mx-auto grid max-w-[1680px] overflow-hidden pb-[0.04em]">
            {slides.map((sl, k) => (
              <div
                key={sl.key}
                aria-hidden
                className={cn("title-roll wide col-start-1 row-start-1 whitespace-nowrap", k === i && "is-on")}
                style={{
                  fontSize: `calc(clamp(2.6rem, 11.4vw, 13.5rem) * ${sl.size})`,
                  lineHeight: 0.84,
                }}
              >
                {sl.title}
              </div>
            ))}
          </div>
        </div>

        {/* bottom bar */}
        <div
          className="relative z-30 mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t pt-3 transition-colors duration-[1100ms]"
          style={{ borderColor: `${s.ink}33` }}
        >
          <a
            href={s.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group flex max-w-[60ch] items-center gap-2 text-[12px] leading-snug"
          >
            <span className="tracked-b text-[9.5px] opacity-60">
              {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
            <span className="link-line">{s.credit}</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-1.5 sm:flex" role="tablist" aria-label="Slides">
              {slides.map((sl, k) => (
                <button
                  key={sl.key}
                  role="tab"
                  aria-selected={k === i}
                  aria-label={`Show ${sl.title}`}
                  onClick={() => setI(k)}
                  className="group relative h-6 w-9"
                >
                  <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-current opacity-20 transition-opacity group-hover:opacity-40" />
                  {k === i && (
                    <span
                      key={`${i}-${paused}`}
                      className="progress-fill absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-current"
                      style={{
                        ["--dur" as string]: `${DUR}ms`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prev}
                aria-label="Previous painting"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-current transition-transform duration-300 hover:-translate-x-0.5"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next painting"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-current transition-transform duration-300 hover:translate-x-0.5"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
