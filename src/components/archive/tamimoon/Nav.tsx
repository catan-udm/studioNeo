"use client";

import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { useActiveSection, useScrollProgress } from "@/lib/tamimoonMotion";
import { ArtistSwitcher } from "../ArtistSwitcher";
import { Close, Plus } from "./Icons";

const links = [
  { id: "about", label: "About", jp: "紹介" },
  { id: "anatomy", label: "Anatomy", jp: "描き方" },
  { id: "models", label: "Models", jp: "モデル" },
  { id: "colour", label: "Colour", jp: "色" },
  { id: "works", label: "Works", jp: "作品" },
  { id: "clients", label: "Clients", jp: "実績" },
  { id: "history", label: "History", jp: "沿革" },
  { id: "contact", label: "Contact", jp: "連絡" },
];
const ids = ["cover", ...links.map((l) => l.id)];

export default function Nav() {
  const progress = useScrollProgress();
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[70] h-[3px]">
        <div className="h-full origin-left bg-vermil" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* difference blend keeps the nav legible over every colour field */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[65] text-white mix-blend-difference">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between px-4 py-4 sm:px-8">
          <div className="pointer-events-auto flex items-center gap-4">
            <button
              onClick={() => go("cover")}
              className="text-[22px] leading-none font-black tracking-[-0.04em]"
              style={{ fontStretch: "125%" }}
              aria-label="tamimoon — back to top"
            >
              tamimoon
            </button>
            <ArtistSwitcher current="tamimoon" theme="tamimoon" />
          </div>

          <nav className="pointer-events-auto hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className={cn(
                  "tracked-b relative px-3 py-2 text-[10.5px] transition-opacity",
                  active === l.id ? "opacity-100" : "opacity-55 hover:opacity-100",
                )}
              >
                {l.label}
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-0.5 h-[2px] origin-left bg-current transition-transform duration-500",
                    active === l.id ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            ))}
          </nav>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-current lg:hidden"
          >
            {open ? <Close /> : <Plus className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-[64] flex flex-col justify-center bg-lav px-6 transition-all duration-500 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ul>
          {links.map((l, i) => (
            <li key={l.id} className="border-b border-ink/15">
              <button
                onClick={() => go(l.id)}
                className="flex w-full items-baseline gap-4 py-3.5 text-left transition-all duration-500"
                style={{
                  transform: open ? "none" : "translateY(16px)",
                  opacity: open ? 1 : 0,
                  transitionDelay: `${i * 40}ms`,
                }}
              >
                <span className="tracked-b text-[10px] text-vermil">{String(i + 1).padStart(2, "0")}</span>
                <span className="wide text-[34px] leading-none">{l.label}</span>
                <span className="jp ml-auto text-xs text-ink/50">{l.jp}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
