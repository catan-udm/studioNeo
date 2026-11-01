import { art } from './generated/art';

export type WorkCategory = 'Illustration' | 'Animation';
export type WorkFilter = 'All work' | 'Illustrations' | 'Animations';

export interface Work {
  id: string;
  title: string;
  originalTitle: string;
  category: WorkCategory;
  year: string;
  description: string;
  image: string;
  source: string;
  accent: string;
  position?: string;
  videoId?: string;
  credit?: string;
}

const pixivIds: Record<string, string> = {
  'starry-bunnies': '123364099',
  'winter-miku': '87512047',
  'candy-girl': '112291013',
  'cookies-and-cream': '127714364',
  'sweet-daydream': '109370313',
  miku: '100035930',
  'cherry-bomb': '109370231',
  'cereal-girl': '97915831',
  'sisterly-daydreams': '96135611',
  'pocket-universe': '96135526',
  'pink-daydream': '96135500',
  'sailor-girl': '87511827',
};

const illustration = (id: string, title: string, originalTitle: string, year: string, description: string, accent: string, position = '50% 35%'): Work => ({
  id,
  title,
  originalTitle,
  category: 'Illustration',
  year,
  description,
  image: art[id as keyof typeof art],
  source: `https://www.pixiv.net/en/artworks/${pixivIds[id]}`,
  accent,
  position,
});

export const works: Work[] = [
  illustration('starry-bunnies', 'Starry bunnies', '⭐️🐰⭐️🐰', '2024', 'A cosmic daydream of flying rabbits, bright little stars, and a very brave traveler. An original character illustration from Dolman’s collection.', '#e9e9dc', '50% 30%'),
  illustration('winter-miku', 'A little winter magic', 'ミク', '2021', 'Hatsune Miku, a soft winter palette, and a world of delicate details. A character illustration by Dolman.', '#e7f0e9', '50% 30%'),
  illustration('candy-girl', 'Sweet like candy', '💅', '2023', 'Sugar-pink ribbons, a flash of red, and a pocketful of personality. An original character study from Dolman’s colorful world.', '#f3e5e5', '50% 28%'),
  {
    id: 'hello-sodadada',
    title: 'HELLO SODADADA',
    originalTitle: 'HELLO SODADADA',
    category: 'Animation',
    year: 'Music video',
    description: 'A lively world in motion. Dolman worked on the animation for the HELLO SODADADA music video. Watch the original on YouTube.',
    image: art['hello-sodadada'],
    source: 'https://www.youtube.com/watch?v=XF50Ok6350g',
    videoId: 'XF50Ok6350g',
    credit: 'Music video · animation by Dolman',
    accent: '#f0dc8a',
  },
  illustration('sweet-daydream', 'A sweet daydream', '🦷', '2023', 'A playful study in pastel pink, mint green, and tiny little surprises. Original character artwork by Dolman.', '#dce8df', '50% 27%'),
  {
    id: 'save',
    title: 'SAVE!',
    originalTitle: 'SAVE!',
    category: 'Animation',
    year: 'Music video',
    description: 'A daydream brought to life for Miiro’s “SAVE!” Dolman contributed animation, illustration, and storyboarding to the music video.',
    image: art.save,
    source: 'https://www.youtube.com/watch?v=ARR7e35AZOY',
    videoId: 'ARR7e35AZOY',
    credit: 'Miiro · animation / illustration / storyboard',
    accent: '#dceaf6',
  },
  illustration('cookies-and-cream', 'Cookies & cream', '🍪🥛', '2025', 'Cookie-inspired character designs in two flavors. Original character design and illustration, with a little sweetness in every detail.', '#eee3d9', '45% 40%'),
  illustration('miku', 'Miku, in full color', 'ミク', '2022', 'An expressive take on Hatsune Miku: bright mint hair, bold outlines, and a whole universe of energy.', '#dbe9e5', '50% 32%'),
  illustration('cherry-bomb', 'Cherry on top', '💀', '2023', 'A candy-colored character illustration with a playful twist. Original character artwork by Dolman.', '#f3e1e3', '50% 30%'),
  illustration('cereal-girl', 'Cereal world', 'シリアル 少女', '2022', 'A breakfast-time daydream in strawberry pink. A character illustration filled with tiny details and big personality.', '#f3dfe0', '50% 30%'),
  illustration('sisterly-daydreams', 'A little sisterly magic', '久川姉妹', '2022', 'The Hisakawa sisters from The Idolmaster, reimagined in Dolman’s playful pastel style.', '#eee0d5', '50% 35%'),
  {
    id: 'poppin-party',
    title: 'Skip, Slump, Slipper!',
    originalTitle: 'スキップ・スランプ・スリッパ',
    category: 'Animation',
    year: 'Music video',
    description: 'Poppin’Party, in a bright and playful new world. Dolman contributed illustration and animation to this BanG Dream! music video.',
    image: art['poppin-party'],
    source: 'https://www.youtube.com/watch?v=Ta-jJC4GbR0',
    videoId: 'Ta-jJC4GbR0',
    credit: 'Poppin’Party / BanG Dream! · illustration & animation',
    accent: '#eab2b5',
  },
  illustration('pocket-universe', 'Pocket universe', '3', '2022', 'A little character, a lot of imagination. A warm and wonderfully whimsical original illustration.', '#f1e6d8', '50% 40%'),
  illustration('pink-daydream', 'In a pink daydream', '2', '2022', 'A soft, rosy character study. A little moment of wonder, drawn in Dolman’s signature expressive style.', '#f0e1d9', '50% 30%'),
  illustration('sailor-girl', 'Hello, little world', '1', '2021', 'A sailor-collared character and a curious gaze. An original illustration from the early days of Dolman’s collection.', '#e2e9ea', '50% 30%'),
];

export const socials = [
  { name: 'X / Twitter', short: 'X', href: 'https://x.com/dolman4878' },
  { name: 'Pixiv', short: 'pixiv', href: 'https://www.pixiv.net/en/users/5956449' },
  { name: 'Instagram', short: 'Instagram', href: 'https://www.instagram.com/dolman_00/' },
  { name: 'YouTube', short: 'YouTube', href: 'https://www.youtube.com/@dolman4878' },
];

export const artistEmail = 'dolman4878@naver.com';
export const heroWork = works[0];
export const featuredAnimation = works.find((work) => work.id === 'hello-sodadada')!;
export const artistAvatar = art.avatar;
export const animationPoster = art['hello-sodadada'];
