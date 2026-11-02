"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Hero } from "./Hero";
import { Gallery, type ArchiveFilter } from "./Gallery";
import { Featured } from "./Featured";
import { Timeline } from "./Timeline";
import { About } from "./About";
import { Footer } from "./Footer";
import { Marquee } from "./ui";
import { Splash, BackToTop, ScrollProgress } from "./Chrome";
import { ArtistSwitcher, currentArtist, type ArtistPage } from "./ArtistSwitcher";
import { Nav } from "./Nav";
import { RellaPage } from "./RellaPage";
import { TamimoonPage } from "./tamimoon/TamimoonPage";
import { YoneyamaiPage } from "./yoneyamai/YoneyamaiPage";
import { MikaPikazoPage } from "./mikapikazo/MikaPikazoPage";
import { DinoillusPage } from "./dinoillus/DinoillusPage";
import { LamPage } from "./lam/LamPage";
import { DolmanPage } from "./dolman/DolmanPage";
import { TatamipiPage } from "./tatamipi/TatamipiPage";
import { AskziyePage } from "./askziye/AskziyePage";
import { DoraPage } from "./dora/DoraPage";
import { KaduisePage } from "./kaduise/KaduisePage";
import { KdaPage } from "./kda/KdaPage";
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
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-archive-artist", artist);
      document.body.setAttribute("data-archive-artist", artist);
    }
    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.removeAttribute("data-archive-artist");
        document.body.removeAttribute("data-archive-artist");
      }
    };
  }, [artist]);

  useEffect(() => {
    document.title =
      artist === "rella"
        ? "Rella | The Artist Archive • studioNeo"
        : artist === "tamimoon"
        ? "tamimoon — illustrator (@tami_moon02) • studioNeo"
        : artist === "yoneyamai"
        ? "Yoneyama Mai 米山舞 — Museum Archive • studioNeo"
        : artist === "mikapikazo"
        ? "Mika Pikazo ミカ・ピカゾ — Illustration Works • studioNeo"
        : artist === "dinoillus"
        ? "DINO — @Dino_illus · where light ends • studioNeo"
        : artist === "lam"
        ? "LAM | Illustrator & Character Designer • studioNeo"
        : artist === "dolman"
        ? "Dolman — A little world of daydreams • studioNeo"
        : artist === "tatamipi"
        ? "tatamipi — Illustrator Portfolio • studioNeo"
        : artist === "askziye"
        ? "ASK｜偶尔画画的猫爱好者 · Illustrator @askziye • studioNeo"
        : artist === "dora"
        ? "哆啦小熙 · Dora’s Studio • studioNeo"
        : artist === "kaduise"
        ? "kaduise — everything for the sake of a girl • studioNeo"
        : artist === "kda"
        ? "K/DA | FIRESTARTER — Virtual Band • studioNeo"
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

  const renderArtistPage = (page: ReactNode) => page;

  if (artist === "rella") {
    return renderArtistPage(<RellaPage selectedWorkId={selectedWorkId} onSelectWork={handleSelectWork} />);
  }

  if (artist === "tamimoon") {
    return renderArtistPage(<TamimoonPage selectedWorkId={selectedWorkId} onSelectWork={handleSelectWork} />);
  }

  if (artist === "yoneyamai") {
    return renderArtistPage(<YoneyamaiPage selectedWorkId={selectedWorkId} onSelectWork={handleSelectWork} />);
  }

  if (artist === "mikapikazo") {
    return renderArtistPage(<MikaPikazoPage selectedWorkId={selectedWorkId} onSelectWork={handleSelectWork} />);
  }

  if (artist === "dinoillus") {
    return renderArtistPage(<DinoillusPage />);
  }

  if (artist === "lam") {
    return renderArtistPage(<LamPage />);
  }

  if (artist === "dolman") {
    return renderArtistPage(<DolmanPage />);
  }

  if (artist === "tatamipi") {
    return renderArtistPage(<TatamipiPage />);
  }

  if (artist === "askziye") {
    return renderArtistPage(<AskziyePage />);
  }

  if (artist === "dora") {
    return renderArtistPage(<DoraPage />);
  }

  if (artist === "kaduise") {
    return renderArtistPage(<KaduisePage />);
  }

  if (artist === "kda") {
    return renderArtistPage(<KdaPage />);
  }

  return renderArtistPage(
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
