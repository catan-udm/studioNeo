import { useEffect, useRef, useState } from "react";
import { art } from "@/components/archive/kaduise/lib/art";
import { PALETTE, TIMELINE, WORDS } from "@/components/archive/kaduise/data/works";
import { IconIg, IconThreads, IconX, Marquee, Reveal, Signature, Squiggle, Star4 } from "@/components/archive/kaduise/components/ui";
import { cn } from "@/utils/cn";

/* count-up numbers, triggered when in view */
function useCount(target: number, run: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const dur = 1500;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return v;
}

const FACTS: { label: string; n: number; suf: string }[] = [
  { label: "pictures on pixiv", n: 671, suf: "" },
  { label: "drawn during 2026", n: 298, suf: "" },
  { label: "followers on X", n: 15900, suf: "" },
  { label: "originals sold at Design Festa 60", n: 400, suf: "+" },
];

function Stat({ label, n, suf, run }: { label: string; n: number; suf: string; run: boolean }) {
  const v = useCount(n, run);
  return (
    <div className="border-t-[1.5px] border-ink/25 pt-3">
      <p className="font-display text-[30px] leading-none tabular-nums sm:text-[38px]">
        {v.toLocaleString()}
        <span className="ml-0.5 font-body text-[18px] font-bold text-ink-soft">{suf}</span>
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-ash">{label}</p>
    </div>
  );
}

export function About() {
  const box = useRef<HTMLDivElement | null>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el || !("IntersectionObserver" in window)) {
      setRun(true);
      return;
    }
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          o.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);

  return (
    <section
      id="about"
      className="relative scroll-mt-16 overflow-hidden border-t-[2px] border-ink bg-paper py-20 sm:py-28"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[-4vw] top-[6vh] h-[38vh] w-[36vw] rounded-full border-[1.5px] border-ink/10" />
        <div className="absolute right-[2vw] top-[12vh] h-[24vh] w-[22vw] rounded-full border-[1.5px] border-ink/[0.07]" />
        <Star4 className="absolute left-[4vw] top-[18vh] h-6 w-6 text-mustard animate-twinkle" />
      </div>

      <div className="mx-auto max-w-[1560px] px-4 sm:px-7">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* ------------------------------------------- portrait card */}
          <div className="lg:col-span-5">
            <Reveal kind="rv-x">
              <div className="relative w-[min(100%,420px)] -rotate-[1.4deg] border-[2px] border-ink bg-paper p-2.5 ink-shadow">
                <span className="tape absolute -top-3 left-[54%] h-7 w-20 rotate-[7deg]" />
                <img
                  src={art("icon_400x400")}
                  alt="kaduise's avatar, drawn by @miminonaineko"
                  className="aspect-square w-full border-[1.5px] border-ink/60 object-cover"
                />
                <div className="px-1 pb-1 pt-3">
                  <p className="font-display text-[20px]">
                    kaduise <span lang="ja" className="ml-1 text-[13px] font-normal text-ash">かづいせ</span>
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                    illustrator · osaka · since 2019
                  </p>
                  <p className="mt-3 text-[12.5px] leading-[1.9] text-ink-soft">
                    The avatar isn't a photograph — it was drawn by{" "}
                    <a
                      href="https://x.com/miminonaineko"
                      target="_blank"
                      rel="noreferrer"
                      className="link-u font-bold text-ink hover:text-orange"
                    >
                      @miminonaineko
                    </a>
                    . Standing behind someone else's drawing of you runs at about the same temperature as the
                    work itself.
                  </p>
                  <div className="mt-4 flex gap-2">
                    {[
                      { i: IconX, h: "https://x.com/kaduise", l: "X" },
                      { i: IconIg, h: "https://www.instagram.com/kaduise_", l: "IG" },
                      { i: IconThreads, h: "https://www.threads.net/@kaduise_", l: "TH" },
                    ].map(({ i: Ico, h, l }) => (
                      <a
                        key={l}
                        href={h}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-8 flex-1 items-center justify-center gap-1.5 border-[1.5px] border-ink/40 text-[11px] transition-all hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-paper"
                      >
                        <Ico className="h-3.5 w-3.5" /> {l}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <div ref={box} className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6">
              {FACTS.map((f, i) => (
                <Reveal key={f.label} delay={i * 90}>
                  <Stat {...f} run={run} />
                </Reveal>
              ))}
            </div>
          </div>

          {/* -------------------------------------------------- text */}
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-soft">04 — about</p>
            <h2 className="mt-2 font-display text-[12vw] leading-[0.88] tracking-tight sm:text-[6.6vw] lg:text-[5vw]">
              Someone who
              <br />
              draws every day
            </h2>
            <Squiggle className="mt-4 h-3 w-52 text-orange" />

            <div className="mt-7 space-y-5 text-[14.5px] leading-[2.1] sm:text-[15.5px]">
              <Reveal delay={60}>
                <p>
                  Nine years as a licensed nursery teacher, sitting next to children who draw without
                  hesitating, and then in 2019 she started putting her own drawings online. These days she
                  runs a bar in Osaka and still uploads a picture most nights around eight — 298 of them in
                  2026 so far, 671 on pixiv all told.
                </p>
              </Reveal>
              <Reveal delay={120}>
                <p>
                  Everything begins as a pen line on paper. It gets scanned, then coloured on a screen, but no
                  shadow is ever painted in. The early pictures were little more than white paper and grey;
                  lately footbridges, payphones and convenience-store light have crept into the background —
                  and the figure is still left grey in the middle of it. The physical originals don't stay:
                  they're sold off at events and exhibitions.
                </p>
              </Reveal>
              <Reveal delay={180}>
                <p className="border-l-[3px] border-mustard pl-4 font-hand text-[15.5px] leading-[1.95] text-ink-soft">
                  Winner of the 2nd WEGO After-School Art Club competition. She paints live, too. At Design
                  Festa 60 over 400 originals left the table during the event — and in June 2026 she posted,
                  simply, “I got into Design Festa.”
                </p>
              </Reveal>
            </div>

            {/* palette */}
            <Reveal delay={220} className="mt-10">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ash">
                the palette — never more than seven
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {PALETTE.map((c) => (
                  <div
                    key={c.hex}
                    className="group relative h-16 w-[82px] border-[1.5px] border-ink/70 transition-transform duration-300 hover:-translate-y-1"
                    style={{ background: c.hex }}
                  >
                    <span className="absolute inset-x-0 bottom-0 bg-ink/85 px-1 py-0.5 text-center font-mono text-[8.5px] uppercase tracking-[0.1em] text-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {c.hex}
                    </span>
                    <span className="absolute left-1 top-1 border border-ink/40 bg-paper px-1 text-[9px] font-bold text-ink opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {c.en} · <span lang="ja">{c.jp}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* ------------------------------------------------ timeline */}
        <div className="mt-20 border-t-[2px] border-ink pt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h3 className="font-display text-[26px] sm:text-[34px]">How she got here</h3>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">2012 → 2026, in nine steps</p>
          </div>
          <ol className="mt-8 grid grid-cols-1 gap-px bg-ink/15 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {TIMELINE.map((t, i) => (
              <Reveal
                as="li"
                key={t.y + i}
                delay={i * 70}
                className={cn(
                  "group relative list-none bg-paper p-5 transition-colors duration-300 hover:bg-paper-2",
                  (i === 0 || i === TIMELINE.length - 1) && "sm:col-span-2 lg:col-span-1 xl:col-span-2",
                )}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-orange">{t.y}</p>
                <p className="mt-2.5 font-display text-[14.5px] leading-[1.45]">{t.head}</p>
                <p className="mt-2 text-[12px] leading-[1.85] text-ink-soft">{t.body}</p>
                <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-ink transition-all duration-500 group-hover:w-full" />
              </Reveal>
            ))}
          </ol>
        </div>
      </div>

      {/* words marquee */}
      <div className="mt-16 border-y-[1.5px] border-ink/60 bg-paper-2/80 py-4">
        <Marquee
          rev
          sep="·"
          className="font-hand text-[16px] sm:text-[19px]"
          items={WORDS.map((w) => (
            <span key={w.jp} className="inline-flex items-baseline gap-2.5">
              <span>“{w.en}”</span>
              <span lang="ja" className="text-[0.72em] text-ash">{w.jp}</span>
            </span>
          ))}
        />
      </div>

      <div className="mx-auto mt-10 flex max-w-[1560px] justify-end px-4 sm:px-7">
        <Signature className="h-10 w-32 text-ink/40" />
      </div>
    </section>
  );
}
