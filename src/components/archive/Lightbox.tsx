"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Film,
  Timer,
  Gauge,
  CalendarDays,
  Music2,
  Repeat,
  Sun,
  Moon,
  Heart,
  Share2,
  Check,
  Download,
  Pause,
  Play,
  Grid,
} from "lucide-react";
import { pixivArt, type Artwork } from "@/data";
import { useSavedWorks } from "@/lib/archiveFavorites";
import { cn } from "@/utils/cn";

export function Lightbox({
  artwork: a,
  position,
  onClose,
  onPrev,
  onNext,
  onSelectTag,
}: {
  artwork: Artwork;
  position: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelectTag?: (tag: string) => void;
}) {
  const [lightStage, setLightStage] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [selectedCel, setSelectedCel] = useState(1);
  const [copied, setCopied] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isSaved, toggle } = useSavedWorks();
  const saved = isSaved(a.id);

  useEffect(() => {
    setPlaying(true);
    setSelectedCel(1);
  }, [a.id]);

  // Advance cel counter in sync with the loop while playing
  useEffect(() => {
    if (!playing) return;
    const frameInterval = Math.max(25, Math.round(a.durationMs / a.frames));
    const timer = window.setInterval(() => {
      setSelectedCel((prev) => (prev % a.frames) + 1);
    }, frameInterval);
    return () => window.clearInterval(timer);
  }, [playing, a.frames, a.durationMs]);

  const togglePlay = () => {
    if (playing) {
      const img = imgRef.current;
      const canvas = canvasRef.current;
      if (img && canvas && img.naturalWidth > 0) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
      }
      setPlaying(false);
    } else {
      setPlaying(true);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  });

  const handleShare = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("artist", "sankobite");
      url.searchParams.set("work", a.slug);
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  const fps = Math.round(a.frames / (a.durationMs / 1000));
  const currentTimestamp = (((selectedCel - 1) / a.frames) * (a.durationMs / 1000)).toFixed(2);
  const stripNotches = Math.min(a.frames, 60);
  const activeNotch = Math.min(stripNotches - 1, Math.floor(((selectedCel - 1) / a.frames) * stripNotches));

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-deep/95 halftone-light flex items-center justify-center p-3 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${a.titleEn} — artwork viewer`}
      onClick={onClose}
    >
      <div
        key={a.id}
        className="pop-in relative w-full max-w-5xl max-h-full overflow-y-auto thin-scroll bg-paper border-[3px] border-ink shadow-[10px_10px_0_rgba(0,0,0,0.45)] grid md:grid-cols-[1.15fr_1fr]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* animation side */}
        <div
          className={cn(
            "relative flex items-center justify-center p-5 md:p-8 min-h-[320px] transition-colors duration-300",
            lightStage ? "bg-paper-2" : "bg-slate-frame"
          )}
        >
          <div className="relative w-full flex items-center justify-center">
            <img
              ref={imgRef}
              src={a.src}
              alt={`${a.titleJp} (${a.titleEn}) — animated ugoira by sankobite`}
              className={cn(
                "w-full max-h-[60vh] object-contain border-[3px] border-ink shadow-[6px_6px_0_rgba(0,0,0,0.35)]",
                !playing && "hidden"
              )}
            />
            <canvas
              ref={canvasRef}
              className={cn(
                "w-full max-h-[60vh] object-contain border-[3px] border-ink shadow-[6px_6px_0_rgba(0,0,0,0.35)]",
                playing && "hidden"
              )}
            />
            {showGrid && (
              <div
                className="pointer-events-none absolute inset-0 border-2 border-miku/50"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(47,196,187,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(47,196,187,0.3) 1px, transparent 1px)",
                  backgroundSize: "33.333% 33.333%",
                }}
                aria-hidden
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-magenta/70" />
                </div>
              </div>
            )}
          </div>

          <span
            className={cn(
              "absolute top-3 left-3 inline-flex items-center gap-1.5 font-dot text-[11px] px-2.5 py-1",
              lightStage ? "bg-white/90 text-ink border-2 border-ink" : "bg-ink/85 text-paper"
            )}
          >
            <Repeat className={cn("w-3.5 h-3.5 text-miku-deep", playing && "spin-slow")} aria-hidden />
            {playing ? "LOOPING · ORIGINAL FRAMES" : `PAUSED · CEL ${selectedCel}/${a.frames}`}
          </span>

          {/* Stage Controls Bar */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause animation" : "Play animation"}
              className="inline-flex items-center gap-1 bg-white/95 text-ink border-2 border-ink font-dot text-[10px] px-2 py-1 hover:bg-sun transition-colors cursor-pointer"
            >
              {playing ? <Pause className="w-3.5 h-3.5" aria-hidden /> : <Play className="w-3.5 h-3.5" aria-hidden />}
              {playing ? "pause" : "play"}
            </button>
            <button
              type="button"
              onClick={() => setShowGrid((v) => !v)}
              aria-label="Toggle animator grid"
              aria-pressed={showGrid}
              className={cn(
                "inline-flex items-center gap-1 border-2 border-ink font-dot text-[10px] px-2 py-1 transition-colors cursor-pointer",
                showGrid ? "bg-miku text-ink" : "bg-white/95 text-ink hover:bg-sun"
              )}
            >
              <Grid className="w-3.5 h-3.5" aria-hidden />
              grid
            </button>
            <button
              type="button"
              onClick={() => setLightStage((v) => !v)}
              aria-label={lightStage ? "Switch to dark stage" : "Switch to light stage"}
              className="inline-flex items-center gap-1.5 bg-white/95 text-ink border-2 border-ink font-dot text-[10px] px-2 py-1 hover:bg-sun transition-colors cursor-pointer"
            >
              {lightStage ? <Moon className="w-3.5 h-3.5" aria-hidden /> : <Sun className="w-3.5 h-3.5" aria-hidden />}
              {lightStage ? "dark" : "light"}
            </button>
          </div>

          <span className={cn("absolute bottom-3 left-3 font-dot text-[11px]", lightStage ? "text-ink-soft" : "text-paper/70")}>
            {position}
          </span>
        </div>

        {/* info side */}
        <div className="p-6 md:p-8 flex flex-col">
          <p className="font-dot text-xs tracking-[0.2em] text-magenta-deep mb-2">▸ {a.collectionLabel.toUpperCase()}</p>
          <h3 className="font-display text-3xl md:text-4xl leading-none">{a.titleJp}</h3>
          <p className="mt-2 font-bold text-lg text-ink-soft">
            {a.titleRomaji} <span className="font-medium">— {a.titleEn}</span>
          </p>

          <p className="mt-4 text-sm md:text-base leading-relaxed text-ink-soft font-medium">{a.note}</p>

          <dl className="mt-5 grid grid-cols-2 gap-2.5 text-sm">
            {[
              { icon: Film, k: "Frames", v: `${a.frames} hand-drawn` },
              { icon: Timer, k: "Loop length", v: `${(a.durationMs / 1000).toFixed(2)} s` },
              { icon: Gauge, k: "Frame rate", v: `~${fps} fps` },
              { icon: CalendarDays, k: "Posted", v: a.dateLabel },
            ].map(({ icon: Icon, k, v }) => (
              <div key={k} className="border-2 border-ink bg-white px-3 py-2">
                <dt className="flex items-center gap-1.5 font-dot text-[10px] text-ink-soft uppercase">
                  <Icon className="w-3.5 h-3.5 text-miku-deep" aria-hidden /> {k}
                </dt>
                <dd className="font-bold mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 flex items-start gap-2 text-sm font-bold">
            <Music2 className="w-4 h-4 mt-0.5 text-coral shrink-0" aria-hidden />
            <span>
              Song: <span className="text-miku-deep">{a.titleRomaji}</span> by {a.songBy}
            </span>
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {a.tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  onSelectTag?.(t);
                  onClose();
                }}
                title={`Filter archive by #${t}`}
                className="font-dot text-[11px] bg-paper-2 border-2 border-ink/25 hover:border-ink hover:bg-sun px-2 py-0.5 transition-colors cursor-pointer"
              >
                #{t}
              </button>
            ))}
          </div>

          {/* Interactive filmstrip: one notch per drawn frame */}
          <div className="mt-5">
            <div className="flex items-center justify-between font-dot text-[10px] text-ink-soft mb-1.5 uppercase tracking-[0.15em]">
              <span>frame strip · {a.frames} cels</span>
              <span className="text-ink font-bold tabular-nums">
                cel {String(selectedCel).padStart(2, "0")}/{a.frames} · {currentTimestamp}s
              </span>
            </div>
            <div className="flex gap-[2px] h-5 border-2 border-ink bg-white p-[3px] overflow-hidden" role="group" aria-label="Cel timeline">
              {Array.from({ length: stripNotches }).map((_, i) => {
                const isCurrent = i === activeNotch;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const targetCel = Math.max(1, Math.round(((i + 1) / stripNotches) * a.frames));
                      setSelectedCel(targetCel);
                    }}
                    title={`Jump to cel ${Math.max(1, Math.round(((i + 1) / stripNotches) * a.frames))}`}
                    className={cn("flex-1 min-w-[2px] rounded-[1px] cursor-pointer transition-transform", isCurrent && "scale-y-125 ring-1 ring-ink")}
                    style={{
                      background: isCurrent ? "var(--color-ink)" : a.accent,
                      opacity: isCurrent ? 1 : 0.35 + (0.65 * ((i % 12) + 1)) / 12,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="mt-auto pt-6 flex flex-wrap items-center gap-2">
            <a
              href={pixivArt(a.id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-miku text-ink font-display uppercase text-xs px-3.5 py-2.5 border-[3px] border-ink shadow-[3px_3px_0_var(--color-ink)] hover:shadow-[1px_1px_0_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Pixiv <ExternalLink className="w-3.5 h-3.5" aria-hidden />
            </a>

            <button
              type="button"
              onClick={() => toggle(a.id)}
              aria-pressed={saved}
              className={cn(
                "inline-flex items-center gap-1.5 font-bold text-xs px-3 py-2.5 border-[3px] border-ink transition-all cursor-pointer",
                saved
                  ? "bg-magenta text-white shadow-[2px_2px_0_var(--color-ink)]"
                  : "bg-white text-ink hover:bg-sun shadow-[3px_3px_0_rgba(38,49,63,0.25)]"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", saved && "fill-current")} aria-hidden />
              {saved ? "Saved" : "Save"}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 bg-white text-ink font-bold text-xs px-3 py-2.5 border-[3px] border-ink hover:bg-sun shadow-[3px_3px_0_rgba(38,49,63,0.25)] transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-miku-deep" aria-hidden /> : <Share2 className="w-3.5 h-3.5" aria-hidden />}
              {copied ? "Copied!" : "Share"}
            </button>

            <a
              href={a.src}
              download={`sankobite-${a.slug}.webp`}
              title="Download animated loop"
              className="inline-flex items-center justify-center w-10 h-10 bg-white text-ink border-[3px] border-ink hover:bg-sun shadow-[3px_3px_0_rgba(38,49,63,0.25)] transition-colors"
              aria-label="Download animated loop"
            >
              <Download className="w-4 h-4" aria-hidden />
            </a>

            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onPrev}
                aria-label="Previous artwork"
                className="w-10 h-10 grid place-items-center bg-white border-[3px] border-ink hover:bg-sun transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={onNext}
                aria-label="Next artwork"
                className="w-10 h-10 grid place-items-center bg-white border-[3px] border-ink hover:bg-sun transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close viewer"
          className="absolute top-3 right-3 w-10 h-10 grid place-items-center bg-magenta text-white border-[3px] border-ink shadow-[3px_3px_0_rgba(0,0,0,0.4)] hover:rotate-90 transition-transform cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
