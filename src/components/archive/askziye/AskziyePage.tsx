"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrushCursor, Petals, Preloader } from "./Atmosphere";
import { works, type Work } from "./data/works";
import { Gallery, galleryWorks } from "./Gallery";
import { Lightbox } from "./Lightbox";
import { ScrollChrome, setLive, ToastProvider, toneOf, useStored, useToast } from "./lib";
import { Shortcuts, StyleStudy, Timeline } from "./Sections";
import { About, Contact, Footer, Hero, Intro, Spotlight, Stage, Toc } from "./Static";
import "./askziye.css";

export function AskziyePage() {
  return (
    <ToastProvider>
      <Site />
    </ToastProvider>
  );
}

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
      {/* Top navigation bar replaced by studioNeo StudioNav */}
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

export default AskziyePage;
