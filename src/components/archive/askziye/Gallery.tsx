import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { seriesLabel, works, type Series, type Work } from "./data/works";
import { palettes } from "./data/palettes";
import { InkStroke } from "./Atmosphere";
import { cjkNum, copyText, Reveal, setLive, toneOf, useToast } from "./lib";
import { cn } from "@/utils/cn";

const FILTERS: (Series | "all")[] = ["all", "vocaloid", "arknights", "fate", "evangelion", "original", "other"];
type Sort = "curated" | "newest" | "oldest" | "title";
type View = "plates" | "grid" | "list";

export const galleryWorks = works.filter((w) => !w.darkPlate);

const SERIES_CHAR: Record<Series, string> = {
  vocaloid: "声",
  arknights: "源",
  fate: "圣",
  evangelion: "律",
  original: "梦",
  other: "他",
};

export function stripTitle(w: Work) {
  const cjkChars = [...w.title].filter((c) => /[\u3040-\u30ff\u4e00-\u9fff\u3005]/.test(c));
  if (cjkChars.length) return cjkChars.slice(0, 4).join("");
  return SERIES_CHAR[w.series];
}

/* frames the way her prints are published: tall = hanging scroll, square = shikishi, wide = matted plate */
export function Frame({ w, children, overlay }: { w: Work; children: ReactNode; overlay?: ReactNode }) {
  const r = w.w / w.h;
  if (r < 0.92)
    return (
      <div className="frame-scroll relative">
        <div className="rod" aria-hidden />
        <div className="frame-scroll-body bg-[#f6f0e5] px-2.5 pb-4 pt-2.5 shadow-lg ring-1 ring-ink/10">
          <div className="relative overflow-hidden bg-paper-2">{children}{overlay}</div>
        </div>
        <div className="tassel" aria-hidden />
      </div>
    );
  if (r > 1.1)
    return (
      <div className="frame-mat relative">
        <div className="tape" aria-hidden />
        <div className="bg-[#f6f0e5] p-2 shadow-lg ring-1 ring-ink/10">
          <div className="relative overflow-hidden bg-paper-2">{children}{overlay}</div>
        </div>
      </div>
    );
  return (
    <div className="frame-shikishi relative rotate-[0.8deg] bg-[#f6f0e5] p-3.5 shadow-lg ring-1 ring-ink/10 md:p-4">
      <div className="relative overflow-hidden bg-paper-2">{children}{overlay}</div>
      <span className="seal-seal absolute -bottom-1.5 -right-1.5 h-7 w-7 rotate-[-7deg] text-[7px]">ASK</span>
    </div>
  );
}

export function Gallery({
  favs,
  toggleFav,
  onOpen,
}: {
  favs: string[];
  toggleFav: (id: string) => void;
  onOpen: (w: Work, list: Work[]) => void;
}) {
  const toast = useToast();
  const [filter, setFilter] = useState<Series | "all">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("curated");
  const [view, setView] = useState<View>("plates");
  const [onlyFav, setOnlyFav] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: galleryWorks.length };
    galleryWorks.forEach((w) => (c[w.series] = (c[w.series] || 0) + 1));
    return c;
  }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    let l = galleryWorks.filter(
      (w) =>
        (filter === "all" || w.series === filter) &&
        (!onlyFav || favs.includes(w.id)) &&
        (!term ||
          [w.title, w.titleEn, w.subject, String(w.year), seriesLabel[w.series].en]
            .join(" ")
            .toLowerCase()
            .includes(term)),
    );
    if (sort === "newest") l = [...l].sort((a, b) => b.year - a.year);
    if (sort === "oldest") l = [...l].sort((a, b) => a.year - b.year);
    if (sort === "title") l = [...l].sort((a, b) => a.titleEn.localeCompare(b.titleEn));
    return l;
  }, [filter, q, sort, onlyFav, favs]);

  /* the book re-inks as your eye moves down the plates */
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-live-tone]"));
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        const t = (e.target as HTMLElement).dataset.liveTone;
        if (e.isIntersecting && t) setLive(t);
      }),
      { rootMargin: "-42% 0px -42% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [list, view]);

  const copyPlate = async (w: Work) => {
    const url = `${location.origin}${location.pathname}#plate=${w.id}`;
    toast((await copyText(url)) ? `Copied plate link · ${w.title}` : w.title);
  };

  return (
    <section id="works" ref={sectionRef} className="mx-auto max-w-7xl scroll-mt-20 px-5 pb-24 md:px-8 md:pb-32">
      <Reveal>
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="sectmark text-cinnabar">02 · 图版</p>
            <h2 className="mt-5 font-display text-4xl md:text-5xl">The plates</h2>
            <InkStroke className="mt-3 w-52" />
            <p className="mt-3 text-[11px] tracking-[0.2em] text-ink-soft uppercase">
              图版 {list.length} / {galleryWorks.length} · {favs.length} saved
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 border-b border-ink/25 pb-1 focus-within:border-cinnabar">
              <span className="text-ink-soft">⌕</span>
              <input
                id="gallery-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, series, year…"
                className="w-48 bg-transparent text-sm outline-none placeholder:text-taupe"
              />
              {q && (
                <button onClick={() => setQ("")} className="text-xs text-taupe hover:text-cinnabar">
                  ✕
                </button>
              )}
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="border border-ink/15 bg-transparent px-2 py-1.5 text-[11px] tracking-[0.12em] uppercase outline-none"
            >
              <option value="curated">Curated</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">A–Z</option>
            </select>
            <div className="flex border border-ink/15">
              {(["plates", "grid", "list"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  title={v === "plates" ? "Plate spreads" : v}
                  className={cn(
                    "px-2.5 py-1.5 text-[11px] transition",
                    view === v ? "bg-ink text-paper" : "text-ink-soft hover:text-cinnabar",
                  )}
                >
                  {v === "plates" ? "▤" : v === "grid" ? "▦" : "☰"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-10 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "border px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase transition",
                filter === f
                  ? "border-cinnabar bg-cinnabar text-paper"
                  : "border-ink/15 text-ink-soft hover:border-cinnabar/50 hover:text-cinnabar",
              )}
            >
              {seriesLabel[f].en} <span className="opacity-60">{counts[f] || 0}</span>
            </button>
          ))}
          <button
            onClick={() => setOnlyFav(!onlyFav)}
            className={cn(
              "border px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase transition",
              onlyFav ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink-soft hover:text-cinnabar",
            )}
          >
            ♥ Saved
          </button>
        </div>
      </Reveal>

      {list.length === 0 ? (
        <div className="border border-dashed border-ink/20 py-24 text-center">
          <p className="font-display text-2xl">空 — nothing here yet</p>
          <p className="mt-2 text-sm text-ink-soft">
            {onlyFav ? "Tap ♥ on a plate to save it." : "Try another search or filter."}
          </p>
        </div>
      ) : view === "plates" ? (
        <div className="divide-y divide-ink/8">
          {list.map((w, i) => {
            const tone = toneOf(w.id);
            const odd = i % 2 === 1;
            return (
              <article
                key={w.id}
                id={`plate-${w.id}`}
                data-live-tone={tone}
                onMouseEnter={() => setLive(tone)}
                className="group py-14 md:py-20"
              >
                <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
                  <div className={cn(odd && "md:order-2")}>
                    <button
                      onClick={() => onOpen(w, list)}
                      className="block w-full"
                      onMouseEnter={() => setLive(tone)}
                    >
                      <Frame
                        w={w}
                        overlay={
                          <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-end justify-between bg-gradient-to-t from-ink/70 to-transparent p-3 transition duration-500 group-hover:translate-y-0">
                            <span className="text-[10px] tracking-[0.2em] text-paper uppercase">打开 · open plate ↗</span>
                            <Swatches id={w.id} />
                          </div>
                        }
                      >
                        <img
                          src={w.src}
                          alt={`${w.title} — ${w.subject}`}
                          loading="lazy"
                          className="w-full transition duration-700 group-hover:scale-[1.015]"
                          style={{ aspectRatio: `${w.w} / ${w.h}`, maxHeight: "72vh", objectFit: "contain", margin: "0 auto" }}
                        />
                      </Frame>
                    </button>
                  </div>

                  <div className={cn(odd && "md:order-1 md:flex md:flex-col md:items-end md:text-right")}>
                    <p className="text-[11px] tracking-[0.34em] uppercase">
                      <span className="live-text font-display">图版 {cjkNum(i + 1)}</span>
                      <span className="text-taupe"> · {seriesLabel[w.series].en}</span>
                    </p>
                    <div className={cn("mt-5 flex items-start gap-4", odd && "md:flex-row-reverse")}>
                      <span className="strip">{stripTitle(w)}</span>
                      <div>
                        <h3 className="font-display text-4xl leading-tight md:text-5xl">{w.title}</h3>
                        <p className="mt-2 font-script text-2xl text-ink-soft/70">{w.titleEn}</p>
                      </div>
                    </div>
                    <InkStroke className={cn("mt-5 w-44", odd && "md:ml-auto")} />
                    <p className="mt-5 text-[11px] tracking-[0.2em] text-ink-soft uppercase">
                      {w.subject} · {w.year}
                    </p>
                    <dl className="mt-6 grid w-full max-w-sm grid-cols-2 gap-x-6 gap-y-3 text-sm md:w-auto">
                      <div>
                        <dt className="text-[9px] tracking-[0.24em] text-taupe uppercase">媒介 · medium</dt>
                        <dd className="mt-0.5 text-ink-soft">数字插画 · digital painting</dd>
                      </div>
                      <div>
                        <dt className="text-[9px] tracking-[0.24em] text-taupe uppercase">尺寸 · size</dt>
                        <dd className="mt-0.5 text-ink-soft">{w.w} × {w.h}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-[9px] tracking-[0.24em] text-taupe uppercase">palette</dt>
                        <dd className="mt-1.5"><Swatches id={w.id} size="h-5 w-5" /></dd>
                      </div>
                    </dl>
                    <div className={cn("mt-8 flex flex-wrap items-center gap-3", odd && "md:justify-end")}>
                      <button
                        onClick={() => onOpen(w, list)}
                        className="border border-ink/20 bg-ink px-5 py-2.5 text-[10px] tracking-[0.26em] text-paper uppercase transition hover:bg-cinnabar"
                      >
                        打开 plate
                      </button>
                      <button
                        onClick={() => toggleFav(w.id)}
                        title="Save"
                        className={cn(
                          "grid h-10 w-10 place-items-center border border-ink/15 text-base transition hover:border-cinnabar",
                          favs.includes(w.id) ? "text-cinnabar" : "text-ink-soft",
                        )}
                      >
                        {favs.includes(w.id) ? "♥" : "♡"}
                      </button>
                      <button
                        onClick={() => copyPlate(w)}
                        title="Copy plate link"
                        className="grid h-10 w-10 place-items-center border border-ink/15 text-sm text-ink-soft transition hover:border-cinnabar hover:text-cinnabar"
                      >
                        ⤴
                      </button>
                      {w.pixiv && (
                        <a
                          href={`https://www.pixiv.net/artworks/${w.pixiv}`}
                          target="_blank"
                          rel="noreferrer"
                          className="border border-ink/15 px-4 py-2.5 text-[10px] tracking-[0.2em] text-ink-soft uppercase transition hover:border-cinnabar hover:text-cinnabar"
                        >
                          Pixiv ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : view === "list" ? (
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {list.map((w, i) => (
            <li key={w.id} className="group flex items-center gap-5 py-4" onMouseEnter={() => setLive(toneOf(w.id))}>
              <span className="w-8 font-script text-2xl text-gold">{String(i + 1).padStart(2, "0")}</span>
              <button onClick={() => onOpen(w, list)} className="h-16 w-16 shrink-0 overflow-hidden bg-paper-2">
                <img src={w.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
              <button onClick={() => onOpen(w, list)} className="min-w-0 flex-1 text-left">
                <p className="truncate font-display text-xl group-hover:text-cinnabar">{w.title}</p>
                <p className="text-[10px] tracking-[0.18em] text-ink-soft uppercase">
                  {w.titleEn} · {w.subject}
                </p>
              </button>
              <Swatches id={w.id} className="hidden md:flex" />
              <span className="hidden w-14 text-right text-sm text-ink-soft sm:block">{w.year}</span>
              <FavBtn on={favs.includes(w.id)} onClick={() => toggleFav(w.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {list.map((w, i) => (
            <div key={w.id} className="group relative" onMouseEnter={() => setLive(toneOf(w.id))}>
              <button onClick={() => onOpen(w, list)} className="block w-full text-left">
                <Frame
                  w={w}
                  overlay={
                    <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-end justify-between bg-gradient-to-t from-ink/70 to-transparent p-3 transition duration-500 group-hover:translate-y-0">
                      <span className="text-[10px] tracking-[0.2em] text-paper uppercase">open ↗</span>
                      <Swatches id={w.id} />
                    </div>
                  }
                >
                  <img
                    src={w.thumb}
                    alt={`${w.title} — ${w.subject}`}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </Frame>
                <div className="mt-3 flex items-start justify-between gap-3 pr-8">
                  <div>
                    <p className="font-display text-[17px] leading-tight">{w.title}</p>
                    <p className="mt-1 text-[10px] tracking-[0.18em] text-ink-soft uppercase">
                      {w.subject} · {w.year}
                    </p>
                  </div>
                  <span className="font-script text-2xl text-gold/80">{String(i + 1).padStart(2, "0")}</span>
                </div>
              </button>
              <FavBtn
                on={favs.includes(w.id)}
                onClick={() => toggleFav(w.id)}
                className="absolute right-2 top-2 z-10 bg-paper/85 backdrop-blur"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function Swatches({ id, className, size = "h-3 w-3" }: { id: string; className?: string; size?: string }) {
  const p = palettes[id] || [];
  return (
    <div className={cn("flex gap-1", className)}>
      {p.map((c) => (
        <span key={c} className={cn("rounded-full ring-1 ring-black/10", size)} style={{ background: c }} />
      ))}
    </div>
  );
}

export function FavBtn({ on, onClick, className }: { on: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={on ? "Remove from saved" : "Save"}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full text-base transition hover:scale-110",
        on ? "text-cinnabar" : "text-ink-soft/60 hover:text-cinnabar",
        className,
      )}
    >
      {on ? "♥" : "♡"}
    </button>
  );
}
