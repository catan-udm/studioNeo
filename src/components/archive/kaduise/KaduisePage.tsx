"use client";

import { useEffect, useRef } from "react";
import { art } from "@/components/archive/kaduise/lib/art";
import { InkDefs, Marquee, Sparkle } from "@/components/archive/kaduise/components/ui";
import { Hero, Nav } from "@/components/archive/kaduise/components/Hero";
import { Works } from "@/components/archive/kaduise/components/Works";
import { DailySection } from "@/components/archive/kaduise/components/Daily";
import { Featured } from "@/components/archive/kaduise/components/Featured";
import { About } from "@/components/archive/kaduise/components/About";
import { Make } from "@/components/archive/kaduise/components/Make";
import { Footer, Log } from "@/components/archive/kaduise/components/Log";
import "./kaduise.css";

/** parallax strip using the artist's own X header artwork */
function BannerBand() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const loop = () => {
      const r = el.getBoundingClientRect();
      const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      el.style.setProperty("--shift", `${(p * -7).toFixed(2)}%`);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative overflow-hidden border-y-[2px] border-ink bg-ink">
      <div ref={ref} className="relative h-[38vh] min-h-[240px] w-full overflow-hidden sm:h-[52vh]">
        <img
          src={art("banner")}
          alt="kaduise's header artwork"
          className="absolute inset-0 h-[116%] w-full object-cover opacity-95"
          style={{ transform: "translate3d(0, var(--shift, 0%), 0)" }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(26,24,19,0.55),transparent_45%)]" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-7">
          <div>
            <p className="font-display text-[6vw] leading-[0.95] text-paper sm:text-[2.9vw]">
              Everything for the sake of a girl,
              <br />
              everything because of one.
            </p>
            <p lang="ja" className="mt-2 text-[12px] text-paper/60 sm:text-[14px]">全ては少女の為に、全てを少女の為に。</p>
          </div>
          <span className="hidden shrink-0 items-center gap-2 border-[1.5px] border-paper/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/80 sm:inline-flex">
            <Sparkle className="h-3 w-3 text-mustard" /> header art by kaduise
          </span>
        </div>
      </div>
    </div>
  );
}

export function KaduisePage() {
  return (
    <div className="kaduise-page relative min-h-screen bg-paper text-ink antialiased">
      <InkDefs />

      {/* paper grain — sits above everything, never blocks input */}
      <div aria-hidden className="paper-grain pointer-events-none fixed inset-0 z-[79] opacity-[0.3] mix-blend-multiply" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[78] opacity-[0.18]"
        style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(26,24,19,0.5))" }}
      />

      <Nav />
      <main>
        <Hero />
        <DailySection />
        <Works />
        <Featured />
        <BannerBand />
        <About />
        <Make />
        <Log />
      </main>

      <div className="border-t-[1.5px] border-ink/40 bg-ink py-2 text-paper">
        <Marquee
          sep="✦"
          className="font-mono text-[10.5px] uppercase tracking-[0.28em]"
          items={[
            <span key="a">illustrator: kaduise / <span lang="ja">かづいせ</span></span>,
            <span key="b">analog line + digital flat color</span>,
            <span key="c">osaka</span>,
            <span key="d">a new drawing most nights at eight</span>,
            <span key="e">originals sold at design festa & comitia</span>,
            <span key="f">all artwork © kaduise</span>,
          ]}
        />
      </div>

      <Footer />
    </div>
  );
}

export default KaduisePage;
