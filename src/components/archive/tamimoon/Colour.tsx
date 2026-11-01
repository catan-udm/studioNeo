"use client";

import { useState } from "react";
import { fields } from "@/tamimoonData";
import { Reveal } from "@/lib/tamimoonMotion";
import { cn } from "@/utils/cn";
import ArtImg from "./ArtImg";
import { ArrowUpRight } from "./Icons";

export default function Colour() {
  const [k, setK] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      /* clipboard unavailable — still show feedback */
    }
    setCopied(hex);
    window.setTimeout(() => setCopied(null), 1300);
  };

  return (
    <section id="colour" className="relative bg-paper pt-20 sm:pt-28">
      <div className="mx-auto max-w-[1680px] px-4 sm:px-8">
        <Reveal>
          <p className="tracked text-[11px] text-ink/60">04 — Colour / 色</p>
          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="wide text-[clamp(2.4rem,6.4vw,6rem)] leading-[0.88]">
              <span className="line-mask">
                <span>One flat field,</span>
              </span>
              <span className="line-mask">
                <span style={{ ["--d" as string]: "110ms" }}>one loud mouth.</span>
              </span>
            </h2>
            <p className="max-w-[42ch] text-[14px] leading-relaxed text-ink/70 lg:text-right">
              The backgrounds are never scenery — they are blocks of pure colour, and the girl is
              what happens in front of it. Six of them, with the painting each came from. Tap a hex
              to copy it.
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-12" dir="scale">
        <div className="flex h-[92svh] flex-col border-y-[3px] border-ink lg:h-[82svh] lg:flex-row">
          {fields.map((f, idx) => {
            const on = idx === k;
            return (
              <div
                key={f.id}
                role="button"
                tabIndex={0}
                aria-expanded={on}
                aria-label={`${f.name} ${f.hex}`}
                onClick={() => setK(idx)}
                onPointerEnter={() => window.matchMedia("(hover:hover)").matches && setK(idx)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setK(idx)}
                className={cn(
                  "relative min-h-0 min-w-0 cursor-pointer overflow-hidden transition-[flex-grow] duration-[900ms] ease-[cubic-bezier(.7,0,.2,1)] not-last:border-b-[3px] not-last:border-ink lg:not-last:border-r-[3px] lg:not-last:border-b-0",
                  on ? "grow-[7]" : "grow-[1]",
                )}
                style={{ flexBasis: 0, background: f.bg, color: f.ink }}
              >
                {/* collapsed label */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-between px-4 transition-opacity duration-500 lg:flex-col lg:justify-between lg:py-6",
                    on ? "pointer-events-none opacity-0" : "opacity-100 delay-300",
                  )}
                >
                  <span className="tracked-b text-[10px]">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="wide-md text-[13px] whitespace-nowrap lg:vertical lg:text-[clamp(1.2rem,2vw,1.8rem)]">
                    {f.name}
                  </span>
                  <span className="tracked-b hidden text-[9px] opacity-60 lg:block">{f.hex}</span>
                </div>

                {/* expanded */}
                <div
                  className={cn(
                    "absolute inset-0 grid grid-rows-[auto_1fr] gap-3 p-4 transition-opacity duration-700 lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-1 lg:gap-8 lg:p-8",
                    on ? "opacity-100 delay-500" : "pointer-events-none opacity-0",
                  )}
                >
                  <div className="flex min-w-0 flex-col justify-between">
                    <div>
                      <p className="tracked-b text-[10px] opacity-70">
                        {String(idx + 1).padStart(2, "0")} / {String(fields.length).padStart(2, "0")}
                      </p>
                      <p className="wide mt-3 text-[clamp(2rem,5.4vw,5.6rem)] leading-[0.88]">{f.name}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copy(f.hex);
                        }}
                        className="tracked-b rounded-full border-2 border-current px-4 py-2 text-[10.5px] transition-transform duration-300 hover:-translate-y-0.5"
                      >
                        {copied === f.hex ? "Copied ✓" : f.hex}
                      </button>
                      <a
                        href={f.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        onClick={(e) => e.stopPropagation()}
                        className="tracked-b group flex items-center gap-1.5 text-[10px]"
                      >
                        <span className="link-line">From: {f.from}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    </div>
                  </div>

                  <div className="relative min-h-0 lg:h-full lg:w-[min(32vw,420px)]">
                    <span
                      className="hand-frame pointer-events-none absolute -inset-1.5 z-10 border-[3px]"
                      style={{ borderColor: f.ink }}
                      aria-hidden
                    />
                    <ArtImg
                      src={f.src}
                      alt={`${f.from} — painting on ${f.name}`}
                      pos={f.pos}
                      tone="transparent"
                      label={f.from}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
