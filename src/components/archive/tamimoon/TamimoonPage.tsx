"use client";

import Hero from "./Hero";
import About from "./About";
import Anatomy from "./Anatomy";
import Models from "./Models";
import Colour from "./Colour";
import Works from "./Works";
import Clients from "./Clients";
import History from "./History";
import Contact from "./Contact";
import Footer from "./Footer";
import "./tamimoon.css";

export function TamimoonPage({
  selectedWorkId,
  onSelectWork,
}: {
  selectedWorkId?: string | null;
  onSelectWork?: (id: string | null) => void;
}) {
  return (
    <div className="tamimoon-page grain relative min-h-screen bg-paper">
      {/* turbulence filter: makes every .hand-frame wobble like a hand-drawn border */}
      <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden focusable="false">
        <filter id="wobble" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="2" seed="6" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <a
        href="#about"
        className="tracked-b sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[90] focus:bg-vermil focus:px-4 focus:py-2 focus:text-[10px] focus:text-white"
      >
        Skip to content
      </a>

      <main>
        <Hero />
        <About />
        <Anatomy />
        <Models />
        <Colour />
        <Works selectedWorkId={selectedWorkId} onSelectWork={onSelectWork} />
        <Clients />
        <History />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
