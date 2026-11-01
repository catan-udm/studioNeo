import type { Metadata } from 'next';
import ArtistProfileClient from './ArtistProfileClient';
import { ArchiveApp } from '@/components/archive/ArchiveApp';
import { RESIDENT_ARTISTS } from '../../gallery/galleryData';

interface ArtistPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { handle } = await params;
  const cleanHandle = (handle || '').toLowerCase().trim();

  if (cleanHandle === 'sankobite') {
    return {
      title: 'sankobite — ugoira tribute archive さんこばいと • studioNeo',
      description:
        'A fan-made tribute archive of sankobite — Filipino illustrator, animator and sticker maker. Every ugoira loop, from the DECO*27 song series to Magical Mirai’s HERO and Poké Miku.',
    };
  }

  if (cleanHandle === 'rella') {
    return {
      title: 'Rella | The Artist Archive • studioNeo',
      description:
        'An independent tribute archive of Rella — illustrator, designer, and storyteller in light (Hatsune Miku Symphony, 15th & 16th anniversary visuals).',
    };
  }

  if (cleanHandle === 'tamimoon' || cleanHandle === 'tami_moon02') {
    return {
      title: 'tamimoon — illustrator (@tami_moon02) • studioNeo',
      description:
        'They are there. A visual profile of the Japanese illustrator tamimoon (@tami_moon02) — paintings, the five women of her illustration model agency, collaborations and chronology.',
    };
  }

  if (cleanHandle === 'yoneyamai' || cleanHandle === 'yoneyama_mai' || cleanHandle === 'yoneyama') {
    return {
      title: 'Yoneyama Mai (米山舞) — Museum Archive • studioNeo',
      description:
        'A curated museum tribute to Yoneyama Mai (米山舞) — seven rooms of artwork, animation screen credits, chronology, and exhibitions.',
    };
  }

  if (cleanHandle === 'mikapikazo' || cleanHandle === 'mika_pikazo' || cleanHandle === 'mika-pikazo') {
    return {
      title: 'Mika Pikazo (ミカ・ピカゾ) — Illustration Works • studioNeo',
      description:
        'Pop at full volume. An independent tribute showcase of Mika Pikazo — character designer of Fire Emblem Engage, Kaguya Luna and Hatsune Miku Magical Mirai.',
    };
  }

  if (cleanHandle === 'dinoillus' || cleanHandle === 'dinuillus' || cleanHandle === 'dino_illus' || cleanHandle === 'dino') {
    return {
      title: 'DINO (@Dino_illus) — where light ends • studioNeo',
      description:
        'Dramatic light, carved from darkness. Selected works, the WHERE LIGHT ENDS exhibition, artbook XXXIX, and light studies by Dino (@Dino_illus).',
    };
  }

  if (cleanHandle === 'lam' || cleanHandle === 'lam-illustrator' || cleanHandle === 'ramdayo1122') {
    return {
      title: 'LAM (@ramdayo1122) — Illustrator & Character Designer • studioNeo',
      description:
        'A world that looks back. Fearless characters, pop-bright color, and expressive eyes by Japanese illustrator LAM.',
    };
  }

  if (cleanHandle === 'dolman' || cleanHandle === 'dolman-illustrator' || cleanHandle === 'dolman4878') {
    return {
      title: 'Dolman (@dolman4878) — A Little World of Daydreams • studioNeo',
      description:
        'Original illustrations, colorful characters, and animated daydreams by Dolman (@dolman4878). Drawn by hand, made with heart. No AI.',
    };
  }

  if (cleanHandle === 'tatamipi' || cleanHandle === 'tatamipi-illustrator') {
    return {
      title: 'tatamipi (@tatamipi) — Illustrator Portfolio • studioNeo',
      description:
        'Blue wash, clean lines, and atmospheric solitude. Selected plates, principles, chronology, and studio notes by tatamipi.',
    };
  }

  if (cleanHandle === 'askziye' || cleanHandle === 'ask' || cleanHandle === 'askzy') {
    return {
      title: 'ASK (@askziye)｜偶尔画画的猫爱好者 · 画集 • studioNeo',
      description:
        'An online art book of ASK’s selected plates — Arknights, Surtr, Vocaloid, Fate, and Evangelion studies, signed with the cinnabar seal.',
    };
  }

  if (cleanHandle === 'dora' || cleanHandle === 'dora_xxi' || cleanHandle === 'dora-illustrator') {
    return {
      title: '哆啦小熙 (@dora_xxi) · Dora’s Studio • studioNeo',
      description:
        'Everyday light, quiet rooms, and cinematic cityscapes. Original character and scene illustrations by Dora (@dora_xxi).',
    };
  }

  if (cleanHandle === 'kaduise' || cleanHandle === 'kaduise-illustrator') {
    return {
      title: 'kaduise (@kaduise) — everything for the sake of a girl • studioNeo',
      description:
        'An illustrator in Osaka. Analog line, digital flat colour, a new drawing most nights at eight — grey everyday life and the stars above it.',
    };
  }

  if (
    cleanHandle === 'kda' ||
    cleanHandle === 'kda-comeback' ||
    cleanHandle === 'k_da' ||
    cleanHandle === 'firestarter'
  ) {
    return {
      title: 'K/DA | FIRESTARTER — Virtual Band • studioNeo',
      description:
        'Explore K/DA’s FIRESTARTER EP, official music video, ALL OUT, POP/STARS, and singles with Ahri, Akali, Evelynn, Kai’Sa and DJ Sona.',
    };
  }

  const resident = RESIDENT_ARTISTS.find((a) => a.handle.toLowerCase() === cleanHandle);
  const artistName = resident
    ? resident.name
    : cleanHandle
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

  const title = `${artistName} (@${cleanHandle}) • Resident Artist Portfolio • bikko.studio`;
  const description = resident
    ? resident.bio
    : `Curated digital cels, lossless SVG vector stems, and kinetic algorithmic editions by ${artistName} at studioNeo.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://bikko.studio/artist/${cleanHandle}`,
    },
    openGraph: {
      title,
      description,
      url: `https://bikko.studio/artist/${cleanHandle}`,
      type: 'profile',
      locale: 'en_US',
      siteName: 'bikko.studio',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { handle } = await params;
  const cleanHandle = (handle || '').toLowerCase().trim();

  if (cleanHandle === 'sankobite') {
    return <ArchiveApp initialArtist="sankobite" />;
  }

  if (cleanHandle === 'rella') {
    return <ArchiveApp initialArtist="rella" />;
  }

  if (cleanHandle === 'tamimoon' || cleanHandle === 'tami_moon02') {
    return <ArchiveApp initialArtist="tamimoon" />;
  }

  if (cleanHandle === 'yoneyamai' || cleanHandle === 'yoneyama_mai' || cleanHandle === 'yoneyama') {
    return <ArchiveApp initialArtist="yoneyamai" />;
  }

  if (cleanHandle === 'mikapikazo' || cleanHandle === 'mika_pikazo' || cleanHandle === 'mika-pikazo') {
    return <ArchiveApp initialArtist="mikapikazo" />;
  }

  if (cleanHandle === 'dinoillus' || cleanHandle === 'dinuillus' || cleanHandle === 'dino_illus' || cleanHandle === 'dino') {
    return <ArchiveApp initialArtist="dinoillus" />;
  }

  if (cleanHandle === 'lam' || cleanHandle === 'lam-illustrator' || cleanHandle === 'ramdayo1122') {
    return <ArchiveApp initialArtist="lam" />;
  }

  if (cleanHandle === 'dolman' || cleanHandle === 'dolman-illustrator' || cleanHandle === 'dolman4878') {
    return <ArchiveApp initialArtist="dolman" />;
  }

  if (cleanHandle === 'tatamipi' || cleanHandle === 'tatamipi-illustrator') {
    return <ArchiveApp initialArtist="tatamipi" />;
  }

  if (cleanHandle === 'askziye' || cleanHandle === 'ask' || cleanHandle === 'askzy') {
    return <ArchiveApp initialArtist="askziye" />;
  }

  if (cleanHandle === 'dora' || cleanHandle === 'dora_xxi' || cleanHandle === 'dora-illustrator') {
    return <ArchiveApp initialArtist="dora" />;
  }

  if (cleanHandle === 'kaduise' || cleanHandle === 'kaduise-illustrator') {
    return <ArchiveApp initialArtist="kaduise" />;
  }

  if (
    cleanHandle === 'kda' ||
    cleanHandle === 'kda-comeback' ||
    cleanHandle === 'k_da' ||
    cleanHandle === 'firestarter'
  ) {
    return <ArchiveApp initialArtist="kda" />;
  }

  return <ArtistProfileClient handle={handle} />;
}
