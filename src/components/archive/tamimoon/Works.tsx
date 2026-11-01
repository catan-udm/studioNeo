"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { castFilters, workUrl, works, type Cast, type Work } from "@/tamimoonData";
import { Reveal, useScrollLock } from "@/lib/tamimoonMotion";
import { cn } from "@/utils/cn";
import ArtImg from "./ArtImg";
import { ArrowUpRight, ChevronLeft, ChevronRight, Close } from "./Icons";

export default function Works({
  selectedWorkId,
  onSelectWork,
}: {
  selectedWorkId?: string | null;
  onSelectWork?: (id: string | null) => void;
}) {
  const [filter, setFilter] = useState<Cast | "all">("all");
  const [open, setOpen] = useState<number | null>(null);

  const list = useMemo(
    () => (filter === "all" ? works : works.filter((x) => x.cast.includes(filter))),
    [filter],
  );

  // Sync optional external ?work=tamimoon-XXX URL param into local `open` index
  useEffect(() => {
    if (!selectedWorkId) return;
    const rawNumeric = selectedWorkId.replace(/^tamimoon-/, "");
    const idx = list.findIndex((w) => String(w.id) === rawNumeric || `tamimoon-${w.id}` === selectedWorkId);
    if (idx >= 0) {
      setOpen(idx);
    }
  }, [selectedWorkId, list]);

  const close = useCallback(() => {
    setOpen(null);
    onSelectWork?.(null);
  }, [onSelectWork]);

  const step = useCallback(
    (d: number) =>
      setOpen((o) => {
        if (o === null) return o;
        const next = (o + d + list.length) % list.length;
        const nextWork = list[next];
        if (nextWork) onSelectWork?.(`tamimoon-${nextWork.id}`);
        return next;
      }),
    [list, onSelectWork],
  );

  useScrollLock(open !== null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  const current = open !== null ? list[open] : null;

  return (
    <section id="works" className="relative bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[1680px] px-4 sm:px-8">
        <Reveal>
          <p className="tracked text-[11px] text-ink/60">05 — Works / 作品</p>
          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="wide text-[clamp(2.4rem,6.4vw,6rem)] leading-[0.88]">
              <span className="line-mask">
                <span>Selected</span>
              </span>
              <span className="line-mask">
                <span style={{ ["--d" as string]: "110ms" }}>works</span>
              </span>
            </h2>
            <p className="max-w-[40ch] text-[14px] leading-relaxed text-ink/70 lg:text-right">
              Editorial, fashion, music, books and events — {works.length} pieces from the official
              archive. Filter by which of the five women appears.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80} className="mt-10">
          <div className="no-bar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            {castFilters.map((f) => {
              const on = filter === f.key;
              const n = f.key === "all" ? works.length : works.filter((x) => x.cast.includes(f.key as Cast)).length;
              return (
                <button
                  key={f.key}
                  onClick={() => {
                    setFilter(f.key);
                    setOpen(null);
                    onSelectWork?.(null);
                  }}
                  aria-pressed={on}
                  className={cn(
                    "tracked-b shrink-0 rounded-full border-2 border-ink px-5 py-2.5 text-[10.5px] transition-all duration-300",
                    on ? "bg-ink text-paper" : "hover:-translate-y-0.5 hover:bg-lav",
                  )}
                >
                  {f.label}
                  <span className={cn("ml-2 text-[9px]", on ? "text-vermil" : "text-ink/45")}>{n}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div key={filter} className="mt-10 columns-2 gap-3 sm:gap-4 md:columns-3 xl:columns-4">
          {list.map((x, i) => (
            <Card
              key={x.id}
              work={x}
              index={i}
              onOpen={() => {
                setOpen(i);
                onSelectWork?.(`tamimoon-${x.id}`);
              }}
            />
          ))}
        </div>

        <p className="tracked-b mt-14 border-t-[3px] border-ink pt-4 text-[10px] text-ink/55">
          All artwork © tamimoon and the respective rights holders. Images are displayed from the
          artist’s official site — click any piece to view it at the source.
        </p>
      </div>

      <Lightbox work={current} index={open ?? 0} total={list.length} onClose={close} onStep={step} />
    </section>
  );
}

function Card({ work, index, onOpen }: { work: Work; index: number; onOpen: () => void }) {
  return (
    <Reveal dir="scale" delay={(index % 4) * 70} className="mb-3 break-inside-avoid sm:mb-4">
      <button
        onClick={onOpen}
        aria-label={`Open ${work.title}`}
        className="group relative block w-full cursor-zoom-in overflow-hidden text-left"
      >
        <ArtImg
          src={work.src}
          alt={work.title}
          label={work.title}
          tone={work.tone}
          className="w-full"
          style={{ aspectRatio: `${work.w} / ${work.h}` }}
          imgClassName="transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-3 text-paper opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="tracked-b block text-[9px] text-peach">{work.kind}</span>
          <span className="jp mt-1 block text-[13px] leading-snug font-bold">{work.title}</span>
        </span>
      </button>
    </Reveal>
  );
}

function Lightbox({
  work,
  index,
  total,
  onClose,
  onStep,
}: {
  work: Work | null;
  index: number;
  total: number;
  onClose: () => void;
  onStep: (d: number) => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center transition-opacity duration-400",
        work ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      role="dialog"
      aria-modal={Boolean(work)}
      aria-label={work?.title}
    >
      <div className="absolute inset-0 bg-lav/95 backdrop-blur-sm" onClick={onClose} />
      {work && (
        <div className="relative z-10 mx-3 grid max-h-[92svh] w-full max-w-[1100px] grid-cols-1 overflow-y-auto border-[3px] border-ink bg-paper md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:overflow-hidden">
          <div className="relative flex items-center justify-center bg-ink/5 p-3 sm:p-6">
            <ArtImg
              key={work.id}
              src={work.src}
              alt={work.title}
              label={work.title}
              tone="transparent"
              contain
              eager
              className="h-[52svh] w-full md:h-[80svh]"
            />
          </div>
          <div className="flex flex-col p-6 sm:p-9">
            <p className="tracked-b text-[10px] text-vermil">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {work.kind}
            </p>
            <h3 className="wide-md jp mt-4 text-[clamp(1.5rem,2.8vw,2.4rem)] leading-[1.05]">{work.title}</h3>
            <dl className="mt-6 border-t-[3px] border-ink">
              <div className="flex items-baseline justify-between gap-4 border-b border-ink/20 py-3">
                <dt className="tracked-b text-[10px] text-ink/55">Category</dt>
                <dd className="wide-md text-[14px]">{work.kind}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-ink/20 py-3">
                <dt className="tracked-b text-[10px] text-ink/55">Appears</dt>
                <dd className="wide-md text-right text-[14px] uppercase">
                  {work.cast.map((c) => (c === "tamimoon" ? "tamimoon" : c)).join(" · ")}
                </dd>
              </div>
            </dl>
            <a
              href={workUrl(work.id)}
              target="_blank"
              rel="noreferrer noopener"
              className="tracked-b group mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-3 text-[10.5px] text-paper transition-colors hover:bg-vermil"
            >
              View at tamimoon.tokyo
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <div className="mt-auto flex items-center gap-2 pt-8">
              <button
                onClick={() => onStep(-1)}
                aria-label="Previous work"
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink transition-colors hover:bg-ink hover:text-paper"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={() => onStep(1)}
                aria-label="Next work"
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink transition-colors hover:bg-ink hover:text-paper"
              >
                <ChevronRight />
              </button>
              <span className="tracked-b ml-2 hidden text-[9px] text-ink/45 sm:inline">← → · esc</span>
              <button
                onClick={onClose}
                className="tracked-b ml-auto flex items-center gap-2 rounded-full border-2 border-ink px-4 py-2.5 text-[10px] transition-colors hover:bg-vermil hover:text-white"
              >
                Close <Close className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
