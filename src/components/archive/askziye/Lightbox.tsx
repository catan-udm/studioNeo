import { useEffect, useRef, useState } from "react";
import type { Work } from "./data/works";
import { palettes } from "./data/palettes";
import { copyText, useToast } from "./lib";
import { FavBtn } from "./Gallery";
import { cn } from "@/utils/cn";

export function Lightbox({
  work,
  list,
  onClose,
  onGo,
  fav,
  toggleFav,
}: {
  work: Work;
  list: Work[];
  onClose: () => void;
  onGo: (w: Work) => void;
  fav: boolean;
  toggleFav: () => void;
}) {
  const toast = useToast();
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [playing, setPlaying] = useState(false);
  const [info, setInfo] = useState(true);
  const touchX = useRef<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const idx = Math.max(0, list.findIndex((w) => w.id === work.id));
  const go = (d: number) => {
    setZoom(false);
    onGo(list[(idx + d + list.length) % list.length]);
  };

  // move focus into the dialog on open, hand it back on close
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    root.current?.focus();
    return () => prev?.focus();
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key.toLowerCase() === "z") setZoom((z) => !z);
      else if (e.key.toLowerCase() === "f") toggleFav();
      else if (e.key.toLowerCase() === "i") setInfo((v) => !v);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", k);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", k);
    };
  });

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => go(1), 3800);
    return () => clearTimeout(t);
  }, [playing, work.id]);

  const share = async () => {
    const url = `${location.origin}${location.pathname}#plate=${work.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${work.title} — ASK`, url });
        return;
      } catch {
        /* fallthrough */
      }
    }
    toast((await copyText(url)) ? "Link copied" : "Copy failed");
  };

  return (
    <div
      ref={root}
      tabIndex={-1}
      className="lightbox-bg fixed inset-0 z-[90] flex flex-col text-paper outline-none"
      role="dialog"
      aria-modal="true"
      aria-label={`${work.title} — ${work.titleEn}, ${work.year}`}
    >
      {playing && (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-paper/10">
          <div key={work.id} className="h-full bg-cinnabar" style={{ animation: "grow 3.8s linear forwards" }} />
        </div>
      )}
      <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
        <div className="min-w-0">
          <p className="truncate font-display text-xl">{work.title}</p>
          <p className="text-[10px] tracking-[0.2em] text-paper/60 uppercase">
            {idx + 1} / {list.length} · {work.titleEn} · {work.year}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px] tracking-[0.16em] uppercase">
          <Tool label={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)}>
            {playing ? "❚❚" : "▶"}
          </Tool>
          <Tool label="Zoom (Z)" onClick={() => setZoom(!zoom)}>
            {zoom ? "−" : "+"}
          </Tool>
          <Tool label="Info (I)" onClick={() => setInfo(!info)}>
            i
          </Tool>
          <Tool label="Share" onClick={share}>
            ⤴
          </Tool>
          <a
            href={work.src}
            download={`ASK-${work.id}.jpg`}
            title="Download"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper/10"
          >
            ⤓
          </a>
          <FavBtn on={fav} onClick={toggleFav} className="h-9 w-9 text-paper/70" />
          <button onClick={onClose} className="ml-2 px-2 hover:text-cinnabar" aria-label="Close">
            ✕
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        <div
          className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden px-4"
          onClick={onClose}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <button
            onClick={(e) => (e.stopPropagation(), go(-1))}
            className="absolute left-2 z-10 px-3 py-8 text-2xl text-paper/40 hover:text-paper md:left-4"
            aria-label="Previous"
          >
            ←
          </button>
          <img
            key={work.id}
            src={work.src}
            alt={work.title}
            decoding="async"
            onClick={(e) => {
              e.stopPropagation();
              const r = (e.target as HTMLImageElement).getBoundingClientRect();
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
              setZoom(!zoom);
            }}
            onMouseMove={(e) => {
              if (!zoom) return;
              const r = (e.target as HTMLImageElement).getBoundingClientRect();
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
            }}
            className={cn(
              "rise max-h-[calc(100vh-13rem)] max-w-full object-contain shadow-2xl transition-transform duration-300",
              zoom ? "scale-[2.2] cursor-zoom-out" : "cursor-zoom-in",
            )}
            style={{ transformOrigin: origin }}
          />
          <button
            onClick={(e) => (e.stopPropagation(), go(1))}
            className="absolute right-2 z-10 px-3 py-8 text-2xl text-paper/40 hover:text-paper md:right-4"
            aria-label="Next"
          >
            →
          </button>
        </div>

        {info && (
          <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-paper/10 p-6 lg:block">
            <p className="text-[10px] tracking-[0.28em] text-gold uppercase">Plate notes</p>
            <h3 className="mt-2 font-display text-2xl">{work.title}</h3>
            <dl className="mt-6 space-y-4 text-sm">
              {[
                ["Subject", work.subject],
                ["English", work.titleEn],
                ["Year", work.year],
                ["Dimensions", `${work.w} × ${work.h}`],
                ["Orientation", work.w > work.h ? "Landscape" : work.w < work.h ? "Portrait" : "Square"],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <dt className="text-[10px] tracking-[0.2em] text-paper/40 uppercase">{k}</dt>
                  <dd className="mt-0.5 text-paper/85">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-[10px] tracking-[0.28em] text-gold uppercase">Palette · click to copy</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(palettes[work.id] || []).map((c) => (
                <button
                  key={c}
                  onClick={async () => toast((await copyText(c)) ? `Copied ${c}` : c)}
                  className="group text-left"
                >
                  <span className="block h-12 ring-1 ring-paper/10 transition group-hover:scale-105" style={{ background: c }} />
                  <span className="mt-1 block font-mono text-[10px] text-paper/50">{c}</span>
                </button>
              ))}
            </div>
            {work.pixiv && (
              <a
                href={`https://www.pixiv.net/artworks/${work.pixiv}`}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-block border border-paper/20 px-4 py-2 text-[10px] tracking-[0.2em] uppercase hover:border-cinnabar hover:text-cinnabar"
              >
                View on Pixiv ↗
              </a>
            )}
            <p className="mt-8 text-[10px] leading-6 text-paper/35">
              ← → navigate · Space slideshow · Z zoom · F save · I info · Esc close
            </p>
          </aside>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto px-5 py-3 md:px-8">
        {list.map((w) => (
          <button
            key={w.id}
            onClick={() => (setZoom(false), onGo(w))}
            className={cn(
              "h-14 w-14 shrink-0 overflow-hidden transition",
              w.id === work.id ? "opacity-100 ring-2 ring-cinnabar" : "opacity-40 hover:opacity-80",
            )}
          >
            <img src={w.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Tool({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper/10">
      {children}
    </button>
  );
}
