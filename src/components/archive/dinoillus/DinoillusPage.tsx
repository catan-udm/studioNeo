"use client";

import { useEffect, useState } from "react";
import { links, stats } from "./data/artworks";
import { CursorLight, Grain, Sparkle, XLogo } from "./fx";
import { About, Footer, Hero, LightStudy, Ticker, Works } from "./sections";
import { Archive, Exhibition, Process } from "./more";
import "./dinoillus.css";

const NAV: [string, string, string][] = [
  ["01", "works", "#works"],
  ["02", "exhibition", "#exhibition"],
  ["03", "light", "#light"],
  ["04", "process", "#process"],
  ["05", "archive", "#archive"],
  ["06", "about", "#about"],
];

function Nav() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? h.scrollTop / max : 0);
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    window.addEventListener("resize", fn);
    return () => {
      window.removeEventListener("scroll", fn);
      window.removeEventListener("resize", fn);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[80]">
      <div className="h-[2px] w-full bg-bone-100/5">
        <div
          className="h-full bg-ember-400 transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <nav className="flex items-center justify-between bg-gradient-to-b from-ink-950/85 via-ink-950/40 to-transparent px-5 py-4 md:px-10 md:py-5">
        <a
          href="#top"
          className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.28em] text-bone-100 transition-colors hover:text-ember-300"
        >
          <Sparkle className="ember-pulse h-3 w-3 text-ember-400" />
          dino_illus
        </a>
        <div className="hidden items-center gap-6 font-mono text-[11px] lg:gap-8 uppercase tracking-[0.22em] text-ash-400 md:flex">
          {NAV.map(([n, label, href]) => (
            <a
              key={href}
              href={href}
              className="group relative transition-colors hover:text-bone-50"
            >
              <span className="mr-1.5 text-ember-500/80">{n}</span>
              {label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-ember-400 transition-all duration-500 group-hover:w-full" />
            </a>
          ))}
        </div>
        <a
          href={links.x}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 border border-bone-100/20 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone-100 transition-all duration-300 hover:border-ember-400/70 hover:bg-ember-400/10 hover:text-ember-300"
        >
          <XLogo className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{stats.followers}</span>
        </a>
      </nav>
    </header>
  );
}

export function DinoillusPage() {
  return (
    <div className="dinoillus-page min-h-screen bg-ink-950 font-sans text-bone-100 antialiased">
      <CursorLight />
      <Nav />
      <main id="main-content">
        <Hero />
        <Ticker />
        <Works />
        <Exhibition />
        <LightStudy />
        <Process />
        <Archive />
        <About />
        <Footer />
      </main>
      <Grain />
    </div>
  );
}
