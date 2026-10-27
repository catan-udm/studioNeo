import neverEnder from "./assets/rella/never-ender";
import dearCreators from "./assets/rella/dear-creators";
import createMe from "./assets/rella/create-me";
import polaris from "./assets/rella/polaris";
import seventeenth from "./assets/rella/seventeenth";
import frostflower from "./assets/rella/frostflower";
import sakura from "./assets/rella/sakura";
import gramophoneLuka from "./assets/rella/gramophone-luka";
import symphony2024 from "./assets/rella/symphony-2024";
import symphony2025 from "./assets/rella/symphony-2025";

export type RellaCategory = "miku" | "symphony";

export interface RellaArtwork {
  id: string;
  title: string;
  year: string;
  label: string;
  image: string;
  alt: string;
  description: string;
  categories: RellaCategory[];
  position?: string;
}

export const rellaHero = {
  image: neverEnder,
  title: "never ender",
  id: "70858371",
};

export const rellaArtworks: RellaArtwork[] = [
  {
    id: "105245901",
    title: "-Dear Creators-",
    year: "2023",
    label: "Hatsune Miku, 16th birthday",
    image: dearCreators,
    alt: "Hatsune Miku in a starry sky with a ribbon of teal hair and floating white pages",
    description: "Rella's key visual and costume design for Hatsune Miku's 16th birthday project, a celebration of the creators who continue to shape her world.",
    categories: ["miku"],
    position: "50% 38%",
  },
  {
    id: "121955436",
    title: "Create me, with me",
    year: "2024",
    label: "Illustration",
    image: createMe,
    alt: "Hatsune Miku reaching out among clouds, light, and floating creative tools",
    description: "A luminous tribute to the creators who have met Miku, and to all the new versions of her they have yet to imagine.",
    categories: ["miku"],
    position: "50% 36%",
  },
  {
    id: "100881091",
    title: "Polaris",
    year: "2022",
    label: "Hatsune Miku, 15th anniversary",
    image: polaris,
    alt: "Hatsune Miku beneath a crescent moon and a deep blue, star-filled sky",
    description: "A star-themed illustration and figure design for Miku's 15th anniversary. Rella chose Polaris with the hope that Miku would keep lighting the way.",
    categories: ["miku"],
    position: "50% 37%",
  },
  {
    id: "122018635",
    title: "17th",
    year: "2024",
    label: "Birthday illustration",
    image: seventeenth,
    alt: "Hatsune Miku standing beside a translucent tower in a pale, sunlit scene",
    description: "A quiet, architectural portrait shared for Hatsune Miku's 17th birthday.",
    categories: ["miku"],
    position: "50% 40%",
  },
  {
    id: "124366833",
    title: "Frostflower",
    year: "2024",
    label: "Hatsune Miku Symphony 2025",
    image: frostflower,
    alt: "An icy, translucent Hatsune Miku dancing under a dark winter sky",
    description: "The key visual for the Sapporo performance of Hatsune Miku Symphony 2025, imagining Gramophone Miku in a world of snow, ice, and winter sounds.",
    categories: ["miku", "symphony"],
    position: "50% 42%",
  },
  {
    id: "81976038",
    title: "Sakura",
    year: "2020",
    label: "Illustration",
    image: sakura,
    alt: "Sakura Miku floating among branches and soft pink cherry blossoms",
    description: "Sakura Miku is surrounded by a cascade of cherry blossoms in this soft, springtime illustration.",
    categories: ["miku"],
    position: "50% 40%",
  },
  {
    id: "116741033",
    title: "The Birth of Gramophone Luka",
    year: "2024",
    label: "Hatsune Miku Symphony 2024",
    image: gramophoneLuka,
    alt: "Megurine Luka and the Piapro characters in an ornate pink, shell-like scene",
    description: "Rella's key visual for the Symphony 2024 Suntory Hall performance introduces Gramophone Luka for Megurine Luka's 15th anniversary.",
    categories: ["symphony"],
  },
  {
    id: "121525173",
    title: "Hatsune Miku Symphony 2024",
    year: "2024",
    label: "Symphony key visual",
    image: symphony2024,
    alt: "The Piapro characters in elegant light-colored costumes among flowers and columns",
    description: "Rella designed the Symphony 2024 key visual and costumes, drawing on My Fair Lady for Megurine Luka's anniversary year.",
    categories: ["miku", "symphony"],
  },
  {
    id: "132477259",
    title: "Hatsune Miku Symphony 2025",
    year: "2025",
    label: "Symphony key visual",
    image: symphony2025,
    alt: "The Piapro characters gathered inside an ornate, sunlit concert hall",
    description: "Created for Symphony 2025's Yokohama and Kobe performances, with costumes inspired by the pipes of a grand organ.",
    categories: ["miku", "symphony"],
  },
];

export const rellaLinks = {
  pixiv: "https://www.pixiv.net/en/users/163536",
  x: "https://x.com/Rellakinoko",
  booth: "https://rella.booth.pm/",
  exhibition: "https://exhibition.rella.work/",
  interview: "https://www.pixivision.net/en/a/1969",
};

export const rellaOriginal = (id: string) => `https://www.pixiv.net/en/artworks/${id}`;