'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { illustrators, type Illustrator, getArtistHref } from '@/data/illustrators';

/** Accent colors sampled from the reference studioneo hero palette grid. */
const accents = [
  '#c496ff',
  '#f4cc7f',
  '#ff9d96',
  '#ff3380',
  '#737373',
  '#ac332b',
  '#e2750d',
  '#bffc3f',
  '#d99af0',
  '#344553',
  '#f2479d',
  '#8d1409',
  '#7e7f77',
  '#fcf6bd',
  '#a9def9',
];

const GRID_COLS = 8;

/** Deterministic-per-load PRNG so the shuffle is random but stable while mounted. */
function makeRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fills the 8x8 grid with colors drawn at random from the reference palette,
 * then swaps until no tile shares a color with its up/down/left/right neighbour.
 */
function shuffleGridColors(count: number, rng: () => number): string[] {
  const colors: string[] = [];
  while (colors.length < count) colors.push(...accents);
  const out = colors.slice(0, count);

  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }

  const rows = Math.ceil(count / GRID_COLS);
  const clashes = (i: number) => {
    const row = Math.floor(i / GRID_COLS);
    const col = i % GRID_COLS;
    const neighbours = [
      row > 0 ? (row - 1) * GRID_COLS + col : -1,
      row < rows - 1 ? (row + 1) * GRID_COLS + col : -1,
      col > 0 ? i - 1 : -1,
      col < GRID_COLS - 1 ? i + 1 : -1,
    ].filter((n) => n >= 0 && n < count);
    return neighbours.some((n) => out[n] === out[i]);
  };

  for (let i = 0; i < out.length; i++) {
    if (!clashes(i)) continue;
    for (let attempt = 0; attempt < 14; attempt++) {
      const swap = Math.floor(rng() * out.length);
      if (swap === i) continue;
      [out[i], out[swap]] = [out[swap], out[i]];
      if (!clashes(i) && !clashes(swap)) break;
      [out[i], out[swap]] = [out[swap], out[i]];
    }
  }
  return out;
}

const gridColors = shuffleGridColors(illustrators.length, makeRng(0x9e3779b9));

/** 8x8 kinetic color grid: one tile per illustrator (64 total). */
const palette: { id: number; color: string; artist: Illustrator }[] = illustrators.map((artist, index) => ({
  id: index + 1,
  color: gridColors[index],
  artist,
}));

/**
 * Hero 8x8 kinetic color grid — all 64 illustrators, one tile each.
 * Hovering any tile reveals that illustrator's real X profile photo underneath,
 * and tiles also periodically cycle open like the reference kinetic grid.
 */
export default function PaletteArtwork() {
  const [revealedIds, setRevealedIds] = useState<number[]>([3, 12, 22, 29, 38, 47, 53, 60]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const interval = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      setRevealedIds((prev) => {
        const allIds = palette.map((p) => p.id);
        const candidates = allIds.filter((id) => !prev.includes(id));
        const picks: number[] = [];
        for (let i = 0; i < 2 && candidates.length > 0; i++) {
          const pick = candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0];
          picks.push(pick);
        }
        const trimmed = prev.length >= 10 ? prev.slice(picks.length) : prev;
        return [...trimmed, ...picks];
      });
    }, 1400);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="code-art" role="region" aria-label="Kinetic grid of all 64 featured illustrators">
      <div className="code-art-grid">
        {palette.map((tile) => {
          const artist = tile.artist;
          const isRevealed = revealedIds.includes(tile.id);
          const { href, isInternal } = getArtistHref(artist);

          const tileContent = (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artist.image}
                alt={`${artist.name} (@${artist.handle}) profile picture`}
                width={240}
                height={240}
                loading="eager"
                decoding="sync"
                className="gallery-image"
              />
              <div className="code-art-overlay" style={{ backgroundColor: tile.color }} />
            </>
          );

          const className = `code-art-tile code-art-hover${isRevealed ? ' is-revealed' : ''}`;
          const ariaLabel = isInternal
            ? `Open ${artist.name} (@${artist.handle}) archive`
            : `Visit ${artist.name} (@${artist.handle}) on X`;

          if (isInternal) {
            return (
              <Link
                key={tile.id}
                href={href}
                className={className}
                aria-label={ariaLabel}
              >
                {tileContent}
              </Link>
            );
          }

          return (
            <a
              key={tile.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
              aria-label={ariaLabel}
            >
              {tileContent}
            </a>
          );
        })}
      </div>
    </div>
  );
}
