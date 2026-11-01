export const EXHIBITION = "https://revenge-pop.mikapikazo.info/";
export const OFFICIAL = "https://www.mikapikazo.com/";
export const X_URL = "https://x.com/MikaPikaZo";

export type Category = "illustration" | "key-visual";

export type Work = {
  id: string;
  title: string;
  category: Category;
  year?: string;
  meta: string;
  image: string;
  alt: string;
  note: string;
  sfx: string;
  pos?: string;
};

export const works: Work[] = [
  {
    id: "pop",
    sfx: "ドンッ",
    pos: "center 22%",
    title: "POP",
    category: "key-visual",
    year: "2022",
    meta: "Key visual · REVENGE POP",
    image: "/images/mikapikazo/pop-portrait.webp",
    alt: "POP key visual by Mika Pikazo: a grinning character against saturated blue",
    note: "The second key visual for REVENGE POP, and the half of the exhibition that gives the show its name.",
  },
  {
    id: "revenge",
    sfx: "ゴォッ",
    pos: "center 20%",
    title: "REVENGE",
    category: "key-visual",
    year: "2022",
    meta: "Key visual · REVENGE POP",
    image: "/images/mikapikazo/revenge-portrait.webp",
    alt: "REVENGE key visual by Mika Pikazo: a red and white haired character mid-motion",
    note: "The first visual announced for the exhibition, made alongside her move into animation in 2022.",
  },
  {
    id: "free",
    sfx: "バッ",
    pos: "center 30%",
    title: "FREE",
    category: "illustration",
    year: "2022",
    meta: "Exhibition piece · REVENGE POP",
    image: "/images/mikapikazo/free.webp",
    alt: "FREE by Mika Pikazo: a character reaching outward through ribbons of blue, orange and pink",
    note: "Shown at REVENGE POP and released as a reproduction print. Ribbons of paint do the work that line art usually does.",
  },
  {
    id: "visions",
    sfx: "キラッ",
    pos: "center 35%",
    title: "VISIONS",
    category: "illustration",
    year: "2023",
    meta: "Cover illustration · VISIONS 2023",
    image: "/images/mikapikazo/visions.webp",
    alt: "VISIONS by Mika Pikazo: a character surrounded by a dense burst of colourful flowers",
    note: "Cover art for the pixiv-supervised art book VISIONS 2023 — flowers, confetti colour and a character right in the middle of the noise.",
  },
  {
    id: "fun",
    sfx: "ワッ",
    pos: "center 32%",
    title: "FUN",
    category: "illustration",
    year: "2022",
    meta: "Exhibition piece · REVENGE POP",
    image: "/images/mikapikazo/fun.webp",
    alt: "FUN by Mika Pikazo: a character illustration on a bright red background",
    note: "A character study built out of flat, saturated shapes — the pop end of the REVENGE POP spectrum.",
  },
  {
    id: "sports",
    sfx: "パンッ",
    pos: "center 22%",
    title: "SPORTS",
    category: "illustration",
    year: "2022",
    meta: "Exhibition piece · REVENGE POP",
    image: "/images/mikapikazo/sports.webp",
    alt: "SPORTS by Mika Pikazo: a character with red glasses and headphones on a red ground",
    note: "Primary red, primary blue, nothing in between. A good example of how few colours a loud picture actually needs.",
  },
  {
    id: "birth",
    sfx: "シュン",
    pos: "center 25%",
    title: "Birth",
    category: "illustration",
    year: "2022",
    meta: "Exhibition piece · REVENGE POP",
    image: "/images/mikapikazo/birth.webp",
    alt: "Birth by Mika Pikazo: a character wrapped in blue motion and sharp graphic shards",
    note: "Blue on blue on blue, cut through with white — proof that her palette can shout in a single hue.",
  },
  {
    id: "revenge-pop",
    sfx: "ドカン",
    pos: "center 25%",
    title: "REVENGE POP",
    category: "key-visual",
    year: "2022",
    meta: "Main visual · REVENGE POP",
    image: "/images/mikapikazo/revenge-pop-portrait.webp",
    alt: "REVENGE POP main visual by Mika Pikazo: the two exhibition characters together on yellow",
    note: "Both halves of the show in one frame. This is the image the whole exhibition was built around.",
  },
  {
    id: "laugh",
    sfx: "ゲラ",
    pos: "center 32%",
    title: "LAUGH",
    category: "illustration",
    year: "2022",
    meta: "Exhibition piece · REVENGE POP",
    image: "/images/mikapikazo/laugh.webp",
    alt: "LAUGH by Mika Pikazo: a character wearing pink goggles",
    note: "Goggles, gradients of magenta and cyan, and a grin. Pure exhibition energy.",
  },
  {
    id: "adhouse",
    sfx: "ザブン",
    pos: "center 28%",
    title: "AD:HOUSE",
    category: "illustration",
    meta: "Cover illustration",
    image: "/images/mikapikazo/adhouse.webp",
    alt: "AD:HOUSE cover illustration by Mika Pikazo: a character amid splashing blue water shapes",
    note: "Cover artwork for the AD:HOUSE compilation series — summer, water and a very fast shutter speed.",
  },
];

export type Palette = {
  id: string;
  name: string;
  jp: string;
  pop: string;
  pop2: string;
  pop3: string;
  onPop: string;
  onPop2: string;
  onPop3: string;
};

const INK = "#14101c";
const PAPER = "#fffdf6";

export const palettes: Palette[] = [
  {
    id: "pop",
    name: "POP",
    jp: "ポップ",
    pop: "#ff2e7e",
    pop2: "#eaff00",
    pop3: "#2b2bff",
    onPop: INK,
    onPop2: INK,
    onPop3: PAPER,
  },
  {
    id: "candy",
    name: "CANDY",
    jp: "キャンディ",
    pop: "#ff3dcb",
    pop2: "#b6ff3c",
    pop3: "#00c8f5",
    onPop: INK,
    onPop2: INK,
    onPop3: INK,
  },
  {
    id: "sunset",
    name: "SUNSET",
    jp: "サンセット",
    pop: "#ff5a00",
    pop2: "#ffd400",
    pop3: "#ff2d6f",
    onPop: INK,
    onPop2: INK,
    onPop3: INK,
  },
  {
    id: "volt",
    name: "VOLT",
    jp: "ボルト",
    pop: "#2b2bff",
    pop2: "#00e5ff",
    pop3: "#c6ff00",
    onPop: PAPER,
    onPop2: INK,
    onPop3: INK,
  },
];

export type Project = {
  year: string;
  title: string;
  role: string;
  detail: string;
  href: string;
  linkLabel: string;
};

export const projects: Project[] = [
  {
    year: "2023",
    title: "FIRE EMBLEM ENGAGE",
    role: "Character design · Nintendo",
    detail:
      "Character design for the Nintendo Switch entry in the Fire Emblem series — a full cast built from her saturated, high-contrast design language.",
    href: "https://www.nintendo.com/us/store/products/fire-emblem-engage-switch/",
    linkLabel: "NINTENDO",
  },
  {
    year: "2021",
    title: "HAKOS BAELZ",
    role: "Character design · hololive English",
    detail:
      "Character design for the hololive English virtual talent, following her earlier work designing Kaguya Luna.",
    href: "https://en.hololive.tv/portfolio/items/hakos-baelz",
    linkLabel: "HOLOLIVE",
  },
  {
    year: "2018",
    title: "MAGICAL MIRAI 2018",
    role: "Main visual & costume design · Hatsune Miku",
    detail:
      "Main visual and costume design for Hatsune Miku Magical Mirai 2018, the concert and exhibition series built around the Vocaloid.",
    href: "https://magicalmirai.com/2018/",
    linkLabel: "MAGICAL MIRAI",
  },
  {
    year: "2017",
    title: "KAGUYA LUNA",
    role: "Character design · Virtual YouTuber",
    detail:
      "The design that put her in front of a huge audience: the virtual YouTuber Kaguya Luna, plus art direction for the project's VR live show.",
    href: OFFICIAL,
    linkLabel: "OFFICIAL SITE",
  },
  {
    year: "FGO",
    title: "FATE / GRAND ORDER",
    role: "Illustration · Sei Shōnagon",
    detail:
      "In-game illustration work for Fate/Grand Order, including the endlessly upbeat Sei Shōnagon.",
    href: "https://fate-go.us/",
    linkLabel: "FATE / GO",
  },
  {
    year: "ADO",
    title: "KYŌGEN",
    role: "Advertising visual · Ado",
    detail:
      "Outdoor advertising artwork for Ado's first album 狂言 (Kyōgen) — her illustration scaled up to city signage.",
    href: "https://www.universal-music.co.jp/ado/",
    linkLabel: "ADO",
  },
];

export const milestones = [
  { year: "2015", title: "DEBUT", text: "First light-novel cover work after returning to Japan from Brazil." },
  { year: "2017", title: "KAGUYA LUNA", text: "Character design for the virtual YouTuber that changed her scale overnight." },
  { year: "2018", title: "MAGICAL MIRAI", text: "Main visual and costumes for Hatsune Miku's biggest annual event." },
  { year: "2019", title: "MIKAPIKAZO", text: "First commercial art book, and a first solo exhibition to match." },
  { year: "2022", title: "REVENGE POP", text: "Solo show at Hz in Shibuya, with new animation work alongside the illustrations." },
  { year: "2023", title: "ENGAGE + ILY GIRL", text: "Fire Emblem Engage launches; a third solo exhibition opens in Harajuku." },
];

export const socials = [
  { name: "X / TWITTER", handle: "@MikaPikaZo", href: X_URL, kind: "x" as const },
  {
    name: "INSTAGRAM",
    handle: "@mika_pikazo_mpz",
    href: "https://www.instagram.com/mika_pikazo_mpz/",
    kind: "instagram" as const,
  },
  {
    name: "PIXIV",
    handle: "Mika Pikazo",
    href: "https://www.pixiv.net/users/1039353",
    kind: "pixiv" as const,
  },
];
