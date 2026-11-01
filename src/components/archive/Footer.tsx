"use client";

import Link from "next/link";
import { Heart, ArrowUp } from "lucide-react";
import { links, totalFrames, artworks } from "@/data";
import { ArtistLink } from "./ArtistSwitcher";
import { Marquee } from "./ui";

export function Footer() {
  return (
    <footer className="border-t-[3px] border-ink">
      <Marquee
        dark
        reverse
        items={["SANKOBITE", "さんこばいと", "UGOIRA ARCHIVE", `${totalFrames} FRAMES`, `${artworks.length} LOOPS`, "初音ミク", "SUPPORT THE ARTIST"]}
      />
      <div className="bg-ink text-paper py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-8 md:items-center">
            <div className="max-w-xl">
              <p className="font-display uppercase text-2xl">
                sanko<span className="text-miku">bite</span> <span className="text-paper/40">/ tribute archive</span>
              </p>
              <p className="mt-3 text-sm font-medium text-paper/60 leading-relaxed">
                An unofficial, fan-made gallery. All artwork, animations, the self-portrait and the logo mark are
                © sankobite, reproduced here from the artist&apos;s public{" "}
                <a href={links.pixiv} target="_blank" rel="noreferrer" className="text-miku hover:underline">Pixiv</a> and{" "}
                <a href={links.blog} target="_blank" rel="noreferrer" className="text-miku hover:underline">portfolio</a>{" "}
                to celebrate their work. Hatsune Miku © Crypton Future Media. Please follow and support the original artist.
              </p>
            </div>
            <div className="md:ml-auto flex flex-col items-start md:items-end gap-4">
              <div className="flex flex-wrap gap-2.5">
                <ArtistLink
                  artist="rella"
                  className="inline-flex items-center gap-2 bg-paper/10 text-paper font-display uppercase text-xs px-4 py-2.5 border-[3px] border-paper/20 hover:bg-magenta hover:text-white transition-colors"
                >
                  Visit Rella Archive →
                </ArtistLink>
                <ArtistLink
                  artist="tamimoon"
                  className="inline-flex items-center gap-2 bg-paper/10 text-paper font-display uppercase text-xs px-4 py-2.5 border-[3px] border-paper/20 hover:bg-coral hover:text-white transition-colors"
                >
                  Visit tamimoon Profile →
                </ArtistLink>
                <a
                  href="#top"
                  className="inline-flex items-center gap-2 bg-miku text-ink font-display uppercase text-xs px-4 py-2.5 border-[3px] border-paper/20 hover:bg-sun transition-colors"
                >
                  Back to top <ArrowUp className="w-4 h-4" aria-hidden />
                </a>
              </div>
              <p className="font-dot text-xs text-paper/50 inline-flex items-center gap-1.5">
                made with <Heart className="w-3.5 h-3.5 text-magenta" aria-hidden /> for the loops · studioNeo 2026
              </p>
            </div>
          </div>

          {/* Studio Neo Platform Links */}
          <div className="mt-8 pt-6 border-t border-paper/15 flex flex-wrap items-center justify-between gap-4 text-xs font-dot text-paper/60">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-miku uppercase tracking-widest">studioNeo:</span>
              <Link href="/gallery" className="hover:text-sun transition-colors">Atelier Gallery</Link>
              <Link href="/projects" className="hover:text-sun transition-colors">Projects &amp; Cuts</Link>
              <Link href="/studio/upload" className="hover:text-sun transition-colors">Creator Studio</Link>
              <Link href="/collection" className="hover:text-sun transition-colors">Saved Vault</Link>
              <Link href="/membership" className="hover:text-sun transition-colors">Membership</Link>
              <Link href="/licensing" className="hover:text-sun transition-colors">Licensing</Link>
              <Link href="/contact" className="hover:text-sun transition-colors">Contact</Link>
              <Link href="/login" className="hover:text-sun transition-colors">Sign In / Passkey</Link>
            </div>
            <div className="flex items-center gap-4 text-paper/45">
              <Link href="/terms" className="hover:text-paper transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-paper transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
