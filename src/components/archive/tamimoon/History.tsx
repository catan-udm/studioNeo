"use client";

import { useEffect, useRef, useState } from "react";
import { timeline } from "@/tamimoonData";
import { Reveal, prefersReducedMotion } from "@/lib/tamimoonMotion";
import { cn } from "@/utils/cn";
import { Ink } from "./Ink";

export default function History() {
  const wrap = useRef<HTMLOListElement | null>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setP(1);
      return;
    }
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const start = window.innerHeight * 0.7;
        const v = (start - r.top) / (r.height + start - window.innerHeight * 0.3);
        setP(Math.max(0, Math.min(1, v)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="history" className="relative overflow-hidden bg-night py-20 text-paper sm:py-28">
      <div className="mx-auto max-w-[1680px] px-4 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <p className="tracked text-[11px] text-paper/55">07 — History / 沿革</p>
                <h2 className="wide mt-5 text-[clamp(2.4rem,6vw,5.6rem)] leading-[0.88]">
                  <span className="line-mask">
                    <span>Six years,</span>
                  </span>
                  <span className="line-mask">
                    <span style={{ ["--d" as string]: "110ms" }}>
                      one{" "}
                      <span className="relative inline-block text-vermil">
                        gaze
                        <Ink kind="underline" className="absolute -bottom-1.5 left-0 h-3 w-full text-paper" stroke={3.5} />
                      </span>
                    </span>
                  </span>
                </h2>
                <p className="mt-6 max-w-[34ch] text-[14px] leading-relaxed text-paper/60">
                  From posting on social media to a KADOKAWA art book, solo exhibitions, magazine
                  covers and a hand-distressed cap.
                </p>
              </Reveal>
            </div>
          </div>

          <ol ref={wrap} className="relative lg:col-span-8">
            <span className="absolute top-0 bottom-0 left-[5px] w-px bg-paper/20 sm:left-[9px]" aria-hidden />
            <span
              className="absolute top-0 left-[5px] w-px bg-vermil sm:left-[9px]"
              style={{ height: `${p * 100}%` }}
              aria-hidden
            />
            {timeline.map((y, yi) => {
              const lit = p * timeline.length > yi + 0.1;
              return (
                <li key={y.year} className="relative pb-14 pl-9 last:pb-0 sm:pl-14">
                  <span
                    className={cn(
                      "absolute top-3 left-0 h-[11px] w-[11px] rounded-full border-2 transition-all duration-500 sm:top-5 sm:h-[19px] sm:w-[19px]",
                      lit ? "scale-110 border-vermil bg-vermil" : "border-paper/40 bg-night",
                    )}
                    aria-hidden
                  />
                  <p
                    className={cn(
                      "wide text-[clamp(3.4rem,10vw,8.5rem)] leading-[0.85] transition-colors duration-700 tabular-nums",
                      lit ? "text-paper" : "text-paper/20",
                    )}
                  >
                    {y.year}
                  </p>
                  <ul className="mt-5 space-y-5">
                    {y.items.map((it) => (
                      <li key={it.t} className="max-w-[60ch]">
                        <p className="wide-md jp text-[clamp(1.05rem,1.7vw,1.4rem)] leading-tight">{it.t}</p>
                        {it.d && <p className="mt-1.5 text-[13.5px] leading-[1.75] text-paper/55">{it.d}</p>}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
