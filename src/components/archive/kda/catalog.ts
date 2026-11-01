const firestarterCover = "/images/kda/cover.jpg";
const firestarterSingle = "/images/kda/single.jpg";
const allOutCover = "/images/kda/allout.jpg";
const popStarsCover = "/images/kda/popstars.jpg";
const baddestCover = "/images/kda/baddest.jpg";
const moreCover = "/images/kda/more.jpg";

export type ReleaseId = "firestarter" | "allout" | "popstars";

export type Track = {
  id: string;
  title: string;
  artists: string;
  duration: string;
  release: ReleaseId;
  previewUrl: string;
  appleUrl: string;
};

export type Release = {
  id: ReleaseId;
  title: string;
  type: string;
  year: string;
  date: string;
  cover: string;
  description: string;
  appleUrl: string;
  listenUrl: string;
  tracks: Track[];
};

// Preview and release metadata come from the public Apple Music catalog.
const firestarterTracks: Track[] = [
  {
    id: "firestarter",
    title: "FIRESTARTER",
    artists: "MIYEON, SOYEON, Sophie Powers, Mimi Webb",
    duration: "3:07",
    release: "firestarter",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ac/b4/68/acb468f1-7d9d-5453-2702-c2e813f38b89/mzaf_8359989160445767411.plus.aac.p.m4a",
    appleUrl: "https://music.apple.com/us/album/firestarter-feat-sophie-powers-miyeon-soyeon/6814691428?i=6814691429",
  },
  {
    id: "watch-me",
    title: "WATCH ME",
    artists: "Sophie Powers, Mimi Webb",
    duration: "3:02",
    release: "firestarter",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ec/a2/2d/eca22d5c-1324-216f-26b1-0584cd96fa3b/mzaf_15823307502760687603.plus.aac.p.m4a",
    appleUrl: "https://music.apple.com/us/album/watch-me/6814691428?i=6814691433",
  },
  {
    id: "never-going-back",
    title: "NEVER GOING BACK",
    artists: "SOYEON, MIYEON",
    duration: "3:10",
    release: "firestarter",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6f/27/75/6f2775ba-8118-79df-85f0-855d3c6a5ab9/mzaf_14254803605995398998.plus.aac.p.m4a",
    appleUrl: "https://music.apple.com/us/album/never-going-back-feat-soyeon-miyeon/6814691428?i=6814691435",
  },
  {
    id: "girls",
    title: "GIRLS",
    artists: "DJ Sona, Sophie Powers, Sorana, Royal & the Serpent",
    duration: "2:05",
    release: "firestarter",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/59/7e/13/597e1396-2728-2498-281d-89af45e6ede6/mzaf_7921251097167026256.plus.aac.p.m4a",
    appleUrl: "https://music.apple.com/us/album/girls-feat-sorana-royal-the-serpent/6814691428?i=6814691440",
  },
];

const allOutTracks: Track[] = [
  {
    id: "the-baddest",
    title: "THE BADDEST",
    artists: "(G)I-DLE, Bea Miller, Wolftyla",
    duration: "2:43",
    release: "allout",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6e/6a/07/6e6a07e4-bccb-533c-ed4e-4a01e81ac79b/mzaf_12278690126074226016.plus.aac.p.m4a",
    appleUrl: "https://music.apple.com/us/album/the-baddest-feat-bea-miller-league-of-legends-music/1832012000?i=1832012006",
  },
  {
    id: "more",
    title: "MORE",
    artists: "Madison Beer, (G)I-DLE, Lexie Liu, Jaira Burns, Seraphine",
    duration: "3:37",
    release: "allout",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/cb/d1/27/cbd127bc-1665-1095-9aa9-13322bd1da20/mzaf_12465534455231308006.plus.aac.p.m4a",
    appleUrl: "https://music.apple.com/us/album/more-feat-%E5%88%98%E6%9F%8F%E8%BE%9Blexie-jaira-burns-seraphine-league-of/1832012000?i=1832012012",
  },
  {
    id: "villain",
    title: "VILLAIN",
    artists: "Madison Beer, Kim Petras",
    duration: "3:19",
    release: "allout",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0a/ed/94/0aed9496-8905-9bbd-543a-b964327fd0f4/mzaf_13980202443288533483.plus.aac.p.m4a",
    appleUrl: "https://music.apple.com/us/album/villain-feat-kim-petras-league-of-legends-music/1832012000?i=1832012017",
  },
  {
    id: "drum-go-dum",
    title: "DRUM GO DUM",
    artists: "Aluna, Wolftyla, Bekuh BOOM",
    duration: "3:21",
    release: "allout",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a4/2c/84/a42c8416-5263-fd48-7db6-841b9caa8773/mzaf_14711802372851084172.plus.aac.p.m4a",
    appleUrl: "https://music.apple.com/us/album/drum-go-dum-feat-aluna-league-of-legends-music/1832012000?i=1832012018",
  },
  {
    id: "ill-show-you",
    title: "I'LL SHOW YOU",
    artists: "TWICE, Bekuh BOOM, Annika Wells",
    duration: "3:19",
    release: "allout",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/37/2f/86/372f86dd-f994-d648-3337-a7ed3640561c/mzaf_7980540188537432591.plus.aac.p.m4a",
    appleUrl: "https://music.apple.com/us/album/ill-show-you-feat-annika-wells-league-of-legends-music/1832012000?i=1832012386",
  },
];

const popStarsTracks: Track[] = [
  {
    id: "popstars",
    title: "POP/STARS",
    artists: "Madison Beer, (G)I-DLE, Jaira Burns",
    duration: "3:11",
    release: "popstars",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/be/6d/da/be6dda93-0fc9-9545-38a7-04bfd3a4c67d/mzaf_12674869634233540340.plus.aac.p.m4a",
    appleUrl: "https://music.apple.com/us/album/pop-stars-feat-jaira-burns-league-of-legends-music/1831861471?i=1831861474",
  },
];

export const releases: Release[] = [
  {
    id: "firestarter",
    title: "FIRESTARTER",
    type: "EP",
    year: "2026",
    date: "OCTOBER 21, 2026",
    cover: firestarterCover,
    description: "A new chapter for K/DA. Four tracks, four voices, and a little help from DJ Sona.",
    appleUrl: "https://music.apple.com/us/album/firestarter-ep/6814691428",
    listenUrl: "https://kda.ffm.to/firestarter-ep",
    tracks: firestarterTracks,
  },
  {
    id: "allout",
    title: "ALL OUT",
    type: "EP",
    year: "2020",
    date: "NOVEMBER 6, 2020",
    cover: allOutCover,
    description: "Five tracks from the era that brought us THE BADDEST, MORE, and a whole new side of K/DA.",
    appleUrl: "https://music.apple.com/us/album/all-out-ep/1832012000",
    listenUrl: "https://ffm.to/kda-allout",
    tracks: allOutTracks,
  },
  {
    id: "popstars",
    title: "POP/STARS",
    type: "DEBUT SINGLE",
    year: "2018",
    date: "NOVEMBER 2018",
    cover: popStarsCover,
    description: "The debut single that introduced K/DA to the world at the 2018 World Championship.",
    appleUrl: "https://music.apple.com/us/album/pop-stars-feat-jaira-burns-league-of-legends-music-single/1831861471",
    listenUrl: "https://www.youtube.com/watch?v=UOxkGD8qRB4",
    tracks: popStarsTracks,
  },
];

export const singles = [
  {
    title: "FIRESTARTER",
    year: "2026",
    cover: firestarterSingle,
    track: firestarterTracks[0],
    url: "https://music.apple.com/us/album/firestarter-feat-sophie-powers-miyeon-soyeon-single/6813196868",
  },
  {
    title: "MORE",
    year: "2020",
    cover: moreCover,
    track: allOutTracks[1],
    url: "https://music.apple.com/us/album/more-feat-%E5%88%98%E6%9F%8F%E8%BE%9Blexie-jaira-burns-seraphine-league-of/1832564132",
  },
  {
    title: "THE BADDEST",
    year: "2020",
    cover: baddestCover,
    track: allOutTracks[0],
    url: "https://music.apple.com/us/album/the-baddest-feat-bea-miller-league-of-legends-music-single/1831861761",
  },
  {
    title: "POP/STARS",
    year: "2018",
    cover: popStarsCover,
    track: popStarsTracks[0],
    url: "https://music.apple.com/us/album/pop-stars-feat-jaira-burns-league-of-legends-music-single/1831861471",
  },
];

export const videos = [
  { id: "Mmw-PpWhKFg", title: "FIRESTARTER", type: "OFFICIAL MUSIC VIDEO", year: "2026" },
  { id: "R-JywodifoE", title: "WATCH ME", type: "OFFICIAL LYRIC VIDEO", year: "2026" },
  { id: "WZpcuRYP26E", title: "NEVER GOING BACK", type: "OFFICIAL VISUALIZER", year: "2026" },
  { id: "Ko9VF6dDnAk", title: "FIRESTARTER CHOREOGRAPHY", type: "OFFICIAL CHOREOGRAPHY VIDEO", year: "2026" },
  { id: "3VTkBuxU4yk", title: "MORE", type: "OFFICIAL MUSIC VIDEO", year: "2020" },
  { id: "UOxkGD8qRB4", title: "POP/STARS", type: "OFFICIAL MUSIC VIDEO", year: "2018" },
];

export const members = [
  { name: "AHRI", role: "VOCALIST", vocalist: "MIYEON", imagePosition: "60% 23%" },
  { name: "AKALI", role: "RAPPER", vocalist: "SOYEON", imagePosition: "88% 25%" },
  { name: "EVELYNN", role: "VOCALIST", vocalist: "SOPHIE POWERS", imagePosition: "39% 25%" },
  { name: "KAI'SA", role: "VOCALIST & DANCER", vocalist: "MIMI WEBB", imagePosition: "13% 27%" },
];

export const quotes = [
  {
    text: "With the FIRESTARTER EP, we wanted to respect what made people fall in love with K/DA while giving Ahri, Akali, Evelynn, and Kai'Sa the space to evolve as artists after all this time.",
    name: "MARIA EGAN",
    role: "GLOBAL HEAD OF MUSIC & EVENTS, RIOT GAMES",
    source: "https://www.invenglobal.com/articles/27526/kda-returns-with-firestarter-ep-ahead-of-worlds-2026-opening-ceremony-show",
  },
  {
    text: "Bringing K/DA back was a joy for the whole artistic team. We wanted their return to feel more mature and fashion-forward — idols setting the runway on fire.",
    name: "MARIETTA REN",
    role: "DIRECTOR, FORTICHE PRODUCTION",
    source: "https://danamic.org/2026/10/19/k-da-returns-after-six-years-firestarter-single-and-music-video-out-now/",
  },
];

export const milestone = {
  event: "WORLDS 2026 FINALS · OPENING CEREMONY",
  when: "NOVEMBER 14, 2026",
  where: "BARCLAYS CENTER · NEW YORK",
  note: "K/DA take the stage with True Damage at the Worlds 2026 Finals Opening Ceremony Presented by Mastercard.",
  target: Date.UTC(2026, 10, 14, 22, 0, 0),
  url: "https://lolesports.com/",
};

export const preorder = {
  title: "CD, VINYL & BOX SET",
  note: "The FIRESTARTER EP lands on physical formats. Limited-edition CD variants and BLADES red vinyl are up for pre-order in the official Riot Games collection.",
  url: "https://merch.riotgames.com/en-us/collection/kda-firestarter",
  label: "PRE-ORDER THE EP",
};
