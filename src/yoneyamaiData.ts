/* All artwork is loaded from Yoneyama Mai's own portfolio (yoneyamai.com). */

const CDN = "https://cdn.sanity.io/images/zoin1sjp/production/";
export const imageUrl = (file: string, width: number) => `${CDN}${file}?w=${width}&q=85`;

export const LOOP_VIDEO =
  "https://cdn.sanity.io/files/zoin1sjp/production/4ce72ce2d98c3e1435fa489fa0116b37dbcbfcb7.mp4";

export type Piece = {
  id: string;
  title: string;
  year: string;
  medium: string;
  shown?: string;
  /** natural pixel size, used so frames match the artwork's proportions */
  w: number;
  h: number;
  file: string;
  alt: string;
  source: string;
};

const SHE = "SHE, pixiv WAEN GALLERY";
const EYE = "EYE, PARCO MUSEUM TOKYO";

export const P = {
  flare: {
    id: "flare", title: "DYE – Flare", year: "2025", medium: "Illustration",
    w: 11713, h: 6201, file: "8ae086948a60f33ff59d5917e7ff64796eae1409-11713x6201.jpg",
    alt: "DYE – Flare, a 2025 illustration by Yoneyama Mai",
    source: "https://yoneyamai.com/projects/DYE_Flare/",
  },
  reincarnation: {
    id: "reincarnation", title: "Reincarnation", year: "2023", medium: "Illustration",
    w: 8510, h: 11408, file: "2059467a2e40ee4e559f0c52615eb96e60b61470-8510x11408.jpg",
    alt: "Reincarnation, a 2023 illustration by Yoneyama Mai",
    source: "https://yoneyamai.com/projects/reincarnation/",
  },
  skin: {
    id: "skin", title: "Skin – Fracture", year: "2023", medium: "Illustration", shown: EYE,
    w: 6000, h: 6000, file: "9eb545b88ea4a67ac5a6f43a2f1e3a9ade3a3bae-6000x6000.jpg",
    alt: "Skin – Fracture, a 2023 illustration by Yoneyama Mai",
    source: "https://yoneyamai.com/projects/SKIN_FRACTURE/",
  },
  shewill: {
    id: "shewill", title: "She Will", year: "2019", medium: "Illustration", shown: SHE,
    w: 3409, h: 4608, file: "a86501efae8352e282d0b13fb18576117c7add49-3409x4608.jpg",
    alt: "She Will, a 2019 illustration by Yoneyama Mai",
    source: "https://yoneyamai.com/projects/SHEWILL/",
  },
  blackrat: {
    id: "blackrat", title: "She – Black Rat", year: "2019", medium: "Illustration", shown: SHE,
    w: 6216, h: 8438, file: "2b7df1f6dd1208157ba586d5e548b8b1d27b3090-6216x8438.jpg",
    alt: "She – Black Rat, a 2019 illustration by Yoneyama Mai",
    source: "https://yoneyamai.com/projects/SHE_BLACKRAT/",
  },
  metamorphosis: {
    id: "metamorphosis", title: "Metamorphosis 01", year: "2024", medium: "Illustration",
    w: 8076, h: 7845, file: "50e71c5c40dd56f97867a91fc6cf47bf98db632b-8076x7845.jpg",
    alt: "Metamorphosis 01, a 2024 illustration by Yoneyama Mai",
    source: "https://yoneyamai.com/projects/METAMORPHOSIS01/",
  },
  radiance: {
    id: "radiance", title: "DYE – Radiance", year: "2025", medium: "Illustration",
    w: 11713, h: 6201, file: "c11fd21a41fbe30d8a7f4f676cb70513a9b47742-11713x6201.jpg",
    alt: "DYE – Radiance, a 2025 illustration by Yoneyama Mai",
    source: "https://yoneyamai.com/projects/DYE_Radiance/",
  },
  eye: {
    id: "eye", title: "Eye", year: "2023", medium: "Illustration", shown: EYE,
    w: 2283, h: 1600, file: "3e4f1d2233ae59c4645918bf906a22b91f8c8a70-2283x1600.jpg",
    alt: "Eye, a 2023 illustration by Yoneyama Mai",
    source: "https://yoneyamai.com/projects/EYE/",
  },
  morph: {
    id: "morph", title: "Morph", year: "2023", medium: "Illustration", shown: EYE,
    w: 3398, h: 1600, file: "eea046b9410cdce46f808bfb761173879ddc0f18-3398x1600.jpg",
    alt: "Morph, a 2023 illustration by Yoneyama Mai",
    source: "https://yoneyamai.com/projects/MORPH/",
  },
} satisfies Record<string, Piece>;

/** The catalogue: one continuous numbering used on every wall label. */
export const ORDER: Piece[] = [
  P.flare, P.reincarnation, P.skin, P.shewill, P.blackrat, P.metamorphosis, P.radiance, P.eye, P.morph,
];
export const catalogueNo = (id: string) => String(ORDER.findIndex((p) => p.id === id) + 1).padStart(2, "0");

/** The width each work is shown at on its wall. The viewer reuses it as an instant, already-cached placeholder. */
const DISPLAY_WIDTH: Record<string, number> = {
  flare: 2000,
  reincarnation: 1200, skin: 1200, shewill: 1200, blackrat: 1200, metamorphosis: 1200,
  radiance: 1800, eye: 1800, morph: 1800,
};
export const wallImage = (piece: Piece) => imageUrl(piece.file, Math.min(piece.w, DISPLAY_WIDTH[piece.id] ?? 1400));

export const SALON = [P.reincarnation, P.skin, P.shewill, P.blackrat, P.metamorphosis];
export const LONG_WALL = [P.radiance, P.eye, P.morph];

export type Room = { id: string; num: string; name: string };
export const ROOMS: Room[] = [
  { id: "flare", num: "I", name: "Flare" },
  { id: "salon", num: "II", name: "Salon" },
  { id: "gallery", num: "III", name: "Gallery" },
  { id: "screening", num: "IV", name: "Screening" },
  { id: "chronology", num: "V", name: "Chronology" },
  { id: "exhibitions", num: "VI", name: "Exhibitions" },
  { id: "artist", num: "VII", name: "Artist" },
];

export const chronology: { year: string; items: string[] }[] = [
  { year: "1988", items: ["Born in Nagano."] },
  { year: "2009", items: ["GAINAX."] },
  { year: "2013", items: ["Kill la Kill."] },
  { year: "2016", items: ["Kiznaiver."] },
  { year: "2018", items: ["Darling in the Franxx."] },
  { year: "2019", items: ["SHE, pixiv WAEN GALLERY.", "PROMARE."] },
  { year: "2021", items: ["EGO, anicoremix gallery.", "Start Art Fair, Saatchi Gallery."] },
  { year: "2022", items: ["Cyberpunk: Edgerunners.", "YOKU."] },
  { year: "2023", items: ["EYE, PARCO MUSEUM TOKYO."] },
  { year: "2024", items: ["Artists' Fair Kyoto."] },
  { year: "2025", items: ["arc, Ginza Tsutaya Books."] },
  { year: "2026", items: ["Ghost and the Shell.", "Art Scramble, Osaka."] },
];

export type Kind = "Solo" | "Fair" | "Public";
export const exhibitions: { year: string; name: string; venue: string; kind: Kind; url: string }[] = [
  { year: "2026", name: "arc — Kyoto", venue: "Kyoto Tsutaya", kind: "Solo", url: "https://x.com/yoneyamai" },
  { year: "2026", name: "Art Scramble", venue: "Grand Front Osaka", kind: "Public", url: "https://x.com/yoneyamai" },
  { year: "2025", name: "arc", venue: "Ginza Tsutaya Books, Tokyo", kind: "Solo", url: "https://arc.yoneyamai.jp/" },
  { year: "2024", name: "Artists' Fair Kyoto", venue: "Kyoto", kind: "Fair", url: "https://www.imuraart.com/artist/bio/post_41.html" },
  { year: "2023", name: "EYE", venue: "PARCO MUSEUM TOKYO", kind: "Solo", url: "https://art.parco.jp/museumtokyo/detail/?id=1206" },
  { year: "2021", name: "Start Art Fair", venue: "Saatchi Gallery, London", kind: "Fair", url: "https://www.imuraart.com/artist/bio/post_41.html" },
  { year: "2021", name: "EGO", venue: "anicoremix gallery, Tokyo", kind: "Solo", url: "https://www.anicoremixgallery.com/exhibition/mai-yoneyama-ego-online-boutique/" },
  { year: "2019", name: "SHE", venue: "pixiv WAEN GALLERY, Tokyo", kind: "Solo", url: "https://www.pixivision.net/en/a/5309" },
];

export const channels = [
  { label: "Portfolio", url: "https://yoneyamai.com/" },
  { label: "Profile", url: "https://yoneyamai.com/about/" },
  { label: "X", url: "https://x.com/yoneyamai" },
  { label: "Instagram", url: "https://www.instagram.com/yoneyamai/" },
  { label: "Pixiv", url: "https://www.pixiv.net/users/1554775" },
];
