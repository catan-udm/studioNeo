import { useEffect, useMemo, useRef, useState } from "react";
import { art, sourceHref, sourceLabel } from "@/components/archive/kaduise/lib/art";
import { ALL_WORKS, WORDS, displayTitle, type Work } from "@/components/archive/kaduise/data/works";
import { CAL_STATS } from "@/components/archive/kaduise/data/daily";
import {
  ArrowCurved,
  Fish,
  IconExternal,
  IconIg,
  IconX,
  Marquee,
  Reveal,
  Signature,
  Sparkle,
  Squiggle,
  Star4,
} from "@/components/archive/kaduise/components/ui";
import { cn } from "@/utils/cn";

/* ---------------------------------------------------------------- nav */
const SECTIONS = [
  { id: "daily", label: "Daily" },
  { id: "works", label: "Archive" },
  { id: "featured", label: "Readings" },
  { id: "about", label: "About" },
  { id: "make", label: "Method" },
  { id: "log", label: "Latest" },
  { id: "contact", label: "Contact" },
];

export function Nav() {
  const [p, setP] = useState(0);
  const [active, setActive] = useState("top");
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? (h.scrollTop / max) * 100 : 0);
      setSolid(h.scrollTop > 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length || !("IntersectionObserver" in window)) return;
    const o = new IntersectionObserver(
      (es) => {
        const vis = es
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.6] },
    );
    els.forEach((e) => o.observe(e));
    return () => o.disconnect();
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 kaduise-top-nav">
      <div
        className={cn(
          "transition-colors duration-500",
          solid ? "border-b-2 border-ink/85 bg-paper/92 backdrop-blur-[2px]" : "border-b-2 border-transparent",
        )}
      >
        <div className="mx-auto flex max-w-[1560px] items-center gap-4 px-4 py-2.5 sm:px-7">
          <a href="#top" className="group flex items-baseline gap-2.5">
            <span className="font-display text-lg leading-none tracking-tight">kaduise</span>
            <span lang="ja" className="font-mono text-[10px] tracking-[0.28em] text-ink-soft group-hover:text-orange">
              かづいせ
            </span>
          </a>

          <nav className="ml-auto hidden items-end gap-1 lg:flex" aria-label="Sections">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  "relative px-3 py-1.5 text-[13px] font-medium tracking-wide text-ink-soft transition-colors hover:text-ink",
                  active === s.id && "text-ink",
                )}
              >
                {s.label}
                <span
                  className={cn(
                    "absolute inset-x-2 -bottom-0.5 h-[2px] origin-left scale-x-0 bg-orange transition-transform duration-300",
                    active === s.id && "scale-x-100",
                  )}
                />
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <a
              href="https://x.com/kaduise"
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center border-[1.5px] border-ink/70 transition-all hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-paper"
              aria-label="X / @kaduise"
            >
              <IconX className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/kaduise_"
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 w-9 items-center justify-center border-[1.5px] border-ink/70 transition-all hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-paper sm:flex"
              aria-label="Instagram / @kaduise_"
            >
              <IconIg className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-b-2 border-ink/80 bg-paper/95 backdrop-blur-[2px] transition-[max-height,opacity] duration-500 lg:hidden",
          solid ? "max-h-14 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                "shrink-0 border-[1.5px] px-3 py-1 text-[12px] font-medium transition-colors",
                active === s.id ? "border-ink bg-ink text-paper" : "border-ink/25 text-ink-soft",
              )}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <div className="h-[3px] w-full bg-ink/10">
        <div
          className="h-full bg-orange transition-[width] duration-150 ease-out"
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------- scramble text */
const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ*+·—/";
function useScramble(target: string, run = true) {
  const [out, setOut] = useState(target);
  useEffect(() => {
    if (!run) {
      setOut(target);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOut(target);
      return;
    }
    let f = 0;
    let raf = 0;
    const total = target.length * 3 + 26;
    const tick = () => {
      f += 1;
      const progress = f / total;
      setOut(
        target
          .split("")
          .map((c, i) => {
            if (c === " ") return " ";
            if (i / target.length < progress) return c;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );
      if (f < total) raf = requestAnimationFrame(tick);
      else setOut(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return out;
}

/* ------------------------------------------------------------- hero */
const FEATURED = ["px151457717", "px151422265", "music", "px151311318", "ikite", "shayou"];

export function Hero() {
  const pool = useMemo(
    () => FEATURED.map((k) => ALL_WORKS.find((w) => w.k === k)).filter(Boolean) as Work[],
    [],
  );
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const cur = pool[i] ?? pool[0];
  const word = WORDS[i % WORDS.length];
  const scrambled = useScramble("かづいせ");

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % pool.length), 5600);
    return () => clearInterval(t);
  }, [paused, pool.length]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--px", `${(-x * 22).toFixed(2)}px`);
      el.style.setProperty("--py", `${(-y * 16).toFixed(2)}px`);
      el.style.setProperty("--fx", `${(x * 34).toFixed(2)}px`);
      el.style.setProperty("--fy", `${(y * 26).toFixed(2)}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate min-h-[100svh] overflow-hidden pt-[68px]"
      style={{
        ["--px" as never]: "0px",
        ["--py" as never]: "0px",
        ["--fx" as never]: "0px",
        ["--fy" as never]: "0px",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 dotgrid opacity-[0.5]" />
        <div className="absolute -left-[6vw] top-[12vh] select-none font-display text-[24vw] leading-none text-ink/[0.045]">
          少女
        </div>
        <div className="absolute right-[3vw] bottom-[16vh] hidden select-none font-display text-[16vw] leading-none text-ink/[0.04] md:block">
          生きて
        </div>
        <div className="absolute inset-x-0 top-0 h-[46vh] bg-pinky/50" />
        <div className="absolute -right-24 top-[8vh] h-[42vh] w-[42vw] hatch opacity-30" />
        <Fish className="absolute left-[6vw] top-[24vh] h-10 w-24 text-ink/35 animate-drift" style={{ animationDelay: "-3s" }} />
        <Fish className="absolute right-[14vw] top-[62vh] h-8 w-20 text-ink/25 animate-drift" style={{ animationDelay: "-9s" }} />
        <Sparkle className="absolute left-[42vw] top-[10vh] h-4 w-4 text-orange animate-twinkle" />
        <Star4 className="absolute left-[16vw] bottom-[26vh] h-6 w-6 text-teal animate-twinkle" style={{ animationDelay: "1.1s" }} />
        <Sparkle className="absolute right-[8vw] top-[30vh] h-5 w-5 text-mustard animate-twinkle" style={{ animationDelay: "2.2s" }} />
      </div>

      <div className="mx-auto grid max-w-[1560px] grid-cols-1 items-center gap-8 px-4 pb-24 pt-6 sm:px-7 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-10">
        {/* ---------------------------------------------------- text */}
        <div className="relative z-10 lg:col-span-5">
          <Reveal className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 border-[1.5px] border-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em]">
              <span
                className="h-1.5 w-1.5 rounded-full bg-red"
                style={{ animation: "blink-dot 2.4s steps(1) infinite" }}
              />
              Osaka · new drawing most nights
            </span>
            <a
              href="#daily"
              className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft transition-colors hover:text-orange"
            >
              <span className="h-[1.5px] w-5 bg-ink-soft transition-all group-hover:w-8 group-hover:bg-orange" />
              latest {CAL_STATS.latest}
            </a>
          </Reveal>

          <h1 className="mt-5">
            <Reveal
              as="span"
              kind="rv-sc"
              className="block font-display text-[17vw] leading-[0.84] tracking-[-0.035em] sm:text-[12vw] lg:text-[7.2vw]"
            >
              kaduise
            </Reveal>
            <Reveal
              as="span"
              kind="rv-sc"
              delay={140}
              className="mt-3 block font-display text-[7vw] leading-none tracking-[0.08em] text-ink-soft sm:text-[3vw] lg:text-[2.1vw]"
            >
              {scrambled}
            </Reveal>
          </h1>

          <Reveal delay={220} className="mt-7 max-w-[36ch]">
            <p className="text-[17px] leading-[1.75] font-bold sm:text-[19px]">
              Everything for the sake of a girl,
              <br />
              everything because of one.
            </p>
            <Squiggle className="mt-3 h-3 w-44 text-orange" />
            <p className="mt-4 text-[13.5px] leading-[2] text-ink-soft">
              An illustrator in Osaka who draws grey weekday life, the stars above it, and occasionally
              death — starting from nothing but a shaky line of ink. Lines on paper, colour on screen,
              and the originals given away at events.
            </p>
          </Reveal>

          <Reveal delay={320} className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#works"
              className="group relative inline-flex items-center gap-3 bg-ink px-6 py-3.5 font-display text-[15px] text-paper ink-shadow transition-transform duration-300 hover:-translate-y-[3px] active:translate-y-0"
            >
              See the archive
              <span className="font-mono text-[10px] tracking-[0.2em] opacity-70 group-hover:opacity-100">
                {ALL_WORKS.length} PICTURES
              </span>
            </a>
            <a
              href={sourceHref(cur)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border-b-2 border-ink/25 pb-0.5 text-[13px] font-medium transition-colors hover:border-ink hover:text-orange"
            >
              View this one on {sourceLabel(cur.via)}
              <IconExternal className="h-3.5 w-3.5" />
            </a>
          </Reveal>

          <Reveal delay={420} className="relative mt-10 hidden max-w-[32ch] lg:block">
            <ArrowCurved className="absolute -left-9 -top-7 h-14 w-16 text-ink/40" />
            <p className="font-hand text-[15px] leading-relaxed text-ink-soft">“{word.en}”</p>
            <p lang="ja" className="mt-1.5 text-[11.5px] leading-relaxed text-ash">{word.jp}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ash">{word.from}</p>
          </Reveal>
        </div>

        {/* ------------------------------------------------- artwork */}
        <div
          className="relative lg:col-span-7"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="relative mx-auto w-[min(100%,880px)] transition-transform duration-500 ease-out"
            style={{ transform: "translate3d(var(--px), var(--py), 0) rotate(-1.1deg)" }}
          >
            <span className="tape absolute -top-4 left-[16%] z-20 h-8 w-24 -rotate-6 opacity-90" />
            <span className="tape absolute -bottom-3 right-[14%] z-20 h-7 w-20 rotate-3 opacity-80" />
            <div className="relative border-[2.5px] border-ink bg-paper p-2.5 ink-shadow sm:p-3.5">
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-paper-2">
                <div
                  className="absolute inset-0 transition-transform duration-500 ease-out"
                  style={{ transform: "translate3d(var(--fx), var(--fy), 0) scale(1.03)" }}
                >
                  {pool.map((w, idx) => (
                    <img
                      key={w.k}
                      src={art(w.k)}
                      alt={displayTitle(w)}
                      aria-hidden={idx !== i}
                      className={cn(
                        "absolute inset-0 h-full w-full object-contain transition-opacity duration-[900ms]",
                        idx === i ? "opacity-100" : "opacity-0",
                      )}
                      style={{ animation: idx === i ? "breathe 24s ease-in-out infinite alternate" : undefined }}
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(26,24,19,0.46),transparent_46%)]" />
                <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-3 sm:p-5">
                  <div className="min-w-0">
                    <p className="font-display text-[20px] leading-tight text-paper drop-shadow sm:text-[28px]">
                      {displayTitle(cur)}
                    </p>
                    {cur.title && (
                      <p lang="ja" className="mt-1 text-[12px] text-paper/70">{cur.title}</p>
                    )}
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/70">
                      {cur.d} · {cur.fav ? `${cur.fav.toLocaleString()} likes` : sourceLabel(cur.via)}
                    </p>
                  </div>
                  <Signature className="h-8 w-24 shrink-0 text-paper/80" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {pool.map((w, idx) => (
                <button
                  key={w.k}
                  onClick={() => setI(idx)}
                  aria-label={displayTitle(w)}
                  className={cn(
                    "h-[3px] flex-1 origin-left bg-ink/20 transition-all duration-300 hover:bg-ink/50",
                    idx === i && "bg-ink",
                  )}
                />
              ))}
              <span className="font-mono text-[10px] tracking-[0.18em] text-ash">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-16 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 lg:flex"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-ink-soft/70">scroll</span>
        <span className="h-9 w-px bg-gradient-to-b from-ink/50 to-transparent" />
      </div>

      {/* --------------------------------------------------- ticker */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-y-[1.5px] border-ink/80 bg-ink text-paper">
        <Marquee
          className="py-2.5 font-hand text-[15px] sm:text-[17px]"
          items={[
            ...ALL_WORKS.filter((w) => w.en)
              .slice(0, 14)
              .map((w) => (
                <span key={w.k}>
                  {w.en}
                  <span lang="ja" className="ml-2 text-[0.8em] text-paper/45">{w.title}</span>
                </span>
              )),
            <span key="m1" className="text-mustard">
              everything for the sake of a girl
            </span>,
            <span key="m2" className="text-orange">
              全ては少女の為に
            </span>,
          ]}
        />
      </div>
    </section>
  );
}
