'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PaletteArtwork from './PaletteArtwork';
import {
  illustrators,
  type Illustrator,
  getArtistHref,
  formatFollowers,
} from '@/data/illustrators';

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

export function ArrowIcon({ size = 19 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 19 19 5M8 5h11v11" />
    </svg>
  );
}

const spotlightArtists = [
  illustrators[0], // sankobite
  illustrators[4], // mika pikazo
  illustrators[3], // yoneyama mai
  illustrators[6], // ramdayo (LAM)
];

type SortMode = 'featured' | 'followers' | 'az';

function ArtistCard({ artist, index }: { artist: Illustrator; index: number }) {
  const accent = accents[index % accents.length];
  const handleChanged = artist.requestedHandle.toLowerCase() !== artist.handle.toLowerCase();
  const { href, isInternal } = getArtistHref(artist);

  const LinkComp = isInternal ? Link : 'a';
  const linkProps = isInternal
    ? { href }
    : { href, target: '_blank', rel: 'noopener noreferrer' };

  return (
    <article className="artist-card" style={{ ['--accent' as string]: accent }}>
      <LinkComp
        className="artist-link"
        {...linkProps}
        aria-label={
          isInternal
            ? `Open ${artist.name} (@${artist.handle}) tribute archive`
            : `Open ${artist.name} (@${artist.handle}) X profile in a new tab`
        }
      >
        <div className="artist-image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artist.image}
            alt={`${artist.name} (@${artist.handle}) official X profile picture`}
            width={280}
            height={280}
            loading="lazy"
            decoding="async"
          />
          <span className="artist-index">{String(artist.id).padStart(2, '0')}</span>
          <span className="artist-visit">
            {isInternal ? 'Archive' : `@${artist.handle}`} <ArrowIcon size={13} />
          </span>
        </div>
        <div className="artist-caption">
          <div className="artist-caption-text">
            <h3>{artist.name}</h3>
            <span className="artist-handle-line">
              @{artist.handle}
              {handleChanged ? ` · (${artist.requestedHandle})` : ''}
              {artist.displayName && artist.displayName.toLowerCase() !== artist.name.toLowerCase()
                ? ` · ${artist.displayName}`
                : ''}
            </span>
            <span className="artist-meta-line">{formatFollowers(artist.followers)}</span>
          </div>
          <span className="artist-dot" />
        </div>
      </LinkComp>
    </article>
  );
}

export default function StudioLanding() {
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('featured');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^@/, '');
    const base = q
      ? illustrators.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.handle.toLowerCase().includes(q) ||
            a.requestedHandle.toLowerCase().includes(q) ||
            a.displayName.toLowerCase().includes(q),
        )
      : [...illustrators];

    if (sortMode === 'followers') {
      return [...base].sort((a, b) => b.followers - a.followers);
    }
    if (sortMode === 'az') {
      return [...base].sort((a, b) => a.name.localeCompare(b.name));
    }
    return base;
  }, [query, sortMode]);

  return (
    <main id="main-content" className="studio-landing-root">
      {/* Hero Section */}
      <div className="landing-page">
        <section className="landing-hero" aria-labelledby="landing-title">
          <PaletteArtwork />
          <div className="landing-content">
            <div className="landing-copy">
              <h1 id="landing-title">bikko.studio</h1>
              <p>Go ahead and say just a little more about what you do.</p>
            </div>
            <div className="landing-actions" role="group" aria-label="Primary landing actions">
              <a className="landing-button landing-button-primary" href="#gallery">
                Browse the gallery
              </a>
              <Link className="landing-button landing-button-secondary" href="/projects">
                Projects
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Curated Spotlight */}
      <section className="studio-spotlight" aria-labelledby="spotlight-title">
        <div className="spotlight-shell">
          <div className="spotlight-header">
            <div>
              <span className="eyebrow">Curated Spotlight</span>
              <h2 id="spotlight-title">Featured in the studio.</h2>
            </div>
            <a className="text-link" href="#gallery">
              View all {illustrators.length} in Gallery <ArrowIcon size={15} />
            </a>
          </div>
          <div className="spotlight-grid">
            {spotlightArtists.map((artist) => {
              const { href, isInternal } = getArtistHref(artist);
              const CardLink = isInternal ? Link : 'a';
              const cardProps = isInternal
                ? { href }
                : { href, target: '_blank', rel: 'noopener noreferrer' };

              return (
                <CardLink
                  key={artist.handle}
                  className="spotlight-card"
                  {...cardProps}
                >
                  <div className="spotlight-img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={artist.image}
                      alt={`${artist.name} profile picture`}
                      width={240}
                      height={240}
                      loading="eager"
                    />
                    <span className="spotlight-chip">
                      {isInternal ? 'Artist Archive' : 'Official profile'} <ArrowIcon size={12} />
                    </span>
                  </div>
                  <div className="spotlight-meta">
                    <h3>{artist.name}</h3>
                    <span className="spotlight-handle">@{artist.handle}</span>
                    <small>{formatFollowers(artist.followers)}</small>
                  </div>
                </CardLink>
              );
            })}
          </div>
        </div>
      </section>

      {/* Full 64-Artist Directory / Gallery Section */}
      <section id="gallery" className="featured-section gallery-section" aria-labelledby="featured-title">
        <div className="section-shell">
          <div className="featured-rail">
            <div className="featured-intro">
              <span className="eyebrow">Gallery archive · {illustrators.length} profiles</span>
              <h1 id="featured-title" aria-label="The artist archive">
                The artist
                <br />
                archive<span className="period">.</span>
              </h1>
              <p>
                Search the full roster and follow every portrait to its source. Each image is the illustrator&apos;s real
                X profile photo from <code>pbs.twimg.com</code>, never generated or substituted.
              </p>
              <dl className="stat-row">
                <div>
                  <dt>Illustrators</dt>
                  <dd>{illustrators.length}</dd>
                </div>
                <div>
                  <dt>Showing</dt>
                  <dd>{filtered.length}</dd>
                </div>
                <div>
                  <dt>Portraits</dt>
                  <dd>Real X</dd>
                </div>
              </dl>

              <div className="roster-controls" role="search" aria-label="Filter illustrators">
                <label className="search-field-wrap" htmlFor="illustrator-search">
                  <input
                    id="illustrator-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search 64 illustrators (@handle or name)…"
                    className="roster-search-input"
                  />
                  {query && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setQuery('')}
                      aria-label="Clear search"
                    >
                      Clear
                    </button>
                  )}
                </label>

                <div className="sort-pills" role="group" aria-label="Sort illustrators">
                  <button
                    type="button"
                    className={`sort-pill${sortMode === 'featured' ? ' active' : ''}`}
                    onClick={() => setSortMode('featured')}
                  >
                    Featured ({illustrators.length})
                  </button>
                  <button
                    type="button"
                    className={`sort-pill${sortMode === 'followers' ? ' active' : ''}`}
                    onClick={() => setSortMode('followers')}
                  >
                    Most Followed
                  </button>
                  <button
                    type="button"
                    className={`sort-pill${sortMode === 'az' ? ' active' : ''}`}
                    onClick={() => setSortMode('az')}
                  >
                    A–Z
                  </button>
                </div>
              </div>

              <span className="gallery-count-note">
                Showing {filtered.length} of {illustrators.length} illustrators
              </span>
            </div>
          </div>

          <div className="artists-grid" aria-live="polite">
            {filtered.map((artist, index) => (
              <ArtistCard key={artist.handle} artist={artist} index={index} />
            ))}
            {filtered.length === 0 && (
              <div className="gallery-empty-state">
                <span className="eyebrow">No match</span>
                <h3>Try another name.</h3>
                <p>Search by display name or X handle.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Beyond the Grid */}
      <section className="studio-next" aria-labelledby="studio-next-title">
        <div className="studio-next-copy">
          <span className="eyebrow">Beyond the grid</span>
          <h2 id="studio-next-title">The people are the picture.</h2>
          <p>
            Explore four editorial paths through the roster, or open the complete directory to search all {illustrators.length} illustrators.
          </p>
        </div>
        <div className="studio-next-links">
          <Link className="text-link" href="/projects">
            Explore projects <ArrowIcon size={16} />
          </Link>
          <a className="text-link" href="#gallery">
            Search the {illustrators.length}-artist gallery <ArrowIcon size={16} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <Link className="site-footer-brand" href="/">
          bikko.studio
        </Link>
        <span>{illustrators.length} illustrators · official profile links</span>
        <nav aria-label="Footer navigation">
          <Link href="/">Studio</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/about">About</Link>
        </nav>
      </footer>
    </main>
  );
}
