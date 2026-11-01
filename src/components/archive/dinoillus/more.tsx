import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { archive, exhibitionPost, type ArchiveWork } from "./data/archive";
import { links, timelapses, type Timelapse } from "./data/artworks";
import { Art } from "./Art";
import { ArrowUpRight, Reveal, Sparkle } from "./fx";

/* ======================================================= exhibition */

export function Exhibition() {
  const [active, setActive] = useState(0);
  const photos = exhibitionPost.photos;
  return (
    <section
      id="exhibition"
      className="relative overflow-hidden border-y border-bone-100/10 bg-ink-900/40 px-5 py-24 md:px-10 md:py-32"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-4 left-0 select-none whitespace-nowrap font-display text-[20vw] font-semibold italic leading-none text-bone-50/[0.03]"
      >
        where light ends
      </span>

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ember-400">
                02 · Exhibition &amp; first artbook
              </p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-5 font-display text-5xl font-medium leading-[0.95] text-bone-50 md:text-6xl">
                Where
                <br />
                <span className="italic text-ember-300">light ends</span>
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-4 font-display text-2xl italic text-bone-300/70">
                光的边界 · 13–15 March 2026
              </p>
            </Reveal>

            <Reveal delay={190}>
              <blockquote className="mt-9 border-l-2 border-ember-400/60 pl-5">
                <p className="font-display text-2xl leading-snug text-bone-100 md:text-[1.7rem]">
                  “{exhibitionPost.quote}”
                </p>
                <footer className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ash-400">
                  Dino on X · {exhibitionPost.date}
                </footer>
              </blockquote>
            </Reveal>

            <Reveal delay={240}>
              <dl className="mt-10 grid grid-cols-2 gap-px border border-bone-100/10 bg-bone-100/10">
                {[
                  ["Exhibition", "Where Light Ends · 光的边界"],
                  ["Dates", "13–15 March 2026"],
                  ["Artbook", "XXXIX · his first, 首部画集"],
                  ["Online", "Digital collection, free worldwide shipping"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-ink-950 p-4">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.26em] text-ash-500">
                      {k}
                    </dt>
                    <dd className="mt-1.5 text-sm text-bone-100">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={290} className="mt-9 flex flex-wrap gap-4">
              <a
                href={exhibitionPost.tweet}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 border border-ember-400/60 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ember-300 transition-all duration-300 hover:bg-ember-400 hover:text-ink-950"
              >
                Announcement post <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href={links.x}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 border border-bone-100/20 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bone-300 transition-all duration-300 hover:border-bone-100/50 hover:text-bone-50"
              >
                Shop via pinned post
              </a>
            </Reveal>
          </div>

          {/* the real exhibition sheets, shown as stacked prints */}
          <Reveal delay={120}>
            <div className="relative mx-auto w-full max-w-[460px]">
              <div className="relative aspect-[3/4]">
                {photos.map((p, i) => {
                  const offset = (i - active + photos.length) % photos.length;
                  const isTop = offset === 0;
                  return (
                    <button
                      key={p}
                      onClick={() => setActive((active + 1) % photos.length)}
                      aria-label={isTop ? "Next exhibition sheet" : undefined}
                      tabIndex={isTop ? 0 : -1}
                      className="absolute inset-0 origin-bottom border border-bone-100/15 bg-bone-50 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.85)] transition-all duration-700 [transition-timing-function:var(--ease-soft)]"
                      style={{
                        zIndex: photos.length - offset,
                        transform: `translate(${offset * 14}px, ${offset * -10}px) rotate(${
                          offset === 0 ? -1.5 : offset * 2.2
                        }deg)`,
                        opacity: offset > 2 ? 0 : 1 - offset * 0.12,
                      }}
                    >
                      <Art
                        src={p}
                        alt={`Where Light Ends exhibition sheet ${i + 1} of ${photos.length}`}
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover object-top"
                      />
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ash-400">
                <span>
                  sheet {active + 1} / {photos.length} · click to shuffle
                </span>
                <span className="flex gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      aria-label={`Show sheet ${i + 1}`}
                      className={`h-1.5 transition-all duration-500 ${
                        i === active ? "w-6 bg-ember-400" : "w-1.5 bg-bone-100/25"
                      }`}
                    />
                  ))}
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ======================================================= process / timelapse */

function TimelapsePlayer({ t, index }: { t: Timelapse; index: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  // play only while on screen; never burn bandwidth off-screen
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !reduce) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <figure className="group">
      <div className="relative aspect-[720/1030] overflow-hidden border border-bone-100/10 bg-ink-900">
        {!failed ? (
          <video
            ref={ref}
            src={t.video}
            poster={t.poster}
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) setProgress(v.currentTime / v.duration);
            }}
            onClick={toggle}
            className="h-full w-full cursor-pointer object-cover"
          />
        ) : (
          <a href={t.tweet} target="_blank" rel="noreferrer" className="block h-full">
            <Art
              src={t.poster}
              alt="Timelapse cover frame"
              className="h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
          </a>
        )}
        <span className="absolute left-4 top-4 border border-bone-100/20 bg-ink-950/60 px-2.5 py-1 font-mono text-[9px] tracking-[0.25em] text-bone-300">
          TIMELAPSE {String(index + 1).padStart(2, "0")}
        </span>
        {!failed && (
          <button
            onClick={toggle}
            aria-label={playing ? "Pause timelapse" : "Play timelapse"}
            className="absolute bottom-5 right-4 flex h-10 w-10 items-center justify-center border border-bone-100/25 bg-ink-950/60 text-bone-100 backdrop-blur-sm transition-colors hover:border-ember-400 hover:text-ember-300"
          >
            {playing ? (
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                <path d="M7 4.5v15l12-7.5z" />
              </svg>
            )}
          </button>
        )}
        {/* progress as a thin line of light */}
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-bone-100/10">
          <div
            className="h-full bg-ember-400 shadow-[0_0_12px_rgba(227,173,94,0.8)]"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      <figcaption className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ash-400">
        <span>
          {t.date} · {t.seconds}s · ♥ {t.likes}
        </span>
        <a
          href={t.tweet}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-ember-300/90 transition-colors hover:text-ember-200"
        >
          on X <ArrowUpRight className="h-3 w-3" />
        </a>
      </figcaption>
    </figure>
  );
}

export function Process() {
  return (
    <section id="process" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ember-400">
                04 · Process
              </p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-5 font-display text-4xl font-medium leading-[1.04] text-bone-50 md:text-5xl">
                Watch the light{" "}
                <span className="italic text-ember-300">arrive.</span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-ash-300">
                Two timelapses Dino posted in February 2025, each captioned with the
                single word “timelapse.” They play muted while on screen; tap a
                video to pause it. Watch the steps from the light study above play
                out live: flat color, then cold shadow, then warm light cut back in.
              </p>
            </Reveal>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {timelapses.map((t, i) => (
              <Reveal key={t.id} delay={i * 140} className={i === 1 ? "sm:mt-20" : ""}>
                <TimelapsePlayer t={t} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================= archive */

const ALL = "All";

export function Archive() {
  const series = useMemo(() => {
    const s = new Set<string>();
    archive.forEach((w) => w.series && s.add(w.series));
    return [ALL, ...Array.from(s), "Untitled & other"];
  }, []);
  const [filter, setFilter] = useState(ALL);
  const [sort, setSort] = useState<"likes" | "newest">("likes");
  const [open, setOpen] = useState<number | null>(null);

  const visible = useMemo(() => {
    const list = archive.filter((w) =>
      filter === ALL ? true : filter === "Untitled & other" ? !w.series : w.series === filter,
    );
    return [...list].sort((a, b) =>
      sort === "likes" ? b.likes - a.likes : b.id.localeCompare(a.id, "en", { numeric: true }),
    );
  }, [filter, sort]);

  const total = archive.reduce((n, w) => n + w.likes, 0);

  return (
    <section id="archive" className="border-t border-bone-100/10 px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ember-400">
                05 · Archive
              </p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-5 font-display text-4xl font-medium leading-[1.02] text-bone-50 md:text-5xl">
                From the <span className="italic text-ember-300">timeline</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={150} className="max-w-sm">
            <p className="text-sm leading-relaxed text-ash-300">
              {archive.length} pieces picked from Dino's posts since 2023, with{" "}
              <span className="text-bone-100">{(total / 1_000_000).toFixed(2)}M</span>{" "}
              likes between them. Titles are his own post text, word for word.
            </p>
          </Reveal>
        </div>

        <Reveal delay={200} className="mt-12 flex flex-wrap items-center justify-between gap-5 border-y border-bone-100/10 py-4">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by series">
            {series.map((s) => (
              <button
                key={s}
                role="tab"
                aria-selected={filter === s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all duration-300 ${
                  filter === s
                    ? "bg-ember-400 text-ink-950"
                    : "border border-bone-100/15 text-ash-300 hover:border-bone-100/40 hover:text-bone-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ash-500">
            sort
            {(["likes", "newest"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setSort(k)}
                className={`transition-colors ${sort === k ? "text-ember-300" : "hover:text-bone-100"}`}
              >
                {k === "likes" ? "most liked" : "newest"}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 columns-2 gap-4 md:columns-3 md:gap-5">
          {visible.map((w) => (
            <button
              key={w.id}
              onClick={() => setOpen(archive.indexOf(w))}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden border border-bone-100/10 bg-ink-900 text-left md:mb-5"
            >
              <div style={{ aspectRatio: `${w.w} / ${w.h}` }} className="relative">
                <Art
                  src={w.img.replace("name=large", "name=medium")}
                  alt={`${w.title} by Dino (@Dino_illus)`}
                  label={w.title}
                  href={w.tweet}
                  className="absolute inset-0"
                  imgClassName="h-full w-full object-cover transition-transform duration-[1200ms] [transition-timing-function:var(--ease-soft)] group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink-950/95 via-ink-950/20 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <p className="font-display text-2xl italic text-bone-50">{w.title}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ember-300">
                    {w.series ?? "—"} · {w.date} · ♥ {w.likesLabel}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {open !== null && (
        <Lightbox index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
      )}
    </section>
  );
}

function Lightbox({
  index,
  onClose,
  onIndex,
}: {
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const w: ArchiveWork = archive[index];
  const go = useCallback(
    (d: number) => onIndex((index + d + archive.length) % archive.length),
    [index, onIndex],
  );
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, [go, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${w.title} by Dino`}
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-ink-950/95 p-4 backdrop-blur-md md:p-10"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="grid max-h-full w-full max-w-6xl items-center gap-8 md:grid-cols-[1.5fr_1fr]"
      >
        <div className="relative flex max-h-[78vh] justify-center">
          <img
            key={w.id}
            src={w.img}
            alt={`${w.title} by Dino (@Dino_illus)`}
            referrerPolicy="no-referrer"
            className="max-h-[78vh] w-auto max-w-full object-contain shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]"
          />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-ember-400">
            {String(index + 1).padStart(2, "0")} / {String(archive.length).padStart(2, "0")}
            {w.series ? ` · ${w.series}` : ""}
          </p>
          <h3 className="mt-4 font-display text-5xl italic text-bone-50">{w.title}</h3>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ash-300">{w.note}</p>
          <dl className="mt-7 grid max-w-sm grid-cols-3 gap-px border border-bone-100/10 bg-bone-100/10">
            {[
              ["posted", w.date],
              ["likes", w.likes.toLocaleString("en-US")],
              ["size", `${w.w}×${w.h}`],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink-950 p-3">
                <dt className="font-mono text-[8px] uppercase tracking-[0.26em] text-ash-500">{k}</dt>
                <dd className="mt-1 text-xs text-bone-100">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={w.tweet}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 border border-ember-400/60 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ember-300 transition-all hover:bg-ember-400 hover:text-ink-950"
            >
              original post <ArrowUpRight className="h-3 w-3" />
            </a>
            <button
              onClick={() => go(-1)}
              className="border border-bone-100/20 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-300 transition-colors hover:border-bone-100/50"
            >
              ← prev
            </button>
            <button
              onClick={() => go(1)}
              className="border border-bone-100/20 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-300 transition-colors hover:border-bone-100/50"
            >
              next →
            </button>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="mt-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-ash-500 transition-colors hover:text-bone-100"
          >
            <Sparkle className="h-3 w-3 text-ember-400" /> close · esc
          </button>
        </div>
      </div>
    </div>
  );
}
