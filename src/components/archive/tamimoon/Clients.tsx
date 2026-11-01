"use client";

import { useEffect, useRef, useState } from "react";
import { collabs, workById, workUrl } from "@/tamimoonData";
import { Reveal } from "@/lib/tamimoonMotion";
import { cn } from "@/utils/cn";
import ArtImg from "./ArtImg";
import { ArrowUpRight } from "./Icons";

export default function Clients() {
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLDivElement | null>(null);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const raf = useRef(0);

  /* eased cursor-follow for the floating preview (fine pointers only) */
  useEffect(() => {
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    const tick = () => {
      const p = pos.current;
      p.x += (p.tx - p.x) * 0.16;
      p.y += (p.ty - p.y) * 0.16;
      const vx = (p.tx - p.x) * 0.06;
      if (box.current) {
        box.current.style.transform = `translate3d(${p.x + 28}px, ${p.y - 150}px, 0) rotate(${Math.max(-8, Math.min(8, vx))}deg)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const w = hover !== null ? workById(collabs[hover].work) : null;

  return (
    <section id="clients" className="relative bg-paper pb-24 sm:pb-32">
      <div className="mx-auto max-w-[1680px] px-4 sm:px-8">
        <Reveal>
          <p className="tracked text-[11px] text-ink/60">06 — Clients / 実績</p>
          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="wide text-[clamp(2.4rem,6.4vw,6rem)] leading-[0.88]">
              <span className="line-mask">
                <span>Who she</span>
              </span>
              <span className="line-mask">
                <span style={{ ["--d" as string]: "110ms" }}>has dressed</span>
              </span>
            </h2>
            <p className="max-w-[40ch] text-[14px] leading-relaxed text-ink/70 lg:text-right">
              Magazines, fashion houses, publishers and department stores. Hover a name to see the
              piece.
            </p>
          </div>
        </Reveal>

        <div
          className="mt-12 border-t-[3px] border-ink"
          onPointerMove={(e) => {
            pos.current.tx = e.clientX;
            pos.current.ty = e.clientY;
            if (hover === null) {
              pos.current.x = e.clientX;
              pos.current.y = e.clientY;
            }
          }}
          onPointerLeave={() => setHover(null)}
        >
          {collabs.map((c, i) => {
            const cw = workById(c.work);
            return (
              <a
                key={c.name}
                href={workUrl(c.work)}
                target="_blank"
                rel="noreferrer noopener"
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className={cn(
                  "group relative grid grid-cols-[2.2rem_1fr_auto] items-center gap-x-4 border-b border-ink/30 py-4 transition-all duration-500 sm:grid-cols-[3rem_1fr_16rem_auto] sm:py-5",
                  hover === i ? "bg-ink px-4 text-paper sm:px-6" : "px-0 text-ink",
                  hover !== null && hover !== i && "opacity-40",
                )}
              >
                <span
                  className={cn(
                    "tracked-b text-[10px] transition-colors",
                    hover === i ? "text-vermil" : "text-ink/45",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="wide jp text-[clamp(1.6rem,4.6vw,4.4rem)] leading-[0.95]">{c.name}</span>
                <span className="tracked-b hidden text-[10px] opacity-60 sm:block">{c.what}</span>
                <span className="flex items-center gap-3">
                  <ArtImg
                    src={cw.src}
                    alt=""
                    tone={cw.tone}
                    className="h-12 w-9 shrink-0 lg:hidden"
                  />
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* floating preview */}
      <div
        ref={box}
        className={cn(
          "pointer-events-none fixed top-0 left-0 z-50 hidden h-[300px] w-[240px] transition-opacity duration-300 lg:block",
          w ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      >
        {w && (
          <div className="relative h-full w-full">
            <span className="hand-frame absolute -inset-2 border-[3px] border-vermil" />
            <ArtImg key={w.id} src={w.src} alt="" tone={w.tone} label={w.title} className="h-full w-full" />
          </div>
        )}
      </div>
    </section>
  );
}
