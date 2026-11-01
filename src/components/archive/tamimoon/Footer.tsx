"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";
import { ArrowUpRight } from "./Icons";

const word = "tamimoon";

export default function Footer() {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <footer className="relative overflow-hidden bg-lav pt-14 text-ink">
      <div className="mx-auto flex max-w-[1680px] flex-wrap items-start justify-between gap-8 px-4 sm:px-8">
        <p className="max-w-[46ch] text-[13.5px] leading-[1.8] text-ink/70">
          An unofficial fan-made profile of the illustrator tamimoon (
          <a href="https://x.com/tami_moon02" target="_blank" rel="noreferrer noopener" className="link-line font-bold">
            @tami_moon02
          </a>
          ). All artwork and names © tamimoon and the respective rights holders, shown from the
          artist’s official site and linked back to their source.
        </p>
        <a
          href="#cover"
          className="tracked-b group flex items-center gap-2 text-[10.5px]"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("cover")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span className="link-line">Back to top</span>
          <ArrowUpRight className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </a>
      </div>

      <div className="mt-6 select-none overflow-hidden px-2 sm:px-4" aria-hidden>
        <p className="wide flex justify-center leading-[0.8] normal-case" style={{ fontSize: "clamp(3.4rem, 21vw, 24rem)" }}>
          {word.split("").map((ch, i) => (
            <span
              key={i}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              className={cn(
                "inline-block transition-all duration-500",
                hover === i ? "-translate-y-3 text-vermil" : "",
              )}
            >
              {ch}
            </span>
          ))}
        </p>
      </div>

      <div className="border-t-[3px] border-ink">
        <div className="tracked-b mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-3 px-4 py-4 text-[9.5px] text-ink/65 sm:px-8">
          <span>tamimoon — illustrator · Japan</span>
          <span className="jp tracking-normal normal-case">ファッションを軸に女性を描くアーティスト</span>
        </div>
      </div>
    </footer>
  );
}
