import { useEffect, useRef, useState } from "react";
import { art, sourceHref, sourceLabel } from "@/components/archive/kaduise/lib/art";
import { ALL_WORKS, displayTitle } from "@/components/archive/kaduise/data/works";
import { IconExternal, Reveal, Sparkle, Squiggle, Star4 } from "@/components/archive/kaduise/components/ui";
import { cn } from "@/utils/cn";

const PICKS = [
  {
    k: "px151457717",
    label: "30 Oct 2026",
    head: "Up on the footbridge, with a red guitar",
    body: "A station overpass: round up-and-down arrow signs, green mesh fencing, a barefoot girl, a red Jaguar slung over her shoulder. The city is drawn and coloured like a photograph — and she is still left in grey. In 2026 it's the background that gets to have the colour.",
  },
  {
    k: "px151422265",
    label: "29 Oct 2026",
    head: "Convenience store light, payphone, far too much gear",
    body: "An AED sign, a rice-ball poster, a Wi-Fi sticker — the most ordinary shopfront in Japan. In front of it: amp, pedals, keyboard, and a gold Telecaster being played at full tilt. The best sound anyone never heard.",
  },
  {
    k: "px151311318",
    label: "26 Oct 2026",
    head: "Asleep on the record",
    body: "A turntable seen from directly above. The girl lies across the black disc while the tonearm crosses her body, and the label reads, in handwriting, “It's no use crying over spilt milk.” A picture about only being able to rest on something that keeps turning.",
  },
  {
    k: "music",
    label: "11 Oct 2026",
    head: "Music has been saving me all along",
    body: "Tape pulled from a cassette and wound around a girl until she can't move. This is the post pinned to the top of her profile — 19,906 likes. Being saved by something you love usually looks about this uncomfortable.",
  },
  {
    k: "ikite",
    label: "18 Nov 2024",
    head: "Live",
    body: "The picture that travelled furthest. At Design Festa, more than 400 originals found owners in a single day, and she painted the same word live on the wall: there are still infinite stars to catch, so we can keep reaching — so, live.",
  },
];

export function Featured() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const o = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.i);
            if (!Number.isNaN(i)) setActive(i);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    refs.current.forEach((el) => el && o.observe(el));
    return () => o.disconnect();
  }, []);

  const cur = PICKS[active] ?? PICKS[0];
  const work = ALL_WORKS.find((w) => w.k === cur.k)!;

  return (
    <section
      id="featured"
      className="relative scroll-mt-16 overflow-hidden border-t-[2px] border-ink bg-ink text-paper"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.09]">
        <div className="absolute inset-0 hatch" />
      </div>
      <Sparkle className="pointer-events-none absolute left-[7vw] top-24 h-5 w-5 text-mustard/70 animate-twinkle" />
      <Star4
        className="pointer-events-none absolute right-[10vw] bottom-32 h-7 w-7 text-orange/60 animate-twinkle"
        style={{ animationDelay: "1.4s" }}
      />

      <div className="mx-auto max-w-[1560px] px-4 py-20 sm:px-7 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-paper/25 pb-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-paper/55">
              03 — reading five pictures
            </p>
            <h2 className="mt-2 font-display text-[12vw] leading-[0.9] sm:text-[7vw] lg:text-[5.2vw]">
              Five, read slowly
            </h2>
          </div>
          <p className="max-w-[40ch] text-[13px] leading-[1.95] text-paper/65">
            The picture on the left changes as you scroll. Five of them, looked at properly.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              <div className="relative border-[2px] border-paper/70 bg-paper p-2 shadow-[14px_16px_0_rgba(239,235,225,0.09)]">
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-paper-2">
                  {PICKS.map((p, i) => (
                    <img
                      key={p.k}
                      src={art(p.k)}
                      alt={p.head}
                      loading={i === 0 ? "eager" : "lazy"}
                      className={cn(
                        "absolute inset-0 h-full w-full object-contain transition-[opacity,transform] duration-[900ms] ease-out",
                        i === active ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]",
                      )}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 px-1 pb-0.5 pt-2 text-ink">
                  <p className="font-display text-[15px] sm:text-[18px]">
                    {displayTitle(work)}
                    {work.title && (
                      <span lang="ja" className="ml-2 text-[12px] font-normal text-ash">
                        {work.title}
                      </span>
                    )}
                  </p>
                  <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">{cur.label}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                {PICKS.map((p, i) => (
                  <span
                    key={p.k}
                    className={cn(
                      "h-[2px] flex-1 transition-colors duration-500",
                      i <= active ? "bg-mustard" : "bg-paper/20",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            {PICKS.map((p, i) => {
              const w = ALL_WORKS.find((x) => x.k === p.k)!;
              return (
                <div
                  key={p.k}
                  data-i={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  className={cn(
                    "border-l-2 py-10 pl-6 transition-all duration-500 lg:py-16 lg:pl-8",
                    i === active ? "border-mustard opacity-100" : "border-paper/20 opacity-45",
                  )}
                >
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-paper/55">
                    {String(i + 1).padStart(2, "0")} — {p.label} —{" "}
                    {w.fav ? `${w.fav.toLocaleString()} likes` : sourceLabel(w.via)}
                  </p>
                  <h3 className="mt-3 font-display text-[23px] leading-[1.3] sm:text-[29px]">{p.head}</h3>
                  <Squiggle
                    className={cn("mt-3 h-3 w-36 transition-colors", i === active ? "text-mustard" : "text-paper/30")}
                  />
                  <p className="mt-4 text-[14px] leading-[2.05] text-paper/80">{p.body}</p>
                  <a
                    href={sourceHref(w)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 border-b border-paper/40 pb-1 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-colors hover:border-mustard hover:text-mustard"
                  >
                    view on {sourceLabel(w.via)} <IconExternal className="h-3.5 w-3.5" />
                  </a>
                </div>
              );
            })}

            <Reveal className="mt-10 border border-paper/25 bg-paper/[0.04] p-6">
              <p className="font-hand text-[17px] leading-relaxed text-mustard">
                “There is no picture only I can draw. But there are pictures I want to draw.”
              </p>
              <p lang="ja" className="mt-2.5 text-[12px] leading-relaxed text-paper/55">
                私にしか描けない絵なんてない。でも、私には描きたい絵がある。
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/45">
                from a monthly round-up post
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
