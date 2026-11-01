/**
 * Kaduise art resolver
 * Provides local paths with elegant analog pen & flat-color SVG fallbacks.
 */

function generateKaduiseSvg(k: string): string {
  const titles: Record<string, string> = {
    shingo: "信号待ち · Waiting for the light",
    ufo: "UFO",
    music: "音楽に救われてきたんだ · Music has been saving me",
    ogon: "黄金 · Gold",
    uchuu: "宇宙に行こう · Let's go to space",
    ryuuseigun: "流星群 · Meteor shower",
    todoke: "届け。 · Reach them.",
    haiorange: "灰とオレンジ · Ash and orange",
    banner: "Everything for the sake of a girl · かづいせ",
    avatar: "kaduise · かづいせ",
  };

  const title = titles[k] || k.toUpperCase();
  const width = k === "banner" ? 1440 : 800;
  const height = k === "banner" ? 500 : 540;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#efebe1"/>
    <!-- Starry Night Motif -->
    <circle cx="${width / 2}" cy="${height / 2 - 20}" r="70" fill="none" stroke="#1a1813" stroke-width="2" stroke-dasharray="3 3"/>
    <!-- 4-point Sparkle Star -->
    <path d="M ${width / 2} ${height / 2 - 50} Q ${width / 2} ${height / 2 - 20} ${width / 2 + 30} ${height / 2 - 20} Q ${width / 2} ${height / 2 - 20} ${width / 2} ${height / 2 + 10} Q ${width / 2} ${height / 2 - 20} ${width / 2 - 30} ${height / 2 - 20} Q ${width / 2} ${height / 2 - 20} ${width / 2} ${height / 2 - 50} Z" fill="#e0b931" stroke="#1a1813" stroke-width="2"/>
    <text x="${width / 2}" y="${height / 2 + 45}" font-family="'Space Mono', monospace" font-size="14" font-weight="700" fill="#1a1813" text-anchor="middle" letter-spacing="0.1em">${title}</text>
    <text x="${width / 2}" y="${height / 2 + 68}" font-family="'Zen Kaku Gothic New', sans-serif" font-size="11" fill="#716b5d" text-anchor="middle" letter-spacing="0.18em">KADUISE · かづいせ · OSAKA</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function art(k: string): string {
  const clean = k.replace(/^px/, "");
  if (clean === "icon_400x400" || clean === "avatar") {
    return "/images/kaduise/avatar.jpg";
  }
  return `/images/kaduise/${clean}.jpg`;
}

export const X_POST = (id: string) => `https://x.com/kaduise/status/${id}`;

export const PX_POST = (id: string) => `https://www.pixiv.net/artworks/${id}`;

/** Link to wherever a work was originally published. */
export function sourceHref(w: { id: string; via?: "x" | "pixiv" }) {
  return w.via === "pixiv" ? PX_POST(w.id) : X_POST(w.id);
}

export function sourceLabel(via?: "x" | "pixiv") {
  return via === "pixiv" ? "pixiv" : "X";
}
