import { useCallback, useEffect, useState } from "react";
import { Arrow, Bolt, FallbackImage, Scramble } from "./ui";

export type Palette = {
  id: string;
  name: string;
  source: string;
  thumb: string;
  thumbFallback: string;
  colors: {
    ink: string;
    paper: string;
    red: string;
    cyan: string;
    acid: string;
  };
};

/**
 * Every palette is lifted from a real LAM work, so re-skinning the site is
 * also a way of browsing the colour logic behind each piece.
 */
export const palettes: Palette[] = [
  {
    id: "ikaduchi",
    name: "IKADUCHI",
    source: "Scarlet / cyan / acid — the art book's spine",
    thumb: "/images/lam-red.jpg",
    thumbFallback:
      "https://pie.co.jp/wp/wp-content/uploads/2024/10/d295afb78e77693a59162706f4b82a2a-1000x742.jpg",
    colors: { ink: "#0d0c10", paper: "#f4f0e8", red: "#ed242d", cyan: "#4be0dc", acid: "#eff23c" },
  },
  {
    id: "serpent",
    name: "SERPENT",
    source: "Violet field, green iris, gold scale",
    thumb: "/images/lam-serpent.jpg",
    thumbFallback:
      "https://pie.co.jp/wp/wp-content/uploads/2024/10/99ffdda30d170d78dfd3030bded7f54f-1000x742.jpg",
    colors: { ink: "#120d1d", paper: "#ece6f4", red: "#7b46e8", cyan: "#3ddc84", acid: "#ffd23f" },
  },
  {
    id: "flame",
    name: "FLAME",
    source: "Ember red against cooled teal",
    thumb: "/images/lam-mars.jpg",
    thumbFallback:
      "https://pie.co.jp/wp/wp-content/uploads/2024/10/f632f339422e6523c68d80d7166c0aa0-1000x742.jpg",
    colors: { ink: "#150c09", paper: "#f7ece4", red: "#ff4d17", cyan: "#16b8c4", acid: "#ffc20e" },
  },
  {
    id: "sun",
    name: "SUN",
    source: "Yellow mask, inked green, hot signal",
    thumb: "/images/lam-yellow.jpg",
    thumbFallback:
      "https://pie.co.jp/wp/wp-content/uploads/2024/10/0ac255d65dec89a4efddff0b35bb1817-1000x742.jpg",
    colors: { ink: "#17150c", paper: "#f7f2dd", red: "#e8452c", cyan: "#2f9e6b", acid: "#ffdf2e" },
  },
  {
    id: "visions",
    name: "VISIONS 2027",
    source: "Candy pop from the cover commission",
    thumb: "/images/book-visions2027-cover.jpg",
    thumbFallback:
      "https://img.kai-you.net/storage/2026/07/dcd31f09-f36d-46fd-9250-63574e72f764/main/71yleIvsKXL._SL1500_.webp",
    colors: { ink: "#14071c", paper: "#f6e9f2", red: "#ff2f87", cyan: "#33d6ff", acid: "#ffe14d" },
  },
];

export function applyPalette(palette: Palette) {
  const root = document.documentElement;
  const { ink, paper, red, cyan, acid } = palette.colors;
  root.style.setProperty("--ink", ink);
  root.style.setProperty("--paper", paper);
  root.style.setProperty("--red", red);
  root.style.setProperty("--cyan", cyan);
  root.style.setProperty("--acid", acid);
  root.style.setProperty("--night", ink);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", ink);
}

export default function PaletteLab() {
  const [activeId, setActiveId] = useState(palettes[0].id);
  const [wipe, setWipe] = useState<{ key: number; color: string } | null>(null);
  const active = palettes.find((palette) => palette.id === activeId) ?? palettes[0];

  const select = useCallback((palette: Palette) => {
    setActiveId(palette.id);
    applyPalette(palette);
    setWipe({ key: Date.now(), color: palette.colors.red });
  }, []);

  useEffect(() => () => setWipe(null), []);

  return (
    <section aria-labelledby="color-title" className="lab" id="color">
      {wipe && (
        <span
          aria-hidden="true"
          className="lab__wipe"
          key={wipe.key}
          onAnimationEnd={() => setWipe(null)}
          style={{ background: wipe.color }}
        />
      )}

      <div className="lab__inner page-width">
        <div className="lab__heading" data-reveal>
          <p className="section-label">
            <Bolt /> <Scramble text="04 / COLOUR LAB" />
          </p>
          <h2 id="color-title">
            PICK A <span>COLOUR.</span>
          </h2>
          <p className="lab__blurb">
            LAM&apos;s work is built on hard, saturated colour — scarlet against cyan, acid yellow
            against ink. These five palettes are pulled straight from the artwork. Choose one and
            the whole site repaints.
          </p>
        </div>

        <div className="lab__rack" role="group" aria-label="Colour palettes from LAM's work">
          {palettes.map((palette) => {
            const isActive = palette.id === activeId;
            return (
              <button
                aria-pressed={isActive}
                className={`swatch${isActive ? " is-active" : ""}`}
                key={palette.id}
                onClick={() => select(palette)}
                type="button"
              >
                <span className="swatch__thumb">
                  <FallbackImage
                    alt=""
                    aria-hidden="true"
                    fallbackSrc={palette.thumbFallback}
                    loading="lazy"
                    src={palette.thumb}
                  />
                  <span aria-hidden="true" className="swatch__bolt">
                    <Bolt />
                  </span>
                </span>
                <span className="swatch__chips" aria-hidden="true">
                  <i style={{ background: palette.colors.red }} />
                  <i style={{ background: palette.colors.cyan }} />
                  <i style={{ background: palette.colors.acid }} />
                  <i style={{ background: palette.colors.ink }} />
                </span>
                <span className="swatch__name">{palette.name}</span>
                <span className="swatch__state">{isActive ? "ACTIVE" : "APPLY"}</span>
              </button>
            );
          })}
        </div>

        <div className="lab__readout" data-reveal>
          <div className="lab__bars" aria-hidden="true">
            <span style={{ background: active.colors.red }} />
            <span style={{ background: active.colors.cyan }} />
            <span style={{ background: active.colors.acid }} />
            <span style={{ background: active.colors.ink }} />
            <span style={{ background: active.colors.paper }} />
          </div>
          <div className="lab__meta">
            <p className="lab__now">
              NOW SHOWING <strong>{active.name}</strong>
            </p>
            <p className="lab__source">{active.source}</p>
            <dl className="lab__hexes">
              {(["red", "cyan", "acid", "ink", "paper"] as const).map((slot) => (
                <div key={slot}>
                  <dt>{slot.toUpperCase()}</dt>
                  <dd>
                    <i aria-hidden="true" style={{ background: active.colors[slot] }} />
                    {active.colors[slot]}
                  </dd>
                </div>
              ))}
            </dl>
            <button
              className="lab__reset"
              disabled={activeId === palettes[0].id}
              onClick={() => select(palettes[0])}
              type="button"
            >
              <span>RESET TO IKADUCHI</span>
              <Arrow direction="right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
