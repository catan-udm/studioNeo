"use client";

import { ExternalLink, Film, Maximize2, Timer, Trophy } from "lucide-react";
import { artworks, pixivArt, links } from "@/data";
import { Reveal, SectionHeading, CrossMark } from "./ui";

export function Featured({ onSelectWork }: { onSelectWork?: (slugOrId: string) => void }) {
  const hero = artworks.find((a) => a.slug === "hero")!;
  const poke = artworks.find((a) => a.slug === "pokemiku")!;

  return (
    <section id="featured" className="relative bg-slate-deep halftone-light py-20 md:py-28 border-y-[3px] border-ink scroll-mt-16 overflow-hidden">
      <CrossMark className="absolute top-16 right-[10%] text-miku/40 w-8 h-8" />
      <CrossMark className="absolute bottom-20 left-[6%] text-magenta/40 w-6 h-6" />

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading dark kicker="SPOTLIGHT — THE BIG ONE" title="109 Frames of HERO" jp="マジカルミライ2023" />

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8 items-stretch">
          <Reveal>
            <figure className="sticker rounded-xl overflow-hidden rotate-[-0.6deg]">
              <button
                type="button"
                onClick={() => onSelectWork?.(hero.id)}
                className="relative block w-full group text-left cursor-pointer"
                aria-label="Inspect HERO 109-frame loop in viewer"
              >
                <img
                  src={hero.src}
                  alt="HERO — Magical Mirai 2023 themed widescreen ugoira of Hatsune Miku by sankobite"
                  className="w-full aspect-[2/1] object-cover bg-slate-frame"
                />
                <span className="absolute inset-0 grid place-items-center bg-ink/0 group-hover:bg-ink/25 transition-colors">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-paper border-[3px] border-ink px-3.5 py-2 font-display uppercase text-xs inline-flex items-center gap-1.5 shadow-[3px_3px_0_rgba(38,49,63,0.9)]">
                    <Maximize2 className="w-3.5 h-3.5" aria-hidden /> Inspect 109-cel loop
                  </span>
                </span>
              </button>
              <figcaption className="bg-white border-t-[3px] border-ink px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-1">
                <span className="font-display uppercase text-sm">HERO / Ayase (YOASOBI)</span>
                <span className="font-dot text-xs text-ink-soft inline-flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-miku-deep" aria-hidden /> 109 frames
                </span>
                <span className="font-dot text-xs text-ink-soft inline-flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-magenta-deep" aria-hidden /> 2.27 s loop
                </span>
                <a
                  href={pixivArt(hero.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1.5 font-bold text-sm text-miku-deep hover:text-magenta-deep transition-colors"
                >
                  Pixiv <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                </a>
              </figcaption>
            </figure>
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal delay={120}>
              <div className="bg-paper border-[3px] border-ink p-6 shadow-[6px_6px_0_var(--color-magenta)] rotate-[0.8deg]">
                <p className="font-dot text-xs tracking-[0.2em] text-magenta-deep mb-2">▸ WHY IT MATTERS</p>
                <p className="font-medium leading-relaxed text-ink-soft">
                  Posted August 3, 2023 for <strong className="text-ink">Magical Mirai 2023</strong>, HERO breaks out of the
                  512×512 sticker box into full widescreen — over a hundred individually drawn frames of Miku giving
                  everything to the stage. It&apos;s the most labor-intensive loop in sankobite&apos;s public archive.
                </p>
              </div>
            </Reveal>

            <Reveal delay={220} className="flex-1">
              <div className="h-full bg-paper border-[3px] border-ink p-5 shadow-[6px_6px_0_var(--color-miku)] rotate-[-0.8deg] flex gap-4 items-center">
                <button
                  type="button"
                  onClick={() => onSelectWork?.(poke.id)}
                  className="shrink-0 relative group cursor-pointer"
                  aria-label="Inspect Poké Miku in viewer"
                >
                  <img
                    src={poke.src}
                    alt="Poké Miku — Project VOLTAGE ugoira by sankobite"
                    className="w-28 h-28 md:w-32 md:h-32 object-cover border-[3px] border-ink bg-slate-frame group-hover:scale-105 transition-transform"
                  />
                </button>
                <div>
                  <p className="font-dot text-[11px] tracking-[0.2em] text-miku-deep mb-1">▸ ALSO FEATURED</p>
                  <h3 className="font-display text-lg leading-tight">ポケミク / Poké Miku</h3>
                  <p className="text-sm font-medium text-ink-soft mt-1.5 leading-snug">
                    72 frames for Project VOLTAGE, the Pokémon × Miku crossover —{" "}
                    <button
                      type="button"
                      onClick={() => onSelectWork?.(poke.id)}
                      className="text-miku-deep font-bold hover:underline mr-2 cursor-pointer"
                    >
                      open loop
                    </button>
                    or{" "}
                    <a href={pixivArt(poke.id)} target="_blank" rel="noreferrer" className="text-magenta-deep font-bold hover:underline">
                      see it on Pixiv
                    </a>.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={150} className="mt-10">
          <div className="flex flex-wrap items-center gap-4 bg-sun border-[3px] border-ink px-5 py-4 shadow-[5px_5px_0_rgba(0,0,0,0.4)] rotate-[-0.4deg]">
            <Trophy className="w-7 h-7 text-ink shrink-0" aria-hidden />
            <p className="font-bold text-sm md:text-base">
              Ranked <span className="font-display">6th place — Global PIXIV Daily Ugoira</span>, as listed in the
              Malikhaing Pinoy creative directory under Studio 2003.
            </p>
            <a
              href={links.studio}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 font-display uppercase text-xs bg-ink text-paper px-3.5 py-2 hover:bg-magenta-deep transition-colors"
            >
              Directory <ExternalLink className="w-3.5 h-3.5" aria-hidden />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
