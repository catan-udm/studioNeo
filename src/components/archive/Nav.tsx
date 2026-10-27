"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Images,
  Sparkles,
  CalendarDays,
  User,
  ExternalLink,
  Menu,
  X,
  Heart,
  Layers,
  Upload,
  Crown,
  Mail,
  LogIn,
  LayoutDashboard,
  ChevronDown,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { links, logoMark } from "@/data";
import { getAuthenticatedSession } from "@/lib/clientAuthCache";
import { useSavedWorks } from "@/lib/archiveFavorites";
import { ArtistSwitcher } from "./ArtistSwitcher";

const NAV = [
  { href: "#works", label: "Works", jp: "作品", icon: Images },
  { href: "#featured", label: "Featured", jp: "特集", icon: Sparkles },
  { href: "#timeline", label: "Timeline", jp: "年表", icon: CalendarDays },
  { href: "#about", label: "About", jp: "紹介", icon: User },
];

const STUDIO_LINKS = [
  { href: "/gallery", label: "Atelier Gallery", jp: "ギャラリー", icon: Layers },
  { href: "/projects", label: "Projects & Cuts", jp: "企画", icon: FolderKanban },
  { href: "/studio/upload", label: "Creator Studio", jp: "投稿", icon: Upload },
  { href: "/collection", label: "Saved Vault", jp: "保存", icon: Heart },
  { href: "/membership", label: "Membership", jp: "会員", icon: Crown },
  { href: "/contact", label: "Commissions & Contact", jp: "連絡", icon: Mail },
];

export function Nav({ onOpenSaved }: { onOpenSaved?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [studioMenuOpen, setStudioMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const studioMenuRef = useRef<HTMLDivElement>(null);
  const { count: savedCount } = useSavedWorks();

  useEffect(() => {
    getAuthenticatedSession()
      .then((session) => {
        if (session?.authenticated) {
          setAuthenticated(true);
          setUserEmail(session.subscriber?.email ?? null);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 24);
      const mid = window.scrollY + window.innerHeight * 0.35;
      let current = "";
      NAV.forEach(({ href }) => {
        const el = document.querySelector(href) as HTMLElement | null;
        if (el && el.offsetTop <= mid) current = href;
      });
      setActive(current);
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (studioMenuRef.current && !studioMenuRef.current.contains(e.target as Node)) {
        setStudioMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStudioMenuOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-all duration-300 border-b-[3px]",
        scrolled || open ? "bg-paper/95 backdrop-blur border-ink py-2" : "bg-transparent border-transparent py-4"
      )}
    >
      <div className="mx-auto max-w-7xl px-3 md:px-8 flex items-center justify-between gap-2 lg:gap-4">
        <a href="#top" className="flex items-center gap-2.5 group" onClick={() => setOpen(false)}>
          <span className="w-9 h-9 bg-white border-[3px] border-ink rounded-full overflow-hidden shadow-[2px_3px_0_rgba(38,49,63,0.9)] group-hover:rotate-12 transition-transform">
            <img src={logoMark} alt="sankobite logo mark" className="w-full h-full object-cover" />
          </span>
          <span className="font-display text-sm sm:text-lg tracking-wide uppercase max-[360px]:hidden">
            sanko<span className="text-miku-deep">bite</span>
          </span>
          <span className="hidden xl:inline font-dot text-xs text-ink-soft mt-1">/ tribute archive</span>
        </a>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Sections">
          {NAV.map(({ href, label, jp, icon: Icon }) => {
            const isActive = active === href;
            return (
              <a
                key={href}
                href={href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 font-bold text-sm rounded-full border-2 transition-colors",
                  isActive
                    ? "border-ink bg-miku shadow-[2px_2px_0_rgba(38,49,63,0.9)]"
                    : "border-transparent hover:border-ink hover:bg-sun"
                )}
              >
                <Icon className="w-4 h-4" aria-hidden />
                {label}
                <span className={cn("font-dot text-[10px]", isActive ? "text-ink/70" : "text-ink-soft")}>{jp}</span>
              </a>
            );
          })}

          {/* Studio Neo Platform Dropdown */}
          <div className="relative ml-1" ref={studioMenuRef}>
            <button
              type="button"
              onClick={() => setStudioMenuOpen((v) => !v)}
              aria-expanded={studioMenuOpen}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 font-bold text-sm rounded-full border-2 transition-colors",
                studioMenuOpen
                  ? "border-ink bg-sun shadow-[2px_2px_0_rgba(38,49,63,0.9)]"
                  : "border-ink/40 bg-white/80 hover:border-ink hover:bg-sun"
              )}
            >
              <Layers className="w-3.5 h-3.5 text-miku-deep" aria-hidden />
              studioNeo
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", studioMenuOpen && "rotate-180")} aria-hidden />
            </button>

            {studioMenuOpen && (
              <div className="absolute right-0 mt-2.5 w-64 bg-paper border-[3px] border-ink shadow-[6px_6px_0_rgba(38,49,63,0.9)] p-2 z-50">
                <p className="font-dot text-[10px] tracking-[0.2em] text-magenta-deep px-2.5 py-1 uppercase">
                  ▸ STUDIO NEO PLATFORM
                </p>
                <div className="grid gap-1 mt-1">
                  {STUDIO_LINKS.map(({ href, label, jp, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setStudioMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold border-2 border-transparent hover:border-ink hover:bg-sun transition-colors"
                    >
                      <Icon className="w-4 h-4 text-miku-deep shrink-0" aria-hidden />
                      <span>{label}</span>
                      <span className="font-dot text-[10px] text-ink-soft ml-auto">{jp}</span>
                    </Link>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t-2 border-ink/15">
                  <Link
                    href={authenticated ? "/dashboard" : "/login"}
                    onClick={() => setStudioMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-ink text-paper font-display uppercase text-xs px-3 py-2 border-2 border-ink hover:bg-magenta transition-colors"
                  >
                    {authenticated ? (
                      <>
                        <LayoutDashboard className="w-3.5 h-3.5" aria-hidden />
                        {userEmail ? `Dashboard (${userEmail.split("@")[0]})` : "Dashboard"}
                      </>
                    ) : (
                      <>
                        <LogIn className="w-3.5 h-3.5" aria-hidden />
                        Sign In / Passkey
                      </>
                    )}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ArtistSwitcher current="sankobite" />

          {savedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                onOpenSaved?.();
                const el = document.querySelector("#works");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              title="View saved loops"
              className="hidden sm:inline-flex items-center gap-1.5 bg-white text-ink font-bold text-xs px-2.5 py-1.5 border-2 border-ink shadow-[2px_2px_0_var(--color-magenta)] hover:bg-sun transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-magenta fill-magenta" aria-hidden />
              <span className="font-display">{savedCount}</span>
            </button>
          )}

          <Link
            href={authenticated ? "/dashboard" : "/login"}
            className="hidden md:inline-flex items-center gap-1.5 bg-white text-ink font-bold text-xs px-3 py-2 border-[2px] border-ink shadow-[3px_3px_0_rgba(38,49,63,0.25)] hover:bg-sun transition-all"
          >
            {authenticated ? (
              <>
                <LayoutDashboard className="w-3.5 h-3.5 text-miku-deep" aria-hidden />
                <span>Dashboard</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-magenta-deep" aria-hidden />
                <span>Sign In</span>
              </>
            )}
          </Link>

          <a
            href={links.pixiv}
            target="_blank"
            rel="noreferrer"
            className="hidden xl:flex items-center gap-1.5 bg-ink text-paper font-bold text-sm px-4 py-2 border-[3px] border-ink shadow-[3px_3px_0_var(--color-miku)] hover:shadow-[1px_1px_0_var(--color-miku)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Pixiv <ExternalLink className="w-3.5 h-3.5" aria-hidden />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="lg:hidden w-10 h-10 grid place-items-center bg-white border-[3px] border-ink shadow-[3px_3px_0_rgba(38,49,63,0.9)] active:translate-y-0.5 transition-transform"
          >
            {open ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      <div
        className={cn(
          "lg:hidden overflow-y-auto transition-[max-height,opacity] duration-300 border-t-[3px] border-ink/0",
          open ? "max-h-[82vh] opacity-100 mt-2 border-ink/15" : "max-h-0 opacity-0"
        )}
      >
        <nav className="px-4 py-4 grid gap-2" aria-label="Sections (mobile)">
          {NAV.map(({ href, label, jp, icon: Icon }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 font-bold border-[3px] border-ink bg-white shadow-[3px_3px_0_rgba(38,49,63,0.25)]",
                active === href && "bg-miku shadow-[3px_3px_0_var(--color-ink)]"
              )}
            >
              <Icon className="w-4.5 h-4.5" aria-hidden />
              {label}
              <span className="font-dot text-[11px] text-ink-soft ml-auto">{jp}</span>
            </a>
          ))}

          <p className="font-dot text-[10px] tracking-[0.2em] text-magenta-deep mt-2 px-1 uppercase">
            ▸ STUDIO NEO PLATFORM
          </p>
          <div className="grid grid-cols-2 gap-2">
            {STUDIO_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold border-[2px] border-ink bg-paper-2 hover:bg-sun"
              >
                <Icon className="w-4 h-4 text-miku-deep shrink-0" aria-hidden />
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <Link
              href={authenticated ? "/dashboard" : "/login"}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 font-display uppercase text-xs bg-miku text-ink border-[3px] border-ink"
            >
              {authenticated ? (
                <>
                  <LayoutDashboard className="w-4 h-4" aria-hidden /> Dashboard
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" aria-hidden /> Sign In
                </>
              )}
            </Link>
            <a
              href={links.pixiv}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 font-display uppercase text-xs bg-ink text-paper border-[3px] border-ink"
            >
              Pixiv <ExternalLink className="w-4 h-4" aria-hidden />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
