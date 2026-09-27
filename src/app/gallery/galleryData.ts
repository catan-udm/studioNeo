export interface GalleryWork {
  id: string;
  code: string;
  title: string;
  artist: string;
  artistHandle: string;
  artistAvatar: string;
  color: string;
  gifSrc?: string;
  likes: number;
  edition: string;
  price: string;
  category: 'Generative' | 'Kinetic' | 'Vectors' | 'Mono';
  isVault?: boolean;
  unlocked?: boolean;
  format?: '4K' | 'SVG' | 'RAW' | 'VECTORS';
  description: string;
}

export interface ResidentArtist {
  id: string;
  name: string;
  handle: string;
  location: string;
  role: string;
  bio: string;
  collection: string;
  archivedWorksCount: number;
  publicWorksCount: number;
  editionsCount: number;
}

export const RESIDENT_ARTISTS: ResidentArtist[] = [
  {
    id: 'artist-1',
    name: 'Artist 1',
    handle: 'neo_tokyo',
    location: 'Tokyo, JP',
    role: 'Resident Artist',
    bio: 'Algorithmic vector studies and kinetic geometry experiments focusing on parametric forms and kinetic cels.',
    collection: 'Matrix Shift',
    archivedWorksCount: 32,
    publicWorksCount: 8,
    editionsCount: 148,
  },
  {
    id: 'artist-2',
    name: 'Kroma Atelier',
    handle: 'kroma_lab',
    location: 'Kyoto, JP',
    role: 'Guest Resident',
    bio: 'Chromatic dispersion, procedural halftone rasterization, and generative SVG field studies.',
    collection: 'Prism Continuum',
    archivedWorksCount: 28,
    publicWorksCount: 6,
    editionsCount: 112,
  },
  {
    id: 'artist-3',
    name: 'Sanko Kinetic',
    handle: 'sanko_arch',
    location: 'Berlin / Tokyo',
    role: 'Senior Curation',
    bio: 'Minimalist vector rigs, responsive physics oscillations, and zero-latency kinetic web artifice.',
    collection: 'Zero Vector',
    archivedWorksCount: 36,
    publicWorksCount: 10,
    editionsCount: 164,
  },
  {
    id: 'artist-4',
    name: 'Deco Studio',
    handle: 'deco_cels',
    location: 'Shibuya, Tokyo',
    role: 'Animation Fellow',
    bio: 'Chibi motion cels, Lo-Fi frame-skipping choreography, and synchronized rhythm stickers.',
    collection: 'Deco Pulse',
    archivedWorksCount: 18,
    publicWorksCount: 4,
    editionsCount: 96,
  },
  {
    id: 'artist-5',
    name: 'Torus Mono',
    handle: 'torus_mono',
    location: 'Osaka, JP',
    role: 'Experimental Unit',
    bio: 'Monochrome topographical topology, dark-field generative arrays, and uncompressed SVG stems.',
    collection: 'Slate Horizon',
    archivedWorksCount: 14,
    publicWorksCount: 4,
    editionsCount: 64,
  },
];

// Flat vibrant solid color palette inspired by bikko.studio core tokens
const VIBRANT_PALETTE = [
  '#c496ff', // Lavender
  '#f4cc7f', // Warm Gold
  '#ff9d96', // Coral
  '#ff3380', // Hot Pink
  '#737373', // Slate
  '#ac332b', // Crimson
  '#e2750d', // Amber Orange
  '#bffc3f', // Acid Lime
  '#d99af0', // Orchid
  '#344553', // Deep Navy
  '#f2479d', // Electric Rose
  '#8d1409', // Dark Ruby
  '#7e7f77', // Moss Gray
  '#FCF6BD', // Pastel Lemon
  '#A9DEF9', // Sky Cyan
  '#38bdf8', // Vivid Cerulean
  '#f43f5e', // Cardinal Red
  '#10b981', // Jade Green
  '#8b5cf6', // Deep Purple
  '#f59e0b', // Solar Amber
  '#06b6d4', // Pure Cyan
  '#ec4899', // Raspberry
  '#6366f1', // Ultra Indigo
  '#84cc16', // Chartreuse
];

// Curated first 48 works matching the exact PDF screenshots
const BASE_WORKS: Partial<GalleryWork>[] = [
  { code: 'NEO-01', title: 'Neo-Tension VI', likes: 142, edition: 'Ed. 1/12', price: '$180', category: 'Generative', color: '#c496ff', format: 'RAW', description: 'Spatial balance study focusing on orthogonal kinetic tension.' },
  { code: 'GHOST-02', title: 'Scalar Mesh B', likes: 89, edition: 'Ed. 3/10', price: '$210', category: 'Generative', color: '#f4cc7f', format: 'SVG', description: 'Algorithmic distortion pass across secondary vertex lines.' },
  { code: 'VOLT-03', title: 'Chronos Loop 02', likes: 204, edition: 'Ed. 5/8', price: '$180', category: 'Kinetic', color: '#ff9d96', format: '4K', description: 'Generative temporal sequence with non-linear spring physics.' },
  { code: 'AXIS-04', title: 'Monolith Slate 09', likes: 318, edition: 'Ed. 2/5', price: '$240', category: 'Vectors', color: '#ff3380', format: 'VECTORS', description: 'Minimalist geometry in high-contrast fuchsia plane.' },
  { code: 'VOID-05', title: 'Orbital Drift C', likes: 175, edition: 'Ed. 6/20', price: '$220', category: 'Mono', color: '#737373', format: 'RAW', description: 'Spherical mapping through sparse dark-field vectors.' },
  { code: 'MESH-06', title: 'Topographic IV', likes: 95, edition: 'Ed. 8/15', price: '$160', category: 'Vectors', color: '#ac332b', format: 'SVG', description: 'Topographic elevation slices rendered with mathematical clarity.' },
  { code: 'GRID-07', title: 'Quantum Phase 1', likes: 240, edition: 'Ed. 4/12', price: '$160', category: 'Generative', color: '#e2750d', format: '4K', description: 'Discrete probability grid with fluctuating chroma markers.' },
  { code: 'NULL-08', title: 'Stasis Monad', likes: 112, edition: 'Ed. 7/10', price: '$195', category: 'Kinetic', color: '#bffc3f', format: 'VECTORS', description: 'Zero-velocity node suspension in high-frequency field.' },
  { code: 'ORBIT-09', title: 'Vortex Ribbon', likes: 356, edition: 'Ed. 1/8', price: '$195', category: 'Kinetic', color: '#d99af0', format: '4K', description: 'Continuous single-spline orbital rotation across 3 axes.' },
  { code: 'SINE-10', title: 'Harmonic Pulse', likes: 228, edition: 'Ed. 2/15', price: '$230', category: 'Generative', color: '#344553', format: 'SVG', description: 'Multi-frequency sinusoidal interference visualization.' },
  { code: 'PRISM-11', title: 'Refraction C', likes: 164, edition: 'Ed. 9/25', price: '$210', category: 'Generative', color: '#f2479d', format: 'RAW', description: 'Simulated quartz dispersion with pure pigment channels.' },
  { code: 'RADAR-12', title: 'Sweep Trace A', likes: 412, edition: 'Ed. 2/4', price: '$310', category: 'Vectors', color: '#8d1409', format: 'VECTORS', description: 'Radial phosphor decay study with persistent scanlines.' },
  { code: 'RHOMB-13', title: 'Iso Mesh 3', likes: 198, edition: 'Ed. 5/10', price: '$205', category: 'Mono', color: '#7e7f77', format: 'RAW', description: 'Isometric diamond tessellation with subtle line weight taper.' },
  { code: 'BLOCK-14', title: 'Cellular Void', likes: 155, edition: 'Ed. 3/12', price: '$175', category: 'Generative', color: '#FCF6BD', format: 'SVG', description: 'Voronoi cellular subdivision with perimeter clipping.' },
  { code: 'DELTA-15', title: 'Kinetic Triad', likes: 270, edition: 'Ed. 1/6', price: '$260', category: 'Kinetic', color: '#A9DEF9', format: '4K', description: 'Triple oscillator interaction on equilateral planar mesh.' },
  { code: 'STASIS-16', title: 'Equilibrium 4', likes: 184, edition: 'Ed. 4/16', price: '$150', category: 'Vectors', color: '#38bdf8', format: 'VECTORS', description: 'Equilibrium vectors calculated through spring damping.' },
  { code: 'PULSE-25', title: 'Pulse Matrix', likes: 120, edition: 'Ed. 2', price: '$195', category: 'Generative', color: '#f43f5e', format: 'RAW', description: 'Parametric heartbeat generator with fluid decay.' },
  { code: 'PULSE-26', title: 'Hyper Pulse 4K', likes: 190, edition: '4K', price: '$280', category: 'Generative', color: '#10b981', format: '4K', description: 'Ultra-high density vector trace at native 4K coordinate grid.' },
  { code: 'VALENCE-27', title: 'Valence Bond', likes: 145, edition: 'RAW', price: '$160', category: 'Kinetic', color: '#8b5cf6', format: 'RAW', description: 'Atomic electron probability kinetic motion model.' },
  { code: 'SURGE-28', title: 'Surge Vector', likes: 210, edition: 'SVG', price: '$220', category: 'Kinetic', color: '#f59e0b', format: 'SVG', description: 'Instantaneous velocity spikes with bezier ease-out curves.' },
  { code: 'VALENCE-29', title: 'Valence Field', likes: 310, edition: 'Ed. 20', price: '$320', category: 'Vectors', color: '#06b6d4', format: 'VECTORS', description: 'Multi-body attractive force field with vector arrows.' },
  { code: 'QUANT-30', title: 'Quantized Mono', likes: 165, edition: 'SVG', price: '$280', category: 'Mono', color: '#ec4899', format: 'SVG', description: 'Discrete step quantization applied to continuous curvature.' },
  { code: 'TRACE-31', title: 'Ray Tracer 01', likes: 230, edition: 'Ed. 20', price: '$280', category: 'Vectors', color: '#6366f1', format: 'VECTORS', description: 'Pure computational ray trajectories mapped to 2D vector strokes.' },
  { code: 'KNOT-32', title: 'Topology Knot', likes: 340, edition: '4K', price: '$320', category: 'Mono', color: '#84cc16', format: '4K', description: 'Torus knot trajectory in four-dimensional projection.' },
  { code: 'SURGE-33', title: 'Kinetic Surge II', likes: 178, edition: 'Ed. 20', price: '$320', category: 'Vectors', color: '#c496ff', format: 'VECTORS', description: 'Secondary velocity phase with multi-tier damping.' },
  { code: 'ECHO-34', title: 'Echo Chamber', likes: 142, edition: 'RAW', price: '$195', category: 'Vectors', color: '#f4cc7f', format: 'RAW', description: 'Acoustic waveform reflections translated into vector paths.' },
  { code: 'VERTEX-35', title: 'Vertex Array 35', likes: 215, edition: 'SVG', price: '$160', category: 'Generative', color: '#ff9d96', format: 'SVG', description: 'Vertex buffering study evaluating sub-pixel polygon alignment.' },
  { code: 'KNOT-36', title: 'Mono Knot 36', likes: 188, edition: '4K', price: '$195', category: 'Mono', color: '#ff3380', format: '4K', description: 'Closed non-self-intersecting space curve rendered in high-key black.' },
  { code: 'CHROMA-37', title: 'Chroma Array 37', likes: 162, edition: '4K', price: '$195', category: 'Generative', color: '#737373', format: '4K', description: 'Color matrix modulation across 64 orthogonal cells.' },
  { code: 'VERTEX-38', title: 'Vertex Tensor', likes: 245, edition: 'RAW', price: '$280', category: 'Generative', color: '#ac332b', format: 'RAW', description: 'Tensor product surfaces with procedural displacement.' },
  { code: 'CHROMA-39', title: 'Chroma Flux', likes: 312, edition: 'Ed. 8', price: '$320', category: 'Kinetic', color: '#e2750d', format: 'VECTORS', description: 'Continuous RGB channel phasing driven by micro-clocks.' },
  { code: 'KNOT-40', title: 'Mono Topology', likes: 195, edition: 'Ed. 20', price: '$160', category: 'Mono', color: '#bffc3f', format: '4K', description: 'Single continuous ribbon forming an impossible knot.' },
  { code: 'SYNTH-41', title: 'Synth Tone 41', likes: 220, edition: 'Ed. 20', price: '$195', category: 'Generative', color: '#d99af0', format: 'RAW', description: 'Modular audio synthesis parameters translated to visual glyphs.' },
  { code: 'TORUS-42', title: 'Torus Vector 42', likes: 285, edition: 'Ed. 20', price: '$220', category: 'Vectors', color: '#344553', format: 'VECTORS', description: 'Nested toroidal rings with asynchronous orbital periods.' },
  { code: 'PULSE-43', title: 'Mono Pulse 43', likes: 174, edition: '4K', price: '$220', category: 'Mono', color: '#f2479d', format: '4K', description: 'Monochrome square wave impulse response.' },
  { code: 'TRACE-44', title: 'Mono Trace 44', likes: 290, edition: '4K', price: '$320', category: 'Mono', color: '#8d1409', format: '4K', description: 'Depth buffer ray marching in single-pass scalar field.' },
  { code: 'CHROMA-45', title: 'Chroma RAW 45', likes: 133, edition: 'RAW', price: '$160', category: 'Mono', color: '#7e7f77', format: 'RAW', description: 'Uncompressed RGB data frame before gamma correction.' },
  { code: 'ECHO-46', title: 'Echo Stem 46', likes: 260, edition: 'SVG', price: '$280', category: 'Mono', color: '#FCF6BD', format: 'SVG', description: 'Vector audio stem visualizing low-frequency resonance.' },
  { code: 'ECHO-47', title: 'Kinetic Echo 47', likes: 315, edition: 'Ed. 20', price: '$320', category: 'Kinetic', color: '#A9DEF9', format: 'VECTORS', description: 'Multi-tap reverberation delay lines visualized in 2D space.' },
  { code: 'SYNTH-48', title: 'Mono Synth 48', likes: 180, edition: 'Ed. 15', price: '$280', category: 'Mono', color: '#38bdf8', format: 'RAW', description: 'Subtractive synthesis filter cutoff sweep.' },
];

// Special Subscriber Vault items as shown in PDF 3 & 4
const VAULT_ITEMS: Partial<GalleryWork>[] = [
  { code: 'VAULT-01', title: 'Artist 1 - Work 05 (Vault)', likes: 420, edition: 'Private', price: 'Unlock', category: 'Generative', color: '#f43f5e', isVault: true, unlocked: false, description: 'Exclusive subscriber vector master and 4K uncompressed stem.' },
  { code: 'VAULT-02', title: 'Artist 1 - Work 06 (Vault)', likes: 388, edition: 'Private', price: 'Unlock', category: 'Kinetic', color: '#8b5cf6', isVault: true, unlocked: false, description: 'Exclusive subscriber interactive kinetic script with passkey authentication.' },
  { code: 'VAULT-03', title: 'Artist 1 - Work 07 (Vault)', likes: 512, edition: 'Private', price: 'Unlock', category: 'Vectors', color: '#06b6d4', isVault: true, unlocked: false, description: 'Exclusive subscriber raw SVG layers and full Figma component tokens.' },
  { code: 'VAULT-04', title: 'Artist 1 - Work 08 (Vault)', likes: 475, edition: 'Private', price: 'Unlock', category: 'Mono', color: '#10b981', isVault: true, unlocked: false, description: 'Exclusive subscriber cel animations from the Tokyo 2025 archive.' },
];

// Build the full 128-work archive
export function generateGalleryArchive(): GalleryWork[] {
  const works: GalleryWork[] = [];
  const categories: Array<'Generative' | 'Kinetic' | 'Vectors' | 'Mono'> = [
    'Generative',
    'Kinetic',
    'Vectors',
    'Mono',
  ];

  // 1. Insert Base Works (40 works)
  BASE_WORKS.forEach((base, idx) => {
    works.push({
      id: `work-${idx + 1}`,
      code: base.code || `WRK-${String(idx + 1).padStart(2, '0')}`,
      title: base.title || `Curated Study ${idx + 1}`,
      artist: 'Artist 1',
      artistHandle: 'neo_tokyo',
      artistAvatar: 'A1',
      color: base.color || VIBRANT_PALETTE[idx % VIBRANT_PALETTE.length],
      likes: base.likes || 100 + ((idx * 37) % 350),
      edition: base.edition || `Ed. ${(idx % 12) + 1}/12`,
      price: base.price || `$${150 + ((idx * 15) % 180)}`,
      category: base.category || categories[idx % categories.length],
      isVault: false,
      unlocked: true,
      format: base.format || 'VECTORS',
      description: base.description || 'Parametric vector composition exploring modern minimalism.',
    });
  });

  // 2. Insert Vault Items (4 locked items)
  VAULT_ITEMS.forEach((vault, idx) => {
    works.push({
      id: `vault-${idx + 1}`,
      code: vault.code || `VAULT-0${idx + 1}`,
      title: vault.title || `Subscriber Vault ${idx + 1}`,
      artist: 'Artist 1',
      artistHandle: 'neo_tokyo',
      artistAvatar: 'A1',
      color: vault.color || '#333333',
      likes: vault.likes || 400,
      edition: 'Private',
      price: 'Unlock',
      category: vault.category || 'Generative',
      isVault: true,
      unlocked: false,
      format: '4K',
      description: vault.description || 'Subscriber vault exclusive asset.',
    });
  });

  // 3. Fill up to 128 total items
  const startId = works.length + 1;
  const targetTotal = 128;

  for (let i = startId; i <= targetTotal; i++) {
    const color = VIBRANT_PALETTE[(i * 7) % VIBRANT_PALETTE.length];
    const cat = categories[i % categories.length];
    const isLockedVault = i % 11 === 0;

    works.push({
      id: `work-${i}`,
      code: isLockedVault ? `VAULT-${String(i).padStart(3, '0')}` : `ARCH-${String(i).padStart(3, '0')}`,
      title: `Archived Cel ${i}`,
      artist: i % 3 === 0 ? 'Kroma Atelier' : i % 5 === 0 ? 'Sanko Kinetic' : 'Artist 1',
      artistHandle: i % 3 === 0 ? 'kroma_lab' : i % 5 === 0 ? 'sanko_arch' : 'neo_tokyo',
      artistAvatar: i % 3 === 0 ? 'KA' : i % 5 === 0 ? 'SK' : 'A1',
      color,
      likes: 80 + ((i * 29) % 420),
      edition: isLockedVault ? 'Private' : `Ed. ${(i % 10) + 1}/15`,
      price: isLockedVault ? 'Unlock' : `$${140 + ((i * 12) % 200)}`,
      category: cat,
      isVault: isLockedVault,
      unlocked: !isLockedVault,
      format: i % 4 === 0 ? '4K' : i % 3 === 0 ? 'SVG' : 'RAW',
      description: `Algorithmic vector exploration ${i} from the 2023-2025 StudioNeo digital heritage vault.`,
    });
  }

  return works;
}

export const ALL_GALLERY_WORKS: GalleryWork[] = generateGalleryArchive();
