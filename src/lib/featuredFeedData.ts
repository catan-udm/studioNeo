import { artworks as sankobiteArtworks } from '@/data';
import { rellaArtworks } from '@/rellaData';
import { works as tamimoonArtworks, workUrl as tamimoonWorkUrl } from '@/tamimoonData';
import { P as yoneyamaiPieces, imageUrl as yoneyamaImageUrl, type Piece as YoneyamaPiece } from '@/yoneyamaiData';
import { works as mikapikazoWorks } from '@/mikapikazoData';
import { works as dolmanWorks } from '@/components/archive/dolman/data';
import { illustrators } from '@/data/illustrators';
import {
  getArtistDistinction,
  getArtistBadge,
  isPartnerHandle,
  type ArtistDistinction,
} from '@/data/artistRoles';

export interface FeedItem {
  id: string;
  dbId?: number;
  code: string;
  title: string;
  subtitle?: string;
  caption: string;
  artistName: string;
  artistHandle: string;
  artistAvatar: string;
  artistProfileUrl: string;
  distinction: 'partner' | 'featured';
  badge: 'Partner' | 'Featured';
  mediaSrc: string;
  mediaKind: 'image' | 'animated';
  accentColor: string;
  dateLabel: string;
  tags: string[];
  initialLikes: number;
  canDownloadMaster: boolean;
  archiveRoute: string;
  sourceUrl?: string;
}

export interface FeaturedStoryArtist {
  handle: string;
  archiveSlug: string;
  displayName: string;
  avatar: string;
  distinction: 'partner' | 'featured';
  badge: 'Partner' | 'Featured';
  followers: number;
}

export interface ArtistStory {
  artistHandle: string;
  artistName: string;
  artistAvatar: string;
  distinction: 'partner' | 'featured';
  badge: 'Partner' | 'Featured';
  archiveRoute: string;
  workId: string;
  title: string;
  subtitle?: string;
  caption?: string;
  mediaSrc: string;
  mediaKind: 'image' | 'animated';
  accentColor: string;
  dateLabel: string;
  tags: string[];
  likes: number;
  feedItem?: FeedItem;
}

function findIllustratorAvatar(handle: string, fallbackInitials: string): string {
  const h = handle.toLowerCase();
  const match = illustrators.find(
    (ill) =>
      ill.handle.toLowerCase() === h ||
      ill.requestedHandle.toLowerCase() === h ||
      ill.name.toLowerCase() === h ||
      (h === 'rella' && ill.handle.toLowerCase() === 'rellakinoko') ||
      (h === 'tamimoon' && ill.handle.toLowerCase() === 'tami_moon02') ||
      (h === 'dolman' && ill.handle.toLowerCase() === 'dolman4878') ||
      (h === 'dinoillus' && ill.handle.toLowerCase() === 'dino_illus') ||
      (h === 'lam' && (ill.handle.toLowerCase() === 'ramdayo1122' || ill.name.toLowerCase() === 'lam' || ill.displayName.toLowerCase() === 'lam'))
  );
  return match?.image || match?.avatarUrl || fallbackInitials;
}

/**
 * Strictly enforces that only 'partner' and 'featured' artists pass into the feed.
 * Normal directory artists ('artist') are excluded.
 */
export function isEligibleFeedArtist(handle?: string | null): boolean {
  const d: ArtistDistinction = getArtistDistinction(handle);
  return d === 'partner' || d === 'featured';
}

/**
 * Builds the top horizontal story bar of Partner & Featured artists.
 */
export function getFeaturedAndPartnerArtists(): FeaturedStoryArtist[] {
  const curatedOrder: Array<{ handle: string; archiveSlug: string; fallbackName: string }> = [
    { handle: 'sankobite', archiveSlug: 'sankobite', fallbackName: 'sankobite' },
    { handle: 'rellakinoko', archiveSlug: 'rella', fallbackName: 'Rella' },
    { handle: 'tami_moon02', archiveSlug: 'tamimoon', fallbackName: 'tamimoon' },
    { handle: 'yoneyamai', archiveSlug: 'yoneyamai', fallbackName: 'Yoneyama Mai' },
    { handle: 'mikapikazo', archiveSlug: 'mikapikazo', fallbackName: 'Mika Pikazo' },
    { handle: 'dolman4878', archiveSlug: 'dolman', fallbackName: 'Dolman' },
    { handle: 'lam', archiveSlug: 'lam', fallbackName: 'LAM' },
    { handle: 'dino_illus', archiveSlug: 'dinoillus', fallbackName: 'Dino' },
    { handle: 'askziye', archiveSlug: 'askziye', fallbackName: 'ASK' },
    { handle: 'tatamipi', archiveSlug: 'tatamipi', fallbackName: 'Tatamipi' },
    { handle: 'dora_xxi', archiveSlug: 'dora', fallbackName: 'Dora' },
    { handle: 'kaduise', archiveSlug: 'kaduise', fallbackName: 'Kaduise' },
  ];

  const stories: FeaturedStoryArtist[] = [];

  for (const item of curatedOrder) {
    if (!isEligibleFeedArtist(item.handle)) continue;
    const distinction = getArtistDistinction(item.handle) as 'partner' | 'featured';
    const badge = getArtistBadge(item.handle) || 'Featured';
    const ill = illustrators.find(
      (i) =>
        i.handle.toLowerCase() === item.handle.toLowerCase() ||
        i.requestedHandle.toLowerCase() === item.handle.toLowerCase() ||
        (item.handle === 'lam' &&
          (i.handle.toLowerCase() === 'ramdayo1122' ||
            i.name.toLowerCase() === 'lam' ||
            i.displayName.toLowerCase() === 'lam'))
    );

    stories.push({
      handle: item.handle,
      archiveSlug: item.archiveSlug,
      displayName: ill?.displayName || item.fallbackName,
      avatar: ill?.image || ill?.avatarUrl || item.fallbackName.slice(0, 2).toUpperCase(),
      distinction,
      badge,
      followers: ill?.followers || 10000,
    });
  }

  return stories;
}

/**
 * Generates the interleaved feed of Partner and Featured artist works.
 * Normal artists are strictly excluded.
 */
export function buildCuratedFeedItems(): FeedItem[] {
  const sankobiteAvatar = findIllustratorAvatar('sankobite', 'SB');
  const rellaAvatar = findIllustratorAvatar('rellakinoko', 'RL');
  const tamimoonAvatar = findIllustratorAvatar('tami_moon02', 'TM');
  const yoneyamaAvatar = findIllustratorAvatar('yoneyamai', 'YM');
  const mikaAvatar = findIllustratorAvatar('mikapikazo', 'MP');
  const dolmanAvatar = findIllustratorAvatar('dolman4878', 'DM');

  // 1. Partner Artist: sankobite
  const partnerPosts: FeedItem[] = sankobiteArtworks.map((a, idx) => ({
    id: `sankobite-${a.id}`,
    code: `SNK-${String(idx + 1).padStart(2, '0')}`,
    title: `${a.titleJp} — ${a.titleEn}`,
    subtitle: a.songBy,
    caption: a.note,
    artistName: 'sankobite',
    artistHandle: 'sankobite',
    artistAvatar: sankobiteAvatar,
    artistProfileUrl: 'https://x.com/sankobite',
    distinction: 'partner',
    badge: 'Partner',
    mediaSrc: a.src,
    mediaKind: 'animated',
    accentColor: a.accent || '#ef4fd0',
    dateLabel: a.dateLabel,
    tags: a.tags.slice(0, 5),
    initialLikes: 380 + a.frames * 6,
    canDownloadMaster: true,
    archiveRoute: `/?artist=sankobite&work=${a.slug}`,
  }));

  // 2. Featured Artist: Rella
  const rellaPosts: FeedItem[] = rellaArtworks.map((r, idx) => ({
    id: `rella-${r.id}`,
    code: `REL-${String(idx + 1).padStart(2, '0')}`,
    title: r.title,
    subtitle: r.label,
    caption: r.description,
    artistName: 'Rella',
    artistHandle: 'rellakinoko',
    artistAvatar: rellaAvatar,
    artistProfileUrl: 'https://x.com/Rellakinoko',
    distinction: 'featured',
    badge: 'Featured',
    mediaSrc: r.image,
    mediaKind: 'image',
    accentColor: '#67b7b0',
    dateLabel: r.year,
    tags: ['HatsuneMiku', 'KeyVisual', ...r.categories],
    initialLikes: 1240 + idx * 95,
    canDownloadMaster: false,
    archiveRoute: `/?artist=rella&work=${r.id}`,
  }));

  // 3. Featured Artist: Yoneyama Mai
  const yoneyamaList = Object.values(yoneyamaiPieces) as YoneyamaPiece[];
  const yoneyamaPosts: FeedItem[] = yoneyamaList.slice(0, 14).map((p, idx) => ({
    id: `yoneyamai-${p.id}`,
    code: `YNM-${String(idx + 1).padStart(2, '0')}`,
    title: p.title,
    subtitle: p.shown || p.medium,
    caption: `${p.alt}. Exhibited as part of ${p.shown || 'Yoneyama Mai Official Solo Archive'} (${p.year}).`,
    artistName: '米山 舞 Yoneyama Mai',
    artistHandle: 'yoneyamai',
    artistAvatar: yoneyamaAvatar,
    artistProfileUrl: 'https://x.com/yoneyamai',
    distinction: 'featured',
    badge: 'Featured',
    mediaSrc: yoneyamaImageUrl(p.file, 1200),
    mediaKind: 'image',
    accentColor: '#c496ff',
    dateLabel: p.year,
    tags: ['YoneyamaMai', 'Exhibition', p.medium.replace(/\s+/g, '')],
    initialLikes: 2150 + idx * 130,
    canDownloadMaster: false,
    archiveRoute: `/?artist=yoneyamai`,
    sourceUrl: p.source,
  }));

  // 4. Featured Artist: Mika Pikazo
  const mikaPosts: FeedItem[] = mikapikazoWorks.slice(0, 14).map((w, idx) => ({
    id: `mikapikazo-${w.id}`,
    code: `MKP-${String(idx + 1).padStart(2, '0')}`,
    title: w.title,
    subtitle: w.meta,
    caption: w.note,
    artistName: 'Mika Pikazo',
    artistHandle: 'mikapikazo',
    artistAvatar: mikaAvatar,
    artistProfileUrl: 'https://x.com/MikaPikaZo',
    distinction: 'featured',
    badge: 'Featured',
    mediaSrc: w.image,
    mediaKind: 'image',
    accentColor: '#ff3380',
    dateLabel: w.year || '2023',
    tags: ['MikaPikazo', 'REVENGEPOP', w.category],
    initialLikes: 1890 + idx * 110,
    canDownloadMaster: false,
    archiveRoute: `/?artist=mikapikazo`,
  }));

  // 5. Featured Artist: tamimoon
  const tamimoonPosts: FeedItem[] = tamimoonArtworks.slice(0, 14).map((t, idx) => ({
    id: `tamimoon-${t.id}`,
    code: `TMM-${String(idx + 1).padStart(2, '0')}`,
    title: t.title === 'tamimoon' ? `IDENTITY Study #${t.id}` : t.title,
    subtitle: `${t.kind.toUpperCase()} · ${t.cast.join(', ').toUpperCase()}`,
    caption: `Contemporary fashion & character study by tamimoon (@tami_moon02) featuring ${t.cast.join(', ')}.`,
    artistName: 'tamimoon',
    artistHandle: 'tami_moon02',
    artistAvatar: tamimoonAvatar,
    artistProfileUrl: 'https://x.com/tami_moon02',
    distinction: 'featured',
    badge: 'Featured',
    mediaSrc: t.src,
    mediaKind: 'image',
    accentColor: t.tone || '#94a3b8',
    dateLabel: '2023–2025',
    tags: ['tamimoon', 'FashionIllustration', ...t.cast],
    initialLikes: 980 + idx * 64,
    canDownloadMaster: false,
    archiveRoute: `/?artist=tamimoon`,
    sourceUrl: tamimoonWorkUrl(t.id),
  }));

  // 6. Featured Artist: Dolman
  const dolmanPosts: FeedItem[] = dolmanWorks.slice(0, 10).map((d, idx) => ({
    id: `dolman-${d.id}`,
    code: `DLM-${String(idx + 1).padStart(2, '0')}`,
    title: `${d.title} (${d.originalTitle})`,
    subtitle: d.category,
    caption: d.description,
    artistName: 'Dolman',
    artistHandle: 'dolman4878',
    artistAvatar: dolmanAvatar,
    artistProfileUrl: 'https://x.com/dolman4878',
    distinction: 'featured',
    badge: 'Featured',
    mediaSrc: d.image,
    mediaKind: 'image',
    accentColor: d.accent || '#f4cc7f',
    dateLabel: d.year,
    tags: ['Dolman', d.category, 'OriginalCharacter'],
    initialLikes: 760 + idx * 45,
    canDownloadMaster: false,
    archiveRoute: `/?artist=dolman`,
    sourceUrl: d.source,
  }));

  // 7. Featured Artist: LAM
  const lamAvatar = findIllustratorAvatar('lam', 'LM');
  const lamPosts: FeedItem[] = [
    {
      id: 'lam-red',
      code: 'LAM-01',
      title: 'RED — The Gaze',
      subtitle: 'Original Solo Exhibition · Eye Contact',
      caption: 'LAM illustration of a dark-haired woman with multicolored eyes and white flowers against scarlet red.',
      artistName: 'LAM',
      artistHandle: 'lam',
      artistAvatar: lamAvatar,
      artistProfileUrl: 'https://x.com/ramdayo1122',
      distinction: 'featured',
      badge: 'Featured',
      mediaSrc: '/images/lam-red.jpg',
      mediaKind: 'image',
      accentColor: '#ff2a5f',
      dateLabel: '2024',
      tags: ['LAM', 'RED', 'TheGaze', 'SoloExhibition'],
      initialLikes: 2450,
      canDownloadMaster: false,
      archiveRoute: '/?artist=lam',
    },
    {
      id: 'lam-serpent',
      code: 'LAM-02',
      title: 'SERPENT — The Gaze',
      subtitle: 'Original Solo Exhibition · Violet Serpentine',
      caption: 'LAM illustration of a green-eyed character surrounded by black serpents on a violet background.',
      artistName: 'LAM',
      artistHandle: 'lam',
      artistAvatar: lamAvatar,
      artistProfileUrl: 'https://x.com/ramdayo1122',
      distinction: 'featured',
      badge: 'Featured',
      mediaSrc: '/images/lam-serpent.jpg',
      mediaKind: 'image',
      accentColor: '#a855f7',
      dateLabel: '2024',
      tags: ['LAM', 'SERPENT', 'SoloExhibition'],
      initialLikes: 1980,
      canDownloadMaster: false,
      archiveRoute: '/?artist=lam',
    },
    {
      id: 'lam-mars',
      code: 'LAM-03',
      title: 'MARS — Flame Burst',
      subtitle: 'Selected Masterpiece',
      caption: 'LAM illustration of a red-haired character in scarlet amid flames and black serpents.',
      artistName: 'LAM',
      artistHandle: 'lam',
      artistAvatar: lamAvatar,
      artistProfileUrl: 'https://x.com/ramdayo1122',
      distinction: 'featured',
      badge: 'Featured',
      mediaSrc: '/images/lam-mars.jpg',
      mediaKind: 'image',
      accentColor: '#f97316',
      dateLabel: '2024',
      tags: ['LAM', 'MARS', 'Flame'],
      initialLikes: 1870,
      canDownloadMaster: false,
      archiveRoute: '/?artist=lam',
    },
  ];

  // 8. Featured Artist: Dino
  const dinoAvatar = findIllustratorAvatar('dino_illus', 'DI');
  const dinoPosts: FeedItem[] = [
    {
      id: 'dino-31a',
      code: 'DNO-01',
      title: '31-A (Heaven Burns Red)',
      subtitle: 'Heaven Burns Red · Official 1st Anniversary',
      caption: 'Made for the first anniversary of Heaven Burns Red EN: “So honored to have created this illustration of 31-A.” Held together by one warm key light.',
      artistName: 'Dino',
      artistHandle: 'dino_illus',
      artistAvatar: dinoAvatar,
      artistProfileUrl: 'https://x.com/Dino_illus',
      distinction: 'featured',
      badge: 'Featured',
      mediaSrc: '/images/dino-hero.jpg',
      mediaKind: 'image',
      accentColor: '#eab308',
      dateLabel: '2025',
      tags: ['Dino', 'HeavenBurnsRed', 'OfficialArt'],
      initialLikes: 1720,
      canDownloadMaster: false,
      archiveRoute: '/?artist=dinoillus',
    },
  ];

  // 9. Featured Artist: ASK
  const askAvatar = findIllustratorAvatar('askziye', 'AK');
  const askPosts: FeedItem[] = [
    {
      id: 'ask-shaohua',
      code: 'ASK-01',
      title: '韶华 · Shaohua',
      subtitle: 'Hatsune Miku · Original Masterpiece',
      caption: 'Timeless Chinese classical aesthetic portrait of Hatsune Miku in traditional silk by ASK (@askziye).',
      artistName: 'ASK',
      artistHandle: 'askziye',
      artistAvatar: askAvatar,
      artistProfileUrl: 'https://x.com/askziye',
      distinction: 'featured',
      badge: 'Featured',
      mediaSrc: '/images/askziye/shaohua.jpg',
      mediaKind: 'image',
      accentColor: '#b44738',
      dateLabel: '2024',
      tags: ['ASK', 'HatsuneMiku', 'Shaohua', 'ClassicalStyle'],
      initialLikes: 2950,
      canDownloadMaster: false,
      archiveRoute: '/?artist=askziye',
    },
    {
      id: 'ask-meihua',
      code: 'ASK-02',
      title: '梅花三弄 · Plum Blossom',
      subtitle: 'Original Series',
      caption: 'Delicate ink and wash portrait with blossoming branches by ASK (@askziye).',
      artistName: 'ASK',
      artistHandle: 'askziye',
      artistAvatar: askAvatar,
      artistProfileUrl: 'https://x.com/askziye',
      distinction: 'featured',
      badge: 'Featured',
      mediaSrc: '/images/askziye/meihua.jpg',
      mediaKind: 'image',
      accentColor: '#e11d48',
      dateLabel: '2024',
      tags: ['ASK', 'Meihua', 'OriginalSeries'],
      initialLikes: 2100,
      canDownloadMaster: false,
      archiveRoute: '/?artist=askziye',
    },
  ];

  // 10. Featured Artist: Tatamipi
  const tatamipiAvatar = findIllustratorAvatar('tatamipi', 'TT');
  const tatamipiPosts: FeedItem[] = [
    {
      id: 'tatamipi-plate-01',
      code: 'TTM-01',
      title: 'Erumina Special Archive',
      subtitle: 'Plate 01 · Photographer & Illustrator Cross-Session',
      caption: 'Visual archive study and creative interview by tatamipi (@tatamipi). Subtle room tones and delicate analog atmosphere.',
      artistName: 'Tatamipi',
      artistHandle: 'tatamipi',
      artistAvatar: tatamipiAvatar,
      artistProfileUrl: 'https://x.com/tatamipi',
      distinction: 'featured',
      badge: 'Featured',
      mediaSrc: 'https://erumina.jp/renewal/wp-content/uploads/2025/10/article-tatamipi-01.jpg',
      mediaKind: 'image',
      accentColor: '#38bdf8',
      dateLabel: '2025',
      tags: ['tatamipi', 'Erumina', 'Plate01', 'Atmosphere'],
      initialLikes: 1430,
      canDownloadMaster: false,
      archiveRoute: '/?artist=tatamipi',
    },
    {
      id: 'tatamipi-plate-02',
      code: 'TTM-02',
      title: 'Tatami Ozashiki',
      subtitle: 'Plate 02 · R11R Agency Archive',
      caption: 'Warm ambient room study by tatamipi (@tatamipi), published via R11R.',
      artistName: 'Tatamipi',
      artistHandle: 'tatamipi',
      artistAvatar: tatamipiAvatar,
      artistProfileUrl: 'https://x.com/tatamipi',
      distinction: 'featured',
      badge: 'Featured',
      mediaSrc: 'https://r11r.jp/wp-content/uploads/R11R_tatamipi_06-tatami-ozashiki.png',
      mediaKind: 'image',
      accentColor: '#84cc16',
      dateLabel: '2025',
      tags: ['tatamipi', 'R11R', 'Ozashiki'],
      initialLikes: 1120,
      canDownloadMaster: false,
      archiveRoute: '/?artist=tatamipi',
    },
  ];

  // 11. Featured Artist: Dora
  const doraAvatar = findIllustratorAvatar('dora_xxi', 'DR');
  const doraPosts: FeedItem[] = [
    {
      id: 'dora-01',
      code: 'DRA-01',
      title: '被物件填满的日常 · The Everyday, Collected',
      subtitle: 'Places Series · Indoor Daylight Study',
      caption: '哆啦小熙的室内插画：桌椅、衣物与日用品在光影中层层堆叠。Bespoke studio composition.',
      artistName: '哆啦小熙 Dora',
      artistHandle: 'dora_xxi',
      artistAvatar: doraAvatar,
      artistProfileUrl: 'https://x.com/dora_xxi',
      distinction: 'featured',
      badge: 'Featured',
      mediaSrc: '/images/dora/01.jpg',
      mediaKind: 'image',
      accentColor: '#f5a623',
      dateLabel: '2025',
      tags: ['Dora', 'EverydayCollected', 'PlacesSeries'],
      initialLikes: 1650,
      canDownloadMaster: false,
      archiveRoute: '/?artist=dora',
    },
    {
      id: 'dora-02',
      code: 'DRA-02',
      title: '蓝调时刻 · Blue Hour',
      subtitle: 'Figures Series · City Night Light',
      caption: 'Figures bathed in the quiet electric glow of the city dusk by 哆啦小熙 (@dora_xxi).',
      artistName: '哆啦小熙 Dora',
      artistHandle: 'dora_xxi',
      artistAvatar: doraAvatar,
      artistProfileUrl: 'https://x.com/dora_xxi',
      distinction: 'featured',
      badge: 'Featured',
      mediaSrc: '/images/dora/02.jpg',
      mediaKind: 'image',
      accentColor: '#5ce1e6',
      dateLabel: '2025',
      tags: ['Dora', 'BlueHour', 'FiguresSeries'],
      initialLikes: 1410,
      canDownloadMaster: false,
      archiveRoute: '/?artist=dora',
    },
  ];

  // 12. Featured Artist: Kaduise
  const kaduiseAvatar = findIllustratorAvatar('kaduise', 'KD');
  const kaduisePosts: FeedItem[] = [
    {
      id: 'kaduise-shingo',
      code: 'KDS-01',
      title: '信号待ち · Waiting for the Light',
      subtitle: 'Everyday Girls · Osaka Street Series',
      caption: 'Analog pen & flat-color study by kaduise (@kaduise). The quiet stillness of waiting at the intersection.',
      artistName: 'kaduise · かづいせ',
      artistHandle: 'kaduise',
      artistAvatar: kaduiseAvatar,
      artistProfileUrl: 'https://x.com/kaduise',
      distinction: 'featured',
      badge: 'Featured',
      mediaSrc: '/images/kaduise/shingo.jpg',
      mediaKind: 'image',
      accentColor: '#e0b931',
      dateLabel: '2024',
      tags: ['kaduise', 'WaitingForTheLight', 'Girls', 'Everyday'],
      initialLikes: 1390,
      canDownloadMaster: false,
      archiveRoute: '/?artist=kaduise',
    },
    {
      id: 'kaduise-uchuu',
      code: 'KDS-02',
      title: '宇宙に行こう · Let\'s Go to Space',
      subtitle: 'Original Series · Starry Night Motif',
      caption: 'Dreamy ink illustration with star charts and retro-futuristic charm by kaduise (@kaduise).',
      artistName: 'kaduise · かづいせ',
      artistHandle: 'kaduise',
      artistAvatar: kaduiseAvatar,
      artistProfileUrl: 'https://x.com/kaduise',
      distinction: 'featured',
      badge: 'Featured',
      mediaSrc: '/images/kaduise/uchuu.jpg',
      mediaKind: 'image',
      accentColor: '#38bdf8',
      dateLabel: '2024',
      tags: ['kaduise', 'LetsGoToSpace', 'Stars'],
      initialLikes: 1540,
      canDownloadMaster: false,
      archiveRoute: '/?artist=kaduise',
    },
  ];

  // Interleave buckets round-robin so the feed feels like an organic social timeline
  const buckets = [
    partnerPosts,
    rellaPosts,
    yoneyamaPosts,
    mikaPosts,
    tamimoonPosts,
    dolmanPosts,
    lamPosts,
    dinoPosts,
    askPosts,
    tatamipiPosts,
    doraPosts,
    kaduisePosts,
  ];

  const interleaved: FeedItem[] = [];
  const maxLen = Math.max(...buckets.map((b) => b.length));

  for (let i = 0; i < maxLen; i++) {
    for (const bucket of buckets) {
      if (i < bucket.length) {
        const candidate = bucket[i];
        // Final strict guard: only Partner and Featured artists allowed
        if (
          isEligibleFeedArtist(candidate.artistHandle) &&
          (candidate.distinction === 'partner' || candidate.distinction === 'featured')
        ) {
          interleaved.push(candidate);
        }
      }
    }
  }

  return interleaved;
}

/**
 * Builds stories for each Partner & Featured artist representing their latest post.
 * Prioritizes database-minted works (dbFeedItems), falling back to curated works.
 */
export function buildArtistStories(dbFeedItems?: FeedItem[]): ArtistStory[] {
  const storyArtists = getFeaturedAndPartnerArtists();
  const curatedFeed = buildCuratedFeedItems();
  const allCandidates = [...(dbFeedItems || []), ...curatedFeed];

  const stories: ArtistStory[] = [];

  for (const artist of storyArtists) {
    // Find newest post for this artist:
    // First candidate in allCandidates matching artistHandle
    const latestWork = allCandidates.find(
      (item) => item.artistHandle.toLowerCase() === artist.handle.toLowerCase()
    );

    if (latestWork) {
      stories.push({
        artistHandle: artist.handle,
        artistName: latestWork.artistName || artist.displayName,
        artistAvatar: artist.avatar,
        distinction: artist.distinction,
        badge: artist.badge,
        archiveRoute: latestWork.archiveRoute || `/?artist=${artist.archiveSlug}`,
        workId: latestWork.id,
        title: latestWork.title,
        subtitle: latestWork.subtitle,
        caption: latestWork.caption,
        mediaSrc: latestWork.mediaSrc,
        mediaKind: latestWork.mediaKind,
        accentColor: latestWork.accentColor || '#6366f1',
        dateLabel: latestWork.dateLabel,
        tags: latestWork.tags,
        likes: latestWork.initialLikes,
        feedItem: latestWork,
      });
    }
  }

  return stories;
}

/**
 * Converts a database CelRecord into a FeedItem if and only if its artist is Partner or Featured.
 */
export function mapDbCelToFeedItem(cel: {
  id: number;
  code: string;
  title: string;
  description: string;
  artist: string;
  artist_handle: string;
  artist_avatar: string;
  artist_distinction?: string;
  category: string;
  edition: string;
  color: string;
  likes: number;
  svg_url?: string | null;
  gif_url?: string | null;
  created_at: string;
}): FeedItem | null {
  const distinction =
    cel.artist_distinction === 'partner' || cel.artist_distinction === 'featured'
      ? cel.artist_distinction
      : getArtistDistinction(cel.artist_handle);

  // Exclude normal artists ('artist' or 'none')
  if (distinction !== 'partner' && distinction !== 'featured') {
    return null;
  }

  const isPartner = distinction === 'partner' || isPartnerHandle(cel.artist_handle);

  return {
    id: `db-artwork-${cel.id}`,
    dbId: cel.id,
    code: cel.code,
    title: cel.title,
    subtitle: `${cel.category} · ${cel.edition}`,
    caption: cel.description || `Minted studioNeo work by @${cel.artist_handle}.`,
    artistName: cel.artist,
    artistHandle: cel.artist_handle,
    artistAvatar: findIllustratorAvatar(cel.artist_handle, cel.artist_avatar),
    artistProfileUrl: `/artist/${cel.artist_handle}`,
    distinction,
    badge: isPartner ? 'Partner' : 'Featured',
    mediaSrc:
      cel.gif_url ||
      cel.svg_url ||
      `/api/assets/download/${encodeURIComponent(cel.code.toLowerCase())}?preview=true`,
    mediaKind: cel.gif_url ? 'animated' : 'image',
    accentColor: cel.color || '#c496ff',
    dateLabel: new Date(cel.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    tags: [cel.category, 'studioNeo', isPartner ? 'PartnerMaster' : 'FeaturedArchive'],
    initialLikes: cel.likes || 42,
    canDownloadMaster: isPartner,
    archiveRoute: `/gallery?code=${encodeURIComponent(cel.code)}`,
  };
}
