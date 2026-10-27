"use client";

import { useCallback, useEffect, useState } from "react";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { Gallery, type ArchiveFilter } from "./Gallery";
import { Featured } from "./Featured";
import { Timeline } from "./Timeline";
import { About } from "./About";
import { Footer } from "./Footer";
import { Marquee } from "./ui";
import { Splash, ScrollProgress, BackToTop } from "./Chrome";
import { currentArtist, type ArtistPage } from "./ArtistSwitcher";
import { RellaPage } from "./RellaPage";
import { artworks } from "@/data";
import "./archive.css";

export function ArchiveApp({ initialArtist = "sankobite" }: { initialArtist?: ArtistPage }) {
  const [artist, setArtist] = useState<ArtistPage>(initialArtist);
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [filterOverride, setFilterOverride] = useState<ArchiveFilter | null>(null);

  const syncFromUrl = useCallback(() => {
    const resolved = currentArtist(initialArtist);
    setArtist(resolved);
    const params = new URLSearchParams(window.location.search);
    const workParam = params.get("work");
    if (workParam) {
      if (resolved === "sankobite") {
        const match = artworks.find((a) => a.slug === workParam || a.id === workParam);
        setSelectedWorkId(match ? match.id : workParam);
      } else {
        setSelectedWorkId(workParam);
      }
    } else {
      setSelectedWorkId(null);
    }
  }, [initialArtist]);

  useEffect(() => {
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [syncFromUrl]);

  useEffect(() => {
    document.title =
      artist === "rella"
        ? "Rella | The Artist Archive • studioNeo"
        : "sankobite | ugoira tribute archive さんこばいと";
  }, [artist]);

  const handleSelectWork = useCallback(
    (idOrSlug: string | null) => {
      setSelectedWorkId(idOrSlug);
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (idOrSlug) {
        const artMatch = artworks.find((a) => a.id === idOrSlug || a.slug === idOrSlug);
        url.searchParams.set("work", artMatch ? artMatch.slug : idOrSlug);
      } else {
        url.searchParams.delete("work");
      }
      window.history.replaceState(null, "", url.toString());
    },
    []
  );

  if (artist === "rella") {
    return <RellaPage selectedWorkId={selectedWorkId} onSelectWork={handleSelectWork} />;
  }

  return (
    <div className="sankobite-page min-h-screen">
      <Splash />
      <ScrollProgress />
      <a
        href="#works"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:bg-ink focus:text-paper focus:px-4 focus:py-2 focus:font-bold focus:border-[3px] focus:border-miku"
      >
        Skip to the artwork
      </a>
      <Nav onOpenSaved={() => setFilterOverride("saved")} />
      <main id="main-content">
        <Hero onSelectWork={handleSelectWork} />
        <Marquee
          items={[
            "SANKOBITE",
            "うごイラ",
            "ANIMATED STICKERS",
            "DECO*27 SONG SERIES",
            "初音ミク",
            "MAGICAL MIRAI 2023",
            "PROJECT VOLTAGE",
            "HAND-DRAWN LOOPS",
          ]}
        />
        <Gallery
          selectedWorkId={selectedWorkId}
          onSelectWork={handleSelectWork}
          filterOverride={filterOverride}
          onClearFilterOverride={() => setFilterOverride(null)}
        />
        <Featured onSelectWork={handleSelectWork} />
        <Timeline onSelectWork={handleSelectWork} />
        <About />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
