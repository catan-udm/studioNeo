/* All artwork is © tamimoon / the respective rights holders.
   Images are loaded live from the artist's own official site (tamimoon.tokyo)
   and every piece links back to its source page. */

const UP = "https://tamimoon.tokyo/wp-content/uploads/";
export const up = (file: string) => UP + encodeURIComponent(file);
export const site = "https://tamimoon.tokyo";
export const workUrl = (id: number) => `${site}/works/${id}/`;

export type Cast = "riku" | "yuki" | "nana" | "rin" | "jun" | "tamimoon";

/* ------------------------------------------------------------------ */
/* Hero — each slide swaps the whole page into that painting's colour  */
/* ------------------------------------------------------------------ */

export type Slide = {
  key: string;
  title: string;
  size: number; // font-size multiplier so long/short titles share a footprint
  src: string;
  pos: string;
  field: string;
  ink: string;
  credit: string;
  href: string;
  alt: string;
};

export const slides: Slide[] = [
  {
    key: "identity",
    title: "IDENTITY",
    size: 1,
    src: up("identitiy-1.jpg"),
    pos: "50% 38%",
    field: "#e7edf0",
    ink: "#111113",
    credit: "IDENTITY — first art book, KADOKAWA, 2022",
    href: workUrl(75),
    alt: "Girl with teal hair and blunt bangs resting her cheek on her hand, vermilion lips, gold chain jewellery",
  },
  {
    key: "nylon",
    title: "NYLON",
    size: 1.55,
    src: up("works-thumbnail-04.jpg"),
    pos: "50% 30%",
    field: "#7db357",
    ink: "#111113",
    credit: "NYLON JAPAN — cover illustration",
    href: workUrl(50),
    alt: "Two girls leaning together on a grass-green ground, one with indigo hair and a gold hoop earring",
  },
  {
    key: "rin",
    title: "RIN",
    size: 1.9,
    src: up("models-rin.jpg"),
    pos: "50% 28%",
    field: "#df2f6d",
    ink: "#ffffff",
    credit: "RIN — model No.4 of the agency tamimoon, age 17",
    href: `${site}/models`,
    alt: "Girl with teal twin-tails in a pink cut-out top, framed by a hand-drawn hot-pink border",
  },
  {
    key: "vocacolle",
    title: "MIKU",
    size: 1.9,
    src: up("miku02-min-1600x1310.jpg"),
    pos: "42% 38%",
    field: "#1c1e22",
    ink: "#eff1f3",
    credit: "VocaColle 2022 Spring — key visual",
    href: workUrl(323),
    alt: "Girl with blue-green twin-tails in a grey ribbed knit, chin on her fist, bokeh night background",
  },
  {
    key: "anne",
    title: "ANNE",
    size: 1.7,
    src: up("Fo67EIdakAEqgs2.jpg"),
    pos: "50% 22%",
    field: "#c5c6d3",
    ink: "#111113",
    credit: "Chiyono Anne × tamimoon",
    href: workUrl(403),
    alt: "Silver-haired girl with red hair ties in a black ribbed knit on a lavender-grey ground",
  },
  {
    key: "riku",
    title: "RIKU",
    size: 1.7,
    src: up("models-riku.jpg"),
    pos: "50% 34%",
    field: "#b6bddb",
    ink: "#14163a",
    credit: "RIKU — model No.1 of the agency tamimoon, age 20",
    href: `${site}/models`,
    alt: "Indigo-haired girl eating a candied strawberry in a white knit turtleneck",
  },
];

/* ------------------------------------------------------------------ */
/* Anatomy of a tamimoon girl — hotspots on the IDENTITY cover         */
/* ------------------------------------------------------------------ */

export const anatomySrc = up("identitiy-1.jpg");
export const anatomyRatio = { w: 1240, h: 1518 };

export type Trait = {
  id: string;
  no: string;
  title: string;
  jp: string;
  note: string;
  x: number; // hotspot, % of image
  y: number;
  zoom: number;
};

export const traits: Trait[] = [
  {
    id: "line",
    no: "01",
    title: "Lines left open",
    jp: "閉じない線",
    note: "Hair is a handful of confident dark strands laid over a flat patch of teal. The outlines stop where they want to — nothing is sealed shut, so the drawing still looks like it is being drawn.",
    x: 42,
    y: 22,
    zoom: 2.6,
  },
  {
    id: "gaze",
    no: "02",
    title: "The heavy-lidded gaze",
    jp: "伏し目がちな視線",
    note: "Small dark pupils under heavy lids, a pin-prick of white light, and a warm peach shadow pooling beneath the eye. She looks at you, and then slightly past you.",
    x: 34,
    y: 36,
    zoom: 2.8,
  },
  {
    id: "blush",
    no: "03",
    title: "Skin as warm paint",
    jp: "絵の具のような肌",
    note: "Blush gathers on the nose tip, cheeks and ears in soft, visible brushwork. Shadow is never grey — it is the same peach, pushed redder, and the nose gets one tiny highlight.",
    x: 33,
    y: 52,
    zoom: 2.6,
  },
  {
    id: "lips",
    no: "04",
    title: "One loud colour",
    jp: "唇の朱",
    note: "Everything else is muted — teal, bone, grey-lavender — so the vermilion mouth does all the talking. The same red returns in nails, ribbons and hair ties across the work.",
    x: 32,
    y: 59,
    zoom: 3,
  },
  {
    id: "metal",
    no: "05",
    title: "Fashion is the character",
    jp: "装身具が人格をつくる",
    note: "Chains, hoops, rings, a choker — rendered in a few hard highlights over soft skin. The styling is the sentence she is saying; the face just delivers it.",
    x: 63,
    y: 67,
    zoom: 2.6,
  },
  {
    id: "mark",
    no: "06",
    title: "A flaw, on purpose",
    jp: "ほくろ",
    note: "A small mole near the collarbone, another beside the eye. Little imperfections placed deliberately — the thing that makes a drawing into somebody.",
    x: 37,
    y: 87,
    zoom: 3.2,
  },
];

/* ------------------------------------------------------------------ */
/* The agency roster — as listed on tamimoon.tokyo/models              */
/* ------------------------------------------------------------------ */

export type Model = {
  id: Exclude<Cast, "tamimoon">;
  name: string;
  no: string;
  age: number;
  dob: string;
  height: string;
  blood: string;
  fav: string;
  src: string;
  pos: string;
  field: string;
  ink: string;
  accent: string;
  look: string;
};

export const models: Model[] = [
  {
    id: "riku",
    name: "RIKU",
    no: "01",
    age: 20,
    dob: "Jun. 21",
    height: "155 cm",
    blood: "A",
    fav: "Music, Sweets",
    src: up("models-riku.jpg"),
    pos: "50% 30%",
    field: "#b6bddb",
    ink: "#14163a",
    accent: "#4b4f93",
    look: "Indigo bob, white ribbed knit, a candied strawberry.",
  },
  {
    id: "yuki",
    name: "YUKI",
    no: "02",
    age: 20,
    dob: "Feb. 5",
    height: "174 cm",
    blood: "A",
    fav: "Skateboarding, Basketball",
    src: up("models-yuki.jpg"),
    pos: "50% 25%",
    field: "#d9cfcb",
    ink: "#161214",
    accent: "#161214",
    look: "Long black hair, cut-out black top, a wall of glass blocks.",
  },
  {
    id: "nana",
    name: "NANA",
    no: "03",
    age: 22,
    dob: "Aug. 16",
    height: "163 cm",
    blood: "O",
    fav: "Manga, Anime",
    src: up("models-nana.jpg"),
    pos: "50% 30%",
    field: "#e4e7ec",
    ink: "#0f2a55",
    accent: "#2a5db0",
    look: "Cobalt crop, round glasses, oversized white tee, red nails.",
  },
  {
    id: "rin",
    name: "RIN",
    no: "04",
    age: 17,
    dob: "Dec. 7",
    height: "168 cm",
    blood: "AB",
    fav: "Makeup, Nails",
    src: up("models-rin.jpg"),
    pos: "50% 30%",
    field: "#df2f6d",
    ink: "#ffffff",
    accent: "#5ea5ba",
    look: "Teal twin-tails, pink bolero, a wobbly hot-pink frame.",
  },
  {
    id: "jun",
    name: "JUN",
    no: "05",
    age: 23,
    dob: "Sep. 23",
    height: "170 cm",
    blood: "B",
    fav: "Movie appreciation",
    src: up("models-jun.jpg"),
    pos: "50% 22%",
    field: "#141214",
    ink: "#f4eeea",
    accent: "#e8472b",
    look: "Copper curls, gold nose ring and hoops, cobalt nails on black.",
  },
];

/* ------------------------------------------------------------------ */
/* Works — thumbnails and titles from tamimoon.tokyo/works             */
/* ------------------------------------------------------------------ */

export type Work = {
  id: number;
  title: string;
  kind: string;
  cast: Cast[];
  src: string;
  w: number;
  h: number;
  tone: string;
};

const w = (
  id: number,
  title: string,
  kind: string,
  cast: Cast[],
  file: string,
  W: number,
  H: number,
  tone = "#d6d8df",
): Work => ({ id, title, kind, cast, src: up(file), w: W, h: H, tone });

export const works: Work[] = [
  w(75, "初作品集『IDENTITY』", "Art book", ["rin", "jun", "riku", "yuki", "nana"], "identitiy-1.jpg", 1240, 1518, "#dfe7ea"),
  w(50, "NYLON JAPAN", "Editorial", ["riku", "yuki"], "works-thumbnail-04.jpg", 1440, 1728, "#8dbd68"),
  w(403, "Chiyono Anne × tamimoon", "Fashion", ["tamimoon"], "Fo67EIdakAEqgs2.jpg", 1260, 1575, "#c5c6d3"),
  w(323, "ボカコレ2022春 キービジュアル", "Music", ["tamimoon"], "miku02-min-1600x1310.jpg", 1600, 1310, "#25282d"),
  w(330, "Ground Y × ILLUSTRATORS", "Fashion", ["yuki"], "0E0DFC31-F7A0-47E9-AC3F-F9B03BF61397-min-1600x2028.jpg", 1600, 2028),
  w(396, "伊勢丹新宿 個展", "Exhibition", ["tamimoon"], "FowkMIeakAEkLhv-1600x1600.jpeg", 1600, 1600),
  w(414, "La Perla × tamimoon", "Fashion", ["tamimoon"], "FpKXFuGaEAA7deW.jpg", 1257, 1572),
  w(335, "tanakadaisuke × tamimoon", "Fashion", ["riku", "yuki"], "イラスト25-完-min-1600x1935.jpg", 1600, 1935),
  w(344, "VOGUE JAPAN × yama・くじら", "Editorial", ["tamimoon"], "vogue-yama-kujira-min-1600x1186.jpg", 1600, 1186),
  w(52, "竜とそばかすの姫 PRイメージ", "Film", ["tamimoon"], "works-thumbnail-03.jpg", 1440, 1954),
  w(412, "Aubade × tamimoon", "Fashion", ["tamimoon"], "FpAD_wIaUAAl-TT.jpg", 1223, 1529),
  w(250, "初個展『IDENTITY』", "Exhibition", ["tamimoon"], "identty_exhibition.jpg", 1182, 1182),
  w(366, "OSAJI 2022AW collection", "Beauty", ["nana", "jun"], "OSAJIa-min.jpg", 1345, 1509),
  w(417, "初音ミク × イセタン", "Music", ["tamimoon"], "IMG_3538-2.jpg", 1109, 1386),
  w(382, "atmos pink × tamimoon", "Fashion", ["riku", "rin"], "atmos-min-1600x1600.jpg", 1600, 1600),
  w(386, "川崎ラチッタデッラ", "Event", ["riku", "yuki"], "C1586B76-7177-47D1-8207-6402BB0BD4CD-min-1600x1884.jpg", 1600, 1884),
  w(247, "ASOBIBA × tamimoon", "Collab", ["rin"], "works_12-min-1600x1946.jpg", 1600, 1946),
  w(373, "4na × tamimoon『某夜』", "Music", ["jun"], "bouya_-min-1600x1600.jpg", 1600, 1600),
  w(415, "桃野雑派『星くずの殺人』講談社", "Book cover", ["tamimoon"], "hoshikuzu-min.jpg", 1579, 2185),
  w(369, "くじら T-shirts", "Goods", ["tamimoon"], "kujira-min-1600x1710.jpg", 1600, 1710),
  w(110, "花譜『不可解弐Q2』公式ファンアート", "Music", ["tamimoon"], "Kafu-min-1600x1600.jpg", 1600, 1600),
  w(48, "フィロソフィーのダンス × tamimoon", "Music", ["tamimoon"], "works-thumbnail-02.jpg", 1440, 934),
  w(134, "4na × tamimoon『BURU』", "Music", ["nana"], "15169230985339.jpg", 1280, 1280),
  w(117, "apollostation Drive Discovery PRESS", "Radio", ["jun"], "TOKYO-FM-min-1600x1600.jpg", 1600, 1600),
  w(137, "こはならむ『不完全花』", "Music", ["tamimoon"], "不完全花-min-1600x1600.jpg", 1600, 1600),
  w(130, "當山みれい × tamimoon", "Collab", ["tamimoon"], "hack-min-1600x1600.jpg", 1600, 1600),
  w(439, "DANCE CLUB CHAMPIONSHIP 2023", "Event", ["rin"], "dcc2023-min-1600x1200.jpg", 1600, 1200),
  w(112, "NEO LEMONADE. SWITCHBAR", "Brand", ["tamimoon"], "Neo-lemonade-min.jpeg", 1200, 1200),
];

export const workById = (id: number) => works.find((x) => x.id === id)!;

export const castFilters: { key: Cast | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "riku", label: "Riku" },
  { key: "yuki", label: "Yuki" },
  { key: "nana", label: "Nana" },
  { key: "rin", label: "Rin" },
  { key: "jun", label: "Jun" },
  { key: "tamimoon", label: "tamimoon" },
];

/* ------------------------------------------------------------------ */
/* Colour fields                                                       */
/* ------------------------------------------------------------------ */

export type Field = {
  id: string;
  name: string;
  hex: string;
  bg: string;
  ink: string;
  src: string;
  pos: string;
  from: string;
  href: string;
};

export const fields: Field[] = [
  {
    id: "pink",
    name: "Frame pink",
    hex: "#DF2F6D",
    bg: "linear-gradient(180deg,#df2f6d 0%,#d2579f 45%,#3f95c7 100%)",
    ink: "#ffffff",
    src: up("models-rin.jpg"),
    pos: "50% 25%",
    from: "RIN",
    href: `${site}/models`,
  },
  {
    id: "grass",
    name: "Grass green",
    hex: "#7DB357",
    bg: "#7db357",
    ink: "#101509",
    src: up("works-thumbnail-04.jpg"),
    pos: "50% 30%",
    from: "NYLON JAPAN",
    href: workUrl(50),
  },
  {
    id: "lav",
    name: "Lavender ground",
    hex: "#C5C6D3",
    bg: "#c5c6d3",
    ink: "#111113",
    src: up("Fo67EIdakAEqgs2.jpg"),
    pos: "50% 22%",
    from: "Chiyono Anne × tamimoon",
    href: workUrl(403),
  },
  {
    id: "teal",
    name: "Teal hair",
    hex: "#5EA59D",
    bg: "#5ea59d",
    ink: "#08201d",
    src: up("identitiy-1.jpg"),
    pos: "50% 40%",
    from: "IDENTITY",
    href: workUrl(75),
  },
  {
    id: "indigo",
    name: "Indigo bob",
    hex: "#4B4F93",
    bg: "#4b4f93",
    ink: "#f3f3fb",
    src: up("models-riku.jpg"),
    pos: "50% 30%",
    from: "RIKU",
    href: `${site}/models`,
  },
  {
    id: "night",
    name: "Night black",
    hex: "#141214",
    bg: "#141214",
    ink: "#f4eeea",
    src: up("models-jun.jpg"),
    pos: "50% 22%",
    from: "JUN",
    href: `${site}/models`,
  },
];

/* ------------------------------------------------------------------ */
/* Collaborators — hover a name, see the work                          */
/* ------------------------------------------------------------------ */

export const collabs: { name: string; what: string; work: number }[] = [
  { name: "NYLON JAPAN", what: "Cover & editorial", work: 50 },
  { name: "VOGUE JAPAN", what: "yama × くじら portraits", work: 344 },
  { name: "KADOKAWA", what: "Art book — IDENTITY", work: 75 },
  { name: "Ground Y", what: "Fashion × illustrators", work: 330 },
  { name: "La Perla", what: "Brand illustration", work: 414 },
  { name: "Aubade", what: "Brand illustration", work: 412 },
  { name: "OSAJI", what: "2022 AW collection", work: 366 },
  { name: "atmos pink", what: "Streetwear collab", work: 382 },
  { name: "VocaColle", what: "2022 Spring key visual", work: 323 },
  { name: "Hatsune Miku × Isetan", what: "Department store collab", work: 417 },
  { name: "Belle / 竜とそばかすの姫", what: "Film PR image", work: 52 },
  { name: "講談社 Kodansha", what: "Novel cover", work: 415 },
  { name: "Isetan Shinjuku", what: "Solo exhibition", work: 396 },
  { name: "tanakadaisuke", what: "Apparel collab", work: 335 },
];

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

export const timeline: { year: string; items: { t: string; d?: string }[] }[] = [
  {
    year: "2020",
    items: [
      {
        t: "Begins posting",
        d: "Starts drawing women through fashion on social media. Within two years the audience passes 400,000 across platforms.",
      },
    ],
  },
  {
    year: "2021",
    items: [
      { t: "KATE × tamimoon", d: "Original LINE stickers for the Kanebo cosmetics brand." },
      { t: "New Real Clothes Illustration", d: "Cover illustration for the PIE International anthology." },
      { t: "竜とそばかすの姫", d: "PR illustration for the Mamoru Hosoda film." },
    ],
  },
  {
    year: "2022",
    items: [
      {
        t: "The agency tamimoon is founded",
        d: "February: an illustration model agency where each drawn woman has an age, a birthday and a favourite thing.",
      },
      {
        t: "IDENTITY — first art book",
        d: "KADOKAWA, 12 Feb. 112 pages, 257 × 210 mm; new work, past work, interview and making-of. First solo exhibition of the same name.",
      },
      { t: "VocaColle 2022 Spring", d: "Key visual for the Vocaloid event." },
      { t: "NYLON · VOGUE · OSAJI", d: "Editorial and beauty commissions." },
    ],
  },
  {
    year: "2023",
    items: [
      { t: "Isetan Shinjuku solo exhibition" },
      { t: "tamimoon × KASHIYAMA", d: "Pop-up, key visual, packaging, tees — with a signing session in Osaka." },
      {
        t: "ILLUSTRATION 2024 cover",
        d: "10th-anniversary issue, a collaboration with Hakuiki Shiroi (Shoeisha, 6 Dec).",
      },
    ],
  },
  {
    year: "2024",
    items: [
      { t: "AFA Singapore — Asia Creators Cross", d: "Featured creator in the first Japan–Singapore convention exchange (29 Nov – 1 Dec)." },
      { t: "sumika「リビドー」", d: "Illustration for the lyric video from the album Vermillion's." },
    ],
  },
  {
    year: "2025",
    items: [
      { t: "AFA Creators Super Fest", d: "Key visual and special showcase, Singapore (2–3 Aug)." },
      { t: "COMITIA 154", d: "First time exhibiting; an all-new joint book with 慧子 (Keiko), every page newly drawn." },
      { t: "マツコの知らない世界", d: "Two works shown on national TV." },
    ],
  },
  {
    year: "2026",
    items: [
      { t: "NEW ERA × tamimoon", d: "Two new paintings plus a hand-painted, hand-distressed cap rebuilt in embroidery. Released 3 Sep." },
      { t: "いち髪 PREMIER × HANA", d: "Package illustration featuring JISOO." },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Links                                                               */
/* ------------------------------------------------------------------ */

export const email = "info@tamimoon.jp";

export const links = [
  { label: "X / Twitter", handle: "@tami_moon02", href: "https://x.com/tami_moon02" },
  { label: "Instagram", handle: "@tami_moon02", href: "https://www.instagram.com/tami_moon02/" },
  { label: "Threads", handle: "@tami_moon02", href: "https://www.threads.com/@tami_moon02" },
  { label: "Official site", handle: "tamimoon.tokyo", href: site },
  { label: "Online shop", handle: "tamimoon.official.ec", href: "https://tamimoon.official.ec" },
  { label: "R11R (management)", handle: "r11r.jp", href: "https://r11r.jp/creator/3542/" },
];
