"use client";

import { useEffect, useRef, useState } from "react";
import FlipBook from "./FlipBook";
import PaletteLab from "./PaletteLab";
import Chronology from "./Chronology";
import { Cursor, SectionRail } from "./Chrome";
import { Intro, ScrollSpyNav, Shortcuts, UtilityBar } from "./Panels";
import { Arrow, Bolt, FallbackImage } from "./ui";
import "./lam.css";

type Artwork = {
  src: string;
  fallbackSrc: string;
  alt: string;
  label: string;
  detail: string;
  className: string;
};

const disciplines = [
  {
    title: "CHARACTER DESIGN",
    copy: "Faces, silhouettes, and details built with presence — a whole personality in a single frame.",
    theme: "red",
  },
  {
    title: "KEY VISUALS",
    copy: "One decisive image for campaigns, events, and stories that need to feel like an entire world.",
    theme: "cyan",
  },
  {
    title: "ILLUSTRATION",
    copy: "Editorial, book, and cover artwork driven by pop color, graphic composition, and expressive eyes.",
    theme: "acid",
  },
  {
    title: "COLLABORATION",
    copy: "Music, games, and fashion meet illustration in unexpected, high-voltage crossovers.",
    theme: "paper",
  },
] as const;

const collaborations = [
  { title: "takt op.", meta: "Character design" },
  { title: "Hatsune Miku", meta: "Magical Mirai 2023 / Main visual" },
  { title: "Kureiji Ollie", meta: "hololive Indonesia / Character design" },
  { title: "DemVAMPS", meta: "Director / Original concept" },
  { title: "Project SEKAI", meta: "Selected work" },
  { title: "Arcaea", meta: "Selected work" },
  { title: "BLEACH × LAM", meta: "SOUL ART SHOWCASE / Collaboration" },
  { title: "TOKYO CHRONOS", meta: "Selected work" },
] as const;

const artworks: Artwork[] = [
  {
    src: "/images/lam-red.jpg",
    fallbackSrc:
      "https://pie.co.jp/wp/wp-content/uploads/2024/10/d295afb78e77693a59162706f4b82a2a.jpg",
    alt: "LAM illustration of a dark-haired woman with multicolored eyes and white flowers against scarlet red.",
    label: "RED",
    detail: "The gaze / 01",
    className: "artwork--red",
  },
  {
    src: "/images/lam-serpent.jpg",
    fallbackSrc:
      "https://pie.co.jp/wp/wp-content/uploads/2024/10/99ffdda30d170d78dfd3030bded7f54f.jpg",
    alt: "LAM illustration of a green-eyed character surrounded by black serpents on a violet background.",
    label: "SERPENT",
    detail: "The gaze / 02",
    className: "artwork--serpent",
  },
  {
    src: "/images/lam-mars.jpg",
    fallbackSrc:
      "https://pie.co.jp/wp/wp-content/uploads/2024/10/f632f339422e6523c68d80d7166c0aa0.jpg",
    alt: "LAM illustration of a red-haired character in scarlet amid flames and black serpents.",
    label: "MARS",
    detail: "The gaze / 03",
    className: "artwork--mars",
  },
  {
    src: "/images/lam-yellow.jpg",
    fallbackSrc:
      "https://pie.co.jp/wp/wp-content/uploads/2024/10/0ac255d65dec89a4efddff0b35bb1817.jpg",
    alt: "LAM illustration of a tattooed figure holding a dark mask against a brilliant yellow background.",
    label: "YELLOW",
    detail: "The gaze / 04",
    className: "artwork--yellow",
  },
];

export function LamPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [heroReady, setHeroReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastArtworkButtonRef = useRef<HTMLButtonElement | null>(null);
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fallback = window.setTimeout(() => setHeroReady(true), 2400);
    const image = heroImageRef.current;
    if (image?.complete) {
      setHeroReady(true);
    } else {
      image?.addEventListener("load", () => setHeroReady(true), { once: true });
      image?.addEventListener("error", () => setHeroReady(true), { once: true });
    }
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => setHeroReady(true)).catch(() => setHeroReady(true));
    }
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
      heroRef.current?.style.setProperty("--scroll-y", String(window.scrollY));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero");
    const image = heroImageRef.current;
    if (!hero || !image) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let frame = 0;
    let target = { x: 0, y: 0 };
    const apply = () => {
      frame = 0;
      image.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) scale(1.06)`;
    };
    const onMove = (event: PointerEvent) => {
      target = {
        x: (event.clientX / window.innerWidth - 0.5) * -26,
        y: (event.clientY / window.innerHeight - 0.5) * -18,
      };
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    const onLeave = () => {
      target = { x: 0, y: 0 };
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const tiltArtwork = (event: React.PointerEvent<HTMLElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--tilt-x", `${y * -7}deg`);
    card.style.setProperty("--tilt-y", `${x * 9}deg`);
    card.style.setProperty("--glare-x", `${(x + 0.5) * 100}%`);
    card.style.setProperty("--glare-y", `${(y + 0.5) * 100}%`);
  };

  const resetArtwork = (event: React.PointerEvent<HTMLElement>) => {
    const card = event.currentTarget;
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  };

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.classList.add("is-visible");
        element.classList.add("is-revealed");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -35px 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const closeViewer = () => {
    setActiveIndex(null);
    requestAnimationFrame(() => lastArtworkButtonRef.current?.focus());
  };

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeViewer();
      } else if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? current : (current - 1 + artworks.length) % artworks.length,
        );
      } else if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? current : (current + 1) % artworks.length,
        );
      } else if (event.key === "Tab") {
        const controls = Array.from(
          document.querySelectorAll<HTMLButtonElement>(".viewer__dialog button"),
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex]);

  const openViewer = (index: number, button: HTMLButtonElement) => {
    lastArtworkButtonRef.current = button;
    setActiveIndex(index);
  };

  const changeArtwork = (direction: -1 | 1) => {
    setActiveIndex((current) =>
      current === null ? current : (current + direction + artworks.length) % artworks.length,
    );
  };

  const activeArtwork = activeIndex === null ? null : artworks[activeIndex];

  return (
    <div className="lam-page">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <div aria-hidden="true" className="scroll-progress">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <Intro ready={heroReady} />
      <Cursor />
      <SectionRail />
      <UtilityBar />
      <Shortcuts />
      <ScrollSpyNav />

      <main id="main">
        <section aria-labelledby="hero-title" className="hero" id="top" ref={heroRef}>
          <div className="hero__image">
            <FallbackImage
              alt="An original LAM character in red and black pointing outward with a striking red eye and fanged smile."
              fallbackSrc="https://lam-ex.com/common2/images/bg02.png"
              fetchPriority="high"
              ref={heroImageRef}
              src="/images/lam-hero.jpg"
            />
          </div>

          <header className={`header${menuOpen ? " is-open" : ""}`}>
            <a aria-label="LAM, back to top" className="header__brand" href="#top" onClick={() => setMenuOpen(false)}>
              <span>LAM</span>
              <Bolt />
            </a>

            <p className="header__caption">ILLUSTRATOR / CHARACTER DESIGNER</p>

            <button
              aria-controls="primary-navigation"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              className="header__menu"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <span />
              <span />
            </button>

            <nav aria-label="Main navigation" className="header__nav" id="primary-navigation">
              <a href="#works" onClick={() => setMenuOpen(false)}>
                WORKS
              </a>
              <a href="#practice" onClick={() => setMenuOpen(false)}>
                PRACTICE
              </a>
              <a href="#profile" onClick={() => setMenuOpen(false)}>
                PROFILE
              </a>
              <a href="#color" onClick={() => setMenuOpen(false)}>
                COLOR
              </a>
              <a href="#artbook" onClick={() => setMenuOpen(false)}>
                BOOK
              </a>
              <a href="#years" onClick={() => setMenuOpen(false)}>
                YEARS
              </a>
              <a href="#exhibition" onClick={() => setMenuOpen(false)}>
                SHOW
              </a>
              <a href="#contact" onClick={() => setMenuOpen(false)}>
                CONTACT
              </a>
              <a className="header__nav-x" href="https://x.com/ramdayo1122" rel="noreferrer" target="_blank">
                X <Arrow />
              </a>
              <button
                aria-label="Show keyboard shortcuts"
                className="header__keys"
                onClick={() => document.dispatchEvent(new CustomEvent("lam:shortcuts"))}
                type="button"
              >
                <kbd>?</kbd>
              </button>
            </nav>
          </header>

          <div className="hero__content page-width">
            <div className="hero__copy">
              <p className="hero__japanese" lang="ja">
                イラストレーター / キャラクターデザイナー
              </p>
              <h1 className="hero__wordmark" id="hero-title">
                LAM<span aria-hidden="true">.</span>
              </h1>
              <div className="hero__text">
                <p className="hero__headline">
                  A WORLD THAT <span>LOOKS BACK.</span>
                </p>
                <p className="hero__description">
                  Pop-bright color. Fearless characters. Eyes impossible to forget.
                </p>
              </div>
              <div className="hero__actions">
                <a className="hero__primary-link" href="#works">
                  <span>EXPLORE THE WORK</span>
                  <Arrow direction="right" />
                </a>
                <a
                  className="hero__secondary-link"
                  href="https://x.com/ramdayo1122"
                  rel="noreferrer"
                  target="_blank"
                >
                  @ramdayo1122 <Arrow />
                </a>
              </div>
            </div>
          </div>
        </section>

        <div aria-hidden="true" className="signal-strip">
          <div className="signal-strip__track">
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index}>
                <Bolt /> COLOR <i>/</i> CHARACTER <i>/</i> IMPACT
              </span>
            ))}
          </div>
        </div>

        <section aria-labelledby="works-title" className="works" id="works">
          <div className="works__intro page-width" data-reveal>
            <p className="section-label">
              <Bolt /> <span>01 / SELECTED WORKS</span>
            </p>
            <div>
              <h2 id="works-title">
                NOT MADE TO <span>BLEND IN.</span>
              </h2>
              <p className="works__description">
                Look closer. Every detail has a pulse. A selection of LAM illustrations from the
                art book <em>IKADUCHI</em>.
              </p>
            </div>
          </div>

          <div className="works__gallery page-width">
            {artworks.map((artwork, index) => (
              <figure
                className={`artwork ${artwork.className}`}
                data-reveal
                key={artwork.label}
                style={{ transitionDelay: `${index % 2 === 0 ? 0 : 110}ms` }}
              >
                <button
                  aria-label={`Open artwork ${index + 1}: ${artwork.label.toLowerCase()}`}
                  className="artwork__button"
                  onClick={(event) => openViewer(index, event.currentTarget)}
                  onPointerLeave={resetArtwork}
                  onPointerMove={tiltArtwork}
                  type="button"
                >
                  <span className="artwork__tilt">
                    <FallbackImage
                      alt={artwork.alt}
                      fallbackSrc={artwork.fallbackSrc}
                      loading="lazy"
                      src={artwork.src}
                    />
                    <span aria-hidden="true" className="artwork__glare" />
                  </span>
                  <span aria-hidden="true" className="artwork__open">
                    <Arrow />
                  </span>
                </button>
                <figcaption className="artwork__caption">
                  <span className="artwork__number">0{index + 1}</span>
                  <span className="artwork__name">{artwork.label}</span>
                  <span className="artwork__detail">{artwork.detail}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="works__credit page-width" data-reveal>
            <span>ARTWORK PREVIEWS © LAM / VIA PIE INTERNATIONAL</span>
            <a href="https://pie.co.jp/book/i/5948/?lang=asia" rel="noreferrer" target="_blank">
              EXPLORE THE ART BOOK <Arrow />
            </a>
          </div>
        </section>

        <section aria-labelledby="practice-title" className="practice" id="practice">
          <div className="practice__inner page-width">
            <div className="practice__heading" data-reveal>
              <p className="section-label">
                <Bolt /> <span>02 / PRACTICE &amp; WORLDS</span>
              </p>
              <h2 id="practice-title">
                MANY WORLDS. <span>ONE HAND.</span>
              </h2>
              <p>
                LAM moves between original characters, entire visual identities, and illustrations
                that hold the center of a project. Different formats, same electric point of view.
              </p>
            </div>

            <div className="practice__disciplines">
              {disciplines.map((discipline, index) => (
                <article
                  className={`discipline discipline--${discipline.theme}`}
                  data-reveal
                  key={discipline.title}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div className="discipline__topline">
                    <span className="discipline__number">0{index + 1}</span>
                    <Arrow />
                  </div>
                  <div>
                    <h3>{discipline.title}</h3>
                    <p>{discipline.copy}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="collaborations" data-reveal>
              <div className="collaborations__heading">
                <p className="section-label">
                  <Bolt /> <span>SELECTED COLLABORATIONS</span>
                </p>
                <a href="https://lam-illust.com/" rel="noreferrer" target="_blank">
                  FULL INDEX <Arrow />
                </a>
              </div>
              <div className="collaborations__grid">
                {collaborations.map((collaboration, index) => (
                  <div
                    className="collaboration"
                    key={collaboration.title}
                  >
                    <span className="collaboration__index">0{index + 1}</span>
                    <span className="collaboration__title">{collaboration.title}</span>
                    <span className="collaboration__meta">{collaboration.meta}</span>
                    <span aria-hidden="true" className="collaboration__mark">
                      <Arrow />
                    </span>
                  </div>
                ))}
              </div>
              <p className="collaborations__note">
                A partial index. See LAM&apos;s official portfolio for the complete archive.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="profile-title" className="profile" id="profile">
          <div className="profile__art">
            <FallbackImage
              alt="A close-up of a LAM character with vivid violet-and-gold eyes and playful pink-and-blue makeup."
              fallbackSrc="https://lam-illust.com/static/img/og.png"
              loading="lazy"
              src="/images/lam-eyes.jpg"
            />
          </div>
          <div className="profile__body">
            <div className="profile__content" data-reveal>
              <p className="section-label">
                <Bolt /> <span>03 / THE ILLUSTRATOR</span>
              </p>
              <h2 id="profile-title">
                THIS IS <span>LAM.</span>
              </h2>
              <p className="profile__description">
                A Japanese freelance illustrator and character designer making work that refuses
                to fade into the background. LAM brings pop color, expressive eyes, and a fearless
                sense of character to illustrations, visual art, and book covers.
              </p>
              <p className="profile__credits">
                SELECTED WORK <span>takt op. / Hatsune Miku Magical Mirai 2023 / IKADUCHI</span>
              </p>
              <a
                className="profile__link"
                href="https://lam-illust.com/"
                rel="noreferrer"
                target="_blank"
              >
                VISIT THE OFFICIAL PORTFOLIO <Arrow />
              </a>
            </div>
          </div>
        </section>

        <PaletteLab />

        <FlipBook />

        <Chronology />

        <section aria-labelledby="exhibition-title" className="exhibition" id="exhibition">
          <div className="exhibition__inner page-width">
            <div className="exhibition__main" data-reveal>
              <p className="section-label">
                <Bolt /> <span>07 / SOLO EXHIBITION</span>
              </p>
              <p aria-hidden="true" className="exhibition__kanji" lang="ja">
                千客万雷
              </p>
              <div className="exhibition__title-group">
                <p className="exhibition__kicker">LAM SOLO EXHIBITION / 2024—25</p>
                <h2 id="exhibition-title">
                  SENKYAKU <span>BANRAI.</span>
                </h2>
                <p>
                  A large-scale solo exhibition bringing LAM&apos;s characters, color, and
                  iconography into two cities across Tokyo and Osaka.
                </p>
              </div>
            </div>

            <div className="exhibition__details" data-reveal>
              <div className="exhibition__status">
                <span>ARCHIVE</span>
                <span>2 CITIES / 1 WORLD</span>
              </div>
              <article>
                <p className="exhibition__city">TOKYO</p>
                <p className="exhibition__dates">2024.11.01—12.02</p>
                <p className="exhibition__venue">
                  SPACE GALLERIA
                  <br />
                  Animate Ikebukuro 8F
                </p>
              </article>
              <article>
                <p className="exhibition__city">OSAKA</p>
                <p className="exhibition__dates">2025.01.10—02.03</p>
                <p className="exhibition__venue">
                  SPACE GRATUS
                  <br />
                  Animate Osaka Nipponbashi 3F
                </p>
              </article>
              <a className="exhibition__link" href="https://lam-ex.com/" rel="noreferrer" target="_blank">
                VISIT THE EXHIBITION SITE <Arrow />
              </a>
            </div>
          </div>
          <div aria-hidden="true" className="exhibition__band">
            <span>雷</span>
            <span>千客万雷 / LAM</span>
            <span>雷</span>
            <span>ILLUSTRATION / EXHIBITION</span>
          </div>
        </section>

        <section aria-labelledby="contact-title" className="contact" id="contact">
          <div className="contact__inner page-width">
            <div className="contact__topline" data-reveal>
              <p className="section-label">
                <Bolt /> <span>08 / CONTACT</span>
              </p>
              <p>FOR ILLUSTRATION, CHARACTER DESIGN &amp; VISUAL COLLABORATION</p>
            </div>

            <div className="contact__heading" data-reveal>
              <h2 id="contact-title">
                HAVE A WORLD <span>IN MIND?</span>
              </h2>
              <div className="contact__intro">
                <p>
                  Bring LAM a character, a world, or an idea that needs to be seen. Start with the
                  official site or reach out through LAM&apos;s social channels.
                </p>
                <a href="https://lam-illust.com/" rel="noreferrer" target="_blank">
                  OFFICIAL SITE <Arrow />
                </a>
              </div>
            </div>

            <div className="contact__actions" data-reveal>
              <a
                className="contact__primary"
                href="https://lam-illust.com/"
                rel="noreferrer"
                target="_blank"
              >
                <span>VISIT THE OFFICIAL SITE</span>
                <Arrow direction="right" />
              </a>
              <a
                className="contact__secondary"
                href="https://x.com/ramdayo1122"
                rel="noreferrer"
                target="_blank"
              >
                FOLLOW @RAMDAYO1122 <Arrow />
              </a>
            </div>

            <div className="contact__footer" data-reveal>
              <p>BASED IN JAPAN / WORKING WORLDWIDE</p>
              <nav aria-label="LAM social channels">
                <a href="https://www.instagram.com/ramdayo1122/" rel="noreferrer" target="_blank">
                  INSTAGRAM <Arrow />
                </a>
                <a href="https://www.pixiv.net/en/users/17429" rel="noreferrer" target="_blank">
                  PIXIV <Arrow />
                </a>
                <a href="https://x.com/ramdayo1122" rel="noreferrer" target="_blank">
                  X <Arrow />
                </a>
              </nav>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__inner page-width">
          <a aria-label="LAM, back to top" className="footer__brand" href="#top">
            LAM<span>.</span>
          </a>
          <div className="footer__bottom">
            <nav aria-label="Social links" className="footer__socials">
              <a href="https://x.com/ramdayo1122" rel="noreferrer" target="_blank">
                X <Arrow />
              </a>
              <a href="https://www.instagram.com/ramdayo1122/" rel="noreferrer" target="_blank">
                INSTAGRAM <Arrow />
              </a>
              <a href="https://www.pixiv.net/en/users/17429" rel="noreferrer" target="_blank">
                PIXIV <Arrow />
              </a>
            </nav>
            <p className="footer__source">
              ARTWORK © LAM. PREVIEWS VIA <a href="https://pie.co.jp/book/i/5948/?lang=asia">PIE INTERNATIONAL</a>
              {" "}AND <a href="https://lam-ex.com/">LAM SOLO EXHIBITION</a>.
            </p>
          </div>
          <div className="footer__end">
            <p>ILLUSTRATION / CHARACTER DESIGN / VISUAL WORK</p>
            <p>
              BUILT AS AN INDEPENDENT FAN PROFILE. ALL ARTWORK © LAM. PRESS A <kbd>?</kbd> FOR
              KEYBOARD SHORTCUTS.
            </p>
          </div>
        </div>
      </footer>

      {activeArtwork && activeIndex !== null && (
        <div className="viewer" onClick={closeViewer}>
          <div
            aria-label="LAM artwork viewer"
            aria-modal="true"
            className="viewer__dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="viewer__header">
              <p>
                LAM / IKADUCHI <span>0{activeIndex + 1} OF 0{artworks.length}</span>
              </p>
              <button aria-label="Close artwork viewer" onClick={closeViewer} ref={closeButtonRef} type="button">
                CLOSE <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="viewer__stage">
              <button aria-label="Previous artwork" onClick={() => changeArtwork(-1)} type="button">
                <Arrow direction="right" />
              </button>
              <FallbackImage
                alt={activeArtwork.alt}
                fallbackSrc={activeArtwork.fallbackSrc}
                key={activeArtwork.src}
                src={activeArtwork.src}
              />
              <button aria-label="Next artwork" onClick={() => changeArtwork(1)} type="button">
                <Arrow direction="right" />
              </button>
            </div>
            <p aria-live="polite" className="viewer__caption">
              <strong>{activeArtwork.label}</strong>
              <span>ILLUSTRATION © LAM</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LamPage;
