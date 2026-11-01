/**
 * ASK Illustration Asset Resolver
 * Provides local image paths with instant, elegant SVG artwork fallbacks.
 * Never throws errors so the gallery always renders seamlessly.
 */

function generateFallbackSvg(id: string, isThumb = false): string {
  const titles: Record<string, string> = {
    shaohua: "韶华 · Shaohua",
    meihua: "梅花三弄 · Plum Blossom",
    "sleeping-beauty": "Sleeping Beauty",
    sophon: "智子 · Sophon",
    "sophon-meeting": "会面 · Meeting",
    "dusk-to-dawn": "dusk to dawn · Surtr",
    "dusk-to-dawn-2": "Surtr — Dusk",
    entelechia: "Entelechia",
    "entelechia-2": "Entelechia II",
    eva: "新世纪福音战士 · Evangelion",
    "fate-saber": "Saber · Fate",
    "azur-lane": "碧蓝航线 · Azur Lane",
    avatar: "ASK · 偶尔画画的猫爱好者",
  };

  const title = titles[id] || id.replace(/-/g, " ").toUpperCase();
  const width = isThumb ? 400 : 900;
  const height = isThumb ? 520 : 1200;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <radialGradient id="paper" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#f8f4ec"/>
        <stop offset="50%" stop-color="#efe7da"/>
        <stop offset="100%" stop-color="#e2d4c0"/>
      </radialGradient>
      <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#b44738"/>
        <stop offset="100%" stop-color="#8e3328"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#paper)"/>
    <!-- Subtle Ink Border -->
    <rect x="16" y="16" width="${width - 32}" height="${height - 32}" fill="none" stroke="#2a221b" stroke-opacity="0.12" stroke-width="1"/>
    <rect x="22" y="22" width="${width - 44}" height="${height - 44}" fill="none" stroke="#2a221b" stroke-opacity="0.06" stroke-width="0.5"/>
    <!-- Center Art Motif -->
    <g transform="translate(${width / 2}, ${height / 2 - 30})">
      <circle r="${isThumb ? 48 : 80}" fill="none" stroke="#b44738" stroke-opacity="0.15" stroke-width="1.5" stroke-dasharray="4 4"/>
      <!-- Cinnabar Seal -->
      <rect x="${isThumb ? -20 : -32}" y="${isThumb ? -20 : -32}" width="${isThumb ? 40 : 64}" height="${isThumb ? 40 : 64}" rx="4" fill="none" stroke="url(#sealGrad)" stroke-width="2"/>
      <text x="0" y="${isThumb ? 6 : 10}" font-family="'Shippori Mincho', 'Noto Serif SC', serif" font-size="${isThumb ? 18 : 28}" font-weight="700" fill="#b44738" text-anchor="middle" letter-spacing="0.1em">画</text>
    </g>
    <!-- Title Text -->
    <text x="${width / 2}" y="${height / 2 + (isThumb ? 50 : 80)}" font-family="'Shippori Mincho', 'Noto Serif SC', serif" font-size="${isThumb ? 14 : 20}" font-weight="600" fill="#2a221b" fill-opacity="0.82" text-anchor="middle" letter-spacing="0.08em">${title}</text>
    <text x="${width / 2}" y="${height / 2 + (isThumb ? 72 : 112)}" font-family="'Outfit', sans-serif" font-size="${isThumb ? 10 : 13}" font-weight="400" fill="#5c5146" fill-opacity="0.6" text-anchor="middle" letter-spacing="0.2em">ASK · ILLUSTRATION</text>
    <!-- Vertical Watermark Tag -->
    <text x="${width - 30}" y="48" font-family="'Shippori Mincho', serif" font-size="9" fill="#2a221b" fill-opacity="0.25" text-anchor="end" letter-spacing="0.3em" transform="rotate(90 ${width - 30} 48)">偶尔画画的猫爱好者</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function image(id: string): string {
  if (id === 'surtr-e2' || id === 'surtr-base' || id === 'surtr-liberte') {
    return `/images/askziye/${id}.png`;
  }
  return `/images/askziye/${id}.jpg`;
}

export function thumbnail(id: string): string {
  if (id === 'surtr-e2' || id === 'surtr-base' || id === 'surtr-liberte') {
    return `/images/askziye/${id}_thumb.png`;
  }
  return `/images/askziye/${id}_thumb.jpg`;
}
