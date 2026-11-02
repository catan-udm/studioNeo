'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  illustrators,
  type Illustrator,
  getArtistHref,
} from '@/data/illustrators';
import { getArtistPixiv, getArtistTwitter } from './artistSocials';
import './artistIndex.css';

export const artistTitle: Record<string, string> = {
  sankobite: 'sankobite',
  rella: 'Rella',
  tamimoon: 'tamimoon',
  yoneyamai: 'Yoneyama Mai',
  mikapikazo: 'Mika Pikazo',
  dinoillus: 'DINO',
  lam: 'LAM',
  dolman: 'Dolman',
  tatamipi: 'tatamipi',
  askziye: 'ASK',
  dora: 'Dora',
  kaduise: 'kaduise',
  kda: 'KDA',
};

export const artistBySlug: Record<string, Illustrator> = Object.fromEntries(
  illustrators.flatMap((a) => {
    const href = getArtistHref(a);
    return href.isInternal ? [[href.href.split('/').pop() as string, a] as const] : [];
  }),
);

const residents = Object.entries(artistBySlug)
  .map(([slug, artist]) => ({ slug, artist }))
  .filter((entry): entry is { slug: string; artist: Illustrator } => Boolean(entry.artist));

function slugOf(artist: Illustrator) {
  const target = getArtistHref(artist);
  return target.isInternal ? target.href.slice('/artist/'.length) : null;
}

function ArrowRightIcon({ size = 17 }: { size?: number }) {
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
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

function ArrowUpRightIcon({
  size = 16,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
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
      className={className}
    >
      <path d="M5 19 19 5M8 5h11v11" />
    </svg>
  );
}

function SearchIcon({ size = 18 }: { size?: number }) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function CloseIcon({ size = 15 }: { size?: number }) {
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
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}

function TwitterIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function PixivIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4.94 0A4.953 4.953 0 0 0 0 4.94v14.12A4.953 4.953 0 0 0 4.94 24h14.12A4.953 4.953 0 0 0 24 19.06c-.014 1.355 0-14.12 0-14.12A4.953 4.953 0 0 0 19.06 0Zm1.783 5.465h.904a.37.37 0 0 1 .31.17l.752 1.17a6.172 6.172 0 0 1 10.01 4.834a6.172 6.172 0 0 1-9.394 5.265v2.016a.37.37 0 0 1-.37.367H6.724a.37.37 0 0 1-.37-.367V5.834a.37.37 0 0 1 .37-.37m5.804 2.951a3.222 3.222 0 1 0-.002 6.443a3.222 3.222 0 0 0 .002-6.443" />
    </svg>
  );
}

function ArchiveItem({
  slug,
  artist,
  index,
}: {
  slug: string;
  artist: Illustrator;
  index: number;
}) {
  return (
    <Link
      href={`/artist/${slug}`}
      className="archive-item group"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <div className="archive-item-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artist.image}
          alt={`${artistTitle[slug] ?? artist.name} portrait`}
          loading={index < 4 ? 'eager' : 'lazy'}
        />
      </div>
      <div className="archive-item-info">
        <div>
          <span className="archive-item-index">
            {String(index + 1).padStart(2, '0')} / ARCHIVE
          </span>
          <h3>{artistTitle[slug] ?? artist.name}</h3>
          <p>@{artist.handle}</p>
        </div>
        <span className="archive-item-arrow" aria-hidden="true">
          <ArrowUpRightIcon size={18} />
        </span>
      </div>
    </Link>
  );
}

function Footer() {
  return (
    <footer className="artist-footer" aria-label="Footer">
      <div className="artist-footer-inner">
        <Link href="/" className="artist-footer-brand">
          studioNeo
        </Link>
        <span className="artist-footer-meta">
          {illustrators.length} illustrators · official profile links
        </span>
        <nav className="artist-footer-nav" aria-label="Footer navigation">
          <Link href="/">Studio</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/artist">Artists</Link>
        </nav>
      </div>
    </footer>
  );
}

export default function ArtistIndexClient() {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<'all' | 'archives'>('all');
  const [sort, setSort] = useState<'az' | 'za' | 'featured'>('az');

  const roster = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^@/, '');
    const filtered = illustrators.filter((artist) => {
      const slug = slugOf(artist);
      const matches = [
        artist.name,
        artist.handle,
        artist.requestedHandle,
        artist.displayName,
        slug ? artistTitle[slug] : '',
      ].some((value) => value?.toLowerCase().includes(q));
      return matches && (scope === 'all' || Boolean(slug));
    });
    if (sort === 'az') {
      return [...filtered].sort((a, b) =>
        (artistTitle[slugOf(a) ?? ''] ?? a.name).localeCompare(
          artistTitle[slugOf(b) ?? ''] ?? b.name,
        ),
      );
    }
    if (sort === 'za') {
      return [...filtered].sort((a, b) =>
        (artistTitle[slugOf(b) ?? ''] ?? b.name).localeCompare(
          artistTitle[slugOf(a) ?? ''] ?? a.name,
        ),
      );
    }
    return filtered;
  }, [query, scope, sort]);

  return (
    <main id="main-content" className="site-bg text-ink artist-directory">
      <section
        className="artist-directory-hero"
        aria-labelledby="artist-directory-title"
      >
        <div className="artist-hero-wall" aria-hidden="true">
          {illustrators.slice(0, 32).map((artist) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={artist.id} src={artist.image} alt="" />
          ))}
        </div>
        <div className="artist-hero-wash" aria-hidden="true" />
        <div className="artist-hero-content">
          <span className="artist-hero-kicker">
            <span className="artist-hero-kicker-line" /> STUDIO NEO / ARTIST INDEX
          </span>
          <h1 id="artist-directory-title">
            Artists of<br />
            <em>studioNeo.</em>
          </h1>
          <p>
            A living directory of the illustrators, image-makers, and visual storytellers
            behind the archive.
          </p>
          <a href="#resident-archives" className="artist-hero-cta">
            Explore the artists <ArrowRightIcon size={17} />
          </a>
        </div>
        <span className="artist-hero-corner" aria-hidden="true">
          001 — {String(illustrators.length).padStart(3, '0')}
          <br />
          TOKYO / EVERYWHERE
        </span>
      </section>

      <section
        id="resident-archives"
        className="artist-archives-section"
        aria-labelledby="resident-heading"
      >
        <div className="artist-section-head">
          <div>
            <span className="artist-section-kicker">01 / RESIDENT COLLECTIONS</span>
            <h2 id="resident-heading">
              Enter an archive<span>.</span>
            </h2>
            <p>Individual spaces for artists whose work shapes the studioNeo world.</p>
          </div>
          <span className="artist-section-count">
            {String(residents.length).padStart(2, '0')} ARTIST ARCHIVES
          </span>
        </div>
        <div className="archive-directory-grid">
          {residents.map(({ slug, artist }, index) => (
            <ArchiveItem
              key={slug}
              slug={slug}
              artist={artist}
              index={index}
            />
          ))}
        </div>
      </section>

      <section
        id="full-roster"
        className="artist-roster-section"
        aria-labelledby="roster-heading"
      >
        <div className="artist-roster-inner">
          <div className="artist-section-head">
            <div>
              <span className="artist-section-kicker">02 / THE COMPLETE DIRECTORY</span>
              <h2 id="roster-heading">
                The full roster<span>.</span>
              </h2>
              <p>Find a name, discover an archive, or visit an artist at the source.</p>
            </div>
            <span className="artist-section-count">
              {String(illustrators.length).padStart(2, '0')} ILLUSTRATORS
            </span>
          </div>

          <div className="roster-toolbar">
            <label className="roster-query">
              <SearchIcon size={18} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or @handle"
                aria-label="Search illustrators"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  <CloseIcon size={15} />
                </button>
              )}
            </label>
            <div className="roster-scope" role="group" aria-label="Filter roster">
              <button
                type="button"
                className={scope === 'all' ? 'is-active' : ''}
                onClick={() => setScope('all')}
              >
                All artists
              </button>
              <button
                type="button"
                className={scope === 'archives' ? 'is-active' : ''}
                onClick={() => setScope('archives')}
              >
                With archives
              </button>
            </div>
            <label className="roster-sort-label">
              <span>Sort</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as typeof sort)}
                aria-label="Sort artists"
              >
                <option value="az">Name A–Z</option>
                <option value="za">Name Z–A</option>
                <option value="featured">Featured order</option>
              </select>
            </label>
          </div>

          <div className="roster-result-line" aria-live="polite">
            SHOWING {roster.length} OF {illustrators.length} ARTISTS
          </div>
          <div className="roster-grid">
            {roster.map((artist) => {
              const slug = slugOf(artist);
              const displayName = (slug && artistTitle[slug]) || artist.name;
              const twitterUrl = getArtistTwitter(artist);
              const pixivUrl = getArtistPixiv(artist);

              return (
                <div key={artist.id} className="roster-row">
                  {slug ? (
                    <Link
                      href={`/artist/${slug}`}
                      className="roster-link-wrap has-archive"
                      aria-label={`Open ${displayName} archive`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={artist.image} alt="" loading="lazy" />
                      <div className="roster-identity">
                        <strong>{displayName}</strong>
                        <span>@{artist.handle}</span>
                      </div>
                      <span className="roster-archive-pill">
                        ARCHIVE <ArrowUpRightIcon size={12} />
                      </span>
                    </Link>
                  ) : (
                    <div className="roster-link-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={artist.image} alt="" loading="lazy" />
                      <div className="roster-identity">
                        <strong>{displayName}</strong>
                        <span>@{artist.handle}</span>
                      </div>
                    </div>
                  )}

                  <div
                    className="roster-socials"
                    aria-label={`Social links for ${displayName}`}
                  >
                    <a
                      href={twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="roster-social-btn twitter"
                      aria-label={`${displayName} on X / Twitter`}
                      title={`${displayName} on X / Twitter`}
                    >
                      <TwitterIcon size={14} />
                    </a>
                    <a
                      href={pixivUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="roster-social-btn pixiv"
                      aria-label={`${displayName} on Pixiv`}
                      title={`${displayName} on Pixiv`}
                    >
                      <PixivIcon size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
            {roster.length === 0 && (
              <div className="roster-empty">
                <span className="artist-section-kicker">NO RESULTS</span>
                <h3>No artist found.</h3>
                <p>Try another name or handle.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setScope('all');
                  }}
                >
                  Clear filters <ArrowRightIcon size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="artist-directory-end">
        <span className="artist-section-kicker">BEYOND THE PORTRAIT</span>
        <h2>Follow the work.</h2>
        <p>From a single sketch to an entire visual world, explore what the artists make.</p>
        <div>
          <Link href="/projects">
            View projects <ArrowUpRightIcon size={17} />
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
