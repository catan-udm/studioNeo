/**
 * Curated data for the Dino (@Dino_illus) tribute site.
 *
 * Every tweet below was checked against api.fxtwitter.com (author = Dino_illus,
 * media matches). Titles are the artist's own post text; where a post has no
 * text we say so instead of inventing a name. Visual descriptions were written
 * from looking at the images, and series are named only where the post text,
 * a hashtag, or the character name makes it unambiguous.
 */

export type Artwork = {
  id: string;
  title: string;
  subject: string;
  year: string;
  tag: string;
  caption: string;
  img: string;
  tweet: string;
  aspect: string;
};

export const heroImg =
  "/images/dino-hero.jpg";

export const artworks: Artwork[] = [
  {
    id: "31a",
    title: "31-A",
    subject: "Heaven Burns Red · official art",
    year: "2025",
    tag: "OFFICIAL",
    caption:
      "Made for the first anniversary of Heaven Burns Red EN: “So honored to have created this illustration of 31-A.” A wide banner held together by one warm key light.",
    img: "https://pbs.twimg.com/media/G53r4JzWMAAEtnS.jpg?name=large",
    tweet: "https://x.com/Dino_illus/status/1990006466565059055",
    aspect: "aspect-[16/10] md:aspect-[21/10]",
  },
  {
    id: "family",
    title: "family",
    subject: "Arcane · fan art",
    year: "2024",
    tag: "FAN ART",
    caption:
      "Two sisters holding each other in red-lit rain. Posted in November 2024, right after Arcane's final act aired, with the single word “family.”",
    img: "https://pbs.twimg.com/media/GcnluABWwAA6oUh.jpg?name=large",
    tweet: "https://x.com/Dino_illus/status/1858268920714793319",
    aspect: "aspect-[16/10] md:aspect-[19/10]",
  },
  {
    id: "untitled-2023",
    title: "untitled",
    subject: "posted without a caption",
    year: "2023",
    tag: "FAN ART",
    caption:
      "Posted with no words at all. A white-haired figure with ringed red eyes, face tipped up into the light while a cool shadow falls across the wall behind.",
    img: "https://pbs.twimg.com/media/FtdmbXBWcAQ7Om9.jpg?name=large",
    tweet: "https://x.com/Dino_illus/status/1645896856063586304",
    aspect: "aspect-[4/5]",
  },
  {
    id: "carlotta",
    title: "maid Carlotta",
    subject: "Wuthering Waves · fan art",
    year: "2025",
    tag: "FAN ART",
    caption:
      "Carlotta in a maid outfit, rendered in lace, fabric folds and soft light.",
    img: "https://pbs.twimg.com/media/GgWVpKwWkAAqazH.jpg?name=large",
    tweet: "https://x.com/Dino_illus/status/1875069587106259224",
    aspect: "aspect-[4/5]",
  },
  {
    id: "vertin",
    title: "vertin",
    subject: "Reverse: 1999 · fan art",
    year: "2024",
    tag: "FAN ART",
    caption:
      "Vertin in a low-contrast wash: shadow decided first, light let in second.",
    img: "https://pbs.twimg.com/media/GFWamSpX0AAR4eP.jpg?name=large",
    tweet: "https://x.com/Dino_illus/status/1753477622170796279",
    aspect: "aspect-[4/5]",
  },
];

export type LightStep = {
  n: string;
  label: string;
  handwritten: string;
  note: string;
  img: string;
};

/** Each step's `handwritten` text is transcribed from the note in the image itself. */
export const lightSteps: LightStep[] = [
  {
    n: "01",
    label: "Base color",
    handwritten: "BASE COLOR.",
    note: "Everything starts as flat color on a mid-grey ground. No shadow and no light yet, just hue and silhouette.",
    img: "https://pbs.twimg.com/media/FcOsavaX0AECVh1.jpg?name=large",
  },
  {
    n: "02",
    label: "Multiply · cold shadow",
    handwritten: "MULTIPLY WITH ● FOR COLD SHADOW [cold grey-ish]",
    note: "A multiply layer in a cold grey-blue drops the whole figure into shadow. Everything turns cool before any light exists.",
    img: "https://pbs.twimg.com/media/FcOscxmWIAI1oRZ.jpg?name=large",
  },
  {
    n: "03",
    label: "Color dodge · warm light",
    handwritten: "COLOR DOGE WITH ● FOR WARM LIGHT [warm tone]",
    note: "A color-dodge layer with a warm swatch cuts the light back out of the shadow in hard-edged shapes across the hair, face and hands.",
    img: "https://pbs.twimg.com/media/FcOsd1oWIAo7yvM.jpg?name=large",
  },
  {
    n: "04",
    label: "Overlay · reflected light",
    handwritten:
      "OVERLAY WITH ● FOR THE REFLECTED LIGHT FORM WARM LIGHT ON SKIN. [AIR BRSH]",
    note: "Finally, a soft airbrush on overlay adds the warm light bouncing back onto the skin.",
    img: "https://pbs.twimg.com/media/FcOse1GWAAAeDuo.jpg?name=large",
  },
];

export const lightStudyTweet =
  "https://x.com/Dino_illus/status/1568286902087983106";
export const lightStudyQuote =
  "ppl asking me how i usually do the light , so i wanna share some method im using for adding light";

export type Timelapse = {
  id: string;
  video: string;
  poster: string;
  tweet: string;
  date: string;
  seconds: number;
  likes: string;
};

export const timelapses: Timelapse[] = [
  {
    id: "tl-feb13",
    video:
      "https://video.twimg.com/ext_tw_video/1889945602449973248/pu/vid/avc1/720x1050/xx_B3RgYvoeozKZe.mp4?tag=12",
    poster:
      "https://pbs.twimg.com/ext_tw_video_thumb/1889945602449973248/pu/img/M6gpfTpDBfy1_a3J.jpg",
    tweet: "https://x.com/Dino_illus/status/1889945695454695593",
    date: "Feb 13, 2025",
    seconds: 90,
    likes: "24K",
  },
  {
    id: "tl-feb24",
    video:
      "https://video.twimg.com/ext_tw_video/1894079772021407744/pu/vid/avc1/720x996/9UeMah1vGDQ-xGqo.mp4?tag=12",
    poster:
      "https://pbs.twimg.com/ext_tw_video_thumb/1894079772021407744/pu/img/nLAFDnNQN14kHpU3.jpg",
    tweet: "https://x.com/Dino_illus/status/1894079847187567026",
    date: "Feb 24, 2025",
    seconds: 90,
    likes: "8.4K",
  },
];

export const tickerItems = [
  "cold shadow",
  "warm light",
  "Heaven Burns Red",
  "Arcane",
  "Wuthering Waves",
  "Reverse: 1999",
  "Frieren",
  "artbook XXXIX",
  "where light ends · 2026",
  "870K on X",
];

export const avatar =
  "https://pbs.twimg.com/profile_images/1705236188888457217/Sl6dGX4M_400x400.jpg";

export const stats = {
  followers: "870.8K",
  posts: "4,163",
  joined: "Jan 2022",
};

export const links = {
  x: "https://x.com/dino_illus",
  pixiv: "https://www.pixiv.net/users/66807813",
  weibo: "https://weibo.com/u/7788580743",
  email: "mailto:dinohu0019@gmail.com",
};
