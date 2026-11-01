"use client";

import { CursorLight, Grain } from "./fx";
import { About, Footer, Hero, LightStudy, Ticker, Works } from "./sections";
import { Archive, Exhibition, Process } from "./more";
import "./dinoillus.css";

export function DinoillusPage() {
  return (
    <div className="dinoillus-page min-h-screen bg-ink-950 font-sans text-bone-100 antialiased">
      <CursorLight />
      {/* Top navigation bar is integrated with studioNeo's StudioNav */}
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
