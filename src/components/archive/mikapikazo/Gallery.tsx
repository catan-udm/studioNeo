"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, X } from "lucide-react";
import { EXHIBITION, works, type Category, type Work } from "@/mikapikazoData";

type Filter = "all" | Category;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "WHOLE PAGE" },
  { id: "illustration", label: "ILLUSTRATION" },
  { id: "key-visual", label: "KEY VISUALS" },
];

/* an irregular manga page rhythm — tiles cleanly at ten panels */
const SPANS = [
  "col-span-1 row-span-2 md:col-span-2 md:row-span-3",
  "col-span-1 row-span-2 md:col-span-2 md:row-span-3",
  "col-span-2 row-span-3 md:col-span-2 md:row-span-3",
  "col-span-1 row-span-2 md:col-span-3 md:row-span-3",
  "col-span-1 row-span-2 md:col-span-3 md:row-span-3",
  "col-span-1 row-span-2 md:col-span-2 md:row-span-3",
  "col-span-1 row-span-2 md:col-span-2 md:row-span-3",
  "col-span-2 row-span-3 md:col-span-2 md:row-span-3",
  "col-span-1 row-span-2 md:col-span-3 md:row-span-4",
  "col-span-1 row-span-2 md:col-span-3 md:row-span-4",
];

export default function Gallery({
  selectedWorkId,
  onSelectWork,
}: {
  selectedWorkId?: string | null;
  onSelectWork?: (id: string | null) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(selectedWorkId ?? null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Sync from props
  useEffect(() => {
    if (selectedWorkId !== undefined) {
      setOpenId(selectedWorkId);
    }
  }, [selectedWorkId]);

  const list = useMemo(
    () => works.filter((work) => filter === "all" || work.category === filter),
    [filter],
  );
  const openIndex = openId ? list.findIndex((w) => w.id === openId) : -1;
  const active: Work | null = openIndex >= 0 ? list[openIndex] : null;

  const handleOpen = (id: string) => {
    setOpenId(id);
    onSelectWork?.(id);
  };

  const handleClose = () => {
    setOpenId(null);
    onSelectWork?.(null);
  };

  const step = useCallback(
    (direction: 1 | -1) => {
      setOpenId((current) => {
        const i = list.findIndex((w) => w.id === current);
        if (i < 0) return current;
        const nextWork = list[(i + direction + list.length) % list.length];
        onSelectWork?.(nextWork.id);
        return nextWork.id;
      });
    },
    [list, onSelectWork],
  );

  useEffect(() => {
    if (!active) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [active, step]);

  const countFor = (id: Filter) =>
    id === "all" ? works.length : works.filter((w) => w.category === id).length;

  return (
    <section id="work" className="relative scroll-mt-20 bg-paper px-4 py-20 md:px-10 md:py-28">
      <div className="relative mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between" data-reveal>
          <div className="reveal">
            <p className="mb-4 inline-flex items-center gap-2 border-[3px] border-ink bg-pop2 px-3 py-1 font-body text-[11px] font-bold tracking-[0.2em] text-on-pop2">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> 03 — THE SPREAD
            </p>
            <h2 className="font-display text-[clamp(52px,9vw,132px)] leading-[0.94] tracking-tight">
              TEN PANELS,
              <br />
              <span className="text-pop stroke-ink">ONE PAGE.</span>
            </h2>
          </div>

          <div className="reveal max-w-md">
            <p className="mb-5 font-body text-base leading-relaxed text-ink/75">
              Laid out the way the work is drawn — as a page of panels, not a grid of thumbnails.
              Open any panel to read it full size.
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter panels by type">
              {FILTERS.map((item) => {
                const isActive = filter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setFilter(item.id)}
                    className={`inline-flex items-center gap-2 border-[3px] border-ink px-3 py-2 font-body text-[11px] font-bold tracking-[0.14em] transition-all duration-150 hover:-translate-y-0.5 ${
                      isActive
                        ? "bg-ink text-paper shadow-[4px_4px_0_var(--pop)]"
                        : "bg-paper text-ink hover:bg-pop2 hover:text-on-pop2"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`px-1.5 py-0.5 text-[10px] ${
                        isActive ? "bg-pop2 text-on-pop2" : "bg-ink text-paper"
                      }`}
                    >
                      {countFor(item.id)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* the page */}
        <div className="relative border-[5px] border-ink bg-paper p-3 shadow-[16px_16px_0_var(--color-ink)] md:p-5">
          <span className="tape -top-4 left-10 -rotate-6" aria-hidden="true" />
          <span className="tape -top-4 right-14 rotate-4" aria-hidden="true" />

          <div
            key={filter}
            className="grid auto-rows-[104px] grid-cols-2 gap-3 [grid-auto-flow:dense] md:auto-rows-[132px] md:grid-cols-6 md:gap-4"
            aria-live="polite"
          >
            {list.map((work, i) => (
              <button
                key={work.id}
                type="button"
                onClick={() => handleOpen(work.id)}
                aria-label={`Open panel ${i + 1}: ${work.title}`}
                style={{ animationDelay: `${Math.min(i, 9) * 60}ms` }}
                className={`panel-in group relative overflow-hidden border-[4px] border-ink bg-white transition-transform duration-300 hover:z-10 hover:-translate-y-1 focus-visible:z-10 focus-visible:-translate-y-1 ${
                  SPANS[i % SPANS.length]
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={work.image}
                  alt={work.alt}
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: work.pos ?? "center" }}
                  className="chroma h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />

                {/* speed lines burst in on hover */}
                <span
                  className="speedlines pointer-events-none absolute inset-0 text-ink/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  aria-hidden="true"
                />

                <span className="pointer-events-none absolute left-0 top-0 border-b-[3px] border-r-[3px] border-ink bg-paper px-2 py-0.5 font-display text-base leading-tight">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* katakana sound effect */}
                <span
                  className="sfx pointer-events-none absolute right-2 top-3 origin-center font-jp text-[clamp(20px,3vw,40px)] font-bold leading-none text-paper opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  style={{ WebkitTextStroke: "4px var(--color-ink)", paintOrder: "stroke fill" }}
                  aria-hidden="true"
                >
                  {work.sfx}
                </span>

                <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full border-t-[3px] border-ink bg-ink px-2.5 py-1.5 text-left transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
                  <span className="block font-display text-lg leading-none tracking-wide text-paper">
                    {work.title}
                  </span>
                  <span className="mt-0.5 block font-body text-[9px] font-bold tracking-[0.14em] text-pop2">
                    {work.meta}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t-[3px] border-ink pt-2 font-body text-[10px] font-bold tracking-[0.18em] text-ink/50 md:mt-5">
            <span>MIKA PIKAZO — SELECTED PANELS</span>
            <span>PAGE {filter === "all" ? "01" : filter === "illustration" ? "02" : "03"}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <p className="font-body text-xs font-bold tracking-[0.16em] text-ink/60">
            SHOWING {list.length} OF {works.length} PANELS
          </p>
          <a
            href="https://www.pixiv.net/users/1039353"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 border-[3px] border-ink bg-pop3 px-5 py-3 font-body text-[11px] font-bold tracking-[0.16em] text-on-pop3 shadow-[6px_6px_0_var(--color-ink)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[9px_9px_0_var(--color-ink)]"
          >
            MORE ON PIXIV <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/92 p-3 md:p-8"
          onMouseDown={handleClose}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lightbox-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="pop-in flex max-h-[94svh] w-full max-w-6xl flex-col overflow-auto border-[5px] border-ink bg-paper shadow-[14px_14px_0_var(--pop)]"
          >
            <div className="flex items-center justify-between gap-4 border-b-[4px] border-ink bg-pop2 px-4 py-2.5 text-on-pop2">
              <span className="font-body text-[10px] font-bold tracking-[0.2em]">
                PANEL {String(openIndex + 1).padStart(2, "0")} — MIKA PIKAZO
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={handleClose}
                className="inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-2.5 py-1 font-body text-[10px] font-bold tracking-[0.16em] text-ink transition-colors hover:bg-pop hover:text-on-pop"
              >
                CLOSE <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid flex-1 md:grid-cols-[1.15fr_0.85fr]">
              <div className="relative flex items-center justify-center bg-ink p-4">
                <div className="halftone pointer-events-none absolute inset-0 text-paper/15" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.image}
                  alt={active.alt}
                  className="chroma relative max-h-[42svh] w-auto border-[3px] border-paper object-contain md:max-h-[64svh]"
                />
                <span
                  className="pointer-events-none absolute right-5 top-5 font-jp text-3xl font-bold text-paper md:text-5xl"
                  style={{ WebkitTextStroke: "5px var(--color-ink)", paintOrder: "stroke fill" }}
                  aria-hidden="true"
                >
                  {active.sfx}
                </span>
              </div>

              <div className="flex flex-col justify-center gap-4 p-6 md:p-9">
                <div className="flex flex-wrap gap-2">
                  <span className="border-[3px] border-ink bg-pop px-2.5 py-1 font-body text-[10px] font-bold tracking-[0.16em] text-on-pop">
                    {active.category === "key-visual" ? "KEY VISUAL" : "ILLUSTRATION"}
                  </span>
                  {active.year && (
                    <span className="border-[3px] border-ink px-2.5 py-1 font-body text-[10px] font-bold tracking-[0.16em]">
                      {active.year}
                    </span>
                  )}
                </div>
                <h3
                  id="lightbox-title"
                  className="font-display text-[clamp(40px,6vw,76px)] leading-[0.9] tracking-tight"
                >
                  {active.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-ink/75">{active.note}</p>
                <p className="font-body text-[11px] font-bold tracking-[0.14em] text-ink/50">
                  {active.meta}
                </p>
                <a
                  href={EXHIBITION}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-2 border-b-[3px] border-pop pb-1 font-body text-[11px] font-bold tracking-[0.16em] transition-colors hover:text-pop"
                >
                  ARTWORK SOURCE <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t-[4px] border-ink px-4 py-3">
              <button
                type="button"
                onClick={() => step(-1)}
                className="inline-flex items-center gap-2 border-[3px] border-ink px-3 py-2 font-body text-[10px] font-bold tracking-[0.16em] transition-colors hover:bg-pop2 hover:text-on-pop2"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> PREV
              </button>
              <span className="font-display text-lg tracking-widest">
                {String(openIndex + 1).padStart(2, "0")}
                <span className="text-ink/40"> / {String(list.length).padStart(2, "0")}</span>
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                className="inline-flex items-center gap-2 border-[3px] border-ink px-3 py-2 font-body text-[10px] font-bold tracking-[0.16em] transition-colors hover:bg-pop2 hover:text-on-pop2"
              >
                NEXT <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
