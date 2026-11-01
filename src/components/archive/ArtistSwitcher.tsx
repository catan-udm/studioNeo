"use client";

import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/utils/cn";
import sankobiteAvatar from "@/assets/sankobite/avatar";
import yoneyamaiAvatar from "@/assets/yoneyamai/profile";
import mikaPikazoAvatar from "@/assets/mikapikazo/avatar";
import { art as dolmanArt } from "@/components/archive/dolman/generated/art";

export type ArtistPage =
  | "sankobite"
  | "rella"
  | "tamimoon"
  | "yoneyamai"
  | "mikapikazo"
  | "dinoillus"
  | "lam"
  | "dolman"
  | "tatamipi"
  | "askziye"
  | "dora"
  | "kaduise"
  | "kda";

export interface ArtistMeta {
  id: ArtistPage;
  name: string;
  japanese: string;
  tagline: string;
  badge: string;
  accent: string;
}

export const ARTISTS_LIST: ArtistMeta[] = [
  {
    id: "sankobite",
    name: "Sankobite",
    japanese: "さんこばいと",
    tagline: "Ugoira & DECO*27 Loops",
    badge: "Animated Loops",
    accent: "#2fc4bb",
  },
  {
    id: "rella",
    name: "Rella",
    japanese: "レラ",
    tagline: "Storyteller in Light • Miku & Symphony",
    badge: "Celestial Light",
    accent: "#7fd8be",
  },
  {
    id: "tamimoon",
    name: "tamimoon",
    japanese: "タミムーン",
    tagline: "Tokyo Fashion & Editorial Models",
    badge: "Editorial Agency",
    accent: "#e4472b",
  },
  {
    id: "yoneyamai",
    name: "Yoneyama Mai",
    japanese: "米山舞",
    tagline: "Animation & Museum Art • EYE & DYE",
    badge: "Museum Archive",
    accent: "#b3261e",
  },
  {
    id: "mikapikazo",
    name: "Mika Pikazo",
    japanese: "ミカ・ピカゾ",
    tagline: "Pop Explosion • Color Outside The Lines",
    badge: "Pop Explosion",
    accent: "#ff2e7e",
  },
  {
    id: "dinoillus",
    name: "DINO",
    japanese: "ディノ",
    tagline: "Where Light Ends • Dramatic Chiaroscuro",
    badge: "Light & Shadow",
    accent: "#e3ad5e",
  },
  {
    id: "lam",
    name: "LAM",
    japanese: "ラム",
    tagline: "Visual Shock • Eyes That Look Back",
    badge: "Graphic Pop",
    accent: "#ed242d",
  },
  {
    id: "dolman",
    name: "Dolman",
    japanese: "ドルマン",
    tagline: "Little Worlds & Animated Daydreams",
    badge: "Daydreams",
    accent: "#2743d8",
  },
  {
    id: "tatamipi",
    name: "tatamipi",
    japanese: "タタミピ",
    tagline: "Blue Wash & Atmospheric Solitude",
    badge: "Quiet Realism",
    accent: "#2f4ff1",
  },
  {
    id: "askziye",
    name: "ASK",
    japanese: "偶尔画画的猫爱好者",
    tagline: "Cinnabar & Chinese Classical Ink • Surtr & Vocaloid",
    badge: "Classical Ink",
    accent: "#b44738",
  },
  {
    id: "dora",
    name: "Dora",
    japanese: "哆啦小熙",
    tagline: "Lilac Workspace • Everyday Figures & Scenic Light",
    badge: "Everyday Light",
    accent: "#ff704b",
  },
  {
    id: "kaduise",
    name: "kaduise",
    japanese: "かづいせ",
    tagline: "Analog Line & Flat Color • Osaka Starry Nights",
    badge: "Stars & Line",
    accent: "#e0b931",
  },
  {
    id: "kda",
    name: "K/DA",
    japanese: "ケーディーエー",
    tagline: "FIRESTARTER • Virtual Band • Riot Games Music",
    badge: "Virtual Pop",
    accent: "#f43e72",
  },
];

export const ARTIST_LABELS: Record<ArtistPage, string> = {
  sankobite: "Sankobite",
  rella: "Rella",
  tamimoon: "tamimoon",
  yoneyamai: "Yoneyama Mai",
  mikapikazo: "Mika Pikazo",
  dinoillus: "DINO",
  lam: "LAM",
  dolman: "Dolman",
  tatamipi: "tatamipi",
  askziye: "ASK",
  dora: "Dora",
  kaduise: "kaduise",
  kda: "K/DA",
};

export function ArtistIcon({
  artist,
  size = 24,
  className,
}: {
  artist: ArtistPage;
  size?: number;
  className?: string;
}) {
  if (artist === "sankobite") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={sankobiteAvatar}
        alt="Sankobite"
        width={size}
        height={size}
        className={cn("artist-avatar-img", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (artist === "rella") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("artist-icon-svg rella-star-icon", className)}
        aria-hidden="true"
      >
        <path d="M18 1.5v33M1.5 18h33M6.3 6.3l23.4 23.4M29.7 6.3 6.3 29.7" />
        <circle cx="18" cy="18" r="6.3" strokeWidth="2.2" />
      </svg>
    );
  }

  if (artist === "tamimoon") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        className={cn("artist-icon-svg tamimoon-moon-icon", className)}
        aria-hidden="true"
      >
        <path
          d="M22.4 27.2A12.4 12.4 0 0 1 12.6 4.2a13 13 0 1 0 9.8 23Z"
          fill="currentColor"
        />
        <path
          d="M26.5 3.2 21 12.4l-2.1 3.5 3.9-.9 8.2-1.9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="21.4" cy="20.6" r="1.6" fill="#e4472b" />
      </svg>
    );
  }

  if (artist === "mikapikazo") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mikaPikazoAvatar}
        alt="Mika Pikazo"
        width={size}
        height={size}
        className={cn("artist-avatar-img rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (artist === "dinoillus") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="https://pbs.twimg.com/profile_images/1705236188888457217/Sl6dGX4M_400x400.jpg"
        alt="DINO"
        width={size}
        height={size}
        className={cn("artist-avatar-img rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (artist === "lam") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 30 42"
        fill="#ed242d"
        className={cn("artist-icon-svg", className)}
        aria-hidden="true"
      >
        <path d="M18 0 1 23h12l-3 19 19-27H17L18 0Z" />
      </svg>
    );
  }

  if (artist === "dolman") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={dolmanArt.avatar}
        alt="Dolman"
        width={size}
        height={size}
        className={cn("artist-avatar-img rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (artist === "tatamipi") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="https://r11r.jp/wp-content/uploads/R11R_tatamipi_01-tatami-ozashiki.png"
        alt="tatamipi"
        width={size}
        height={size}
        className={cn("artist-avatar-img rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (artist === "askziye") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/images/askziye/avatar.jpg"
        alt="ASK"
        width={size}
        height={size}
        className={cn("artist-avatar-img rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (artist === "dora") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/images/dora/avatar.jpg"
        alt="Dora"
        width={size}
        height={size}
        className={cn("artist-avatar-img rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (artist === "kaduise") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/images/kaduise/avatar.jpg"
        alt="kaduise"
        width={size}
        height={size}
        className={cn("artist-avatar-img rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (artist === "kda") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/images/kda/avatar.jpg"
        alt="K/DA"
        width={size}
        height={size}
        className={cn("artist-avatar-img rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={yoneyamaiAvatar}
      alt="Yoneyama Mai"
      width={size}
      height={size}
      className={cn("artist-avatar-img rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function currentArtist(fallback: ArtistPage = "sankobite"): ArtistPage {
  if (typeof window === "undefined") return fallback;
  const path = window.location.pathname.toLowerCase();
  if (path === "/artist/rella") return "rella";
  if (path === "/artist/sankobite") return "sankobite";
  if (path === "/artist/tamimoon" || path === "/artist/tami_moon02") return "tamimoon";
  if (path === "/artist/yoneyamai" || path === "/artist/yoneyama_mai" || path === "/artist/yoneyama") return "yoneyamai";
  if (path === "/artist/mikapikazo" || path === "/artist/mika_pikazo" || path === "/artist/mika-pikazo") return "mikapikazo";
  if (path === "/artist/dinoillus" || path === "/artist/dinuillus" || path === "/artist/dino_illus" || path === "/artist/dino") return "dinoillus";
  if (path === "/artist/lam" || path === "/artist/lam-illustrator" || path === "/artist/ramdayo1122") return "lam";
  if (path === "/artist/dolman" || path === "/artist/dolman-illustrator" || path === "/artist/dolman4878") return "dolman";
  if (path === "/artist/tatamipi" || path === "/artist/tatamipi-illustrator") return "tatamipi";
  if (path === "/artist/askziye" || path === "/artist/ask" || path === "/artist/askzy") return "askziye";
  if (path === "/artist/dora" || path === "/artist/dora_xxi" || path === "/artist/dora-illustrator") return "dora";
  if (path === "/artist/kaduise" || path === "/artist/kaduise-illustrator") return "kaduise";
  if (path === "/artist/kda" || path === "/artist/kda-comeback" || path === "/artist/k_da" || path === "/artist/firestarter") return "kda";

  const param = new URLSearchParams(window.location.search).get("artist")?.toLowerCase();
  if (param === "rella") return "rella";
  if (param === "tamimoon" || param === "tami_moon02") return "tamimoon";
  if (param === "yoneyamai" || param === "yoneyama_mai" || param === "yoneyama") return "yoneyamai";
  if (param === "mikapikazo" || param === "mika_pikazo" || param === "mika-pikazo") return "mikapikazo";
  if (param === "dinoillus" || param === "dinuillus" || param === "dino_illus" || param === "dino") return "dinoillus";
  if (param === "lam" || param === "lam-illustrator" || param === "ramdayo1122") return "lam";
  if (param === "dolman" || param === "dolman-illustrator" || param === "dolman4878") return "dolman";
  if (param === "tatamipi" || param === "tatamipi-illustrator") return "tatamipi";
  if (param === "askziye" || param === "ask" || param === "askzy") return "askziye";
  if (param === "dora" || param === "dora_xxi" || param === "dora-illustrator") return "dora";
  if (param === "kaduise" || param === "kaduise-illustrator") return "kaduise";
  if (param === "kda" || param === "kda-comeback" || param === "firestarter") return "kda";
  if (param === "sankobite") return "sankobite";

  try {
    const saved = window.localStorage.getItem("studioneo_active_artist");
    if (
      saved === "sankobite" ||
      saved === "rella" ||
      saved === "tamimoon" ||
      saved === "yoneyamai" ||
      saved === "mikapikazo" ||
      saved === "dinoillus" ||
      saved === "lam" ||
      saved === "dolman" ||
      saved === "tatamipi" ||
      saved === "askziye" ||
      saved === "dora" ||
      saved === "kaduise" ||
      saved === "kda"
    ) {
      return saved;
    }
  } catch {
    /* ignore storage errors */
  }
  return fallback;
}

export function setArtistUrl(artist: ArtistPage, workSlugOrId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("studioneo_active_artist", artist);
  } catch {
    /* ignore storage errors */
  }
  const url = new URL(window.location.href);
  if (url.pathname.startsWith("/artist/")) {
    url.pathname = "/";
  }
  url.searchParams.set("artist", artist);
  if (workSlugOrId) {
    url.searchParams.set("work", workSlugOrId);
  } else {
    url.searchParams.delete("work");
  }
  url.hash = "";
  if (url.href !== window.location.href) {
    window.history.pushState(null, "", url.toString());
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  window.dispatchEvent(new CustomEvent("studioneo:artist-change", { detail: { artist } }));
}

export function ArtistLink({
  artist,
  children,
  className,
  current,
  onNavigate,
}: {
  artist: ArtistPage;
  children: ReactNode;
  className?: string;
  current?: boolean;
  onNavigate?: () => void;
}) {
  const href = `/?artist=${artist}`;

  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setArtistUrl(artist, null);
    onNavigate?.();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <a href={href} className={className} aria-current={current ? "page" : undefined} onClick={navigate}>
      {children}
    </a>
  );
}

export function ArtistSwitcher({
  current,
  theme = "sankobite",
}: {
  current: ArtistPage;
  theme?: ArtistPage;
}) {
  const themeClass =
    theme === "rella"
      ? "artist-switcher--rella"
      : theme === "tamimoon"
      ? "artist-switcher--tamimoon"
      : theme === "yoneyamai"
      ? "artist-switcher--yoneyamai"
      : theme === "mikapikazo"
      ? "artist-switcher--mikapikazo"
      : "artist-switcher--sankobite";

  return (
    <nav
      aria-label="Artist pages"
      className={cn("artist-switcher flex shrink-0 items-center", themeClass)}
    >
      {(["sankobite", "rella", "tamimoon", "yoneyamai", "mikapikazo", "dinoillus", "lam", "dolman", "tatamipi"] as const).map((artist) => (
        <ArtistLink
          key={artist}
          artist={artist}
          current={artist === current}
          className={cn("artist-switcher__link", artist === current && "is-active")}
        >
          {ARTIST_LABELS[artist]}
        </ArtistLink>
      ))}
    </nav>
  );
}
