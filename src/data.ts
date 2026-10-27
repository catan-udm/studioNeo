import salamander from "./assets/sankobite/salamander";
import cinderella from "./assets/sankobite/cinderella";
import animal from "./assets/sankobite/animal";
import hibana from "./assets/sankobite/hibana";
import otomeKaibou from "./assets/sankobite/otome-kaibou";
import vampire from "./assets/sankobite/vampire";
import parasite from "./assets/sankobite/parasite";
import zombie from "./assets/sankobite/zombie";
import devil1 from "./assets/sankobite/devil-1";
import devil2 from "./assets/sankobite/devil-2";
import devil3 from "./assets/sankobite/devil-3";
import hero from "./assets/sankobite/hero";
import rabbitHole from "./assets/sankobite/rabbit-hole";
import pokemiku from "./assets/sankobite/pokemiku";
import avatarImg from "./assets/sankobite/avatar";
import logoImg from "./assets/sankobite/banner";

export const avatar = avatarImg;
export const logoMark = logoImg;

export type Collection = "deco27" | "devil" | "special";

export interface Artwork {
  id: string;
  slug: string;
  src: string;
  titleJp: string;
  titleRomaji: string;
  titleEn: string;
  songBy: string;
  date: string; // ISO
  dateLabel: string;
  frames: number;
  durationMs: number;
  collection: Collection;
  collectionLabel: string;
  tags: string[];
  note: string;
  wide?: boolean;
  accent: string; // tailwind-safe hex
}

export const artworks: Artwork[] = [
  {
    id: "116809068", slug: "pokemiku", src: pokemiku,
    titleJp: "ポケミク", titleRomaji: "Poke Miku", titleEn: "Poké Miku",
    songBy: "Project VOLTAGE (Pokémon × Hatsune Miku)",
    date: "2024-03-10", dateLabel: "Mar 10, 2024",
    frames: 72, durationMs: 1440, collection: "special", collectionLabel: "Project VOLTAGE",
    tags: ["うごイラ", "初音ミク", "ProjectVOLTAGE", "ポケミク"],
    note: "A 72-frame ugoira for Project VOLTAGE 18 Types/Songs, the Pokémon × Hatsune Miku collaboration — Miku reimagined through a Pokémon lens.",
    accent: "#ffd23f",
  },
  {
    id: "116663066", slug: "rabbit-hole", src: rabbitHole,
    titleJp: "ラビットホール", titleRomaji: "Rabbit Hole", titleEn: "Rabbit Hole",
    songBy: "DECO*27",
    date: "2024-03-05", dateLabel: "Mar 5, 2024",
    frames: 15, durationMs: 300, collection: "deco27", collectionLabel: "DECO*27 Song Series",
    tags: ["うごイラ", "DECO*27", "VOCALOID", "初音ミク", "ラビットホール", "PurePure"],
    note: "Sankobite's return to the song series in 2024 — a snappy 15-frame loop at over 3 frames per beat of DECO*27's viral hit.",
    accent: "#ef4fd0",
  },
  {
    id: "110495140", slug: "hero", src: hero,
    titleJp: "HERO", titleRomaji: "HERO", titleEn: "HERO — Magical Mirai 2023",
    songBy: "Ayase (YOASOBI)",
    date: "2023-08-03", dateLabel: "Aug 3, 2023",
    frames: 109, durationMs: 2270, collection: "special", collectionLabel: "Magical Mirai 2023",
    tags: ["うごイラ", "VOCALOID", "YOASOBI", "初音ミク", "HERO(Ayase)", "マジカルミライ2023"],
    note: "The most ambitious piece in the archive: 109 hand-drawn frames in widescreen, made for Magical Mirai 2023 and Ayase's theme song HERO.",
    wide: true, accent: "#2fc4bb",
  },
  {
    id: "107110254", slug: "devil-3", src: devil3,
    titleJp: "デビルじゃないもん 3", titleRomaji: "Devil Janai Mon 3", titleEn: "I'm Not a Devil — Part 3",
    songBy: "DECO*27 × PinocchioP",
    date: "2023-04-12", dateLabel: "Apr 12, 2023",
    frames: 48, durationMs: 2000, collection: "devil", collectionLabel: "デビルじゃないもん",
    tags: ["うごイラ", "デビルじゃないもん", "DECO*27", "VOCALOID", "初音ミク"],
    note: "The finale of the three-part 'Devil Janai Mon' story — 48 frames, the longest loop of the April 2023 series.",
    accent: "#ff7a6b",
  },
  {
    id: "107110226", slug: "devil-2", src: devil2,
    titleJp: "デビルじゃないもん 2", titleRomaji: "Devil Janai Mon 2", titleEn: "I'm Not a Devil — Part 2",
    songBy: "DECO*27 × PinocchioP",
    date: "2023-04-12", dateLabel: "Apr 12, 2023",
    frames: 24, durationMs: 1000, collection: "devil", collectionLabel: "デビルじゃないもん",
    tags: ["うごイラ", "VOCALOID", "DECO*27", "初音ミク", "デビルじゃないもん"],
    note: "Part two of the devil diptych-turned-trilogy, posted the same day as its siblings — a full second of animation in one loop.",
    accent: "#ef4fd0",
  },
  {
    id: "107110202", slug: "devil-1", src: devil1,
    titleJp: "デビルじゃないもん 1", titleRomaji: "Devil Janai Mon 1", titleEn: "I'm Not a Devil — Part 1",
    songBy: "DECO*27 × PinocchioP",
    date: "2023-04-12", dateLabel: "Apr 12, 2023",
    frames: 12, durationMs: 500, collection: "devil", collectionLabel: "デビルじゃないもん",
    tags: ["うごイラ", "VOCALOID", "DECO*27", "初音ミク", "デビルじゃないもん"],
    note: "Where the mini-story begins — Miku insists she's no devil, in a bouncy half-second loop.",
    accent: "#ffd23f",
  },
  {
    id: "107046627", slug: "zombie", src: zombie,
    titleJp: "ゾンビ", titleRomaji: "Zombie", titleEn: "Zombie",
    songBy: "DECO*27",
    date: "2023-04-10", dateLabel: "Apr 10, 2023",
    frames: 24, durationMs: 1000, collection: "deco27", collectionLabel: "DECO*27 Song Series",
    tags: ["うごイラ", "ゾンビ(DECO*27)", "VOCALOID", "DECO*27", "初音ミク"],
    note: "An undead little groove — 24 frames of chibi Miku shambling in perfect rhythm.",
    accent: "#7ed957",
  },
  {
    id: "107039905", slug: "parasite", src: parasite,
    titleJp: "パラサイト", titleRomaji: "Parasite", titleEn: "Parasite",
    songBy: "DECO*27",
    date: "2023-04-09", dateLabel: "Apr 9, 2023",
    frames: 12, durationMs: 500, collection: "deco27", collectionLabel: "DECO*27 Song Series",
    tags: ["うごイラ", "パラサイト(DECO*27)", "VOCALOID", "DECO*27", "初音ミク"],
    note: "Twelve frames that cling to you like the song itself — quick, twitchy and impossibly cute.",
    accent: "#b48cf2",
  },
  {
    id: "107009280", slug: "vampire", src: vampire,
    titleJp: "ヴァンパイア", titleRomaji: "Vampire", titleEn: "Vampire",
    songBy: "DECO*27",
    date: "2023-04-09", dateLabel: "Apr 9, 2023",
    frames: 24, durationMs: 1000, collection: "deco27", collectionLabel: "DECO*27 Song Series",
    tags: ["うごイラ", "ヴァンパイア(DECO*27)", "VOCALOID", "DECO*27", "初音ミク"],
    note: "\"I'm a vampire\" — fangs, frills and a full second of looped mischief.",
    accent: "#ff7a6b",
  },
  {
    id: "107006647", slug: "otome-kaibou", src: otomeKaibou,
    titleJp: "乙女解剖", titleRomaji: "Otome Kaibou", titleEn: "Maiden Dissection",
    songBy: "DECO*27",
    date: "2023-04-09", dateLabel: "Apr 9, 2023",
    frames: 24, durationMs: 1000, collection: "deco27", collectionLabel: "DECO*27 Song Series",
    tags: ["うごイラ", "乙女解剖", "DECO*27"],
    note: "A gentler take on one of DECO*27's darkest hits — the clinical subject rendered utterly huggable.",
    accent: "#8fd3f4",
  },
  {
    id: "106976492", slug: "hibana", src: hibana,
    titleJp: "ヒバナ", titleRomaji: "Hibana", titleEn: "Spark",
    songBy: "DECO*27",
    date: "2023-04-08", dateLabel: "Apr 8, 2023",
    frames: 24, durationMs: 1000, collection: "deco27", collectionLabel: "DECO*27 Song Series",
    tags: ["初音ミク", "VOCALOID", "ヒバナ", "うごイラ", "DECO*27"],
    note: "Crosshairs and magenta sparks — perhaps the signature piece of the series, framed like a target sight.",
    accent: "#ef4fd0",
  },
  {
    id: "106970979", slug: "animal", src: animal,
    titleJp: "アニマル", titleRomaji: "Animal", titleEn: "Animal",
    songBy: "DECO*27",
    date: "2023-04-07", dateLabel: "Apr 7, 2023",
    frames: 24, durationMs: 1000, collection: "deco27", collectionLabel: "DECO*27 Song Series",
    tags: ["アニマル(DECO*27)", "うごイラ", "初音ミク", "VOCALOID", "DECO*27"],
    note: "Wild at heart, chibi in form — a full 24-frame prowl through DECO*27's Animal.",
    accent: "#ffd23f",
  },
  {
    id: "106969155", slug: "cinderella", src: cinderella,
    titleJp: "シンデレラ", titleRomaji: "Cinderella", titleEn: "Cinderella",
    songBy: "DECO*27",
    date: "2023-04-07", dateLabel: "Apr 7, 2023",
    frames: 16, durationMs: 530, collection: "deco27", collectionLabel: "DECO*27 Song Series",
    tags: ["再投稿", "シンデレラ(DECO*27)", "うごイラ", "初音ミク", "VOCALOID", "DECO*27"],
    note: "A midnight loop in 16 frames — re-posted and polished until the slipper fit.",
    accent: "#8fd3f4",
  },
  {
    id: "106941579", slug: "salamander", src: salamander,
    titleJp: "サラマンダー", titleRomaji: "Salamander", titleEn: "Salamander",
    songBy: "DECO*27",
    date: "2023-04-07", dateLabel: "Apr 7, 2023",
    frames: 12, durationMs: 500, collection: "deco27", collectionLabel: "DECO*27 Song Series",
    tags: ["サラマンダー(DECO*27)", "うごイラ", "初音ミク", "VOCALOID", "DECO*27"],
    note: "The very first ugoira on the Pixiv archive — the spark that lit the whole April 2023 song series.",
    accent: "#ff7a6b",
  },
];

export const totalFrames = artworks.reduce((n, a) => n + a.frames, 0);
export const totalMs = artworks.reduce((n, a) => n + a.durationMs, 0);

export const links = {
  blog: "https://sankobite.art.blog/",
  gallery: "https://sankobite.art.blog/about/",
  pixiv: "https://www.pixiv.net/users/92602222",
  x: "https://x.com/sankobite",
  youtube: "https://www.youtube.com/@sankobite",
  instagram: "https://www.instagram.com/sankobite/",
  studio: "https://www.malikhaingpinoy.ph/creative/studio-2003/",
};

export const pixivArt = (id: string) => `https://www.pixiv.net/artworks/${id}`;
