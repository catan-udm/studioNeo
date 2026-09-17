export interface ProjectMediaItem {
  id: string;
  src: string;
  title: string;
  caption: string;
  color: string;
  aspectRatio?: 'wide' | 'tall' | 'square';
}

export interface ProjectRow {
  id: string;
  index: string;
  title: string;
  japaneseTitle?: string;
  year: string;
  category: 'Animation' | 'Artwork' | 'Interactive';
  role: string;
  client?: string;
  description: string;
  tags: string[];
  media: ProjectMediaItem[];
}

export const projectsData: ProjectRow[] = [
  {
    id: 'vampire-kinetic-cell',
    index: '01',
    title: 'DECO*27 / SANKOBITE',
    japaneseTitle: 'DECO*27 / サンコバイト',
    year: '2025',
    category: 'Animation',
    role: 'Animator and Character Design',
    client: 'DECO*27',
    description:
      'Character Chibi Animations for DECO*27 Songs',
    tags: ['Chibi', 'Animation', 'Looped Sticker'],
    media: [
      {
        id: 'vamp-01',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/ヴァンパイア.gif'),
        title: 'Vampire',
        caption: 'Central keyframe sequence featuring dynamic perspective distortion and floating blood drops.',
        color: '#8d1409',
        aspectRatio: 'square',
      },
      {
        id: 'vamp-02',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/アニマル.gif'),
        title: 'Animal',
        caption: 'High-contrast fuchsia accent cut capturing raw silhouette movement.',
        color: '#ff3380',
        aspectRatio: 'square',
      },
      {
        id: 'vamp-03',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/サラマンダー.gif'),
        title: 'Salamander',
        caption: 'Ember-lit character profile with procedural particle displacement.',
        color: '#ac332b',
        aspectRatio: 'square',
      },
      {
        id: 'vamp-04',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/パラサイト.gif'),
        title: 'Parasite',
        caption: 'Chromatic aberration overlay and ultraviolet cel colorway.',
        color: '#d99af0',
        aspectRatio: 'square',
      },
      {
        id: 'vamp-05',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/ラビットホール.gif'),
        title: 'Rabbit Hole',
        caption: 'Electric magenta transition frame demonstrating fast frame-skipping techniques.',
        color: '#f2479d',
        aspectRatio: 'square',
      },
      {
        id: 'ghost-01',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/ゴーストルール.gif'),
        title: 'Ghost Rule Master Key',
        caption: 'Negative-space charcoal character bust with disintegrating pixel aura.',
        color: '#737373',
        aspectRatio: 'square',
      },
      {
        id: 'ghost-02',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/ヒバナ.gif'),
        title: 'Hibana Slate Contrast',
        caption: 'Deep slate blue frame capturing emotional peak expression.',
        color: '#344553',
        aspectRatio: 'square',
      },
      {
        id: 'ghost-03',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/乙女解剖.gif'),
        title: 'Otome Dissection Anatomy',
        caption: 'Desaturated sage green pass focusing on subtle micro-gestures and clean lines.',
        color: '#7e7f77',
        aspectRatio: 'square',
      },
      {
        id: 'volt-03',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/ゾンビ.gif'),
        title: 'Zombie Lime Variant',
        caption: 'Radioactive green accent frame with playful character distortion.',
        color: '#bffc3f',
        aspectRatio: 'square',
      },
      {
        id: 'volt-04',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/シンデレラ.gif'),
        title: 'Cinderella Ochre Finale',
        caption: 'Warm pumpkin-orange composition completing the color wheel progression.',
        color: '#e2750d',
        aspectRatio: 'square',
      },
    ],
  },
  {
    id: 'devil-mon-trilogy',
    index: '02',
    title: 'NOT A DEVIL',
    japaneseTitle: 'デビルじゃないもん',
    year: '2025',
    category: 'Animation',
    role: 'Character Design / Animator',
    client: 'DECO*27 & PinocchioP',
    description:
      'A tripartite animated dance study combining pastel dual-identity character choreography with synchronized rhythmic frame oscillation.',
    tags: ['Chibi', 'Animation', 'Looped Sticker'],
    media: [
      {
        id: 'dev-01',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/1デビルじゃないもん.gif'),
        title: 'Act I: Lavender Awakening',
        caption: 'Introduction dance cut with soft lavender palette and fluid shoulder rolls.',
        color: '#c496ff',
        aspectRatio: 'square',
      },
      {
        id: 'dev-02',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/2デビルじゃないもん.gif'),
        title: 'Act II: Golden Equilibrium',
        caption: 'Symmetric dual-arm choreography over high-key yellow backdrop.',
        color: '#f4cc7f',
        aspectRatio: 'square',
      },
      {
        id: 'dev-03',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/3デビルじゃないもん.gif'),
        title: 'Act III: Coral Climax',
        caption: 'Final synchronized leap sequence highlighting kinetic hair ribbon secondary physics.',
        color: '#ff9d96',
        aspectRatio: 'square',
      },
    ],
  },
  {
    id: 'ghost-rule-synthetic',
    index: '03',
    title: 'HERO',
    japaneseTitle: 'HERO',
    year: '2023',
    category: 'Artwork',
    role: 'Art Direction / Generative Texture / Compositing',
    client: 'Experimental Gallery Exhibition',
    description:
      'A raw monochrome visual essay stripping character identity down to charcoal gradients, halftone raster screens, and harsh glitch artifacts.',
    tags: ['Animation', 'Character Design', 'Dynamic', 'Chibi'],
    media: [
      {
        id: 'volt-01',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/HERO.gif'),
        title: 'HERO Cyan Odyssey',
        caption: 'Vibrant sky-blue centerpiece showcasing character flight trajectory.',
        color: '#A9DEF9',
        aspectRatio: 'wide',
      },
    ],
  },
  {
    id: 'project-volt-hero',
    index: '04',
    title: 'PROJECT VOLTAGE',
    japaneseTitle: 'プロジェクト・ヴォルト',
    year: '2024',
    category: 'Artwork',
    role: 'Animator / Character Designer',
    client: 'The Pokémon Company, Crypton Future Media',
    description:
      'An interactive digital installation celebrating WebAuthn passkey identity and tactile kinetic art widgets deployed on Azure Blob Storage.',
    tags: ['Character Design'],
    media: [
      {
        id: 'volt-02',
        src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/2nan.gif'),
        title: 'Volt Lemon Micro-Engine',
        caption: 'Soft pastel yellow interactive avatar widget responding to accelerometer input.',
        color: '#FCF6BD',
        aspectRatio: 'square',
      },
    ],
  },
];
