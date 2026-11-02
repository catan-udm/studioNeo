"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrushCursor, Petals, Preloader } from "./Atmosphere";
import { works, type Work } from "./data/works";
import { Gallery, galleryWorks } from "./Gallery";
import { Lightbox } from "./Lightbox";
import { ScrollChrome, setLive, ToastProvider, toneOf, useStored, useToast } from "./lib";
import { Shortcuts, StyleStudy, Timeline } from "./Sections";
import { About, Contact, Footer, Hero, Intro, Spotlight, Stage, Toc } from "./Static";
import { cn } from "@/utils/cn";
import "./askziye.css";

export function AskziyePage() {
  return (
    <ToastProvider>
      <Site />
    </ToastProvider>
  );
}

const SECTIONS = [
  { id: "works", label: "作品", en: "Works" },
  { id: "study", label: "研究", en: "Study" },
  { id: "stage", label: "角色", en: "Design" },
  { id: "timeline", label: "年表", en: "Timeline" },
  { id: "about", label: "履历", en: "Atelier" },
  { id: "contact", label: "联系", en: "Contact" },
];

const BASE_TITLE = "ASK｜偶尔画画的猫爱好者 · Illustrator @askziye";

function Site() {
  const toast = useToast();
  const [active, setActive] = useState<{ w: Work; list: Work[] } | null>(null);
  const [favs, setFavs] = useStored<string[]>("ask-favs", []);
  const [night, setNight] = useStored("ask-night", false);
  const [help, setHelp] = useState(false);
  const scrollY = useRef(0);

  const open = useCallback((w: Work, list?: Work[]) => {
    scrollY.current = window.scrollY;
    setActive({
      w,
      list:
        list && list.length
          ? list
          : w.darkPlate
          ? works.filter((x) => x.darkPlate)
          : galleryWorks,
    });
    setLive(toneOf(w.id));
    document.title = `${w.title} · ${w.titleEn} — ASK 画集`;
    history.replaceState(null, "", `#plate=${w.id}`);
  }, []);

  const close = useCallback(() => {
    setActive(null);
    document.title = BASE_TITLE;
    history.replaceState(null, "", location.pathname);
    window.scrollTo({ top: scrollY.current, behavior: "instant" as ScrollBehavior });
  }, []);

  const toggleFav = (id: string) => {
    const on = favs.includes(id);
    setFavs(on ? favs.filter((f) => f !== id) : [...favs, id]);
    toast(on ? "Removed from saved" : "Saved to collection");
  };

  const random = () => {
    const w = galleryWorks[Math.floor(Math.random() * galleryWorks.length)];
    open(w);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("night", night);
    document.getElementById("theme-color")?.setAttribute("content", night ? "#1b1612" : "#f3ece1");
  }, [night]);

  // the book takes the ink of whatever is in the middle of your eye
  useEffect(() => {
    setLive(toneOf("shaohua"));
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          const t = (e.target as HTMLElement).dataset.liveTone;
          if (e.isIntersecting && t) setLive(t);
        }),
      { rootMargin: "-42% 0px -42% 0px" }
    );
    document.querySelectorAll("[data-live-tone]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // deep link: initial load + hash changes
  useEffect(() => {
    const apply = () => {
      const m = location.hash.match(/plate=([\w-]+)/);
      const w = m && works.find((x) => x.id === m[1]);
      if (w) open(w);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [open]);

  // global keys
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || active) return;
      if (e.key === "?") setHelp((h) => !h);
      else if (e.key === "/") {
        e.preventDefault();
        document.getElementById("works")?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => document.getElementById("gallery-search")?.focus(), 400);
      } else if (e.key.toLowerCase() === "n") setNight((n) => !n);
      else if (e.key.toLowerCase() === "r") random();
      else if (e.key === "Escape") setHelp(false);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  return (
    <div className={`askziye-page paper-bg relative min-h-screen text-ink transition-colors duration-700 ${night ? "night" : ""}`}>
      <a
        href="#works"
        className="skip-link fixed left-4 top-4 z-[130] -translate-y-24 bg-ink px-4 py-2 text-[11px] tracking-[0.2em] text-paper uppercase transition-transform focus:translate-y-0"
      >
        跳到图版 · Skip to plates
      </a>
      <Preloader />
      <div className="grain" />
      <Petals />
      <BrushCursor />
      <ScrollChrome />
      <Nav night={night} setNight={setNight} onRandom={random} onHelp={() => setHelp(true)} favCount={favs.length} />
      <Spine />
      <Hero />
      <Toc />
      <Intro />
      <Spotlight onOpen={(w) => open(w)} />
      <Gallery favs={favs} toggleFav={toggleFav} onOpen={open} />
      <StyleStudy />
      <Stage onOpen={(w) => open(w)} />
      <Timeline onOpen={open} />
      <About />
      <Contact />
      <Footer />
      {active && (
        <Lightbox
          work={active.w}
          list={active.list}
          onClose={close}
          onGo={(w) => open(w, active.list)}
          fav={favs.includes(active.w.id)}
          toggleFav={() => toggleFav(active.w.id)}
        />
      )}
      {help && <Shortcuts onClose={() => setHelp(false)} />}
    </div>
  );
}

function Spine() {
  return (
    <div className="fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-4 xl:flex">
      <span className="vertical-rl font-display text-[10px] tracking-[0.55em] text-ink-soft/60">
        ASK 画集 · 偶尔画画的猫爱好者
      </span>
      <span className="h-10 w-px bg-ink/15" aria-hidden />
      <span className="seal h-6 w-6 text-[7px]">画</span>
    </div>
  );
}

function Nav({
  night,
  setNight,
  onRandom,
  onHelp,
  favCount,
}: {
  night: boolean;
  setNight: (v: boolean) => void;
  onRandom: () => void;
  onHelp: () => void;
  favCount: number;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");

  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 24);
      let cur = "";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) cur = s.id;
      }
      setCurrent(cur);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const iconBtn = "grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-sm transition hover:border-cinnabar hover:text-cinnabar";

  return (
    <header className={cn("fixed inset-x-0 top-0 z-40 transition-all duration-500", scrolled || open ? "nav-blur border-b border-ink/10" : "")}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
        <a href="#top" className="flex items-center gap-3">
          <span className="seal h-8 w-8 text-[9px] font-semibold">ASK</span>
          <span className="font-display text-lg tracking-[0.28em]">ASK</span>
        </a>
        <nav className="hidden items-center gap-6 lg:flex">
          {SECTIONS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              aria-current={current === l.id ? "true" : undefined}
              className="group relative flex flex-col items-center text-[10px] tracking-[0.22em] uppercase"
            >
              <span className={cn("transition", current === l.id ? "text-cinnabar" : "text-ink-soft")}>{l.en}</span>
              <span className={cn("mt-0.5 font-display text-[13px] tracking-widest", current === l.id ? "text-cinnabar" : "text-ink/70 group-hover:text-cinnabar")}>
                {l.label}
              </span>
              <span className={cn("absolute -bottom-2 h-px bg-cinnabar transition-all", current === l.id ? "w-full" : "w-0")} />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#works" className={cn(iconBtn, "relative w-auto px-3 text-[11px]")} title="Saved plates">
            ♥ {favCount}
          </a>
          <button onClick={onRandom} className={iconBtn} title="Random plate (R)" aria-label="Random plate">
            ⚄
          </button>
          <button onClick={() => setNight(!night)} className={iconBtn} title="Night studio (N)" aria-label="Toggle theme">
            {night ? "☀" : "☾"}
          </button>
          <button onClick={onHelp} className={cn(iconBtn, "hidden sm:grid")} title="Shortcuts (?)" aria-label="Shortcuts">
            ?
          </button>
          <button className="ml-1 lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
            <span className={cn("block h-px w-6 bg-ink transition", open && "translate-y-[3.5px] rotate-45")} />
            <span className={cn("mt-1.5 block h-px bg-ink transition", open ? "w-6 -translate-y-[3.5px] -rotate-45" : "w-4")} />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-ink/10 px-5 py-6 lg:hidden">
          {SECTIONS.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)} className="flex items-baseline justify-between py-2 font-display text-2xl">
              <span>{l.label}</span>
              <span className="text-xs tracking-[0.2em] text-ink-soft uppercase">{l.en}</span>
            </a>
          ))}
          <a href="https://x.com/askziye" target="_blank" rel="noreferrer" className="mt-4 block text-sm text-cinnabar">
            @askziye ↗
          </a>
        </div>
      )}
    </header>
  );
}

export default AskziyePage;
