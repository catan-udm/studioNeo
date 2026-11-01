/**
 * Dora Studio Artwork Illustration Generator
 * Generates high-fidelity bespoke vector artboards for 哆啦小熙's studio archive.
 * Zero network dependencies and zero 404 errors.
 */

type ArtworkMeta = {
  id: string;
  title: string;
  englishTitle: string;
  kind: string;
  moods: string[];
  year: string;
};

const MOOD_THEMES: Record<string, { bg1: string; bg2: string; accent: string; text: string; sub: string }> = {
  night: {
    bg1: "#120f1d",
    bg2: "#211a34",
    accent: "#5ce1e6",
    text: "#f0eeff",
    sub: "#a59bc8",
  },
  dusk: {
    bg1: "#291b2e",
    bg2: "#4a243b",
    accent: "#ff704b",
    text: "#fff1e8",
    sub: "#d99b92",
  },
  day: {
    bg1: "#f2f0f7",
    bg2: "#e4e0ef",
    accent: "#6b5894",
    text: "#181424",
    sub: "#6b647d",
  },
  indoor: {
    bg1: "#261e20",
    bg2: "#3b2b2b",
    accent: "#f5a623",
    text: "#fff4ea",
    sub: "#c7a28e",
  },
  nature: {
    bg1: "#1b2c28",
    bg2: "#2a423a",
    accent: "#72d6a4",
    text: "#f0fbf5",
    sub: "#9ac0b0",
  },
  fashion: {
    bg1: "#1c1824",
    bg2: "#2f273d",
    accent: "#ff79a6",
    text: "#ffffff",
    sub: "#b7a9ce",
  },
};

export function generateDoraArtwork(meta: ArtworkMeta, isThumb = false): string {
  const primaryMood = meta.moods[0] || "day";
  const theme = MOOD_THEMES[primaryMood] || MOOD_THEMES.day;
  const w = isThumb ? 360 : 840;
  const h = isThumb ? 480 : 1120;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="bg-${meta.id}" x1="0%" y1="0%" x2="40%" y2="100%">
        <stop offset="0%" stop-color="${theme.bg1}"/>
        <stop offset="100%" stop-color="${theme.bg2}"/>
      </linearGradient>
      <linearGradient id="orb-${meta.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0.1"/>
      </linearGradient>
      <radialGradient id="glow-${meta.id}" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid-${meta.id}" width="28" height="28" patternUnits="userSpaceOnUse">
        <path d="M 28 0 L 0 0 0 28" fill="none" stroke="${theme.text}" stroke-opacity="0.04" stroke-width="1"/>
      </pattern>
    </defs>

    <!-- Canvas Background -->
    <rect width="${w}" height="${h}" fill="url(#bg-${meta.id})"/>
    <rect width="${w}" height="${h}" fill="url(#glow-${meta.id})"/>
    <rect width="${w}" height="${h}" fill="url(#grid-${meta.id})"/>

    <!-- Editorial Studio Framing -->
    <rect x="${isThumb ? 12 : 24}" y="${isThumb ? 12 : 24}" width="${w - (isThumb ? 24 : 48)}" height="${h - (isThumb ? 24 : 48)}" fill="none" stroke="${theme.text}" stroke-opacity="0.14" stroke-width="1"/>
    
    <!-- Corner Cross Marks -->
    <g stroke="${theme.accent}" stroke-width="1.5" stroke-opacity="0.6">
      <path d="M ${isThumb ? 16 : 32} ${isThumb ? 20 : 40} L ${isThumb ? 24 : 48} ${isThumb ? 20 : 40} M ${isThumb ? 20 : 40} ${isThumb ? 16 : 32} L ${isThumb ? 20 : 40} ${isThumb ? 24 : 48}"/>
      <path d="M ${w - (isThumb ? 24 : 48)} ${isThumb ? 20 : 40} L ${w - (isThumb ? 16 : 32)} ${isThumb ? 20 : 40} M ${w - (isThumb ? 20 : 40)} ${isThumb ? 16 : 32} L ${w - (isThumb ? 20 : 40)} ${isThumb ? 24 : 48}"/>
    </g>

    <!-- Top Studio Meta -->
    <text x="${isThumb ? 20 : 44}" y="${isThumb ? 32 : 64}" font-family="'Space Grotesk', monospace" font-size="${isThumb ? 8.5 : 12}" font-weight="600" fill="${theme.accent}" letter-spacing="0.2em">DORA STUDIOS // ${meta.year}</text>
    <text x="${w - (isThumb ? 20 : 44)}" y="${isThumb ? 32 : 64}" font-family="'Space Grotesk', monospace" font-size="${isThumb ? 8.5 : 12}" font-weight="500" fill="${theme.sub}" text-anchor="end" letter-spacing="0.15em">NO. ${meta.id} • ${meta.kind.toUpperCase()}</text>

    <!-- Stylized Graphic Stage -->
    <g transform="translate(${w / 2}, ${h * 0.44})">
      <!-- Ambient Orb -->
      <circle r="${isThumb ? 68 : 150}" fill="url(#orb-${meta.id})"/>
      <circle r="${isThumb ? 76 : 168}" fill="none" stroke="${theme.accent}" stroke-opacity="0.22" stroke-width="1" stroke-dasharray="3 4"/>
      
      <!-- Architectural / Figure Silhouette Motif -->
      <path d="M -${isThumb ? 40 : 80} ${isThumb ? 45 : 100} L -${isThumb ? 20 : 40} -${isThumb ? 30 : 60} L 0 -${isThumb ? 50 : 105} L ${isThumb ? 20 : 40} -${isThumb ? 30 : 60} L ${isThumb ? 40 : 80} ${isThumb ? 45 : 100} Z" fill="${theme.text}" fill-opacity="0.1"/>
      <circle cx="0" cy="-${isThumb ? 45 : 95}" r="${isThumb ? 12 : 24}" fill="${theme.accent}" fill-opacity="0.75"/>
      <path d="M -${isThumb ? 32 : 70} ${isThumb ? 35 : 80} Q 0 -${isThumb ? 10 : 20} ${isThumb ? 32 : 70} ${isThumb ? 35 : 80}" fill="none" stroke="${theme.text}" stroke-width="${isThumb ? 2 : 3}" stroke-opacity="0.35"/>
    </g>

    <!-- Central Artwork Titles -->
    <g transform="translate(${w / 2}, ${h * 0.72})">
      <text x="0" y="0" font-family="'Manrope', 'PingFang SC', sans-serif" font-size="${isThumb ? 15 : 28}" font-weight="700" fill="${theme.text}" text-anchor="middle" letter-spacing="0.04em">${meta.title}</text>
      <text x="0" y="${isThumb ? 18 : 34}" font-family="'Space Grotesk', sans-serif" font-size="${isThumb ? 10 : 16}" font-weight="500" fill="${theme.accent}" text-anchor="middle" letter-spacing="0.12em">${meta.englishTitle.toUpperCase()}</text>
      <text x="0" y="${isThumb ? 34 : 64}" font-family="'Space Grotesk', monospace" font-size="${isThumb ? 8.5 : 12}" font-weight="400" fill="${theme.sub}" text-anchor="middle" letter-spacing="0.25em">哆啦小熙 · @DORA_XXI</text>
    </g>

    <!-- Bottom Bar Tags -->
    <g transform="translate(${isThumb ? 20 : 44}, ${h - (isThumb ? 22 : 44)})">
      <text x="0" y="0" font-family="'Space Grotesk', monospace" font-size="${isThumb ? 8 : 11}" fill="${theme.sub}" letter-spacing="0.16em">MOOD // ${meta.moods.join(' · ').toUpperCase()}</text>
      <text x="${w - (isThumb ? 40 : 88)}" y="0" font-family="'Space Grotesk', monospace" font-size="${isThumb ? 8 : 11}" fill="${theme.accent}" text-anchor="end" letter-spacing="0.16em">ARCHIVE PLATE</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
