import { useMemo, useState } from "react";
import { art, sourceHref, sourceLabel } from "@/components/archive/kaduise/lib/art";
import { ALL_WORKS, SERVICES, WORDS, displayTitle } from "@/components/archive/kaduise/data/works";
import {
  IconExternal,
  IconHeart,
  IconIg,
  IconThreads,
  IconX,
  Reveal,
  Signature,
  Sparkle,
  Squiggle,
  Star4,
} from "@/components/archive/kaduise/components/ui";
import { cn } from "@/utils/cn";

function shuffle<T>(a: T[]) {
  return [...a].sort(() => Math.random() - 0.5);
}

export function Log() {
  const recent = useMemo(
    () => ALL_WORKS.filter((w) => w.fav).sort((a, b) => (a.d < b.d ? 1 : -1)).slice(0, 9),
    [],
  );
  const [seed, setSeed] = useState(0);
  const rand = useMemo(() => {
    if (seed === 0) return ALL_WORKS[0];
    return ALL_WORKS[Math.floor(Math.random() * ALL_WORKS.length)];
  }, [seed]);

  return (
    <section id="log" className="relative scroll-mt-16 overflow-hidden border-t-[2px] border-ink bg-paper py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-full w-px bg-ink/10" />
        <Sparkle className="absolute left-[5vw] top-[10vh] h-5 w-5 text-teal animate-twinkle" />
      </div>

      <div className="mx-auto max-w-[1560px] px-4 sm:px-7">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b-[2px] border-ink pb-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-soft">07 — recent posts</p>
            <h2 className="mt-2 font-display text-[12vw] leading-[0.9] tracking-tight sm:text-[7vw] lg:text-[5.2vw]">
              Lately
              <br className="sm:hidden" /> on X
            </h2>
          </div>
          <a
            href="https://x.com/kaduise"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border-[1.5px] border-ink px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
          >
            follow @kaduise <IconExternal className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* ledger of posts */}
          <div className="lg:col-span-7">
            <ul>
              {recent.map((w, i) => (
                <Reveal key={w.k} as="li" delay={i * 55} className="list-none">
                  <a
                    href={sourceHref(w)}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-4 border-b-[1.5px] border-ink/20 py-4 transition-colors hover:border-ink"
                  >
                    <span className="w-10 shrink-0 font-mono text-[11px] tabular-nums text-ash">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="h-14 w-20 shrink-0 overflow-hidden border-[1.5px] border-ink/70 bg-paper-2">
                      <img
                        src={art(w.k)}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[16px] transition-colors group-hover:text-orange sm:text-[18px]">
                        {displayTitle(w)}
                      </span>
                      <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
                        {w.d} · {w.tags.join(" · ")}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-ink-soft">
                      <IconHeart className="h-3.5 w-3.5 text-red" />
                      {(w.fav ?? 0).toLocaleString()}
                    </span>
                    <IconExternal className="h-4 w-4 shrink-0 -translate-x-1 text-ink opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </a>
                </Reveal>
              ))}
            </ul>
            <p className="mt-5 text-[12px] leading-[1.9] text-ash">
              The nine most recent X posts collected here. Click a row to open the original, with its image,
              likes and replies. The 2026 dailies live up in{" "}
              <a href="#daily" className="link-u font-bold text-ink">A drawing, most nights at eight</a>.
            </p>
          </div>

          {/* random + cadence card */}
          <div className="lg:col-span-5">
            <Reveal delay={80}>
              <div className="border-[2px] border-ink bg-paper-2 p-6 ink-shadow-soft">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ash">draw again — pot luck</p>
                <h3 className="mt-2 font-display text-[22px] leading-tight">Turn over any one of them.</h3>
                <div className="relative mt-5 aspect-[3/2] w-full overflow-hidden border-[1.5px] border-ink bg-paper">
                  <img key={rand.k} src={art(rand.k)} alt={rand.title} className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-2 bg-ink/80 px-3 py-2 font-display text-[14px] text-paper">
                    {displayTitle(rand)}
                    <span className="font-mono text-[10px] tracking-[0.14em] text-paper/70">{rand.d}</span>
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setSeed((s) => s + 1)}
                    className="flex-1 border-[1.5px] border-ink bg-ink px-4 py-2.5 text-[13px] font-bold text-paper transition-all hover:-translate-y-0.5 hover:bg-orange hover:border-ink"
                  >
                    Shuffle again
                  </button>
                  <a
                    href={sourceHref(rand)}
                    target="_blank"
                    rel="noreferrer"
                    className="border-[1.5px] border-ink px-4 py-2.5 text-[13px] font-bold transition-colors hover:bg-ink hover:text-paper"
                  >
                    View on {sourceLabel(rand.via)}
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={160} className="mt-6 border-[1.5px] border-ink/45 bg-paper p-6">
              <div className="flex items-start justify-between gap-4">
                <h4 className="font-display text-[18px]">How often</h4>
                <Star4 className="h-5 w-5 shrink-0 text-mustard animate-twinkle" />
              </div>
              <p className="mt-3 text-[13px] leading-[1.95] text-ink-soft">
                178 days straight at the longest. Around 30 pictures a month through 2026, 85% of them going
                up in the 8pm hour. There are still days off, and she admits to them. The talent question and
                the dream question both get worked out in public, in the captions.
              </p>
              <Squiggle className="mt-4 h-2.5 w-32 text-teal" />
              <p className="mt-4 font-hand text-[14.5px] leading-relaxed text-ink-soft">
                “I forgot to post yesterday.
                <br />
                If only the bad things could be forgotten that easily.”
              </p>
              <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ash">from a monthly round-up post</p>
            </Reveal>
          </div>
        </div>

        {/* ------------------------------------------- events & goods */}
        <div className="mt-24 grid grid-cols-1 gap-px bg-ink/15 lg:grid-cols-3">
          <Reveal className="bg-paper p-6">
            <img
              src={art("booth")}
              alt="kaduise's table at Design Festa"
              loading="lazy"
              className="aspect-[4/3] w-full border-[1.5px] border-ink object-cover grayscale transition-all duration-700 hover:grayscale-0"
            />
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-orange">design festa · comitia</p>
            <h3 className="mt-1.5 font-display text-[19px]">The originals leave the room.</h3>
            <p className="mt-2.5 text-[13px] leading-[1.9] text-ink-soft">
              The drawings she actually used get sold at events. At Design Festa 60 more than 400 of them
              were laid out, and every one found an owner. On the evening of day one she posted: “I'll finish
              it tomorrow.”
            </p>
          </Reveal>

          <Reveal delay={90} className="bg-paper p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">on the table — what she sells</p>
            <ul className="mt-4 space-y-3">
              {[
                ["Originals", "the used drawings, one of a kind"],
                ["Zines & picture books", "printed and bound by hand"],
                ["Stickers", "including “Coffin Nail”"],
                ["Goods", "shirts and printed things"],
                ["Live painting", "on site, in front of people"],
              ].map(([jp, en]) => (
                <li key={jp} className="group flex items-baseline justify-between gap-3 border-b border-dashed border-ink/25 pb-2.5">
                  <span className="text-[15px] font-bold transition-transform duration-300 group-hover:translate-x-1">{jp}</span>
                  <span className="text-right font-mono text-[9.5px] uppercase tracking-[0.12em] text-ash">{en}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12px] leading-[1.85] text-ink-soft">
              Less a mail-order operation than an event-and-timeline one. Announcements almost always land
              on X first.
            </p>
          </Reveal>

          <Reveal delay={180} className="relative overflow-hidden bg-ink p-6 text-paper">
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.12] hatch" />
            <p className="relative font-mono text-[10px] uppercase tracking-[0.2em] text-paper/55">gallery</p>
            <h3 className="relative mt-1.5 font-display text-[19px]">On walls around Osaka.</h3>
            <p className="relative mt-2.5 text-[13px] leading-[1.9] text-paper/75">
              She shows regularly in galleries around Osaka. Nothing here is allowed to stay purely digital —
              paper, ink, and people going back and forth in a room.
            </p>
            <div className="relative mt-6 space-y-2">
              {WORDS.slice(2, 5).map((w) => (
                <p key={w.jp} className="font-hand text-[14px] leading-relaxed text-mustard">
                  “{w.en}”
                </p>
              ))}
            </div>
            <Sparkle className="absolute bottom-5 right-5 h-6 w-6 text-orange/70 animate-twinkle" />
          </Reveal>
        </div>

        {/* ------------------------------------------------ contact */}
        <div id="contact" className="mt-24 scroll-mt-20 overflow-hidden border-[2px] border-ink bg-ink text-paper">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="relative p-7 sm:p-10 lg:col-span-7">
              <div aria-hidden className="pointer-events-none absolute inset-0 hatch opacity-[0.14]" />
              <p className="relative font-mono text-[11px] uppercase tracking-[0.3em] text-paper/55">08 — contact</p>
              <h2 className="relative mt-3 font-display text-[11vw] leading-[0.92] sm:text-[6vw] lg:text-[4.6vw]">
                Commissioning her
              </h2>
              <p className="relative mt-5 max-w-[48ch] text-[13.5px] leading-[2] text-paper/75">
                Enquiries go through DMs on X or Instagram. Personal or commercial, album art or sticker sets
                or picture books or a wall painted in front of an audience — all of it starts from the same
                shaky pen line.
              </p>
              <div className="relative mt-8 flex flex-wrap gap-2.5">
                {[
                  { i: IconX, l: "X / DM", h: "https://x.com/kaduise" },
                  { i: IconIg, l: "Instagram", h: "https://www.instagram.com/kaduise_" },
                  { i: IconThreads, l: "Threads", h: "https://www.threads.net/@kaduise_" },
                ].map(({ i: Ico, l, h }) => (
                  <a
                    key={l}
                    href={h}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2.5 border-[1.5px] border-paper/45 px-5 py-3 text-[13px] font-bold transition-all hover:-translate-y-1 hover:border-mustard hover:bg-mustard hover:text-ink"
                  >
                    <Ico className="h-4 w-4" />
                    {l}
                    <IconExternal className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                ))}
              </div>
              <Signature className="relative mt-10 h-12 w-36 text-paper/45" />
            </div>

            <div className="border-t-[1.5px] border-paper/25 p-7 sm:p-10 lg:col-span-5 lg:border-l-[1.5px] lg:border-t-0">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-paper/55">works accepted</p>
              <ul className="mt-5 space-y-0.5">
                {SERVICES.map((s, i) => (
                  <li
                    key={s.en}
                    className={cn(
                      "group flex items-baseline justify-between gap-4 border-b border-paper/15 py-3.5 transition-colors hover:text-mustard",
                    )}
                  >
                    <span className="text-[14px] font-bold">
                      <span className="mr-3 font-mono text-[10px] text-paper/40 group-hover:text-mustard">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.en}
                    </span>
                    <span lang="ja" className="hidden shrink-0 text-[11px] text-paper/40 sm:block">{s.jp}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 border border-mustard/45 bg-mustard/10 p-4">
                <p className="text-[12px] leading-[1.9] text-paper/80">
                  All artwork is © kaduise. This is an unofficial fan page made to introduce the work; every
                  image is shown with a link back to the post it came from. Please don't repost or reuse the
                  drawings without permission.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* words */}
        <div className="mt-16 grid grid-cols-1 gap-px bg-ink/15 sm:grid-cols-2 lg:grid-cols-3">
          {WORDS.slice(1).map((w, i) => (
            <Reveal key={w.jp} delay={i * 90} className="bg-paper p-6">
              <p className="font-hand text-[16px] leading-[1.85]">“{w.en}”</p>
              <p className="mt-3 text-[11px] leading-[1.7] text-ash">{w.en}</p>
              <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.18em] text-orange">{w.from}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- footer */
export function Footer() {
  const years = "2019 — now";
  return (
    <footer className="relative overflow-hidden border-t-[2px] border-ink bg-paper-2 pb-8 pt-14">
      <div className="mx-auto max-w-[1560px] px-4 sm:px-7">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="font-display text-[13vw] leading-[0.8] tracking-[-0.02em] sm:text-[6vw]">kaduise</p>
            <p lang="ja" className="mt-2 font-display text-[4.5vw] leading-none text-ink-soft sm:text-[2vw]">かづいせ</p>
            <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.24em] text-ash">
              illustrator in osaka · {years}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex gap-2">
              {[
                { i: IconX, h: "https://x.com/kaduise", l: "X" },
                { i: IconIg, h: "https://www.instagram.com/kaduise_", l: "Instagram" },
                { i: IconThreads, h: "https://www.threads.net/@kaduise_", l: "Threads" },
                { i: IconExternal, h: "https://www.pixiv.net/users/1031168", l: "pixiv" },
                { i: IconExternal, h: "https://www.lancers.jp/profile/kaduise", l: "Lancers" },
              ].map(({ i: Ico, h, l }) => (
                <a
                  key={l}
                  href={h}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={l}
                  className="flex h-9 items-center gap-2 border-[1.5px] border-ink/50 px-3 text-[11px] transition-all hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-paper"
                >
                  <Ico className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{l}</span>
                </a>
              ))}
            </div>
            <a href="#top" className="group inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-soft hover:text-ink">
              <span className="inline-block transition-transform duration-300 group-hover:-translate-y-1">↑</span> back to top
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t-[1.5px] border-ink/25 pt-5 text-[11px] text-ash">
          <p>
            Images from kaduise's own posts on X (@kaduise) and pixiv. All artwork © kaduise.
          </p>
          <p className="font-mono uppercase tracking-[0.18em]">unofficial fan archive</p>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none mt-8 select-none text-center font-display text-[11vw] leading-[0.78] text-ink/[0.07]"
      >
        everything for the sake of a girl
      </div>
    </footer>
  );
}
