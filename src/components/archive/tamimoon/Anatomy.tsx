"use client";

import { useState } from "react";
import { anatomyRatio, anatomySrc, traits, workUrl } from "@/tamimoonData";
import { Reveal } from "@/lib/tamimoonMotion";
import { cn } from "@/utils/cn";
import { ArrowUpRight } from "./Icons";
import { Ink } from "./Ink";

/* background-position that centres point (cx, cy) in a zoomed crop */
const focus = (c: number, z: number) => Math.max(0, Math.min(100, (((c / 100) * z - 0.5) / (z - 1)) * 100));

export default function Anatomy() {
  const [k, setK] = useState(1);
  const t = traits[k];

  return (
    <section id="anatomy" className="relative overflow-hidden bg-lav py-20 sm:py-28">
      <div className="mx-auto max-w-[1680px] px-4 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <p className="tracked text-[11px] text-ink/60">02 — Anatomy / 描き方</p>
            <h2 className="wide mt-5 text-[clamp(2.4rem,6.4vw,6rem)] leading-[0.88]">
              <span className="line-mask">
                <span>Anatomy of</span>
              </span>
              <span className="line-mask">
                <span style={{ ["--d" as string]: "110ms" }}>
                  a{" "}
                  <span className="relative inline-block">
                    tamimoon
                    <Ink kind="underline2" className="absolute -bottom-1.5 left-0 h-3 w-full text-vermil" stroke={4} />
                  </span>{" "}
                  girl
                </span>
              </span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="max-w-[40ch] text-[14px] leading-relaxed text-ink/70 lg:text-right">
              Six things to look for, pinned to the cover of IDENTITY. Choose a marker — the loupe
              shows that detail from the actual painting.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* the painting with hotspots */}
          <Reveal dir="left" className="lg:col-span-5">
            <div className="relative mx-auto max-w-[520px]">
              <span className="hand-frame pointer-events-none absolute -inset-2.5 z-20 border-[3px] border-ink" aria-hidden />
              <div className="relative overflow-hidden bg-mist" style={{ aspectRatio: `${anatomyRatio.w} / ${anatomyRatio.h}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={anatomySrc}
                  alt="IDENTITY — girl with teal hair and blunt bangs resting her cheek on her hand"
                  width={anatomyRatio.w}
                  height={anatomyRatio.h}
                  referrerPolicy="no-referrer"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                {traits.map((tr, idx) => (
                  <button
                    key={tr.id}
                    onClick={() => setK(idx)}
                    onPointerEnter={() => setK(idx)}
                    aria-label={`${tr.no} ${tr.title}`}
                    aria-pressed={idx === k}
                    className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${tr.x}%`, top: `${tr.y}%` }}
                  >
                    {idx === k && <span className="animate-ping-slow absolute inset-0 rounded-full bg-vermil" />}
                    <span
                      className={cn(
                        "tracked-b relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] transition-all duration-300",
                        idx === k
                          ? "scale-110 border-vermil bg-vermil text-white"
                          : "border-ink bg-paper/85 text-ink group-hover:scale-110 group-hover:bg-ink group-hover:text-paper",
                      )}
                    >
                      {tr.no}
                    </span>
                  </button>
                ))}
              </div>
              <a
                href={workUrl(75)}
                target="_blank"
                rel="noreferrer noopener"
                className="tracked-b group mt-5 flex items-center justify-between text-[10px] text-ink/60 transition-colors hover:text-ink"
              >
                <span className="link-line">IDENTITY — KADOKAWA, 2022</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </Reveal>

          {/* the loupe */}
          <Reveal className="lg:col-span-3" delay={100}>
            <div className="lg:sticky lg:top-24">
              <p className="tracked-b mb-3 text-[10px] text-ink/60">Loupe · ×{t.zoom.toFixed(1)}</p>
              <div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-full border-[3px] border-ink bg-mist">
                {traits.map((tr, idx) => (
                  <div
                    key={tr.id}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-500",
                      idx === k ? "opacity-100" : "opacity-0",
                    )}
                    style={{
                      backgroundImage: `url(${anatomySrc})`,
                      backgroundSize: `${tr.zoom * 100}% auto`,
                      backgroundPosition: `${focus(tr.x, tr.zoom)}% ${focus(tr.y, tr.zoom)}%`,
                      backgroundRepeat: "no-repeat",
                    }}
                    aria-hidden
                  />
                ))}
                <span className="pointer-events-none absolute inset-0 rounded-full ring-[10px] ring-inset ring-lav/40" />
              </div>
              <p className="wide-md mt-5 text-[clamp(1.25rem,2vw,1.7rem)] leading-tight">{t.title}</p>
              <p className="jp mt-1 text-[13px] text-ink/55">{t.jp}</p>
            </div>
          </Reveal>

          {/* the notes */}
          <div className="lg:col-span-4">
            <ol className="border-t-[3px] border-ink">
              {traits.map((tr, idx) => (
                <li key={tr.id} className="border-b border-ink/25">
                  <button
                    onClick={() => setK(idx)}
                    aria-expanded={idx === k}
                    className="group flex w-full items-baseline gap-4 py-4 text-left"
                  >
                    <span
                      className={cn(
                        "tracked-b text-[10px] transition-colors",
                        idx === k ? "text-vermil" : "text-ink/45",
                      )}
                    >
                      {tr.no}
                    </span>
                    <span
                      className={cn(
                        "wide-md text-[clamp(1.05rem,1.6vw,1.4rem)] leading-tight transition-all duration-300",
                        idx === k ? "translate-x-1 text-ink" : "text-ink/55 group-hover:text-ink",
                      )}
                    >
                      {tr.title}
                    </span>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
                    style={{ gridTemplateRows: idx === k ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="pr-2 pb-5 pl-9 text-[13.5px] leading-[1.8] text-ink/70">{tr.note}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
