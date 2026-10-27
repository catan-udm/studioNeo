"use client";

import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/utils/cn";

export type ArtistPage = "sankobite" | "rella";

export function currentArtist(fallback: ArtistPage = "sankobite"): ArtistPage {
  if (typeof window === "undefined") return fallback;
  const path = window.location.pathname.toLowerCase();
  if (path === "/artist/rella") return "rella";
  if (path === "/artist/sankobite") return "sankobite";
  return new URLSearchParams(window.location.search).get("artist") === "rella"
    ? "rella"
    : fallback;
}

export function setArtistUrl(artist: ArtistPage, workSlugOrId?: string | null) {
  if (typeof window === "undefined") return;
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
  const rellaTheme = theme === "rella";
  return (
    <nav
      aria-label="Artist pages"
      className={cn(
        "artist-switcher flex shrink-0 items-center",
        rellaTheme ? "artist-switcher--rella" : "artist-switcher--sankobite"
      )}
    >
      {(["sankobite", "rella"] as const).map((artist) => (
        <ArtistLink
          key={artist}
          artist={artist}
          current={artist === current}
          className={cn("artist-switcher__link", artist === current && "is-active")}
        >
          {artist === "sankobite" ? "Sankobite" : "Rella"}
        </ArtistLink>
      ))}
    </nav>
  );
}
