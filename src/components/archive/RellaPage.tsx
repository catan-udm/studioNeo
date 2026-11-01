"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Download, Heart, Share2, X } from "lucide-react";
import { ArtistLink } from "./ArtistSwitcher";
import { Reveal } from "./ui";
import { rellaArtworks, rellaHero, rellaLinks, rellaOriginal, type RellaArtwork, type RellaCategory } from "@/rellaData";
import { useSavedWorks } from "@/lib/archiveFavorites";
import "./rella.css";

type Filter = "all" | RellaCategory | "saved";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All works" },
  { value: "miku", label: "Hatsune Miku" },
  { value: "symphony", label: "Symphony" },
  { value: "saved", label: "Saved ♥" },
];

function RellaHero() {
  return (
    <section className="rella-hero" id="rella-top" aria-labelledby="rella-heading">
      <img
        className="rella-hero-image"
        src={rellaHero.image}
        alt="Rella's never ender: Hatsune Miku beneath a luminous, starlit sunset"
      />
      <div className="rella-hero-shade" aria-hidden="true" />
      <div className="rella-hero-content">
        <p className="rella-kicker rella-hero-kicker">AN ARTIST&apos;S WORLD</p>
        <h1 id="rella-heading">Rella<span>.</span></h1>
        <p className="rella-hero-line">Where light learns to sing.</p>
        <p className="rella-hero-description">A little world of music, memory, and the art of Rella.</p>
        <a className="rella-hero-link" href="#rella-work">
          Explore the artwork <ArrowDown size={17} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function ArtworkViewer({
  artwork,
  index,
  total,
  onClose,
  onPrevious,
  onNext,
}: {
  artwork: RellaArtwork;
  index: number;
  total: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const { isSaved, toggle } = useSavedWorks();
  const savedKey = `rella-${artwork.id}`;
  const saved = isSaved(savedKey) || isSaved(artwork.id);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
      previouslyFocused?.focus();
    };
  }, []);

  const handleShare = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("artist", "rella");
      url.searchParams.set("work", artwork.id);
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="rella-dialog"
      aria-labelledby="rella-dialog-title"
      aria-describedby="rella-dialog-description"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") onPrevious();
        if (event.key === "ArrowRight") onNext();
      }}
    >
      <div className="rella-dialog-content">
        <button className="rella-dialog-close" type="button" onClick={onClose} aria-label="Close artwork viewer">
          <X size={21} aria-hidden="true" />
        </button>
        <div className="rella-dialog-art">
          <img src={artwork.image} alt={artwork.alt} />
        </div>
        <div className="rella-dialog-details">
          <p className="rella-kicker">SELECTED WORK / {artwork.year}</p>
          <h2 id="rella-dialog-title">{artwork.title}</h2>
          <p className="rella-dialog-label">{artwork.label}</p>
          <p id="rella-dialog-description" className="rella-dialog-description">{artwork.description}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", alignItems: "center", marginTop: "28px" }}>
            <a href={rellaOriginal(artwork.id)} target="_blank" rel="noreferrer" className="rella-text-link" style={{ marginTop: 0 }}>
              View original on Pixiv <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => toggle(savedKey)}
              className="rella-text-link"
              style={{ marginTop: 0, background: "none", borderTop: 0, borderLeft: 0, borderRight: 0, cursor: "pointer" }}
            >
              <Heart size={14} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
              {saved ? "Saved in Vault" : "Save work"}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="rella-text-link"
              style={{ marginTop: 0, background: "none", borderTop: 0, borderLeft: 0, borderRight: 0, cursor: "pointer" }}
            >
              {copied ? <Check size={14} aria-hidden="true" /> : <Share2 size={14} aria-hidden="true" />}
              {copied ? "Link copied" : "Share"}
            </button>
            <a
              href={artwork.image}
              download={`rella-${artwork.id}.webp`}
              className="rella-text-link"
              style={{ marginTop: 0 }}
            >
              <Download size={14} aria-hidden="true" /> Download
            </a>
          </div>
          <div className="rella-dialog-pagination">
            <span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
            <div>
              <button type="button" onClick={onPrevious} aria-label="Previous artwork"><ArrowLeft size={18} /></button>
              <button type="button" onClick={onNext} aria-label="Next artwork"><ArrowRight size={18} /></button>
            </div>
          </div>
          <p className="rella-keyboard-hint">Use arrow keys to browse, Esc to close.</p>
        </div>
      </div>
    </dialog>
  );
}

function RellaGallery({
  selectedWorkId,
  onSelectWork,
}: {
  selectedWorkId?: string | null;
  onSelectWork?: (id: string | null) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const { savedIds, isSaved, toggle } = useSavedWorks();

  const activeId = selectedWorkId !== undefined ? selectedWorkId : internalSelectedId;
  const setActiveId = (id: string | null) => {
    setInternalSelectedId(id);
    onSelectWork?.(id);
  };

  const visible =
    filter === "all"
      ? rellaArtworks
      : filter === "saved"
        ? rellaArtworks.filter((work) => savedIds.includes(`rella-${work.id}`) || savedIds.includes(work.id))
        : rellaArtworks.filter((work) => work.categories.includes(filter));

  const pool = visible.length > 0 ? visible : rellaArtworks;
  const selectedIndex = activeId ? pool.findIndex((w) => w.id === activeId || `rella-${w.id}` === activeId) : -1;
  const selectedWork = selectedIndex >= 0 ? pool[selectedIndex] : activeId ? rellaArtworks.find((w) => w.id === activeId) ?? null : null;

  return (
    <section id="rella-work" className="rella-gallery rella-section">
      <div className="rella-container">
        <p className="rella-image-credit">
          Opening artwork: <a href={rellaOriginal(rellaHero.id)} target="_blank" rel="noreferrer">{rellaHero.title} by Rella <ArrowUpRight size={12} aria-hidden="true" /></a>
        </p>
        <Reveal>
          <div className="rella-gallery-heading">
            <div>
              <p className="rella-kicker">01 / SELECTED ILLUSTRATIONS</p>
              <h2>Worlds worth <em>getting lost in.</em></h2>
            </div>
            <p>Soft light, intricate details, and stories that stay with you. A small selection from Rella&apos;s world.</p>
          </div>
        </Reveal>

        <div className="rella-gallery-toolbar">
          <div className="rella-filters" aria-label="Filter selected artwork">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                className={filter === item.value ? "is-active" : ""}
                aria-pressed={filter === item.value}
                onClick={() => { setFilter(item.value); setActiveId(null); }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p aria-live="polite">{String(visible.length).padStart(2, "0")} WORKS</p>
        </div>

        {visible.length === 0 ? (
          <div style={{ padding: "56px 0", textAlign: "center", color: "#74817e" }}>
            <p style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: "28px", color: "#303c40" }}>
              No saved illustrations yet.
            </p>
            <p style={{ marginTop: "8px", fontSize: "13px" }}>
              Open any illustration and click &ldquo;Save work&rdquo; to bookmark it to your collection.
            </p>
          </div>
        ) : (
          <div className="rella-art-grid">
            {visible.map((artwork, index) => {
              const savedKey = `rella-${artwork.id}`;
              const saved = isSaved(savedKey) || isSaved(artwork.id);
              return (
                <Reveal key={artwork.id} delay={(index % 3) * 75}>
                  <div style={{ position: "relative" }}>
                    <button
                      className="rella-work"
                      type="button"
                      onClick={() => setActiveId(artwork.id)}
                      aria-label={`View ${artwork.title} by Rella`}
                    >
                      <span className="rella-work-image">
                        <img src={artwork.image} alt={artwork.alt} loading="lazy" style={{ objectPosition: artwork.position ?? "center" }} />
                        <span className="rella-work-view" aria-hidden="true">VIEW ARTWORK <ArrowUpRight size={15} /></span>
                      </span>
                      <span className="rella-work-meta">
                        <span><span className="rella-work-title">{artwork.title}</span><span className="rella-work-label">{artwork.label}</span></span>
                        <span className="rella-work-year">{artwork.year}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(savedKey);
                      }}
                      aria-label={saved ? `Unsave ${artwork.title}` : `Save ${artwork.title}`}
                      aria-pressed={saved}
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        width: "32px",
                        height: "32px",
                        display: "grid",
                        placeItems: "center",
                        background: saved ? "#303c40" : "rgba(247, 246, 242, 0.88)",
                        color: saved ? "#f7f6f2" : "#303c40",
                        border: "1px solid rgba(48, 60, 64, 0.2)",
                        cursor: "pointer",
                      }}
                    >
                      <Heart size={14} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        <div className="rella-gallery-outro">
          <p>Every illustration here is by Rella. Open a work to find its original post.</p>
          <a className="rella-text-link" href={rellaLinks.pixiv} target="_blank" rel="noreferrer">
            More from Rella on Pixiv <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
      {selectedWork && (
        <ArtworkViewer
          artwork={selectedWork}
          index={selectedIndex >= 0 ? selectedIndex : 0}
          total={pool.length}
          onClose={() => setActiveId(null)}
          onPrevious={() => setActiveId(pool[(Math.max(0, selectedIndex) - 1 + pool.length) % pool.length].id)}
          onNext={() => setActiveId(pool[(Math.max(0, selectedIndex) + 1) % pool.length].id)}
        />
      )}
    </section>
  );
}

function RellaSymphony({ onSelectWork }: { onSelectWork?: (id: string) => void }) {
  const symphony = rellaArtworks.find((work) => work.id === "121525173")!;
  return (
    <section className="rella-symphony rella-section" aria-labelledby="rella-symphony-title">
      <div
        className="rella-symphony-image"
        style={{ cursor: "pointer" }}
        onClick={() => onSelectWork?.(symphony.id)}
      >
        <img src={symphony.image} alt={symphony.alt} loading="lazy" />
      </div>
      <Reveal className="rella-symphony-copy">
        <p className="rella-kicker">02 / MUSIC IN PICTURES</p>
        <h2 id="rella-symphony-title">A world in <em>harmony.</em></h2>
        <p>From shimmering concert halls to fantastical costumes, Rella&apos;s Hatsune Miku Symphony visuals give music a world to live in.</p>
        <a href={rellaOriginal(symphony.id)} target="_blank" rel="noreferrer" className="rella-text-link">
          See Symphony 2024 <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </Reveal>
    </section>
  );
}

function RellaAbout() {
  return (
    <section id="rella-about" className="rella-about rella-section">
      <div className="rella-container rella-about-grid">
        <Reveal>
          <p className="rella-kicker">03 / THE ARTIST</p>
          <h2>A little about <em>Rella.</em></h2>
          <p className="rella-about-intro">Illustrator, designer, and a storyteller in light.</p>
        </Reveal>
        <Reveal delay={100} className="rella-about-copy">
          <p>Rella is a Chinese illustrator whose dreamlike work brings together delicate color, expressive characters, and a love of music. Her illustrations and designs include Hatsune Miku Symphony and the key visual for Miku&apos;s 16th birthday.</p>
          <blockquote>
            <p>“I find it more important to grasp the balance of the whole piece.”</p>
            <cite>Rella, in conversation with <a href={rellaLinks.interview} target="_blank" rel="noreferrer">pixivision</a></cite>
          </blockquote>
          <div className="rella-social-links">
            <a href={rellaLinks.pixiv} target="_blank" rel="noreferrer">Pixiv <ArrowUpRight size={15} /></a>
            <a href={rellaLinks.x} target="_blank" rel="noreferrer">X / Twitter <ArrowUpRight size={15} /></a>
            <a href={rellaLinks.booth} target="_blank" rel="noreferrer">BOOTH <ArrowUpRight size={15} /></a>
            <a href={rellaLinks.exhibition} target="_blank" rel="noreferrer">Exhibition <ArrowUpRight size={15} /></a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function RellaFooter() {
  return (
    <footer className="rella-footer">
      <div className="rella-container">
        <div className="rella-footer-top">
          <div><p className="rella-kicker">AN INDEPENDENT TRIBUTE TO</p><p className="rella-footer-name">Rella<span>.</span></p></div>
          <div className="rella-footer-navigation">
            <a href="#rella-top">Back to the beginning <ArrowUpRight size={15} /></a>
            <ArtistLink artist="sankobite">Visit Sankobite&apos;s page <ArrowRight size={15} /></ArtistLink>
            <ArtistLink artist="tamimoon">Visit tamimoon&apos;s profile <ArrowRight size={15} /></ArtistLink>
            <Link href="/gallery">Explore studioNeo Gallery <ArrowRight size={15} /></Link>
            <Link href="/collection">Saved Vault <ArrowRight size={15} /></Link>
          </div>
        </div>
        <div className="rella-footer-bottom">
          <p>Unofficial fan-made tribute. All illustrations are by Rella and link to their original Pixiv posts. Hatsune Miku is a character of Crypton Future Media.</p>
          <a href={rellaLinks.pixiv} target="_blank" rel="noreferrer">SUPPORT THE ARTIST <ArrowUpRight size={13} /></a>
        </div>
      </div>
    </footer>
  );
}

export function RellaPage({
  selectedWorkId,
  onSelectWork,
}: {
  selectedWorkId?: string | null;
  onSelectWork?: (id: string | null) => void;
}) {
  return (
    <div className="rella-page">
      <a className="rella-skip-link" href="#rella-work">Skip to the artwork</a>
      <main>
        <RellaHero />
        <RellaGallery selectedWorkId={selectedWorkId} onSelectWork={onSelectWork} />
        <RellaSymphony onSelectWork={(id) => onSelectWork?.(id)} />
        <RellaAbout />
      </main>
      <RellaFooter />
    </div>
  );
}
