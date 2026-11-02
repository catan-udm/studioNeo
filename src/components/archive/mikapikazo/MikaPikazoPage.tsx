"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Gauge,
  Menu,
  Minus,
  Palette as PaletteIcon,
  Plus,
  RotateCcw,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import Gallery from "./Gallery";
import Stickers from "./Stickers";
import {
  EXHIBITION,
  OFFICIAL,
  X_URL,
  milestones,
  palettes,
  projects,
  socials,
} from "@/mikapikazoData";
import {
  Barcode,
  RegMark,
  Starburst,
  Ticker,
  useChroma,
  usePalette,
  usePointerParallax,
  useRegCursor,
  useReveal,
  useScrollProgress,
} from "./ui";
import "./mikapikazo.css";

const NAV = [
  { href: "#dial", label: "COLOUR" },
  { href: "#work", label: "PANELS" },
  { href: "#stickers", label: "STICKERS" },
  { href: "#projects", label: "PROJECTS" },
  { href: "#about", label: "ABOUT" },
];

export function MikaPikazoPage({
  selectedWorkId,
  onSelectWork,
}: {
  selectedWorkId?: string | null;
  onSelectWork?: (id: string | null) => void;
}) {
  const [palette, setPalette] = usePalette();
  const [chroma, setChroma] = useChroma();
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = useScrollProgress();
  const coverRef = useRef<HTMLElement>(null);
  const cursorRef = useRegCursor();
  usePointerParallax(coverRef);
  useReveal();

  const remix = () => {
    const next = palettes[Math.floor(Math.random() * palettes.length)];
    setPalette(next.id);
    setChroma(110 + Math.round(Math.random() * 55));
  };

  return (
    <div className="mikapikazo-page grain min-h-screen bg-paper font-body text-ink">
      <div ref={cursorRef} className="reg-cursor" aria-hidden="true">
        <RegMark className="h-full w-full" />
      </div>

      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-20 focus:z-[200] focus:border-[3px] focus:border-ink focus:bg-pop2 focus:px-4 focus:py-2 focus:font-bold focus:text-on-pop2"
      >
        Skip to the artwork
      </a>

      {/* ---------------- spine / header ---------------- */}
      <header className="sticky top-0 z-50 border-b-[4px] border-ink bg-ink text-paper">
        <div className="mx-auto flex h-[64px] max-w-[1500px] items-center gap-4 px-4 md:px-8">
          <a href="#top" className="group flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <span className="grid h-10 w-10 -rotate-3 place-items-center border-[3px] border-paper bg-pop2 font-display text-lg leading-none text-on-pop2 transition-transform duration-300 group-hover:rotate-6">
              MPZ
            </span>
            <span className="hidden font-body text-[11px] font-bold leading-tight tracking-[0.18em] sm:block">
              MIKA PIKAZO
              <span className="mt-0.5 block text-[9px] tracking-[0.22em] text-paper/55">
                ILLUSTRATION WORKS · VOL.01
              </span>
            </span>
          </a>

          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2 font-body text-[11px] font-bold tracking-[0.16em] transition-colors duration-150 hover:bg-pop2 hover:text-on-pop2"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-4">
            <div className="hidden items-center gap-1.5 border-[3px] border-paper/30 px-2 py-1.5 xl:flex">
              <PaletteIcon className="mr-1 h-3.5 w-3.5 text-paper/60" aria-hidden="true" />
              {palettes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPalette(p.id)}
                  aria-label={`Use the ${p.name} colour palette`}
                  aria-pressed={palette.id === p.id}
                  title={`${p.name} palette`}
                  className={`h-5 w-5 border-2 transition-transform duration-200 hover:scale-110 ${
                    palette.id === p.id ? "border-paper" : "border-transparent"
                  }`}
                  style={{ background: p.pop }}
                />
              ))}
            </div>

            <a
              href={X_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 border-[3px] border-paper bg-pop px-3.5 py-2 font-body text-[11px] font-bold tracking-[0.16em] text-on-pop transition-transform duration-200 hover:-translate-y-0.5 sm:inline-flex"
            >
              FOLLOW ON X <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="inline-flex items-center gap-2 border-[3px] border-paper px-3 py-2 font-body text-[11px] font-bold tracking-[0.16em] lg:hidden"
            >
              {menuOpen ? "CLOSE" : "MENU"}
              {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-nav" aria-label="Mobile" className="border-t-[3px] border-paper/25 bg-ink px-4 pb-5 pt-2 lg:hidden">
            {NAV.concat({ href: "#connect", label: "CONNECT" }).map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between border-b border-paper/15 py-3.5 font-display text-2xl tracking-wide"
              >
                {item.label}
                <ArrowUpRight className="h-5 w-5 text-pop2" aria-hidden="true" />
              </a>
            ))}
          </nav>
        )}

        <div
          className="absolute inset-x-0 bottom-[-4px] h-[4px] origin-left bg-pop2"
          style={{ transform: `scaleX(${progress})` }}
          aria-hidden="true"
        />
      </header>

      <main id="top">
        {/* ---------------- the cover ---------------- */}
        <section ref={coverRef} className="relative overflow-hidden border-b-[5px] border-ink bg-pop2 text-on-pop2">
          <div className="halftone-lg pointer-events-none absolute inset-0 text-ink/15" aria-hidden="true" />
          <div className="par-a pointer-events-none absolute -left-40 top-24 h-64 w-64 rounded-full border-[5px] border-ink bg-pop md:h-80 md:w-80" aria-hidden="true" />
          <div className="checker par-b pointer-events-none absolute -right-8 bottom-40 h-32 w-56 rotate-12 text-ink/70" aria-hidden="true" />

          {/* top rail */}
          <div className="relative flex items-center justify-between gap-3 border-b-[3px] border-ink px-4 py-2 md:px-8">
            <RegMark className="h-5 w-5 shrink-0" />
            <span className="truncate font-body text-[10px] font-bold tracking-[0.24em]">
              MIKA PIKAZO — ILLUSTRATION WORKS
            </span>
            <span className="hidden font-body text-[10px] font-bold tracking-[0.24em] sm:block">
              VOL.01 / TOKYO
            </span>
            <RegMark className="h-5 w-5 shrink-0" />
          </div>

          <div className="relative mx-auto max-w-[1500px] px-4 pb-8 pt-5 md:px-8 md:pb-10">
            {/* masthead */}
            <h1 className="rise-1 font-display leading-[0.8] tracking-[-0.03em]" aria-label="Mika Pikazo">
              <span className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
                <span className="text-[clamp(56px,24vw,186px)]">MIKA</span>
                <span className="mb-2 hidden max-w-[280px] font-body text-[11px] font-bold leading-relaxed tracking-[0.16em] md:block">
                  ILLUSTRATOR
                  <br />
                  CHARACTER DESIGNER
                  <br />
                  <span className="font-jp text-base tracking-[0.2em]">ミカ・ピカゾ</span>
                </span>
              </span>
              <span className="block text-[clamp(56px,24vw,186px)] text-pop stroke-ink">
                PIKAZO<span className="text-ink">.</span>
              </span>
            </h1>

            {/* action strip */}
            <div className="rise-2 mt-6 flex flex-wrap items-center justify-between gap-4 border-y-[4px] border-ink py-4">
              <div className="flex flex-wrap gap-3">
                <a
                  href="#work"
                  className="group inline-flex items-center gap-3 border-[4px] border-ink bg-ink px-5 py-3 font-body text-[12px] font-bold tracking-[0.16em] text-pop2 shadow-[7px_7px_0_var(--pop)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[11px_11px_0_var(--pop)]"
                >
                  OPEN THE PAGE
                  <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </a>
                <a
                  href="#dial"
                  className="inline-flex items-center gap-2 border-[4px] border-ink bg-paper px-4 py-3 font-body text-[12px] font-bold tracking-[0.16em] text-ink transition-all duration-200 hover:-translate-y-1 hover:bg-pop hover:text-on-pop"
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> MIX THE INK
                </a>
              </div>
              <p className="font-body text-[10px] font-bold tracking-[0.2em]">
                10 PANELS <span className="opacity-40">/</span> 4 INK SETS <span className="opacity-40">/</span> 1 STICKER SHEET
              </p>
            </div>

            {/* jacket band */}
            <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-8">
              {/* left rail */}
              <div className="rise-2 order-2 flex flex-row flex-wrap items-end gap-5 lg:order-1 lg:col-span-3 lg:flex-col lg:items-start lg:justify-end">
                <div className="border-l-[5px] border-ink pl-3">
                  <p className="font-body text-[10px] font-bold tracking-[0.2em] opacity-60">SUBJECT</p>
                  <p className="font-display text-2xl leading-tight tracking-wide">POP, AT FULL VOLUME</p>
                </div>
                <div className="border-l-[5px] border-ink pl-3">
                  <p className="font-body text-[10px] font-bold tracking-[0.2em] opacity-60">BASED</p>
                  <p className="font-display text-2xl leading-tight tracking-wide">TOKYO, JAPAN</p>
                </div>
                <div className="hidden lg:block">
                  <Barcode className="h-10 w-40 text-ink" />
                  <p className="mt-1 font-body text-[9px] font-bold tracking-[0.3em]">MPZ · 1993 · 2015—</p>
                </div>
              </div>

              {/* main plate */}
              <div className="order-1 lg:order-2 lg:col-span-5">
                <div className="par-c chroma relative mx-auto max-w-[420px] border-[6px] border-ink bg-paper shadow-[18px_18px_0_var(--color-ink)] transition-transform duration-500 hover:rotate-0 lg:max-w-none">
                  <span className="tape -top-4 left-8 -rotate-6" aria-hidden="true" />
                  <img
                    src="/images/mikapikazo/pop-portrait.webp"
                    alt="POP, a key visual by Mika Pikazo: a grinning character against saturated blue"
                    className="aspect-[4/5] w-full object-cover"
                    fetchPriority="high"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t-[4px] border-ink bg-paper px-3 py-2 font-body text-[10px] font-bold tracking-[0.18em] text-ink">
                    <span>“POP” — KEY VISUAL</span>
                    <span>2022</span>
                  </span>
                  <div className="pointer-events-none absolute -left-7 -top-9 h-24 w-24 md:-left-12 md:h-32 md:w-32">
                    <Starburst className="spin-slow h-full w-full text-ink" points={18} inner={38} />
                    <span className="absolute inset-0 grid place-items-center text-center font-display text-[12px] leading-[0.95] tracking-wide text-pop2 md:text-[15px]">
                      100%
                      <br />
                      POP
                    </span>
                  </div>
                </div>
              </div>

              {/* right rail */}
              <div className="rise-3 order-3 flex flex-col justify-between gap-6 lg:col-span-4">
                <div className="relative">
                  <div className="chroma rotate-2 border-[5px] border-ink bg-paper shadow-[10px_10px_0_var(--pop3)] transition-transform duration-500 hover:rotate-0">
                    <img
                      src="/images/mikapikazo/revenge-portrait.webp"
                      alt="REVENGE, a key visual by Mika Pikazo"
                      className="aspect-[16/10] w-full object-cover object-[center_22%]"
                      loading="lazy"
                    />
                  </div>
                  <span
                    className="pointer-events-none absolute -bottom-3 -left-2 font-jp text-3xl font-bold text-paper md:text-4xl"
                    style={{ WebkitTextStroke: "5px var(--color-ink)", paintOrder: "stroke fill" }}
                    aria-hidden="true"
                  >
                    ドンッ
                  </span>
                </div>

                <div>
                  <div className="inline-block -rotate-1 border-[4px] border-ink bg-ink px-3 py-1.5 shadow-[7px_7px_0_var(--pop3)]">
                    <p className="font-display text-[clamp(18px,2.4vw,30px)] leading-none tracking-wide text-paper">
                      COLOR OUTSIDE THE LINES
                    </p>
                  </div>
                  <p className="mt-5 font-body text-[15px] leading-relaxed text-ink/80">
                    Saturated to the edge and drawn at full volume — the artist behind Fire Emblem
                    Engage, Kaguya Luna and Hatsune Miku&apos;s Magical Mirai.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* colour bar footer of the jacket */}
          <div className="relative flex items-stretch border-t-[4px] border-ink">
            <div className="chroma flex flex-1">
              {["var(--pop)", "var(--pop2)", "var(--pop3)", "var(--color-ink)"].map((c) => (
                <span key={c} className="h-6 flex-1 border-r-[3px] border-ink last:border-r-0" style={{ background: c }} />
              ))}
            </div>
            <span className="flex items-center gap-2 bg-ink px-4 font-body text-[10px] font-bold tracking-[0.2em] text-pop2">
              <span className="blink">●</span> SCROLL
            </span>
          </div>
        </section>

        {/* ---------------- conveyor ---------------- */}
        <div className="relative overflow-hidden border-b-[5px] border-ink bg-ink py-6">
          <div className="-rotate-2">
            <Ticker
              items={["A LITTLE CHAOS", "A LOT OF COLOR", "MIKA PIKAZO", "ミカ・ピカゾ"]}
              className="border-y-[4px] border-ink bg-pop py-2 text-on-pop"
              duration={30}
            />
            <Ticker
              items={["ILLUSTRATION", "CHARACTER DESIGN", "KEY VISUALS", "COVER ART"]}
              className="mt-3 border-y-[4px] border-ink bg-pop3 py-2 text-on-pop3"
              duration={38}
              reverse
            />
          </div>
        </div>

        <ColorDial
          chroma={chroma}
          setChroma={setChroma}
          activeId={palette.id}
          setPalette={setPalette}
          onRemix={remix}
        />

        <StyleSpread />

        <Gallery selectedWorkId={selectedWorkId} onSelectWork={onSelectWork} />

        <div id="stickers" className="scroll-mt-20">
          <Stickers />
        </div>

        <Projects />
        <Timeline />
        <ExhibitionBand />
        <About />
        <Connect />
      </main>

      <footer className="border-t-[5px] border-ink bg-ink px-5 py-10 text-paper md:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 -rotate-3 place-items-center border-[3px] border-paper bg-pop font-display text-xl text-on-pop">
              MPZ
            </span>
            <p className="font-body text-[11px] leading-relaxed tracking-[0.12em] text-paper/60">
              INDEPENDENT FAN-MADE SHOWCASE.
              <br />
              ALL ARTWORK © MIKA PIKAZO.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href={OFFICIAL} target="_blank" rel="noreferrer" className="font-body text-[11px] font-bold tracking-[0.16em] transition-colors hover:text-pop2">
              OFFICIAL SITE
            </a>
            <a href={EXHIBITION} target="_blank" rel="noreferrer" className="font-body text-[11px] font-bold tracking-[0.16em] transition-colors hover:text-pop2">
              ARTWORK SOURCE
            </a>
            <a href="#top" className="inline-flex items-center gap-2 border-[3px] border-paper px-3 py-2 font-body text-[11px] font-bold tracking-[0.16em] transition-colors hover:bg-pop2 hover:text-on-pop2">
              BACK TO TOP <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- 01 · the colour dial ---------------- */

const PRESETS = [
  { label: "MUTED", value: 55 },
  { label: "AS PRINTED", value: 100 },
  { label: "OVERDRIVE", value: 160 },
];

const DIAL_THUMBS = [
  { src: "/images/mikapikazo/visions.webp", alt: "VISIONS illustration" },
  { src: "/images/mikapikazo/free.webp", alt: "FREE illustration" },
  { src: "/images/mikapikazo/revenge-pop-portrait.webp", alt: "REVENGE POP key visual" },
  { src: "/images/mikapikazo/adhouse.webp", alt: "AD:HOUSE cover illustration" },
];

function ColorDial({
  chroma,
  setChroma,
  activeId,
  setPalette,
  onRemix,
}: {
  chroma: number;
  setChroma: (v: number) => void;
  activeId: string;
  setPalette: (id: string) => void;
  onRemix: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const active = palettes.find((p) => p.id === activeId) ?? palettes[0];

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
    } catch {
      setCopied(null);
    }
  };

  const mood = chroma < 80 ? "PULLED BACK" : chroma > 130 ? "OFF THE CHART" : "AS SHE DRAWS IT";

  return (
    <section id="dial" className="relative scroll-mt-20 overflow-hidden border-b-[5px] border-ink bg-paper px-5 py-16 md:px-10 md:py-24">
      <div className="screentone pointer-events-none absolute inset-y-0 right-0 w-1/3 text-ink/10" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1400px]">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16" data-reveal>
          <div className="reveal">
            <p className="mb-4 inline-flex items-center gap-2 border-[3px] border-ink bg-pop px-3 py-1 font-body text-[11px] font-bold tracking-[0.2em] text-on-pop">
              <Gauge className="h-3.5 w-3.5" aria-hidden="true" /> 01 — THE COLOUR DIAL
            </p>
            <h2 className="font-display text-[clamp(46px,7.5vw,110px)] leading-[0.94] tracking-tight">
              YOU HOLD
              <br />
              THE <span className="text-pop3 stroke-ink">INK.</span>
            </h2>
            <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-ink/75">
              This whole issue is printed live. Push the dial and every illustration on the page
              gains or loses saturation — the way she pushes colour past where a printer would
              normally stop.
            </p>

            <div className="mt-8 flex items-end gap-4">
              <span className="font-display text-[clamp(70px,12vw,150px)] leading-[0.8] tracking-tight">
                {chroma}
                <span className="text-pop">%</span>
              </span>
              <span className="mb-3 border-[3px] border-ink bg-pop2 px-2.5 py-1 font-body text-[10px] font-bold tracking-[0.16em] text-on-pop2">
                {mood}
              </span>
            </div>
          </div>

          <div className="reveal">
            <div className="border-[5px] border-ink bg-paper p-5 shadow-[12px_12px_0_var(--color-ink)] md:p-7">
              <label htmlFor="chroma" className="mb-3 flex items-center justify-between font-body text-[11px] font-bold tracking-[0.18em]">
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> SATURATION
                </span>
                <span className="text-ink/50">30% — 180%</span>
              </label>
              <input
                id="chroma"
                type="range"
                min={30}
                max={180}
                step={1}
                value={chroma}
                onChange={(event) => setChroma(Number(event.target.value))}
                className="dial"
                aria-valuetext={`${chroma} percent saturation`}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setChroma(preset.value)}
                    aria-pressed={chroma === preset.value}
                    className={`border-[3px] border-ink px-3 py-1.5 font-body text-[10px] font-bold tracking-[0.14em] transition-transform duration-150 hover:-translate-y-0.5 ${
                      chroma === preset.value ? "bg-ink text-pop2" : "bg-paper hover:bg-pop2 hover:text-on-pop2"
                    }`}
                  >
                    {preset.label} · {preset.value}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setChroma(100)}
                  className="inline-flex items-center gap-1.5 border-[3px] border-ink px-3 py-1.5 font-body text-[10px] font-bold tracking-[0.14em] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-pop2 hover:text-on-pop2"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> RESET
                </button>
              </div>

              {/* live proof */}
              <div className="mt-6 grid grid-cols-4 gap-2">
                {DIAL_THUMBS.map((thumb) => (
                  <div key={thumb.src} className="chroma overflow-hidden border-[3px] border-ink">
                    <img src={thumb.src} alt={thumb.alt} loading="lazy" className="aspect-square w-full object-cover object-[center_28%]" />
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t-[3px] border-ink pt-5">
                <p className="mb-3 font-body text-[11px] font-bold tracking-[0.18em]">INK SET</p>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Colour palette">
                  {palettes.map((p) => {
                    const isActive = p.id === activeId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPalette(p.id)}
                        aria-pressed={isActive}
                        className={`group flex items-center gap-2.5 border-[3px] border-ink px-2.5 py-2 transition-all duration-200 hover:-translate-y-1 ${
                          isActive ? "bg-ink text-paper shadow-[5px_5px_0_var(--pop)]" : "bg-paper shadow-[4px_4px_0_var(--color-ink)]"
                        }`}
                      >
                        <span className="flex">
                          {[p.pop, p.pop2, p.pop3].map((hex) => (
                            <span key={hex} className="h-6 w-4 border-y-[3px] border-r-[3px] border-ink first:border-l-[3px]" style={{ background: hex }} />
                          ))}
                        </span>
                        <span className="font-display text-base leading-none tracking-wide">{p.name}</span>
                        {isActive && <Check className="h-3.5 w-3.5 text-pop2" aria-hidden="true" />}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={onRemix}
                    className="inline-flex items-center gap-2 border-[3px] border-ink bg-pop px-3 py-2 font-body text-[10px] font-bold tracking-[0.16em] text-on-pop shadow-[4px_4px_0_var(--color-ink)] transition-transform duration-200 hover:-translate-y-1"
                  >
                    <Shuffle className="h-4 w-4" aria-hidden="true" /> REMIX
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[active.pop, active.pop2, active.pop3].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => copy(hex)}
                      title={`Copy ${hex}`}
                      className="inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-2.5 py-1.5 font-body text-[10px] font-bold tracking-[0.14em] transition-transform duration-150 hover:-translate-y-0.5"
                    >
                      <span className="h-4 w-4 border-2 border-ink" style={{ background: hex }} />
                      {hex.toUpperCase()}
                      {copied === hex ? (
                        <span className="inline-flex items-center gap-1 text-pop">
                          <Check className="h-3 w-3" aria-hidden="true" /> COPIED
                        </span>
                      ) : (
                        <Copy className="h-3 w-3 text-ink/40" aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 02 · style ---------------- */

function StyleSpread() {
  return (
    <section
      id="style"
      className="cut-both relative -my-[1vw] scroll-mt-20 overflow-hidden bg-pop3 px-5 pb-24 pt-24 text-on-pop3 md:px-10 md:pb-32 md:pt-32"
    >
      <div className="stripes pointer-events-none absolute -right-20 top-0 h-full w-72 rotate-6 text-ink/20" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1400px]">
        <p className="mb-4 inline-flex items-center gap-2 border-[3px] border-ink bg-pop2 px-3 py-1 font-body text-[11px] font-bold tracking-[0.2em] text-on-pop2" data-reveal>
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> 02 — THE STYLE
        </p>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="reveal lg:col-span-7" data-reveal>
            <h2 className="font-display text-[clamp(48px,8vw,116px)] leading-[0.94] tracking-tight">
              LOUD COLOUR,
              <br />
              <span className="text-pop2 stroke-ink">ZERO APOLOGY.</span>
            </h2>

            <blockquote className="mt-8 border-l-[6px] border-pop2 pl-5">
              <p className="font-body text-lg leading-relaxed md:text-xl">
                “I love the word <span className="font-bold">POP</span>, and everything it means. I
                believe in it.”
              </p>
              <footer className="mt-3 font-body text-[11px] font-bold tracking-[0.18em] opacity-70">
                MIKA PIKAZO — TRANSLATED FROM HER REVENGE POP STATEMENT
              </footer>
            </blockquote>
            <a
              href={EXHIBITION}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-3 border-[3px] border-ink bg-paper px-5 py-3 font-body text-[11px] font-bold tracking-[0.16em] text-ink transition-transform duration-200 hover:-translate-y-1"
            >
              READ THE EXHIBITION NOTE <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="grid gap-6 lg:col-span-5">
            <div className="reveal border-[4px] border-ink bg-pop2 p-6 text-on-pop2 shadow-[10px_10px_0_var(--color-ink)]" data-reveal>
              <span className="font-display text-[64px] leading-none">01</span>
              <h3 className="mt-2 font-display text-3xl tracking-wide">SATURATION FIRST</h3>
              <p className="mt-2 font-body text-sm leading-relaxed">
                Colours arrive at full strength — magenta against cyan, acid yellow against cobalt —
                and the drawing keeps its shape anyway.
              </p>
            </div>
            <div className="reveal border-[4px] border-ink bg-pop p-6 text-on-pop shadow-[10px_10px_0_var(--color-ink)] lg:ml-10" data-reveal>
              <span className="font-display text-[64px] leading-none">02</span>
              <h3 className="mt-2 font-display text-3xl tracking-wide">CHARACTERS WITH ATTITUDE</h3>
              <p className="mt-2 font-body text-sm leading-relaxed">
                Young, grinning, mid-motion. Anime-inflected proportions pushed into graphic design:
                costume as colour blocking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 05 · projects ---------------- */

function Projects() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="projects" className="scroll-mt-20 bg-paper px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
          <div className="reveal">
            <p className="mb-4 inline-flex items-center gap-2 border-[3px] border-ink bg-pop px-3 py-1 font-body text-[11px] font-bold tracking-[0.2em] text-on-pop">
              <Starburst className="h-3 w-3" points={8} inner={26} /> 05 — KNOWN FOR
            </p>
            <h2 className="font-display text-[clamp(46px,8.5vw,124px)] leading-[0.94] tracking-tight">
              BIG WORLDS,
              <br />
              <span className="text-pop3 stroke-ink">HER CHARACTERS.</span>
            </h2>
          </div>
          <p className="reveal max-w-xs font-body text-sm leading-relaxed text-ink/70">
            Games, virtual talents, concerts, album covers. Open a row for the detail.
          </p>
        </div>

        <div className="border-t-[4px] border-ink">
          {projects.map((project, i) => {
            const isOpen = open === i;
            return (
              <div key={project.title} className="border-b-[4px] border-ink">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`project-panel-${i}`}
                  className={`group flex w-full items-center gap-4 px-2 py-5 text-left transition-colors duration-200 md:gap-8 md:px-4 ${
                    isOpen ? "bg-pop2 text-on-pop2" : "hover:bg-pop2/60"
                  }`}
                >
                  <span className="w-16 shrink-0 border-[3px] border-ink bg-pop px-1.5 py-1 text-center font-body text-[11px] font-bold tracking-[0.12em] text-on-pop md:w-20">
                    {project.year}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[clamp(22px,3.4vw,44px)] leading-none tracking-wide">
                      {project.title}
                    </span>
                    <span className="mt-1.5 block font-body text-[11px] font-medium tracking-[0.08em] text-ink/60">
                      {project.role}
                    </span>
                  </span>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center border-[3px] border-ink transition-colors ${isOpen ? "bg-ink text-pop2" : "bg-paper group-hover:bg-pop group-hover:text-on-pop"}`}>
                    {isOpen ? <Minus className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                  </span>
                </button>
                {isOpen && (
                  <div
                    id={`project-panel-${i}`}
                    className="pop-in flex flex-col gap-4 border-t-[3px] border-ink bg-paper px-2 py-6 md:flex-row md:items-center md:justify-between md:px-4"
                  >
                    <p className="max-w-2xl font-body text-sm leading-relaxed text-ink/80 md:text-base">{project.detail}</p>
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-fit shrink-0 items-center gap-2 border-[3px] border-ink bg-pop3 px-4 py-2.5 font-body text-[11px] font-bold tracking-[0.16em] text-on-pop3 transition-transform duration-200 hover:-translate-y-1"
                    >
                      {project.linkLabel} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- timeline ---------------- */

function Timeline() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = () => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const scrollBy = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.min(el.clientWidth * 0.8, 460), behavior: "smooth" });
  };

  const tones = ["bg-pop text-on-pop", "bg-pop2 text-on-pop2", "bg-paper text-ink", "bg-pop3 text-on-pop3"];

  return (
    <section className="border-y-[5px] border-ink bg-ink px-5 py-16 text-paper md:px-10 md:py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5" data-reveal>
          <h2 className="reveal font-display text-[clamp(36px,6vw,80px)] leading-none tracking-tight">
            TEN YEARS, <span className="text-pop2">FULL VOLUME</span>
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={edges.start}
              className="inline-flex items-center gap-2 border-[3px] border-paper px-3 py-2 font-body text-[10px] font-bold tracking-[0.16em] transition-colors hover:bg-pop2 hover:text-on-pop2 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-paper"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> BACK
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={edges.end}
              className="inline-flex items-center gap-2 border-[3px] border-paper px-3 py-2 font-body text-[10px] font-bold tracking-[0.16em] transition-colors hover:bg-pop2 hover:text-on-pop2 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-paper"
            >
              NEXT <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          onScroll={measure}
          className="snap-track -mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-5 pt-3"
          tabIndex={0}
          aria-label="Career milestones, scrollable"
        >
          {milestones.map((item, i) => (
            <article
              key={item.year}
              className={`w-[260px] shrink-0 snap-start border-[4px] border-paper p-5 transition-transform duration-300 hover:-translate-y-2 md:w-[320px] ${tones[i % tones.length]} ${i % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"}`}
            >
              <span className="font-display text-[clamp(44px,6vw,68px)] leading-none">{item.year}</span>
              <h3 className="mt-2 font-display text-2xl tracking-wide">{item.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed opacity-85">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- exhibition ---------------- */

function ExhibitionBand() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div
        className="chroma absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-fixed"
        style={{ backgroundImage: "url(/images/mikapikazo/pop-wide.jpg)" }}
        aria-hidden="true"
      />
      <div className="halftone pointer-events-none absolute inset-0 text-ink/25" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-6 px-5 py-20 md:flex-row md:items-end md:justify-between md:px-10 md:py-28">
        <div className="reveal relative max-w-xl border-[5px] border-ink bg-paper p-6 shadow-[14px_14px_0_var(--pop)] md:p-8" data-reveal>
          <span className="tape -top-4 right-10 rotate-6" aria-hidden="true" />
          <p className="font-body text-[11px] font-bold tracking-[0.2em] text-pop">SOLO EXHIBITION · SHIBUYA</p>
          <h2 className="mt-3 font-display text-[clamp(44px,7vw,92px)] leading-[0.9] tracking-tight">
            REVENGE
            <br />
            POP
          </h2>
          <p className="mt-4 font-body text-sm leading-relaxed text-ink/75">
            Three newly drawn key visuals, animation experiments and a room built out of her palette.
            Hz, Shibuya · 10–29 December 2022.
          </p>
          <a
            href={EXHIBITION}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-3 border-[3px] border-ink bg-pop2 px-5 py-3 font-body text-[11px] font-bold tracking-[0.16em] text-on-pop2 transition-transform duration-200 hover:-translate-y-1"
          >
            VISIT THE EXHIBITION SITE <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <span className="hidden -rotate-90 border-[3px] border-paper bg-ink px-4 py-2 font-display text-xl tracking-[0.3em] text-pop2 md:block">
          2022 / TOKYO
        </span>
      </div>
    </section>
  );
}

/* ---------------- 06 · about ---------------- */

function About() {
  return (
    <section id="about" className="relative scroll-mt-20 overflow-hidden border-t-[5px] border-ink bg-paper px-5 py-20 md:px-10 md:py-28">
      <div className="halftone pointer-events-none absolute inset-y-0 right-0 w-1/3 text-ink/10" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="reveal relative mx-auto w-full max-w-[400px]" data-reveal>
          <div className="chroma relative -rotate-2 border-[6px] border-ink bg-pop2 shadow-[16px_16px_0_var(--pop3)] transition-transform duration-500 hover:rotate-0">
            <img src="/images/mikapikazo/mikapikazo-tour.jpg" alt="Illustration from Mika Pikazo's 2020 exhibition tour" loading="lazy" className="aspect-[4/5] w-full object-cover" />
          </div>
          <div className="absolute -bottom-10 -right-4 h-32 w-32 rotate-6 border-[5px] border-ink bg-paper shadow-[8px_8px_0_var(--color-ink)] md:-right-10 md:h-40 md:w-40">
            <img src="/images/mikapikazo/artist-icon.webp" alt="Mika Pikazo's illustrated self-portrait icon" loading="lazy" className="chroma h-full w-full object-cover" />
          </div>
          <span className="absolute -left-3 -top-5 -rotate-6 border-[4px] border-ink bg-pop px-3 py-1 font-jp text-lg font-bold tracking-wide text-on-pop">
            ミカ・ピカゾ
          </span>
        </div>

        <div className="reveal pt-6 lg:pt-0" data-reveal>
          <p className="mb-4 inline-flex items-center gap-2 border-[3px] border-ink bg-pop3 px-3 py-1 font-body text-[11px] font-bold tracking-[0.2em] text-on-pop3">
            <Starburst className="h-3 w-3" points={8} inner={26} /> 06 — THE ARTIST
          </p>
          <h2 className="font-display text-[clamp(46px,8vw,116px)] leading-[0.94] tracking-tight">
            MEET <span className="text-pop stroke-ink">MIKA</span>
          </h2>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-ink/80">
            Born in Tokyo in 1993. After school she left for Brazil, drawn to South American film,
            advertising design and music, and stayed around two and a half years. She came home and
            started drawing for a living.
          </p>
          <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-ink/80">
            Since her 2015 debut she has moved between light novels, games, virtual talents, album art
            and city-sized billboards — adding animation to the mix in 2022. The constants are the
            colour and the grin.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {["TOKYO", "SINCE 2015", "ILLUSTRATION", "CHARACTER DESIGN", "ANIMATION"].map((tag) => (
              <span key={tag} className="border-[3px] border-ink px-3 py-1.5 font-body text-[10px] font-bold tracking-[0.16em]">
                {tag}
              </span>
            ))}
          </div>

          <a
            href={OFFICIAL}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-3 border-[4px] border-ink bg-pop2 px-5 py-3.5 font-body text-[12px] font-bold tracking-[0.16em] text-on-pop2 shadow-[8px_8px_0_var(--color-ink)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[12px_12px_0_var(--color-ink)]"
          >
            OFFICIAL WEBSITE <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 07 · connect ---------------- */

function Connect() {
  const widths = ["lg:w-full", "lg:w-[92%]", "lg:w-[84%]"];
  return (
    <section id="connect" className="relative scroll-mt-20 overflow-hidden border-t-[5px] border-ink bg-pop px-5 py-20 text-on-pop md:px-10 md:py-28">
      <div className="checker pointer-events-none absolute -bottom-10 -left-16 h-32 w-64 -rotate-6 text-ink/20" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2 lg:items-center">
        <div className="reveal" data-reveal>
          <p className="mb-4 inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-3 py-1 font-body text-[11px] font-bold tracking-[0.2em] text-ink">
            <Starburst className="h-3 w-3" points={8} inner={26} /> 07 — SAY HELLO
          </p>
          <h2 className="font-display text-[clamp(48px,9vw,132px)] leading-[0.92] tracking-tight">
            LET&apos;S KEEP
            <br />
            IN <span className="text-paper stroke-ink">COLOUR.</span>
          </h2>
          <p className="mt-5 max-w-md font-body text-base leading-relaxed">
            New work, works in progress and exhibition news land on her own channels first.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {socials.map((social, i) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              data-reveal
              className={`reveal group flex items-center gap-4 border-[4px] border-ink bg-ink px-5 py-5 text-paper shadow-[8px_8px_0_var(--color-ink)] transition-all duration-200 hover:-translate-y-1.5 hover:bg-paper hover:text-ink ${widths[i]}`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center border-[3px] border-paper bg-pop2 font-display text-xl text-on-pop2 transition-colors group-hover:border-ink">
                {social.kind === "instagram" ? <Camera className="h-5 w-5" aria-hidden="true" /> : social.kind === "pixiv" ? <PaletteIcon className="h-5 w-5" aria-hidden="true" /> : "X"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-2xl leading-none tracking-wide">{social.name}</span>
                <span className="mt-1 block font-body text-[11px] font-bold tracking-[0.14em] opacity-70">{social.handle}</span>
              </span>
              <ArrowUpRight className="h-6 w-6 shrink-0 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MikaPikazoPage;
