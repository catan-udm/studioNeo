export const agencyProfile = "https://r11r.jp/creator/16642/";
export const interview = "https://erumina.jp/archives/5908";
export const encounter = "https://encounter.curbon.jp/special/photographer-illustrator01/";
export const linkHub = "https://potofu.me/tatamipi";
export const visions = "https://www.pixiv.net/special/visions2025/?lang=en";
export const illustration = "https://www.shoeisha.co.jp/book/campaign/ILST2025";
export const xProfile = "https://x.com/tatamipi";
export const instagram = "https://www.instagram.com/tatamipi/";
export const skeb = "https://skeb.jp/@tatamipi";

export type Work = {
  plate: string;
  image: string;
  source: string;
  sourceName: string;
  note: string;
  wide?: boolean;
};

const alt = (w: Work) => `Artwork by tatamipi, plate ${w.plate} — via ${w.sourceName}`;
export const altFor = alt;

export const works: Work[] = [
  {
    plate: "01",
    image: "https://erumina.jp/renewal/wp-content/uploads/2025/10/article-tatamipi-01.jpg",
    source: interview,
    sourceName: "erumina",
    note: "erumina interview, 2025",
  },
  {
    plate: "02",
    image: "https://r11r.jp/wp-content/uploads/R11R_tatamipi_06-tatami-ozashiki.png",
    source: agencyProfile,
    sourceName: "R11R",
    note: "R11R portfolio",
  },
  {
    plate: "03",
    image: "https://erumina.jp/renewal/wp-content/uploads/2025/10/article-tatamipi-02.jpg",
    source: interview,
    sourceName: "erumina",
    note: "erumina interview, 2025",
  },
  {
    plate: "04",
    image: "https://r11r.jp/wp-content/uploads/R11R_tatamipi_08-tatami-ozashiki.png",
    source: agencyProfile,
    sourceName: "R11R",
    note: "R11R portfolio",
  },
  {
    plate: "05",
    image: "https://erumina.jp/renewal/wp-content/uploads/2025/10/article-tatamipi-05.jpg",
    source: interview,
    sourceName: "erumina",
    note: "erumina interview, 2025",
  },
  {
    plate: "06",
    image: "https://r11r.jp/wp-content/uploads/R11R_tatamipi_02-tatami-ozashiki.png",
    source: agencyProfile,
    sourceName: "R11R",
    note: "R11R portfolio",
  },
  {
    plate: "07",
    image:
      "https://i0.wp.com/encounter.curbon.jp/wp-content/uploads/2023/09/868f0dac73ae207d2177876c44e68fa9.png?w=1030&ssl=1",
    source: encounter,
    sourceName: "ENCOUNTER",
    note: "Early sketch — ENCOUNTER × Toshiaki Kitaoka, 2023",
  },
  {
    plate: "08",
    image: "https://erumina.jp/renewal/wp-content/uploads/2025/10/article-tatamipi-03.jpg",
    source: interview,
    sourceName: "erumina",
    note: "erumina interview, 2025",
    wide: true,
  },
  {
    plate: "09",
    image: "https://i0.wp.com/encounter.curbon.jp/wp-content/uploads/2023/09/010-fix.png?w=1296&ssl=1",
    source: encounter,
    sourceName: "ENCOUNTER",
    note: "Finished collaboration with photographer Toshiaki Kitaoka, 2023",
  },
  {
    plate: "10",
    image: "https://r11r.jp/wp-content/uploads/R11R_tatamipi_05-tatami-ozashiki.png",
    source: agencyProfile,
    sourceName: "R11R",
    note: "R11R portfolio",
    wide: true,
  },
];

export const details: Work[] = [
  {
    plate: "11",
    image: "https://erumina.jp/renewal/wp-content/uploads/2025/10/article-tatamipi-04.jpg",
    source: interview,
    sourceName: "erumina",
    note: "erumina interview, 2025",
  },
  {
    plate: "12",
    image: "https://r11r.jp/wp-content/uploads/R11R_tatamipi_04-tatami-ozashiki.jpeg",
    source: agencyProfile,
    sourceName: "R11R",
    note: "R11R portfolio",
  },
];

export const heroArt =
  "https://r11r.jp/wp-content/uploads/R11R_tatamipi_01-tatami-ozashiki.png";
export const aboutArt =
  "https://r11r.jp/wp-content/uploads/R11R_tatamipi_07-tatami-ozashiki.png";

export const ticker = [
  "CUTE",
  "COOL",
  "MONOCHROME",
  "かわいいと思うものを、かわいいかたちで",
  "絵を描くのが好きです",
  "OSAKA → TOKYO",
  "R11R",
];

export const quotes = [
  {
    ja: "正確さよりも、気持ち良さを大切にする。",
    en: "Feeling over accuracy.",
    source: "erumina interview, 2025",
    href: interview,
  },
  {
    ja: "自分の中の『フェチ』を、しっかり絵の中に詰める。",
    en: "I pack my own fixations firmly into the picture.",
    source: "erumina interview, 2025",
    href: interview,
  },
  {
    ja: "かわいいと思うものを、かわいいかたちで切り取りたいです。",
    en: "I want to cut out the things I find cute, in a cute shape.",
    source: "R11R creator profile",
    href: agencyProfile,
  },
  {
    ja: "次の瞬間には目を逸しているような女の子だといいなと思います。",
    en: "I hope she is a girl who looks away the next moment.",
    source: "ENCOUNTER × Toshiaki Kitaoka, 2023",
    href: encounter,
  },
  {
    ja: "絵を描くのが好きです。",
    en: "I like drawing pictures.",
    source: "X profile",
    href: xProfile,
  },
];

export const principles = [
  {
    title: "One long stroke",
    text: "Drawing started on an old, painfully slow computer, so pen pressure went off and each line became one long stroke — fewer things to undo. That constraint is still the style.",
  },
  {
    title: "No self-rules",
    text: "No rules like “always two highlights in the eye.” Fixed habits narrow what you can draw, so trends get tried, erased, and balanced back out again.",
  },
  {
    title: "Pleasing balance",
    text: "The most comfortable line in the moment, and a sense of “something belongs around here.” Composition follows feel rather than measurement.",
  },
  {
    title: "Simple, and cute",
    text: "Faces stay uncluttered — too much detail reads wrong in this style. Proportion can be off; a long arm or a small head is fine if the drawing is good.",
  },
];

export const stats: { value: number; label: string; pad?: number }[] = [
  { value: 2013, label: "Posting online since" },
  { value: 12, label: "Plates on this page" },
  { value: 6, label: "Press & exhibitions" },
  { value: 0, label: "Pen pressure", pad: 1 },
];

export const chronology: { year: string; title: string; text: string; href?: string }[] = [
  {
    year: "2013",
    title: "Starts posting on pixiv",
    text: "Before that, drawing boards and hand-drawn blogs — drawing in public was already normal.",
  },
  {
    year: "2023.05",
    title: "Comitia 144 — 百分率",
    text: "Booth 東2 J31b, with an illustration compilation book and favourite Posca drawings.",
  },
  {
    year: "2023.09",
    title: "Photographer × Creator, vol.01",
    text: "Draws over a Toshiaki Kitaoka photograph for ENCOUNTER: navy line instead of black, no colour on the figure, a little grain.",
  },
  {
    year: "2024.10",
    title: "VISIONS 2025 & ILLUSTRATION 2025",
    text: "Selected for two illustration annuals — VISIONS 2025 gathers 170 illustrators, published by pixiv.",
  },
  {
    year: "2024.11",
    title: "Comitia 150 — く31a",
    text: "Back at Tokyo Big Site with the circle.",
  },
  {
    year: "2024.12",
    title: "First large-format piece",
    text: "“Making a big drawing for the first time. Nervous.”",
  },
  {
    year: "2025.10",
    title: "Interview — erumina",
    text: "“Feeling over accuracy”: on method, influences, and keeping room for the work you most want.",
    href: interview,
  },
  {
    year: "2026.01",
    title: "浮世東京 — graphical tokyo",
    text: "Group show, on site both days.",
  },
];

export const currently = [
  {
    title: "Typography",
    text: "Wants more information on the page — layout and lettering, after Yoshitoshi's woodblock compositions and Mucha.",
  },
  {
    title: "Music",
    text: "Loves live shows and festivals; quietly hopes to work with music.",
  },
  {
    title: "Drawing men",
    text: "Practising. Rule-free drawing tends to make gender ambiguous, so a new set of drawers is being built.",
  },
  {
    title: "Leaving room",
    text: "Company employee by day, illustrator alongside — keeping enough slack to say yes to the work that matters.",
  },
];

export const commissions = [
  {
    step: "01",
    title: "Skeb",
    text: "Anonymous requests, one shot, no back-and-forth. Delivered works appear on the public profile.",
    href: skeb,
    cta: "skeb.jp/@tatamipi",
  },
  {
    step: "02",
    title: "Business",
    text: "Book and cover illustration, music video artwork, packaging and event goods — handled through the agency.",
    href: agencyProfile,
    cta: "R11R creator page",
  },
  {
    step: "03",
    title: "Everything else",
    text: "Links, timelapses and process posts in one place.",
    href: linkHub,
    cta: "potofu.me/tatamipi",
  },
];

export const policy = [
  "Do not reupload",
  "Do not use for AI training",
  "No unauthorised edits",
];

export const appearances = [
  {
    year: "2026",
    title: "浮世東京 — group show",
    place: "graphical tokyo",
    href: "https://x.com/graphicaltokyo",
  },
  {
    year: "2025",
    title: "「正確さよりも、気持ち良さを大切にする」",
    place: "erumina",
    href: interview,
  },
  {
    year: "2024",
    title: "VISIONS 2025 Illustrators Book",
    place: "pixiv",
    href: visions,
  },
  {
    year: "2024",
    title: "ILLUSTRATION 2025",
    place: "Shoeisha",
    href: illustration,
  },
  {
    year: "2023",
    title: "写真家とクリエイターの交差点 vol.01",
    place: "ENCOUNTER Magazine",
    href: encounter,
  },
  {
    year: "—",
    title: "Represented illustrator",
    place: "R11R",
    href: agencyProfile,
  },
];

export const facts = [
  { k: "Born", v: "Osaka" },
  { k: "Based", v: "Tokyo" },
  { k: "Subject", v: "Girls, cats, everyday things" },
  { k: "Media", v: "Digital illustration, Posca drawings" },
  { k: "Client work", v: "Book covers, music videos, goods" },
  { k: "Influences", v: "Tezuka Osamu, Mineo Maya, Miho Satake, Yoshitoshi, Mucha" },
];

export const sections = [
  { id: "work", n: "01", label: "Work" },
  { id: "words", n: "02", label: "Words" },
  { id: "detail", n: "03", label: "Detail" },
  { id: "process", n: "04", label: "Process" },
  { id: "chronology", n: "05", label: "Chronology" },
  { id: "about", n: "06", label: "About" },
  { id: "commissions", n: "07", label: "Commissions" },
  { id: "press", n: "08", label: "Press" },
];
