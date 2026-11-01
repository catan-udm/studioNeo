import { DAILY } from "@/components/archive/kaduise/data/daily";

export type Tag =
  | "Daily"
  | "Girls"
  | "Stars"
  | "Music"
  | "City"
  | "Space"
  | "Everyday"
  | "Death"
  | "Sketch"
  | "Originals";

export type Work = {
  /** file name inside src/assets/art */
  k: string;
  /** the artist's own title, in Japanese */
  title: string;
  /** english rendering of that title */
  en: string;
  /** ISO date of the original post */
  d: string;
  /** status id on X, or illust id on pixiv */
  id: string;
  /** likes at archive time (X posts only) */
  fav?: number;
  /** where it was published */
  via?: "x" | "pixiv";
  /** width / height */
  ar: number;
  tags: Tag[];
  quote?: string;
  quoteEn?: string;
};

export const X_WORKS_COUNT = 45;

export const TAGS: Tag[] = [
  "Daily",
  "Girls",
  "Stars",
  "Everyday",
  "Music",
  "City",
  "Space",
  "Death",
  "Sketch",
  "Originals",
];

export const WORKS: Work[] = [
  { k: "shingo", title: "信号待ち", en: "Waiting for the light", d: "2025-11-07", id: "1986751776318730423", fav: 2095, ar: 1.5, tags: ["City", "Music", "Girls"] },
  { k: "ufo", title: "UFO", en: "UFO", d: "2025-11-05", id: "1986029657125457955", fav: 2219, ar: 1.5, tags: ["Space", "Girls"] },
  { k: "music", title: "音楽に救われてきたんだ", en: "Music has been saving me all along", d: "2026-10-11", id: "2109243677541564677", fav: 19906, ar: 1.47, tags: ["Music", "Girls", "Everyday"], quote: "音楽に救われてきたんだ", quoteEn: "Music has been saving me all along." },
  { k: "ogon", title: "黄金", en: "Gold", d: "2025-09-01", id: "1962471272543355220", fav: 788, ar: 1.5, tags: ["Everyday", "Girls"] },
  { k: "uchuu", title: "宇宙に行こう", en: "Let's go to space", d: "2025-08-22", id: "1958847230988747093", fav: 4000, ar: 1.5, tags: ["Space", "Girls"] },
  { k: "ryuuseigun", title: "流星群", en: "Meteor shower", d: "2025-08-20", id: "1958123209389412630", fav: 908, ar: 1.49, tags: ["Stars"] },
  { k: "todoke", title: "届け。", en: "Reach them.", d: "2025-08-19", id: "1957760799767949390", fav: 1669, ar: 1.48, tags: ["Stars", "Girls"] },
  { k: "haiorange", title: "灰とオレンジ", en: "Ash and orange", d: "2025-08-17", id: "1957042281036558813", fav: 3174, ar: 1.48, tags: ["Everyday", "Music"] },
  { k: "mitaiboshi", title: "見たい星だけを見る", en: "I only look at the stars I want to see", d: "2025-08-16", id: "1956674177844629660", fav: 1926, ar: 0.675, tags: ["Stars", "Girls"] },
  { k: "angor", title: "おやすみアンゴルモア。", en: "Good night, Angolmois.", d: "2025-08-06", id: "1953048815461908622", fav: 1018, ar: 1.49, tags: ["Space", "Death"] },
  { k: "uchuu2", title: "宇宙に行こう", en: "Let's go to space", d: "2025-07-24", id: "1948340485824942097", fav: 1035, ar: 1.49, tags: ["Space"] },
  { k: "taiyou", title: "太陽を見たんだ", en: "I saw the sun", d: "2025-07-23", id: "1947976538751996155", fav: 1294, ar: 0.675, tags: ["Stars", "Girls"] },
  { k: "kanjou", title: "感情は風にのって", en: "Feelings ride the wind", d: "2025-07-21", id: "1947250384214323360", fav: 2430, ar: 0.675, tags: ["Everyday", "Girls"] },
  { k: "station", title: "思い出の宇宙ステーション", en: "The space station of memories", d: "2025-07-14", id: "1944715265906028799", fav: 6215, ar: 1.5, tags: ["Space", "Everyday"], quote: "思い出を洗って", quoteEn: "Washing the memories." },
  { k: "issho", title: "一緒に行こう", en: "Let's go together", d: "2025-07-10", id: "1943266705763115406", fav: 740, ar: 1.5, tags: ["Girls", "Death"] },
  { k: "seimei", title: "生命のある限り", en: "As long as there is life", d: "2025-06-18", id: "1935297759445397511", fav: 783, ar: 1.47, tags: ["Death", "Everyday"] },
  { k: "ryuusei", title: "流星になって", en: "Become a shooting star", d: "2025-05-21", id: "1925144645849555021", fav: 5654, ar: 1.47, tags: ["Stars", "Girls"] },
  { k: "bokunohoshi", title: "僕の星は空には無かった", en: "My star was not in the sky", d: "2025-05-19", id: "1924420357823549661", fav: 1030, ar: 1.49, tags: ["Stars", "City"] },
  { k: "drw3", title: "ドローイング", en: "Drawing", d: "2025-05-18", id: "1924056562957729974", fav: 970, ar: 0.675, tags: ["Sketch", "Girls"] },
  { k: "drw4", title: "ドローイング", en: "Drawing", d: "2025-04-28", id: "1916820388274700630", fav: 1014, ar: 0.675, tags: ["Sketch"] },
  { k: "netsuyo", title: "熱よ", en: "O fever", d: "2025-04-24", id: "1915360292349067729", fav: 1272, ar: 1.5, tags: ["Everyday", "Girls"] },
  { k: "kaze", title: "風よ", en: "O wind", d: "2025-04-10", id: "1910286997664784837", fav: 2948, ar: 1.48, tags: ["Everyday"] },
  { k: "drw2", title: "ドローイング", en: "Drawing", d: "2025-04-08", id: "1909563027076342072", fav: 2592, ar: 0.675, tags: ["Sketch", "Girls"] },
  { k: "shine", title: "死を想え", en: "Memento mori", d: "2025-02-20", id: "1892537061942739047", fav: 2436, ar: 0.675, tags: ["Death", "Girls"] },
  { k: "yomichi", title: "夜道", en: "Night road", d: "2025-02-17", id: "1891448558823395654", fav: 3231, ar: 1.48, tags: ["City", "Death"] },
  { k: "shayou", title: "斜陽", en: "The setting sun", d: "2025-02-13", id: "1889999990753501489", fav: 12828, ar: 1.47, tags: ["Everyday", "Girls"], quote: "目を逸らすなよ、自分から。", quoteEn: "Don't look away — from yourself." },
  { k: "bokura", title: "僕らは星になる", en: "We will become stars", d: "2024-12-22", id: "1870787842018021651", fav: 16991, ar: 1.51, tags: ["Stars", "Death", "Girls"] },
  { k: "egaki", title: "絵を描き続ける", en: "Keep drawing", d: "2024-12-14", id: "1867884421602566375", fav: 2088, ar: 1.5, tags: ["Originals", "Sketch"] },
  { k: "top2024", title: "今年一番伸びた絵", en: "My most-shared picture this year", d: "2024-12-10", id: "1866432593169936717", fav: 1659, ar: 1.51, tags: ["Stars", "Girls"] },
  { k: "hoshiyo", title: "星よ。", en: "O stars.", d: "2024-11-30", id: "1862800460039741492", fav: 2572, ar: 0.675, tags: ["Stars"] },
  { k: "drw1", title: "ドローイング", en: "Drawing", d: "2024-11-22", id: "1859916282600276185", fav: 26732, ar: 0.675, tags: ["Sketch", "Girls"] },
  { k: "ugate", title: "穿て。", en: "Pierce it.", d: "2024-11-21", id: "1859547009499398385", fav: 990, ar: 1.51, tags: ["Girls", "Everyday"] },
  { k: "tsukanda", title: "掴んだ途端に小さいね", en: "The moment you catch it, it's small", d: "2024-11-20", id: "1859185016141648111", fav: 1307, ar: 0.66, tags: ["Stars", "Girls"] },
  { k: "shihatsu", title: "始発駅", en: "First train of the day", d: "2024-11-19", id: "1858829593203142986", fav: 708, ar: 1.51, tags: ["City", "Everyday"] },
  { k: "ikite", title: "生きて", en: "Live", d: "2024-11-18", id: "1858454263317581843", fav: 37370, ar: 1.51, tags: ["Stars", "Death", "Girls"], quote: "掴むべき星がまだ無限にあるから私たちは手を伸ばせる。だから「生きて」", quoteEn: "There are still infinite stars to catch, so we can keep reaching. So: live." },
  { k: "booth", title: "デザフェス60", en: "Design Festa 60", d: "2024-11-18", id: "1858459681544675525", fav: 964, ar: 1.33, tags: ["Originals"], quote: "原画400枚以上全て旅立った事。", quoteEn: "All 400-plus originals set off for somewhere." },
  { k: "livepaint", title: "ライブペイント「生きて」", en: "Live painting: “Live”", d: "2024-11-17", id: "1858096443388825968", fav: 5084, ar: 1.33, tags: ["Originals", "Stars"] },
  { k: "kibou", title: "希望", en: "Hope", d: "2024-09-02", id: "1830573459119943979", fav: 807, ar: 1.51, tags: ["Girls", "Everyday"] },
  { k: "migarako", title: "身を焦がして星を掴もうとする", en: "Burning yourself up trying to catch a star", d: "2024-07-14", id: "1812398432763642134", fav: 1037, ar: 1.47, tags: ["Stars", "Girls"] },
  { k: "yokatta", title: "「「よかったねぇ〜。」」", en: "“Well, good for you.”", d: "2024-04-28", id: "1784570181836308577", fav: 748, ar: 0.675, tags: ["Death", "Girls"] },
  { k: "overdrive", title: "オーバードライブ", en: "Overdrive", d: "2023-06-30", id: "1674758577171595267", fav: 1821, ar: 0.675, tags: ["Music", "Girls"] },
  { k: "odorou", title: "踊ろう", en: "Let's dance", d: "2022-01-27", id: "1486646672197550083", fav: 937, ar: 0.675, tags: ["Music", "Girls"] },
  { k: "sainou", title: "才能が無いのは知ってる だからなんだ。", en: "I know I have no talent. So what.", d: "2021-09-24", id: "1441337503458287623", fav: 815, ar: 0.675, tags: ["Girls", "Death"], quote: "才能が無いのは知ってる だからなんだ。", quoteEn: "I know I have no talent. So what." },
  { k: "terashite", title: "あなたは照らしてくれないのに", en: "Even though you never light my way", d: "2021-06-12", id: "1403818889134317570", fav: 827, ar: 0.675, tags: ["Everyday", "Girls"] },
  { k: "hitsujis", title: "羊は誰の夢を見たらいい？", en: "Whose dream should the sheep dream?", d: "2021-05-09", id: "1391466515313029122", fav: 851, ar: 0.675, tags: ["Everyday", "Girls"] },
];

/** Real captions the artist has posted — used as pull quotes across the page. */
export const WORDS: { jp: string; en: string; from: string }[] = [
  {
    jp: "全ては少女の為に、全てを少女の為に。",
    en: "Everything for the sake of a girl, everything because of one.",
    from: "X profile",
  },
  {
    jp: "私にしか描けない絵なんてない。でも、私には描きたい絵がある。",
    en: "There is no picture only I can draw. But there are pictures I want to draw.",
    from: "monthly round-up post",
  },
  {
    jp: "星を一つ掴んだ一ヶ月でした。それでも掴むべき星がまだ無限にあるから私たちは手を伸ばせる。",
    en: "A month in which I caught one star. Still, infinite stars remain — so we can keep reaching.",
    from: "39 drawings in November",
  },
  {
    jp: "全ての事象が私たちを傷つける中「それでも」を言い続けて。",
    en: "While every single thing wounds us, keep saying “and yet”.",
    from: "September 2024",
  },
  {
    jp: "目を逸らすなよ、自分から。",
    en: "Don't look away — from yourself.",
    from: "35 drawings that month",
  },
  {
    jp: "絵を描くだけで生活出来るようになる。夢はぶれて。夢は流れて。夢の始末は自分でつける。",
    en: "To live by drawing alone. Dreams waver, dreams drift — you settle the bill for them yourself.",
    from: "on wanting things out loud",
  },
];

/** Recurring subjects, counted across the 45 X works archived here. */
export const MOTIFS: { en: string; jp: string; note: string; n: number; color: string }[] = [
  { en: "Girls", jp: "少女", note: "barefoot, deadpan, always centre", n: 30, color: "var(--color-ink)" },
  { en: "Everyday", jp: "生活", note: "laundry, buses, sinks, night air", n: 14, color: "var(--color-teal)" },
  { en: "Stars", jp: "星", note: "to catch, and to miss", n: 13, color: "var(--color-mustard)" },
  { en: "Death", jp: "死", note: "and then: live", n: 9, color: "var(--color-red)" },
  { en: "Music", jp: "音楽", note: "guitars, cassettes, amps", n: 5, color: "var(--color-orange)" },
  { en: "Space", jp: "宇宙", note: "UFOs, stations, good night", n: 5, color: "var(--color-ink-soft)" },
  { en: "Sketches", jp: "ドローイング", note: "unpolished, posted anyway", n: 5, color: "var(--color-ash)" },
  { en: "City", jp: "都市", note: "shutters, signals, first trains", n: 4, color: "var(--color-teal)" },
  { en: "Originals", jp: "原画", note: "events, walls, letting go", n: 3, color: "var(--color-mustard)" },
];

export const TIMELINE: { y: string; head: string; body: string }[] = [
  {
    y: "2012",
    head: "Licensed as a nursery teacher",
    body: "Nine years spent in the classroom, next to children who draw without hesitating.",
  },
  { y: "Dec 2018", head: "Joins X", body: "The account opens quietly; the drawings start arriving the following year." },
  {
    y: "2019",
    head: "Begins work as an illustrator",
    body: "Posts to social media, enters competitions, and wins the 2nd WEGO After-School Art Club award.",
  },
  {
    y: "Jun 2023",
    head: "Starts posting to pixiv too",
    body: "671 pictures accumulate there over the next three years — the fullest record of the practice.",
  },
  {
    y: "Nov 2024",
    head: "Design Festa 60",
    body: "Over 400 original drawings all find owners during the event, plus a live painting titled “Live”.",
  },
  {
    y: "Dec 2025",
    head: "The pace becomes daily",
    body: "From this winter the output settles at 28–31 pictures a month and never really drops again.",
  },
  { y: "Jun 2026", head: "“I got into Design Festa.”", body: "Six words, and more than 6,500 people replying in kind." },
  {
    y: "Sep 2026",
    head: "VISIONS 2027",
    body: "A drawing made for the release of pixiv's VISIONS 2027 Illustrators Book.",
  },
  {
    y: "Oct 2026",
    head: "Still every night, around eight",
    body: "Running a bar in Osaka by day, uploading one picture after closing. 29 of them in October alone.",
  },
];

export const PROCESS: { no: string; head: string; sub: string; body: string }[] = [
  {
    no: "01",
    head: "Line, by hand",
    sub: "アナログ線画",
    body: "Pen on paper. The contour shakes, hesitates, doubles back — and none of that gets erased. The wobble is the drawing.",
  },
  {
    no: "02",
    head: "Scan it flat",
    sub: "スキャン取込",
    body: "The original goes straight into the scanner and the white of the paper is kept as negative space. Nothing is added to fill it.",
  },
  {
    no: "03",
    head: "Flat digital colour",
    sub: "デジタル彩色",
    body: "Grey, paper, and a single accent — orange, mustard, rust-blue. No shadows are painted, so the line itself has to carry the air.",
  },
  {
    no: "04",
    head: "Let the original go",
    sub: "原画として手放す",
    body: "The physical drawing is sold at events. The picture stops being hers and goes off to live on somebody else's wall.",
  },
];

export const SERVICES: { en: string; jp: string }[] = [
  { en: "Illustration, personal & commercial", jp: "イラスト制作" },
  { en: "Character design", jp: "キャラクターデザイン" },
  { en: "LINE sticker sets", jp: "LINEスタンプ" },
  { en: "T-shirt & print design", jp: "Tシャツ・プリント" },
  { en: "Manga & picture books", jp: "漫画・絵本制作" },
  { en: "Live painting & exhibitions", jp: "ライブペイント・展示" },
];

export const PALETTE: { hex: string; en: string; jp: string }[] = [
  { hex: "#EFEBE1", en: "paper", jp: "紙" },
  { hex: "#8C8779", en: "ash", jp: "灰" },
  { hex: "#1A1813", en: "ink", jp: "墨" },
  { hex: "#EC8524", en: "signal", jp: "信号" },
  { hex: "#E0B931", en: "mustard", jp: "からし" },
  { hex: "#6B969F", en: "rust blue", jp: "錆碧" },
  { hex: "#D63C22", en: "red", jp: "赤" },
];

/** Daily drawings mirrored from pixiv (2026). */
const DAILY_WORKS: Work[] = DAILY.map((w) => ({
  k: `px${w.id}`,
  title: w.t || "",
  en: w.en || "",
  d: w.d,
  id: w.id,
  ar: w.ar,
  via: "pixiv" as const,
  tags: ["Daily", "Girls"] as Tag[],
}));

/** Untitled dailies read badly in a grid — fall back to the date. */
export function displayTitle(w: Pick<Work, "en" | "d">) {
  if (w.en) return w.en;
  const dt = new Date(`${w.d}T00:00:00Z`);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
}

/** Everything, newest first. */
export const ALL_WORKS: Work[] = [...WORKS, ...DAILY_WORKS].sort((a, b) => (a.d < b.d ? 1 : -1));
