"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight } from "lucide-react";
import { prefersReducedMotion, useActiveSection, useReveal } from "./useSiteMotion";
import AnimationArchive from "./AnimationArchive";
import Viewer from "./Viewer";
import profileImage from "@/assets/yoneyamai/profile";
import {
  LONG_WALL,
  ORDER,
  P,
  ROOMS,
  SALON,
  catalogueNo,
  channels,
  chronology,
  exhibitions,
  wallImage,
  type Kind,
  type Piece,
} from "@/yoneyamaiData";
import "./yoneyamai.css";

const SPY = ["lobby", ...ROOMS.map((room) => room.id)];
const KIND_LETTER: Record<Kind, string> = { Solo: "S", Fair: "F", Public: "P" };
const vi = (n: number) => ({ "--i": n } as CSSProperties);
const ratio = (piece: Piece) => ({ "--ar": piece.w / piece.h } as CSSProperties);

/** A museum wall label: artist, title, year, medium. */
function Label({ piece, className = "" }: { piece: Piece; className?: string }) {
  return (
    <figcaption className={`label ${className}`}>
      <span className="label-no">No. {catalogueNo(piece.id)}</span>
      <strong>Yoneyama Mai</strong>
      <span>
        <em>{piece.title}</em>, {piece.year}
      </span>
      <span>{piece.medium}</span>
      {piece.shown && <span>{piece.shown}</span>}
    </figcaption>
  );
}

/** The work itself, hung on the wall. Click to look closer. */
function Work({
  piece,
  onOpen,
  eager = false,
}: {
  piece: Piece;
  onOpen: (piece: Piece) => void;
  eager?: boolean;
}) {
  return (
    <button
      type="button"
      className="work"
      style={ratio(piece)}
      aria-label={`Look closely at ${piece.title}`}
      onClick={() => onOpen(piece)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={wallImage(piece)}
        alt={piece.alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </button>
  );
}

export function YoneyamaiPage({
  selectedWorkId,
  onSelectWork,
}: {
  selectedWorkId?: string | null;
  onSelectWork?: (id: string | null) => void;
}) {
  const active = useActiveSection(SPY);
  const [viewer, setViewer] = useState<number | null>(null);
  const track = useRef<HTMLDivElement>(null);
  useReveal();

  // Deep-link synchronisation
  useEffect(() => {
    if (selectedWorkId) {
      const idx = ORDER.findIndex((item) => item.id === selectedWorkId);
      if (idx !== -1) {
        setViewer(idx);
      }
    }
  }, [selectedWorkId]);

  const open = (piece: Piece) => {
    const idx = ORDER.findIndex((item) => item.id === piece.id);
    setViewer(idx);
    onSelectWork?.(piece.id);
  };

  const handleIndexChange = (newIdx: number) => {
    setViewer(newIdx);
    if (ORDER[newIdx]) {
      onSelectWork?.(ORDER[newIdx].id);
    }
  };

  const handleClose = () => {
    setViewer(null);
    onSelectWork?.(null);
  };

  const walk = (direction: number) => {
    if (typeof window === "undefined") return;
    track.current?.scrollBy({
      left: direction * Math.min(window.innerWidth * 0.7, 760),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <div className="yoneyamai-page">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[90] focus:bg-ink focus:text-white focus:px-4 focus:py-2 focus:text-xs"
        href="#lobby"
      >
        Skip to the first room
      </a>

      {/* ----------------------- Signage bar (Rooms index) ----------------------- */}
      <header className="yoneyamai-bar" aria-label="Museum Room Navigation">
        <a className="yoneyamai-bar-name" href="#lobby">
          Yoneyama Mai · Exhibition
        </a>
        <nav className="yoneyamai-bar-rooms" aria-label="Rooms">
          {ROOMS.map((room) => (
            <a
              key={room.id}
              href={`#${room.id}`}
              className={active === room.id ? "is-here" : ""}
              aria-current={active === room.id ? "true" : undefined}
              aria-label={`Room ${room.num}, ${room.name}`}
              title={room.name}
            >
              {room.num}
            </a>
          ))}
        </nav>
      </header>

      <main>
        {/* ----------------------- Lobby ----------------------- */}
        <section id="lobby" className="room lobby" aria-label="Entrance">
          <div className="lobby-grid">
            <div className="lobby-title" data-reveal>
              <h1 aria-label="Yoneyama Mai">
                <span aria-hidden="true">Yoneyama</span>
                <span aria-hidden="true" className="lobby-second">
                  <em>Mai</em>
                  <i lang="ja">米山舞</i>
                </span>
              </h1>
            </div>

            <div className="lobby-side">
              <p className="placard" data-reveal style={vi(1)}>
                <strong>Yoneyama Mai</strong>
                <span>b. 1988, Nagano</span>
                <span>Illustration, animation</span>
              </p>

              <nav className="plan" aria-label="Floor plan" data-reveal style={vi(2)}>
                <span className="plan-title">Floor plan</span>
                {ROOMS.map((room) => (
                  <a
                    key={room.id}
                    href={`#${room.id}`}
                    className={`plan-room plan-${room.id} ${active === room.id ? "is-here" : ""}`}
                    aria-current={active === room.id ? "true" : undefined}
                  >
                    <b>{room.num}</b>
                    <span>{room.name}</span>
                  </a>
                ))}
                <span className="plan-door" aria-hidden="true" />
              </nav>

              <blockquote className="lobby-quote" data-reveal style={vi(3)}>
                <p>“No matter which part of the song you sing, it will still be part of that song.”</p>
                <cite>Yoneyama Mai, 2019</cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* ----------------------- I · Flare — one work, one wall ----------------------- */}
        <section id="flare" className="room room-flare" aria-label="Room I, Flare">
          <p className="side-title" aria-hidden="true">
            <b>I</b> Flare
          </p>
          <figure className="flare-wall" data-reveal>
            <Work piece={P.flare} onOpen={open} eager />
            <Label piece={P.flare} className="label--wall" />
          </figure>
        </section>

        {/* ----------------------- II · Salon — a salon hang ----------------------- */}
        <section id="salon" className="room room-salon" aria-label="Room II, Salon">
          <p className="corner-numeral" aria-hidden="true">
            II
          </p>
          <div className="salon">
            {SALON.map((piece, i) => (
              <figure
                key={piece.id}
                className={`frame-wrap s${i + 1}`}
                data-reveal
                style={vi(i % 3)}
              >
                <div className="frame">
                  <Work piece={piece} onOpen={open} />
                </div>
                <span className="tick" aria-hidden="true">
                  {catalogueNo(piece.id)}
                </span>
                <span className="sr">
                  {piece.title}, {piece.year}
                </span>
              </figure>
            ))}

            <ol className="legend" data-reveal aria-label="Legend">
              {SALON.map((piece) => (
                <li key={piece.id}>
                  <span>{catalogueNo(piece.id)}</span>
                  <em>{piece.title}</em>
                  <small>{piece.year}</small>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ----------------------- III · Gallery — a long wall ----------------------- */}
        <section id="gallery" className="room room-gallery" aria-label="Room III, Gallery">
          <div
            className="long-wall"
            ref={track}
            tabIndex={0}
            role="region"
            aria-label="Long wall. Scroll sideways to walk along it."
          >
            {LONG_WALL.map((piece, i) => (
              <figure
                key={piece.id}
                className="long-piece"
                style={{ ...ratio(piece), "--i": i } as CSSProperties}
              >
                <Work piece={piece} onOpen={open} eager />
                <Label piece={piece} className="label--card" />
              </figure>
            ))}
            <div className="bench" aria-hidden="true">
              <i />
              <i />
            </div>
          </div>

          <div className="floor-note">
            <p>
              <b>III</b> Gallery
            </p>
            <div>
              <button type="button" onClick={() => walk(-1)} aria-label="Walk left">
                <ArrowLeft size={18} />
              </button>
              <button type="button" onClick={() => walk(1)} aria-label="Walk right">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* ----------------------- IV · Screening — a dark room ----------------------- */}
        <section id="screening" className="room room-screening" aria-label="Room IV, Screening">
          <span className="beam" aria-hidden="true" />
          <div className="screening-archive-content">
            <p className="now-showing">
              <i aria-hidden="true" /> IV · Screening room
            </p>
            <div className="screening-intro" data-reveal>
              <h2>Animation archive</h2>
              <p>
                Trailers, ending sequences and music videos — with Yoneyama Mai&apos;s credited role on every title.
              </p>
            </div>
            <AnimationArchive />
          </div>
          <div className="seats" aria-hidden="true">
            <i />
            <i />
          </div>
        </section>

        {/* ----------------------- V · Chronology — wall vinyl ----------------------- */}
        <section id="chronology" className="room room-chronology" aria-label="Room V, Chronology">
          <p className="vinyl-head">
            <b>V</b> Chronology
          </p>
          <p className="vinyl" data-reveal>
            {chronology.map((entry) => (
              <span className="ve" key={entry.year}>
                <span className="vy">{entry.year}</span>
                {entry.items.join(" ")}{" "}
              </span>
            ))}
          </p>
        </section>

        {/* ----------------------- VI · Exhibitions — wayfinding ----------------------- */}
        <section id="exhibitions" className="room room-directory" aria-label="Room VI, Exhibitions">
          <div className="sign" data-reveal>
            <div className="sign-head">
              <span>Exhibitions</span>
              <span aria-hidden="true">VI →</span>
            </div>
            <ul>
              {exhibitions.map((show) => (
                <li key={show.year + show.name}>
                  <a href={show.url} target="_blank" rel="noreferrer">
                    <span className="sg-year">{show.year}</span>
                    <span className="sg-kind" role="img" aria-label={show.kind}>
                      {KIND_LETTER[show.kind]}
                    </span>
                    <span className="sg-name">{show.name}</span>
                    <span className="sg-venue">{show.venue}</span>
                    <ArrowUpRight size={22} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="sign-key" aria-hidden="true">
              <span><b>S</b> Solo</span>
              <span><b>F</b> Fair</span>
              <span><b>P</b> Public</span>
            </p>
          </div>
        </section>

        {/* ----------------------- VII · Artist — a single panel ----------------------- */}
        <section id="artist" className="room room-artist" aria-label="Room VII, Artist">
          <article className="panel" data-reveal>
            <p className="panel-room">
              <b>VII</b> Artist
            </p>
            <div className="panel-body">
              <div className="portrait">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profileImage}
                  alt="Yoneyama Mai's profile image: a black-and-white illustrated silhouette of a face in profile with a large round earring"
                  width={132}
                  height={132}
                />
              </div>
              <div>
                <h2>
                  Yoneyama Mai <span lang="ja">米山舞</span>
                </h2>
                <p>b. 1988, Nagano. Lives and works in Tokyo.</p>
                <p>Illustration, animation.</p>
              </div>
            </div>
            <ul className="panel-links">
              {channels.map((channel) => (
                <li key={channel.label}>
                  <a href={channel.url} target="_blank" rel="noreferrer">
                    {channel.label} <ArrowUpRight size={13} />
                  </a>
                </li>
              ))}
            </ul>
          </article>

          <div className="exit-row">
            <a className="exit-sign" href="#lobby">
              <ArrowUp size={16} aria-hidden="true" /> Exit
            </a>
            <p>Unofficial profile archive. All artwork © Yoneyama Mai, shown via yoneyamai.com.</p>
          </div>
        </section>
      </main>

      <Viewer
        items={ORDER}
        index={viewer}
        onIndex={handleIndexChange}
        onClose={handleClose}
      />
    </div>
  );
}
