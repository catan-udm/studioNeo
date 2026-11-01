import { useCallback, useEffect, useMemo, useState, type TouchEvent as ReactTouchEvent } from "react";
import { art, sourceHref, sourceLabel } from "@/components/archive/kaduise/lib/art";
import { ALL_WORKS, TAGS, X_WORKS_COUNT, displayTitle, type Tag, type Work } from "@/components/archive/kaduise/data/works";
import { IconChev, IconClose, IconExternal, IconGrid, IconHeart, IconSearch, Reveal, Signature, Sparkle } from "@/components/archive/kaduise/components/ui";
import { cn } from "@/utils/cn";

type Sort = "new" | "fav";

/* ------------------------------------------------------------ card */
function WorkCard({ w, n, onOpen }: { w: Work; n: number; onOpen: () => void }) {
  const tilt = ((n * 37) % 5) - 2;
  return (
    <Reveal delay={(n % 6) * 70} className="mb-5 break-inside-avoid">
      <button
        onClick={onOpen}
        className="group relative block w-full text-left"
        style={{ transform: `rotate(${tilt * 0.32}deg)` }}
      >
        <span
          aria-hidden
          className="absolute -top-2.5 left-1/2 z-20 h-6 w-6 -translate-x-1/2 rounded-full border-[1.5px] border-ink bg-mustard opacity-0 shadow-[0_2px_0_rgba(26,24,19,0.35)] transition-all duration-300 group-hover:-top-3.5 group-hover:opacity-100"
        />
        <span className="relative block border-[2px] border-ink bg-paper p-1.5 transition-all duration-400 group-hover:shadow-[7px_9px_0_rgba(26,24,19,0.16)]">
          <span className="relative block overflow-hidden bg-paper-2" style={{ aspectRatio: `${w.ar}` }}>
            <img
              src={art(w.k)}
              alt={displayTitle(w)}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
            />
            <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/45" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-paper/80">
                {w.d} · open
              </span>
            </span>
            <span className="absolute left-1.5 top-1.5 border border-ink/25 bg-paper/85 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.12em] text-ink-soft opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {String(n + 1).padStart(2, "0")}
            </span>
          </span>
          <span className="mt-2 flex items-baseline justify-between gap-2 px-0.5 pb-0.5">
            <span className="min-w-0">
              <span className="block font-display text-[13.5px] leading-snug transition-colors group-hover:text-orange">
                {displayTitle(w)}
              </span>
              {w.title && (
                <span lang="ja" className="mt-0.5 block truncate text-[10.5px] text-ash">
                  {w.title}
                </span>
              )}
            </span>
            <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-ash">
              {w.fav ? (
                <>
                  <IconHeart className="h-3 w-3" />
                  {w.fav.toLocaleString()}
                </>
              ) : (
                <span className="uppercase tracking-[0.14em]">{sourceLabel(w.via)}</span>
              )}
            </span>
          </span>
        </span>
      </button>
    </Reveal>
  );
}

/* --------------------------------------------------------- lightbox */
function Lightbox({
  list,
  idx,
  setIdx,
  onClose,
}: {
  list: Work[];
  idx: number;
  setIdx: (i: number) => void;
  onClose: () => void;
}) {
  const w = list[idx];

  const step = useCallback(
    (d: number) => setIdx((idx + d + list.length) % list.length),
    [idx, list.length, setIdx],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, step]);

  if (!w) return null;

  let tx = 0;
  const onTouchStart = (e: ReactTouchEvent) => (tx = e.touches[0].clientX);
  const onTouchEnd = (e: ReactTouchEvent) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-ink/94 px-3 py-3 backdrop-blur-[3px] sm:px-6 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-label={displayTitle(w)}
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 text-paper">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] opacity-70">
          {String(idx + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-2">
          <a
            href={sourceHref(w)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 border-[1.5px] border-paper/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors hover:border-mustard hover:text-mustard"
          >
            source <IconExternal className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center border-[1.5px] border-paper/50 transition-colors hover:bg-paper hover:text-ink"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center gap-2 sm:gap-5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            step(-1);
          }}
          aria-label="Previous"
          className="flex h-11 w-11 shrink-0 rotate-180 items-center justify-center border-[1.5px] border-paper/35 text-paper transition-colors hover:border-paper hover:bg-paper hover:text-ink"
        >
          <IconChev className="h-5 w-5" />
        </button>

        <figure className="flex min-h-0 flex-1 flex-col items-center" onClick={(e) => e.stopPropagation()}>
          <div className="relative max-h-[64vh] w-full max-w-[1080px] border-[2px] border-paper/85 bg-paper p-1.5">
            <img
              key={w.k}
              src={art(w.k)}
              alt={displayTitle(w)}
              className="max-h-[60vh] w-full object-contain"
              style={{ animation: "none" }}
            />
          </div>
          <figcaption className="mt-3 flex w-full max-w-[1080px] flex-wrap items-end justify-between gap-x-6 gap-y-2 text-paper">
            <div>
              <p className="font-display text-[20px] leading-tight sm:text-[26px]">{displayTitle(w)}</p>
              {w.title && (
                <p lang="ja" className="mt-1 text-[13px] text-paper/60">
                  {w.title}
                </p>
              )}
              <p className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] opacity-65">
                {w.d} · drawn by kaduise · via {sourceLabel(w.via)} · © kaduise
              </p>
              {w.quoteEn && (
                <p className="mt-2.5 max-w-[48ch] font-hand text-[14px] leading-relaxed text-mustard">
                  “{w.quoteEn}”
                  <span lang="ja" className="mt-1 block text-[11px] text-paper/45">{w.quote}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {w.fav ? (
                <span className="flex items-center gap-1.5 font-mono text-[11px] opacity-80">
                  <IconHeart className="h-3.5 w-3.5" /> {w.fav.toLocaleString()}
                </span>
              ) : null}
              <span className="flex flex-wrap gap-1.5">
                {w.tags.map((t) => (
                  <span key={t} className="border border-paper/40 px-2 py-0.5 text-[11px]">
                    {t}
                  </span>
                ))}
              </span>
            </div>
          </figcaption>
        </figure>

        <button
          onClick={(e) => {
            e.stopPropagation();
            step(1);
          }}
          aria-label="Next"
          className="flex h-11 w-11 shrink-0 items-center justify-center border-[1.5px] border-paper/35 text-paper transition-colors hover:border-paper hover:bg-paper hover:text-ink"
        >
          <IconChev className="h-5 w-5" />
        </button>
      </div>

      <p className="shrink-0 pt-2 text-center font-mono text-[9.5px] uppercase tracking-[0.2em] text-paper/45">
        use ← → or swipe to move · esc to close · all artwork © kaduise
      </p>
    </div>
  );
}

/* ----------------------------------------------------------- grid */
export function Works() {
  const [tag, setTag] = useState<Tag | "all">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("new");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = ALL_WORKS.filter((w) => (tag === "all" ? true : w.tags.includes(tag))).filter((w) =>
      needle
        ? `${w.en} ${w.title}`.toLowerCase().includes(needle) ||
          w.tags.join(" ").toLowerCase().includes(needle) ||
          w.d.includes(needle)
        : true,
    );
    out.sort((a, b) => (sort === "new" ? (a.d < b.d ? 1 : -1) : (b.fav ?? -1) - (a.fav ?? -1)));
    return out;
  }, [tag, q, sort]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    ALL_WORKS.forEach((w) => w.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return m;
  }, []);

  return (
    <section id="works" className="relative scroll-mt-16 border-t-[2px] border-ink bg-paper-2/70 py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 dotgrid opacity-40" />
        <Sparkle className="absolute right-[6vw] top-16 h-6 w-6 text-orange/50 animate-twinkle" />
      </div>

      <div className="mx-auto max-w-[1560px] px-4 sm:px-7">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b-[2px] border-ink pb-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-soft">02 — archive</p>
            <h2 className="mt-2 font-display text-[13vw] leading-[0.86] tracking-tight sm:text-[8vw] lg:text-[6.2vw]">
              The archive
            </h2>
            <p className="mt-3 max-w-[46ch] text-[13.5px] leading-[1.95] text-ink-soft">
              {ALL_WORKS.length} pictures pulled from X and pixiv, dated and tagged. {X_WORKS_COUNT} of them are
              X posts, carrying their like counts; the rest are the 2026 dailies. Click any one to enlarge it,
              or follow it back to where it was first posted.
            </p>
          </div>
          <Signature className="h-12 w-36 text-ink/45" />
        </div>

        {/* controls */}
        <div className="sticky top-[108px] z-30 lg:top-[70px] -mx-4 mt-6 border-b-[1.5px] border-ink/25 bg-paper-2/95 px-4 py-3 backdrop-blur-[2px] sm:-mx-7 sm:px-7">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTag("all")}
              className={cn(
                "border-[1.5px] px-3 py-1.5 text-[12.5px] font-medium transition-all duration-200",
                tag === "all" ? "border-ink bg-ink text-paper" : "border-ink/30 hover:-translate-y-0.5 hover:border-ink",
              )}
            >
              All <span className="font-mono text-[10px] opacity-60">{ALL_WORKS.length}</span>
            </button>
            {TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t === tag ? "all" : t)}
                className={cn(
                  "border-[1.5px] px-3 py-1.5 text-[12.5px] font-medium transition-all duration-200",
                  tag === t ? "border-ink bg-ink text-paper" : "border-ink/30 hover:-translate-y-0.5 hover:border-ink",
                )}
              >
                {t} <span className="font-mono text-[10px] opacity-60">{counts.get(t) ?? 0}</span>
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <label className="flex items-center gap-2 border-[1.5px] border-ink/30 px-2.5 py-1.5 transition-colors focus-within:border-ink">
                <IconSearch className="h-3.5 w-3.5 text-ash" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search titles"
                  className="w-[7.5rem] bg-transparent text-[12.5px] outline-none placeholder:text-ash"
                />
              </label>
              <div className="flex border-[1.5px] border-ink/30">
                {(
                  [
                    ["new", "Newest"],
                    ["fav", "Most liked"],
                  ] as [Sort, string][]
                ).map(([s, label]) => (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    className={cn(
                      "px-3 py-1.5 text-[12px] font-medium transition-colors",
                      sort === s ? "bg-ink text-paper" : "hover:bg-ink/10",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
            <IconGrid className="h-3 w-3" /> showing {list.length} of {ALL_WORKS.length}
            {tag !== "all" && <span className="text-orange">· tag: {tag}</span>}
            {q && <span className="text-teal">· q: {q}</span>}
          </p>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-28 text-center">
            <p className="font-display text-[22px]">Nothing drawn quite like that.</p>
            <p className="text-[13px] text-ink-soft">Try clearing the tag and searching again.</p>
            <button
              onClick={() => {
                setQ("");
                setTag("all");
              }}
              className="mt-2 border-[1.5px] border-ink px-4 py-2 text-[13px] transition-colors hover:bg-ink hover:text-paper"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="mt-8 columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4 [column-fill:_balance]">
            {list.map((w, i) => (
              <WorkCard key={w.k} w={w} n={i} onOpen={() => { setIdx(i); setOpen(true); }} />
            ))}
          </div>
        )}
      </div>

      {open && <Lightbox list={list} idx={idx} setIdx={setIdx} onClose={() => setOpen(false)} />}
    </section>
  );
}
