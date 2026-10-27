"use client";

import { Flame, Sparkles, Rabbit, Globe, Trophy } from "lucide-react";
import { artworks } from "@/data";
import { Reveal, SectionHeading } from "./ui";

const bySlug = (s: string) => artworks.find((a) => a.slug === s)!;

const EVENTS = [
  {
    icon: Flame,
    color: "bg-coral",
    date: "April 7–12, 2023",
    title: "The six-day song-series sprint",
    jp: "連続投稿",
    body: "In under a week, eleven ugoira go live on Pixiv: Salamander, Cinderella, Animal, Hibana, Otome Kaibou, Vampire, Parasite, Zombie — then the three-part Devil Janai Mon finale, all posted on a single day.",
    thumbs: ["salamander", "hibana", "devil-3"],
  },
  {
    icon: Sparkles,
    color: "bg-miku",
    date: "August 3, 2023",
    title: "HERO for Magical Mirai",
    jp: "マジカルミライ",
    body: "The archive's biggest swing: a 109-frame widescreen ugoira set to Ayase's HERO, the theme of Magical Mirai 2023 — Miku's yearly concert celebration.",
    thumbs: ["hero"],
  },
  {
    icon: Rabbit,
    color: "bg-magenta",
    date: "March 5–10, 2024",
    title: "Rabbit Hole & Poké Miku",
    jp: "帰還",
    body: "A comeback double-feature: a razor-fast 15-frame Rabbit Hole loop, followed five days later by a 72-frame Poké Miku for the Project VOLTAGE collaboration.",
    thumbs: ["rabbit-hole", "pokemiku"],
  },
  {
    icon: Globe,
    color: "bg-sun",
    date: "July 2024",
    title: "The portfolio goes up",
    jp: "ポートフォリオ",
    body: "sankobite.art.blog launches with a gallery of animated stickers — the DECO*27 series re-cut as transparent 512×512 stamps, ready for chats and streams.",
    thumbs: ["vampire", "animal"],
  },
  {
    icon: Trophy,
    color: "bg-miku-deep",
    date: "Ongoing",
    title: "Studio 2003, Philippines",
    jp: "活動中",
    body: "Listed in the Malikhaing Pinoy national creative directory for animation, anime illustration and animated stickers — with a 6th-place Global PIXIV Daily Ugoira ranking and a light novel in the works.",
    thumbs: ["otome-kaibou"],
  },
];

export function Timeline({ onSelectWork }: { onSelectWork?: (slugOrId: string) => void }) {
  return (
    <section id="timeline" className="relative py-20 md:py-28 halftone scroll-mt-16">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <SectionHeading kicker="HOW THE ARCHIVE GREW" title="Frame by Frame" jp="年表" />

        <ol className="relative border-l-[3px] border-ink ml-4 md:ml-8 space-y-12">
          {EVENTS.map((e, i) => (
            <li key={e.title} className="relative pl-8 md:pl-12">
              <span
                className={`absolute -left-[22px] top-0 w-10 h-10 grid place-items-center border-[3px] border-ink ${e.color} shadow-[3px_3px_0_rgba(38,49,63,0.9)]`}
              >
                <e.icon className={`w-5 h-5 ${e.color === "bg-miku-deep" ? "text-paper" : "text-ink"}`} aria-hidden />
              </span>
              <Reveal delay={i * 60}>
                <p className="font-dot text-xs md:text-sm tracking-[0.2em] text-magenta-deep">{e.date} · {e.jp}</p>
                <h3 className="font-display text-xl md:text-2xl mt-1.5">{e.title}</h3>
                <p className="mt-2.5 max-w-2xl font-medium text-ink-soft leading-relaxed text-sm md:text-base">{e.body}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {e.thumbs.map((s, j) => {
                    const a = bySlug(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => onSelectWork?.(a.id)}
                        title={`Open ${a.titleJp} (${a.titleEn})`}
                        className="cursor-pointer focus-visible:outline-4 focus-visible:outline-magenta"
                      >
                        <img
                          src={a.src}
                          alt={`${a.titleJp} thumbnail`}
                          loading="lazy"
                          className={`${a.wide ? "w-32 md:w-44" : "w-16 md:w-20"} h-16 md:h-20 object-cover border-[3px] border-ink bg-slate-frame shadow-[3px_3px_0_rgba(38,49,63,0.8)] hover-wiggle`}
                          style={{ transform: `rotate(${j % 2 ? 2 : -2}deg)` }}
                        />
                      </button>
                    );
                  })}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
