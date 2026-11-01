"use client";

import { useMemo, useState } from "react";
import { models, workUrl, works, site } from "@/tamimoonData";
import { cn } from "@/utils/cn";
import ArtImg from "./ArtImg";
import { ArrowUpRight } from "./Icons";
import { Reveal } from "@/lib/tamimoonMotion";

export default function Models() {
  const [k, setK] = useState(0);
  const m = models[k];

  const appears = useMemo(() => works.filter((w) => w.cast.includes(m.id)), [m.id]);

  return (
    <section
      id="models"
      className="relative overflow-hidden py-20 transition-colors duration-[900ms] ease-[cubic-bezier(.6,0,.2,1)] sm:py-28"
      style={{ backgroundColor: m.field, color: m.ink }}
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-8">
        <Reveal>
          <p className="tracked text-[11px] opacity-70">03 — The agency / モデル</p>
          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="wide text-[clamp(2.4rem,6.4vw,6rem)] leading-[0.88]">
              <span className="line-mask">
                <span>Five women</span>
              </span>
              <span className="line-mask">
                <span style={{ ["--d" as string]: "110ms" }}>who aren’t real.</span>
              </span>
            </h2>
            <p className="max-w-[44ch] text-[14px] leading-relaxed opacity-75 lg:text-right">
              In 2022 tamimoon founded an “illustration model agency”: every woman she draws gets an
              age, a birthday, a height, a blood type and a favourite thing — and brands can book
              them. Profiles below are as listed on the official site.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* names as tabs */}
          <div className="order-2 lg:order-1 lg:col-span-4">
            <div role="tablist" aria-label="Models" className="flex flex-row gap-x-5 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
              {models.map((x, idx) => (
                <button
                  key={x.id}
                  role="tab"
                  aria-selected={idx === k}
                  onClick={() => setK(idx)}
                  onPointerEnter={() => window.matchMedia("(hover:hover)").matches && setK(idx)}
                  className="group flex shrink-0 items-baseline gap-3 lg:gap-5"
                >
                  <span className="tracked-b text-[10px] opacity-60">{x.no}</span>
                  <span
                    className={cn(
                      "wide text-[clamp(2.8rem,8.6vw,8rem)] leading-[0.92] transition-all duration-500",
                      idx === k ? "translate-x-0 opacity-100 lg:translate-x-3" : "opacity-25 group-hover:opacity-60",
                    )}
                  >
                    {x.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* portrait */}
          <div className="order-1 lg:order-2 lg:col-span-4">
            <div className="relative mx-auto max-w-[430px]">
              <span className="hand-frame pointer-events-none absolute -inset-2.5 z-20 border-[3px] transition-colors duration-700" style={{ borderColor: m.ink }} aria-hidden />
              <div className="relative aspect-[3/4] overflow-hidden">
                {models.map((x, idx) => (
                  <ArtImg
                    key={x.id}
                    src={x.src}
                    alt={`${x.name}: ${x.look}`}
                    pos={x.pos}
                    tone={x.field}
                    label={x.name}
                    className={cn(
                      "absolute inset-0 transition-all duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)]",
                      idx === k ? "scale-100 opacity-100" : "scale-[1.06] opacity-0",
                    )}
                    eager={idx < 2}
                  />
                ))}
              </div>
              <p className="tracked-b mt-5 text-[10px] opacity-70">{m.look}</p>
            </div>
          </div>

          {/* comp card */}
          <div className="order-3 lg:col-span-4">
            <div className="border-t-[3px] pt-4 transition-colors duration-700" style={{ borderColor: m.ink }}>
              <div className="flex items-baseline justify-between">
                <p className="wide text-[clamp(1.6rem,2.6vw,2.4rem)] leading-none">{m.name}</p>
                <p className="tracked-b text-[10px] opacity-60">Comp card · {m.no}/05</p>
              </div>
              <dl className="mt-5">
                {[
                  ["Age", String(m.age)],
                  ["Date of birth", m.dob],
                  ["Height", m.height],
                  ["Blood type", m.blood],
                  ["Favourite", m.fav],
                ].map(([a, b]) => (
                  <div key={a} className="flex items-baseline justify-between gap-4 border-b py-3" style={{ borderColor: `${m.ink}33` }}>
                    <dt className="tracked-b text-[10px] opacity-60">{a}</dt>
                    <dd className="wide-md text-right text-[15px]">{b}</dd>
                  </div>
                ))}
              </dl>

              <p className="tracked-b mt-7 text-[10px] opacity-60">
                Appears in · {appears.length} work{appears.length === 1 ? "" : "s"}
              </p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {appears.slice(0, 8).map((w) => (
                  <a
                    key={w.id}
                    href={workUrl(w.id)}
                    target="_blank"
                    rel="noreferrer noopener"
                    title={w.title}
                    className="group relative block aspect-[3/4] overflow-hidden"
                  >
                    <ArtImg
                      src={w.src}
                      alt={w.title}
                      label={w.title}
                      tone={w.tone}
                      className="h-full w-full"
                      imgClassName="transition-transform duration-700 group-hover:scale-110"
                    />
                  </a>
                ))}
              </div>
              <a
                href={`${site}/models`}
                target="_blank"
                rel="noreferrer noopener"
                className="tracked-b group mt-6 inline-flex items-center gap-2 text-[10px]"
              >
                <span className="link-line">Official profiles</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
