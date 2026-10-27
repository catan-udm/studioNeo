"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Film,
  Maximize2,
  CalendarDays,
  Music2,
  Shuffle,
  ArrowDownWideNarrow,
  Keyboard,
  Heart,
  Search,
  X,
  Tag,
} from "lucide-react";
import { artworks, type Artwork, type Collection } from "@/data";
import { useSavedWorks } from "@/lib/archiveFavorites";
import { Reveal, SectionHeading } from "./ui";
import { Lightbox } from "./Lightbox";
import { cn } from "@/utils/cn";

export type ArchiveFilter = "all" | Collection | "saved";

const FILTERS: { key: ArchiveFilter; label: string; jp: string }[] = [
  { key: "all", label: "All works", jp: "全部" },
  { key: "deco27", label: "DECO*27 series", jp: "デコニーナ" },
  { key: "devil", label: "Devil Janai Mon", jp: "デビルじゃないもん" },
  { key: "special", label: "Collabs & events", jp: "特別" },
  { key: "saved", label: "Saved", jp: "お気に入り" },
];

function Card({
  a,
  index,
  saved,
  onToggleSave,
  onOpen,
}: {
  a: Artwork;
  index: number;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
}) {
  const tilt = [-1.4, 1.1, -0.8, 1.6][index % 4];
  return (
    <Reveal delay={(index % 4) * 70} className={cn(a.wide && "sm:col-span-2")}>
      <div
        className="sticker sticker-hover cutline group relative block w-full text-left rounded-xl overflow-hidden"
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        <button
          type="button"
          onClick={onOpen}
          className="block w-full text-left cursor-pointer focus-visible:outline-4 focus-visible:outline-magenta"
          aria-label={`Open ${a.titleEn} in viewer`}
        >
          <div className={cn("relative bg-slate-frame overflow-hidden", a.wide ? "aspect-[2/1]" : "aspect-square")}>
            <img
              src={a.src}
              alt={`${a.titleJp} (${a.titleEn}) — animated ugoira by sankobite`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 bg-ink/85 text-paper font-dot text-[10px] px-2 py-1">
              <Film className="w-3 h-3 text-miku" aria-hidden /> うごイラ · {a.frames}f
            </span>
            <span
              className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 rounded-full border-2 border-ink"
              style={{ background: a.accent }}
              aria-hidden
            />
            <span className="absolute inset-0 grid place-items-center bg-ink/0 group-hover:bg-ink/30 transition-colors">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-paper border-[3px] border-ink px-3 py-1.5 font-display uppercase text-xs inline-flex items-center gap-1.5 shadow-[3px_3px_0_rgba(38,49,63,0.9)]">
                <Maximize2 className="w-3.5 h-3.5" aria-hidden /> View loop
              </span>
            </span>
          </div>
          <div className="px-4 py-3 bg-white border-t-[3px] border-ink">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-black text-lg leading-tight">{a.titleJp}</h3>
              <span className="font-dot text-[11px] text-ink-soft shrink-0">{a.dateLabel}</span>
            </div>
            <p className="text-sm font-medium text-ink-soft mt-0.5">
              {a.titleEn} · <span className="text-miku-deep font-bold">{a.songBy}</span>
            </p>
          </div>
        </button>

        {/* Save / Bookmark button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          aria-label={saved ? `Remove ${a.titleEn} from saved` : `Save ${a.titleEn}`}
          aria-pressed={saved}
          title={saved ? "Saved to vault" : "Save loop"}
          className={cn(
            "absolute top-2.5 right-2.5 z-10 w-8 h-8 grid place-items-center border-2 border-ink transition-all cursor-pointer",
            saved
              ? "bg-magenta text-white shadow-[2px_2px_0_var(--color-ink)]"
              : "bg-white/90 text-ink hover:bg-sun opacity-85 group-hover:opacity-100"
          )}
        >
          <Heart className={cn("w-4 h-4", saved && "fill-current")} aria-hidden />
        </button>
      </div>
    </Reveal>
  );
}

export function Gallery({
  selectedWorkId,
  onSelectWork,
  filterOverride,
  onClearFilterOverride,
}: {
  selectedWorkId?: string | null;
  onSelectWork?: (id: string | null) => void;
  filterOverride?: ArchiveFilter | null;
  onClearFilterOverride?: () => void;
}) {
  const [filter, setFilter] = useState<ArchiveFilter>("all");
  const [sort, setSort] = useState<"newest" | "frames">("newest");
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [internalOpenId, setInternalOpenId] = useState<string | null>(null);
  const [uploadedArtworks, setUploadedArtworks] = useState<Artwork[]>([]);
  const { savedIds, isSaved, toggle } = useSavedWorks();

  const openId = selectedWorkId !== undefined ? selectedWorkId : internalOpenId;
  const setOpenId = (id: string | null) => {
    setInternalOpenId(id);
    onSelectWork?.(id);
  };

  useEffect(() => {
    if (filterOverride) {
      setFilter(filterOverride);
      onClearFilterOverride?.();
    }
  }, [filterOverride, onClearFilterOverride]);

  // Fetch any newly minted cels from studioNeo backend (/api/cels)
  useEffect(() => {
    fetch("/api/cels")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.cels && Array.isArray(data.cels) && data.cels.length > 0) {
          const mapped: Artwork[] = data.cels.map(
            (c: {
              id: number;
              code: string;
              title: string;
              artist: string;
              category: string;
              color: string;
              gif_url?: string | null;
              svg_url?: string | null;
              description?: string | null;
              created_at?: string;
            }) => ({
              id: `cel-${c.id}`,
              slug: (c.code || `cel-${c.id}`).toLowerCase(),
              src: c.gif_url || c.svg_url || artworks[0].src,
              titleJp: c.title,
              titleRomaji: c.code || c.title,
              titleEn: c.title,
              songBy: c.artist || "studioNeo Creator",
              date: (c.created_at || new Date().toISOString()).slice(0, 10),
              dateLabel: "Studio Upload",
              frames: 24,
              durationMs: 1000,
              collection: "special",
              collectionLabel: `Studio · ${c.category || "Kinetic"}`,
              tags: ["studioNeo", c.category || "Kinetic", c.code || "CEL"],
              note: c.description || "Uploaded via studioNeo Creator Studio.",
              accent: c.color || "#2fc4bb",
            })
          );
          setUploadedArtworks(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const allArtworks = useMemo(() => [...uploadedArtworks, ...artworks], [uploadedArtworks]);

  const list = useMemo(() => {
    let base = allArtworks;
    if (filter === "saved") {
      base = base.filter((a) => savedIds.includes(a.id));
    } else if (filter !== "all") {
      base = base.filter((a) => a.collection === filter);
    }

    if (selectedTag) {
      base = base.filter((a) => a.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));
    }

    const q = query.trim().toLowerCase();
    if (q) {
      base = base.filter(
        (a) =>
          a.titleJp.toLowerCase().includes(q) ||
          a.titleRomaji.toLowerCase().includes(q) ||
          a.titleEn.toLowerCase().includes(q) ||
          a.songBy.toLowerCase().includes(q) ||
          a.note.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return [...base].sort((x, y) =>
      sort === "frames" ? y.frames - x.frames : y.date.localeCompare(x.date) || y.id.localeCompare(x.id)
    );
  }, [allArtworks, filter, savedIds, selectedTag, query, sort]);

  // Allow opening any artwork by id or slug even if current filter excludes it
  const openArtwork = useMemo(() => {
    if (!openId) return null;
    return allArtworks.find((a) => a.id === openId || a.slug === openId) ?? null;
  }, [allArtworks, openId]);

  const navPool = list.length > 0 && openArtwork && list.some((a) => a.id === openArtwork.id) ? list : allArtworks;
  const openIndex = openArtwork ? navPool.findIndex((a) => a.id === openArtwork.id) : -1;

  return (
    <section id="works" className="relative grid-paper py-20 md:py-28 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading kicker="THE ARCHIVE — 2023 → 2024" title="Every Loop" jp="全作品" />

        <Reveal className="flex flex-wrap items-center gap-2.5 mb-6" delay={80}>
          {FILTERS.map((f) => {
            const count =
              f.key === "all"
                ? allArtworks.length
                : f.key === "saved"
                  ? allArtworks.filter((a) => savedIds.includes(a.id)).length
                  : allArtworks.filter((a) => a.collection === f.key).length;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "inline-flex items-center gap-2 border-[3px] border-ink px-4 py-2 font-bold text-sm transition-all cursor-pointer",
                  active
                    ? "bg-ink text-paper shadow-[3px_3px_0_var(--color-magenta)]"
                    : "bg-white hover:bg-sun shadow-[3px_3px_0_rgba(38,49,63,0.25)]"
                )}
                aria-pressed={active}
              >
                {f.key === "saved" && (
                  <Heart className={cn("w-3.5 h-3.5", active ? "text-magenta fill-magenta" : "text-magenta")} aria-hidden />
                )}
                {f.label}
                <span className={cn("font-dot text-[10px]", active ? "text-miku" : "text-ink-soft")}>{f.jp}</span>
                <span
                  className={cn(
                    "font-display text-[11px] px-1.5 py-0.5 border-2 border-ink",
                    active ? "bg-magenta text-white" : "bg-paper-2"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </Reveal>

        <Reveal delay={120} className="mb-8 flex flex-wrap items-center gap-3 border-y-[3px] border-ink/15 py-3">
          {/* Search box */}
          <div className="relative flex items-center bg-white border-[3px] border-ink px-3 py-1.5 shadow-[3px_3px_0_rgba(38,49,63,0.2)] w-full sm:w-64">
            <Search className="w-4 h-4 text-ink-soft mr-2 shrink-0" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search song, title, #tag..."
              aria-label="Search artworks"
              className="w-full bg-transparent text-xs font-bold text-ink placeholder:text-ink-soft/70 focus:outline-none border-0 p-0"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="ml-1 text-ink-soft hover:text-ink cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden />
              </button>
            )}
          </div>

          {selectedTag && (
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="inline-flex items-center gap-1.5 bg-sun border-[2px] border-ink px-2.5 py-1 font-dot text-xs font-bold cursor-pointer hover:bg-coral hover:text-white transition-colors"
            >
              <Tag className="w-3 h-3" aria-hidden /> #{selectedTag} <X className="w-3 h-3" aria-hidden />
            </button>
          )}

          <p className="font-dot text-xs text-ink-soft inline-flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-miku-deep" aria-hidden />
            showing <span className="font-bold text-ink">{list.length}</span> original looping animation
            {list.length === 1 ? "" : "s"}
          </p>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="font-dot text-[11px] text-ink-soft inline-flex items-center gap-1.5">
              <ArrowDownWideNarrow className="w-3.5 h-3.5" aria-hidden /> sort
            </span>
            <div className="inline-flex border-[3px] border-ink bg-white">
              {([
                { k: "newest", t: "Newest", Icon: CalendarDays },
                { k: "frames", t: "Most frames", Icon: Film },
              ] as const).map(({ k, t, Icon }, i) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSort(k)}
                  aria-pressed={sort === k}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer",
                    i === 1 && "border-l-[3px] border-ink",
                    sort === k ? "bg-ink text-paper" : "hover:bg-sun"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden /> {t}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const pool = list.length > 0 ? list : allArtworks;
                setOpenId(pool[Math.floor(Math.random() * pool.length)].id);
              }}
              className="inline-flex items-center gap-1.5 bg-magenta text-white font-bold text-xs px-3.5 py-2 border-[3px] border-ink shadow-[3px_3px_0_var(--color-ink)] hover:shadow-[1px_1px_0_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" aria-hidden /> Surprise me
            </button>
          </div>

          <p className="w-full font-dot text-[11px] text-ink-soft flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5 text-coral" aria-hidden /> click any sticker for frame data, cel scrubber &amp; the song behind it
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-miku-deep" aria-hidden /> ← → to browse · SPACE pause · ESC to close
            </span>
          </p>
        </Reveal>

        {list.length === 0 ? (
          <div className="sticker rounded-xl p-10 text-center bg-white">
            <p className="font-display uppercase text-xl">No loops match this filter</p>
            <p className="font-dot text-xs text-ink-soft mt-2">
              {filter === "saved"
                ? "Click the heart button on any sticker card to save your favorite loops here."
                : "Try clearing your search or tag filter."}
            </p>
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setQuery("");
                setSelectedTag(null);
              }}
              className="mt-5 inline-flex items-center gap-2 bg-miku text-ink font-display uppercase text-xs px-4 py-2.5 border-[3px] border-ink shadow-[3px_3px_0_var(--color-ink)] cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {list.map((a, i) => (
              <Card
                key={a.id}
                a={a}
                index={i}
                saved={isSaved(a.id)}
                onToggleSave={() => toggle(a.id)}
                onOpen={() => setOpenId(a.id)}
              />
            ))}
          </div>
        )}
      </div>

      {openArtwork && (
        <Lightbox
          artwork={openArtwork}
          position={`${openIndex + 1} / ${navPool.length}`}
          onClose={() => setOpenId(null)}
          onPrev={() => setOpenId(navPool[(openIndex - 1 + navPool.length) % navPool.length].id)}
          onNext={() => setOpenId(navPool[(openIndex + 1) % navPool.length].id)}
          onSelectTag={(tag) => {
            setSelectedTag(tag);
            setFilter("all");
          }}
        />
      )}
    </section>
  );
}
