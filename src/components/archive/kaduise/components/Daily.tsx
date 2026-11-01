import { useEffect, useMemo, useRef, useState } from "react";
import { CAL_BITS, CAL_START, CAL_STATS, DAILY, MONTHS_12, PIXIV_USER, PX } from "@/components/archive/kaduise/data/daily";
import { art } from "@/components/archive/kaduise/lib/art";
import { IconChev, IconExternal, Reveal, Sparkle, Squiggle } from "@/components/archive/kaduise/components/ui";
import { cn } from "@/utils/cn";

const WD = ["M", "", "W", "", "F", "", "S"];

function longDate(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function shortDate(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/* -------------------------------------------------- activity calendar */
function Calendar() {
  const [hover, setHover] = useState<{ d: string; n: number } | null>(null);

  const cells = useMemo(() => {
    const start = new Date(`${CAL_START}T00:00:00Z`);
    return [...CAL_BITS].map((c, i) => {
      const dt = new Date(start.getTime() + i * 86400000);
      return { n: Number(c), d: dt.toISOString().slice(0, 10) };
    });
  }, []);

  const weeks = useMemo(() => {
    const out: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [cells]);

  const monthMarks = useMemo(
    () =>
      weeks.map((w, i) => {
        const first = w[0];
        if (!first) return null;
        const prev = weeks[i - 1]?.[0];
        const m = first.d.slice(5, 7);
        if (!prev || prev.d.slice(5, 7) !== m) {
          return {
            label: new Date(`${first.d}T00:00:00Z`).toLocaleDateString("en-GB", {
              month: "short",
              timeZone: "UTC",
            }),
          };
        }
        return null;
      }),
    [weeks],
  );

  return (
    <div className="relative">
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        <div className="sticky left-0 z-10 flex shrink-0 flex-col gap-[3px] bg-paper-2 pr-1.5">
          <span className="h-3.5" />
          {WD.map((d, i) => (
            <span key={i} className="flex h-[11px] items-center font-mono text-[8.5px] leading-none text-ash">
              {d}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((w, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              <span className="h-3.5 font-mono text-[8px] uppercase leading-none tracking-[0.08em] text-ash">
                {monthMarks[wi]?.label ?? ""}
              </span>
              {w.map((c) => (
                <span
                  key={c.d}
                  onMouseEnter={() => setHover(c)}
                  onMouseLeave={() => setHover(null)}
                  className={cn(
                    "h-[11px] w-[11px] border transition-all duration-150",
                    c.n === 0
                      ? "border-ink/15 bg-transparent"
                      : c.n === 1
                        ? "border-ink/50 bg-ink/75"
                        : "border-ink bg-orange",
                    hover?.d === c.d && "scale-[1.5] border-red",
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
          {hover ? (
            <span className="text-ink">
              {shortDate(hover.d)} — {hover.n === 0 ? "no drawing" : `${hover.n} drawing`}
            </span>
          ) : (
            <>52 weeks · {CAL_STATS.window} drawings · source: pixiv</>
          )}
        </p>
        <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ash">
          none
          <span className="h-[11px] w-[11px] border border-ink/15" />
          <span className="h-[11px] w-[11px] border border-ink/50 bg-ink/75" />
          <span className="h-[11px] w-[11px] border border-ink bg-orange" />
          drew
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- filmstrip */
function Strip() {
  const box = useRef<HTMLDivElement | null>(null);
  const [i, setI] = useState(0);
  const list = DAILY;

  const go = (d: number) => {
    const next = Math.min(list.length - 1, Math.max(0, i + d));
    setI(next);
    const el = box.current?.children[next] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onScroll = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bd = Infinity;
      [...el.children].forEach((c, idx) => {
        const h = c as HTMLElement;
        const cm = h.offsetLeft + h.offsetWidth / 2;
        if (Math.abs(cm - mid) < bd) {
          bd = Math.abs(cm - mid);
          best = idx;
        }
      });
      setI(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative">
      <div
        ref={box}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {list.map((w, idx) => (
          <a
            key={w.id}
            href={PX(w.id)}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "group relative w-[76vw] shrink-0 snap-center sm:w-[460px]",
              idx === i ? "opacity-100" : "opacity-55 hover:opacity-85",
            )}
          >
            <div
              className={cn(
                "relative border-[2px] bg-paper p-2 transition-all duration-500",
                idx === i ? "border-ink shadow-[8px_10px_0_rgba(26,24,19,0.16)]" : "border-ink/45",
              )}
            >
              <div className="relative overflow-hidden bg-paper-2" style={{ aspectRatio: `${w.ar}` }}>
                <img
                  src={art(`px${w.id}`)}
                  alt={w.en || `Drawing from ${longDate(w.d)}`}
                  loading={idx < 3 ? "eager" : "lazy"}
                  className="h-full w-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.04]"
                />
                {idx === 0 && (
                  <span className="absolute left-2 top-2 border-[1.5px] border-ink bg-mustard px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.18em]">
                    newest
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between gap-3 px-0.5 pb-0.5 pt-2.5">
                <span className="font-display text-[14px]">{w.en || shortDate(w.d)}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
                  {w.d} ↗
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-1 flex items-center gap-3">
        <button
          onClick={() => go(-1)}
          aria-label="Previous drawing"
          disabled={i === 0}
          className="flex h-9 w-9 rotate-180 items-center justify-center border-[1.5px] border-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          <IconChev className="h-4 w-4" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next drawing"
          disabled={i === DAILY.length - 1}
          className="flex h-9 w-9 items-center justify-center border-[1.5px] border-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          <IconChev className="h-4 w-4" />
        </button>
        <div className="h-[2px] flex-1 bg-ink/15">
          <div
            className="h-full bg-ink transition-[width] duration-300"
            style={{ width: `${((i + 1) / DAILY.length) * 100}%` }}
          />
        </div>
        <span className="font-mono text-[10px] tabular-nums tracking-[0.16em] text-ash">
          {String(i + 1).padStart(2, "0")} / {DAILY.length}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ block */
export function DailySection() {
  return (
    <section
      id="daily"
      className="relative scroll-mt-16 overflow-hidden border-t-[2px] border-ink bg-paper py-20 sm:py-24"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 dotgrid opacity-30" />
        <Sparkle className="absolute right-[7vw] top-20 h-5 w-5 text-mustard animate-twinkle" />
      </div>

      <div className="mx-auto max-w-[1560px] px-4 sm:px-7">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b-[2px] border-ink pb-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-soft">01 — daily</p>
            <h2 className="mt-2 font-display text-[11vw] leading-[0.9] tracking-tight sm:text-[6.4vw] lg:text-[4.9vw]">
              A drawing,
              <br className="sm:hidden" /> most nights at eight
            </h2>
            <p className="mt-4 max-w-[52ch] text-[13.5px] leading-[1.95] text-ink-soft">
              Counting all {CAL_STATS.total} pictures on pixiv, {CAL_STATS.eveningShare}% of them went up during
              the 8pm hour. {CAL_STATS.year2026} of them belong to 2026 alone — drawn before the bar opens, or
              after it closes.
            </p>
          </div>
          <a
            href={PIXIV_USER}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border-[1.5px] border-ink px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
          >
            all of them on pixiv <IconExternal className="h-3.5 w-3.5" />
          </a>
        </div>

        <Reveal className="mt-10">
          <Strip />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <div className="border-[2px] border-ink bg-paper-2 p-5 sm:p-7">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <h3 className="font-display text-[19px]">Every day she drew, this past year.</h3>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                  {longDate(CAL_START)} → {longDate(CAL_STATS.latest)}
                </p>
              </div>
              <Calendar />
            </div>
          </Reveal>

          <div className="lg:col-span-4">
            <Reveal delay={80} className="h-full border-[2px] border-ink bg-ink p-6 text-paper">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55">the streak</p>
              <p className="mt-3 font-display text-[64px] leading-[0.85] text-mustard">
                {CAL_STATS.longestStreak}
                <span className="ml-2 font-body text-[15px] font-bold text-paper/70">days straight</span>
              </p>
              <p className="mt-3 text-[13px] leading-[1.95] text-paper/75">
                The longest run without missing a single day. {CAL_STATS.total} pictures since{" "}
                {CAL_STATS.since}, {CAL_STATS.window} of them in the last 52 weeks. There are rest days in
                there too, and she says so when there are.
              </p>
              <Squiggle className="mt-5 h-3 w-36 text-orange" />
              <div className="mt-6 space-y-2.5">
                {MONTHS_12.map((m) => (
                  <div key={m.m} className="flex items-center gap-3">
                    <span className="w-8 shrink-0 font-mono text-[10px] uppercase text-paper/50">{m.label}</span>
                    <span className="h-[9px] flex-1 bg-paper/10">
                      <span
                        className="block h-full bg-paper/70 transition-all duration-700"
                        style={{ width: `${(m.n / 31) * 100}%` }}
                      />
                    </span>
                    <span className="w-6 shrink-0 text-right font-mono text-[10px] tabular-nums text-paper/70">
                      {m.n}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
