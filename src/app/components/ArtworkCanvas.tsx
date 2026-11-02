import React from 'react';
import type { GalleryWork } from '../gallery/galleryData';

interface ArtworkCanvasProps {
  work: GalleryWork;
  className?: string;
  includeGifFallback?: boolean;
  objectFit?: 'contain' | 'cover';
  watermarkLabel?: string;
  patternPrefix?: string;
}

/**
 * Geometric Vector Artwork Cel Generator
 * Creates an authentic minimalist studio cel inside each card's 1:1 media container.
 */
export default function ArtworkCanvas({
  work,
  className = 'ig-artwork-svg',
  includeGifFallback = false,
  objectFit = 'contain',
  watermarkLabel,
  patternPrefix = 'grid',
}: ArtworkCanvasProps) {
  const mediaSrc = work.svgSrc || (includeGifFallback ? work.gifSrc : undefined);
  if (mediaSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mediaSrc}
        alt={work.title}
        className={className || undefined}
        style={{ width: '100%', height: '100%', objectFit }}
        loading="lazy"
      />
    );
  }

  const isMono = work.category === 'Mono';
  const strokeColor = isMono ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.45)';
  const accentFill = isMono ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
  const gridStroke = isMono ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
  const patternId = `${patternPrefix}-${work.id}`;

  return (
    <svg
      className={className || undefined}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="400" height="400" fill={work.color} />

      <defs>
        <pattern id={patternId} width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke={gridStroke} strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill={`url(#${patternId})`} />

      {work.category === 'Generative' && (
        <g stroke={strokeColor} fill="none" strokeWidth="1.5">
          <circle cx="200" cy="200" r="130" strokeDasharray="6 4" />
          <circle cx="200" cy="200" r="95" />
          <circle cx="200" cy="200" r="60" strokeDasharray="3 3" />
          <line x1="50" y1="200" x2="350" y2="200" strokeWidth="0.8" strokeDasharray="2 4" />
          <line x1="200" y1="50" x2="200" y2="350" strokeWidth="0.8" strokeDasharray="2 4" />
          <polygon points="200,85 295,245 105,245" strokeWidth="1.2" fill={accentFill} />
          <circle cx="200" cy="200" r="14" fill={strokeColor} />
          <circle cx="200" cy="85" r="4" fill={strokeColor} />
          <circle cx="295" cy="245" r="4" fill={strokeColor} />
          <circle cx="105" cy="245" r="4" fill={strokeColor} />
        </g>
      )}

      {work.category === 'Kinetic' && (
        <g stroke={strokeColor} fill="none" strokeWidth="1.75">
          <path d="M 50 260 Q 200 60 350 260" strokeWidth="2" />
          <path d="M 50 220 Q 200 20 350 220" strokeWidth="1.2" strokeDasharray="5 3" />
          <path d="M 50 300 Q 200 100 350 300" strokeWidth="1" opacity="0.7" />
          <circle cx="200" cy="160" r="50" fill={accentFill} />
          <line x1="70" y1="70" x2="330" y2="330" strokeWidth="1" strokeDasharray="4 4" />
          <rect x="175" y="135" width="50" height="50" transform="rotate(45 200 160)" strokeWidth="1.5" />
          <circle cx="200" cy="160" r="6" fill={strokeColor} />
        </g>
      )}

      {work.category === 'Vectors' && (
        <g stroke={strokeColor} fill="none" strokeWidth="1.6">
          <polygon points="200,90 295,145 295,255 200,310 105,255 105,145" strokeWidth="2" />
          <line x1="200" y1="90" x2="200" y2="200" strokeWidth="1.5" />
          <line x1="200" y1="200" x2="295" y2="255" strokeWidth="1.5" />
          <line x1="200" y1="200" x2="105" y2="255" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="32" fill={accentFill} />
          <circle cx="200" cy="90" r="5" fill={strokeColor} />
          <circle cx="295" cy="145" r="5" fill={strokeColor} />
          <circle cx="295" cy="255" r="5" fill={strokeColor} />
          <circle cx="200" cy="310" r="5" fill={strokeColor} />
          <circle cx="105" cy="255" r="5" fill={strokeColor} />
          <circle cx="105" cy="145" r="5" fill={strokeColor} />
        </g>
      )}

      {work.category === 'Mono' && (
        <g stroke="#ffffff" fill="none" strokeWidth="1.5">
          <circle cx="200" cy="200" r="140" opacity="0.25" strokeDasharray="2 3" />
          <circle cx="200" cy="200" r="110" opacity="0.45" />
          <circle cx="200" cy="200" r="80" strokeWidth="2" />
          <circle cx="200" cy="200" r="50" strokeDasharray="4 2" />
          <circle cx="200" cy="200" r="18" fill="#ffffff" />
          <line x1="40" y1="200" x2="360" y2="200" strokeWidth="0.8" opacity="0.35" />
          <line x1="200" y1="40" x2="200" y2="360" strokeWidth="0.8" opacity="0.35" />
        </g>
      )}

      <text
        x="376"
        y="384"
        textAnchor="end"
        fill={strokeColor}
        fontSize="10"
        fontFamily="monospace"
        fontWeight="600"
        opacity="0.8"
        letterSpacing="0.08em"
      >
        {work.code} • {watermarkLabel || 'studioNeo'}
      </text>
    </svg>
  );
}
