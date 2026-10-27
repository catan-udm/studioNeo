"use client";

import Link from "next/link";
import { AtSign, SquarePlay, Camera, Palette, Globe, MapPin, BookOpen, Users, ExternalLink, Quote, Mail, Upload } from "lucide-react";
import { avatar, links } from "@/data";
import { Reveal, SectionHeading } from "./ui";

const SOCIALS = [
  { icon: Palette, label: "Pixiv", handle: "sankobite · ID 92602222", href: links.pixiv, bg: "bg-miku" },
  { icon: AtSign, label: "X / Twitter", handle: "@sankobite", href: links.x, bg: "bg-white" },
  { icon: SquarePlay, label: "YouTube", handle: "@sankobite", href: links.youtube, bg: "bg-coral" },
  { icon: Camera, label: "Instagram", handle: "@sankobite", href: links.instagram, bg: "bg-magenta" },
  { icon: Globe, label: "Portfolio", handle: "sankobite.art.blog", href: links.blog, bg: "bg-sun" },
];

export function About() {
  return (
    <section id="about" className="relative py-20 md:py-28 grid-paper border-t-[3px] border-ink scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading kicker="THE ARTIST BEHIND THE LOOPS" title="About sankobite" jp="紹介" />

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-14 items-start">
          {/* portrait card */}
          <Reveal>
            <div className="sticker cutline rounded-xl overflow-hidden rotate-[-1.2deg] max-w-sm">
              <img src={avatar} alt="sankobite's self-portrait — chibi line-art avatar" className="w-full aspect-square object-cover bg-white" />
              <div className="border-t-[3px] border-ink bg-white px-5 py-4">
                <p className="font-display uppercase text-lg">sankobite</p>
                <p className="font-dot text-xs text-ink-soft mt-1">self-portrait · from the official site</p>
                <p className="mt-2.5 inline-flex items-center gap-1.5 font-bold text-sm text-miku-deep">
                  <MapPin className="w-4 h-4" aria-hidden /> Philippines · Studio 2003
                </p>
              </div>
            </div>

            <div className="mt-6 max-w-sm grid gap-2.5">
              <Link
                href="/contact?topic=commission"
                className="flex items-center justify-center gap-2 bg-magenta text-white font-display uppercase text-xs px-4 py-3 border-[3px] border-ink shadow-[4px_4px_0_var(--color-ink)] hover:shadow-[2px_2px_0_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <Mail className="w-4 h-4" aria-hidden /> Commission &amp; Studio Inquiry
              </Link>
              <Link
                href="/studio/upload"
                className="flex items-center justify-center gap-2 bg-white text-ink font-display uppercase text-xs px-4 py-3 border-[3px] border-ink shadow-[4px_4px_0_var(--color-miku)] hover:shadow-[2px_2px_0_var(--color-miku)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <Upload className="w-4 h-4 text-miku-deep" aria-hidden /> Creator Upload Studio
              </Link>
            </div>
          </Reveal>

          <div>
            <Reveal delay={100}>
              <blockquote className="relative bg-white border-[3px] border-ink p-6 md:p-7 shadow-[6px_6px_0_var(--color-miku)]">
                <Quote className="absolute -top-4 -left-3 w-9 h-9 p-1.5 bg-magenta text-white border-[3px] border-ink" aria-hidden />
                <p className="font-medium text-base md:text-lg leading-relaxed">
                  “I work as an illustrator, animator and sticker maker, and I also write one-shots and stories.
                  I plan to publish a light novel in the near future.”
                </p>
                <footer className="mt-3 font-dot text-xs text-ink-soft">
                  — sankobite, from the front page of sankobite.art.blog (translated from Japanese)
                </footer>
              </blockquote>
            </Reveal>

            <Reveal delay={180} className="mt-7 grid sm:grid-cols-2 gap-4">
              <div className="border-[3px] border-ink bg-paper-2 p-5">
                <p className="flex items-center gap-2 font-display uppercase text-sm">
                  <Users className="w-4 h-4 text-magenta-deep" aria-hidden /> Studio 2003
                </p>
                <p className="mt-2 text-sm font-medium text-ink-soft leading-relaxed">
                  The studio name sankobite creates under — animation, anime illustration and animated stickers —
                  registered in the Malikhaing Pinoy Philippine creative directory, with a collaboration credit to
                  half-eaten melonbread (Carl Adrian A. Tan).
                </p>
              </div>
              <div className="border-[3px] border-ink bg-paper-2 p-5">
                <p className="flex items-center gap-2 font-display uppercase text-sm">
                  <BookOpen className="w-4 h-4 text-miku-deep" aria-hidden /> Beyond the loops
                </p>
                <p className="mt-2 text-sm font-medium text-ink-soft leading-relaxed">
                  Not just an animator: sankobite writes one-shots and short stories, and has announced plans to
                  release a light novel — keep an eye on the official blog for the first volume.
                </p>
              </div>
            </Reveal>

            <Reveal delay={240} className="mt-7">
              <p className="font-dot text-xs tracking-[0.25em] text-magenta-deep mb-3">▸ FOLLOW THE ARTIST — SUPPORT THE ORIGINAL</p>
              <ul className="grid sm:grid-cols-2 gap-3">
                {SOCIALS.map(({ icon: Icon, label, handle, href, bg }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3 border-[3px] border-ink bg-white px-4 py-3 shadow-[3px_3px_0_rgba(38,49,63,0.3)] hover:shadow-[4px_4px_0_var(--color-ink)] hover:-translate-y-0.5 transition-all"
                    >
                      <span className={`w-9 h-9 grid place-items-center border-2 border-ink ${bg} shrink-0`}>
                        <Icon className={`w-4.5 h-4.5 ${bg === "bg-magenta" || bg === "bg-coral" ? "text-white" : "text-ink"}`} aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-bold text-sm">{label}</span>
                        <span className="block font-dot text-[11px] text-ink-soft truncate">{handle}</span>
                      </span>
                      <ExternalLink className="w-4 h-4 ml-auto text-ink-soft group-hover:text-magenta-deep transition-colors shrink-0" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
