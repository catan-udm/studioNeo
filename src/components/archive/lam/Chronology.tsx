import { useEffect, useRef, useState } from "react";
import { Arrow, Bolt, Scramble } from "./ui";

type Entry = {
  year: string;
  title: string;
  detail: string;
  tag: string;
};

const entries: Entry[] = [
  {
    year: "2018",
    title: "GOES INDEPENDENT",
    detail:
      "Leaves studio work to freelance as LAM, building the ramdayo handle and the LAMLAB circle around original characters.",
    tag: "ORIGIN",
  },
  {
    year: "2020",
    title: "VISIONS 2021",
    detail:
      "Featured in the inaugural pixiv ILLUSTRATORS BOOK, launched with an exhibition in Ikebukuro.",
    tag: "IN PRINT",
  },
  {
    year: "2020",
    title: "KUREIJI OLLIE",
    detail:
      "Character design for hololive Indonesia's first generation — a design that would go on to be drawn by fans worldwide.",
    tag: "CHARACTER DESIGN",
  },
  {
    year: "2021",
    title: "takt op.",
    detail:
      "Character design across the takt op. franchise, spanning television animation and the mobile game 運命は真紅き旋律の街を.",
    tag: "CHARACTER DESIGN",
  },
  {
    year: "2022",
    title: "VISIONS 2022",
    detail: "Returns to the pixiv series for a second volume, with new original work.",
    tag: "IN PRINT",
  },
  {
    year: "2023",
    title: "MAGICAL MIRAI 2023",
    detail:
      "Main visual for Hatsune Miku's flagship concert series, built on the theme of HERO — cool, stylish, unmistakably LAM.",
    tag: "KEY VISUAL",
  },
  {
    year: "2024",
    title: "IKADUCHI",
    detail:
      "First commercial art book: 182 full-colour pages of published work and original illustrations, from PIE International.",
    tag: "ART BOOK",
  },
  {
    year: "2024",
    title: "SENKYAKU BANRAI",
    detail:
      "Large-scale solo exhibition 千客万雷, running from Tokyo into Osaka with live drawing and signing events.",
    tag: "EXHIBITION",
  },
  {
    year: "2025",
    title: "BLEACH × LAM",
    detail:
      "SOUL ART SHOWCASE collaboration, while IKADUCHI reaches worldwide distribution.",
    tag: "COLLABORATION",
  },
  {
    year: "2025",
    title: "DemVAMPS",
    detail:
      "Directorial debut on an original short anime project — original work, script, character designs and chief animation direction, plus the VAMPY music video.",
    tag: "ANIMATION",
  },
  {
    year: "2026",
    title: "VISIONS 2027",
    detail:
      "Draws the cover illustration for the series' 170-creator volume, with 169 of them appearing in VISIONS for the first time.",
    tag: "COVER ART",
  },
  {
    year: "NOW",
    title: "IN DEMAND",
    detail:
      "Current and recent commissions include Ado モンストロ, NIGHT HIKE, 初音ミク V6 and GLOOMY meets 初音ミク.",
    tag: "ONGOING",
  },
];

const stats = [
  { value: 182, decimals: 0, suffix: "", label: "PAGES IN IKADUCHI" },
  { value: 170, decimals: 0, suffix: "", label: "CREATORS IN VISIONS 2027" },
  { value: 2, decimals: 0, suffix: "", label: "CITIES FOR THE SOLO SHOW" },
  { value: 23.2, decimals: 1, suffix: "K", label: "POSTS ON @ramdayo1122" },
];

const quotes = [
  {
    text: "Signature pop-style colors and a way of drawing human eyes and make-up that people remember.",
    source: "PIE INTERNATIONAL",
    context: "on LAM Artworks IKADUCHI",
  },
  {
    text: "Super cool and stylish — a popular illustrator known for their catchy style.",
    source: "HATSUNE MIKU OFFICIAL",
    context: "on the Magical Mirai 2023 main visual",
  },
  {
    text: "Overwhelming depictions of the eyes, and colour expression that has taken Japan and the world by storm.",
    source: "pixiv",
    context: "announcing the VISIONS 2027 cover",
  },
];

function Counter({
  value,
  decimals,
  suffix,
}: {
  value: number;
  decimals: number;
  suffix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() =>
    decimals ? "0.0" : "0",
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      setDisplay(value.toFixed(decimals));
      return;
    }

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1300);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay((value * eased).toFixed(decimals));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, decimals]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function Chronology() {
  const sectionRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [quote, setQuote] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const fill = fillRef.current;
    if (!section || !fill) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const total = rect.height + window.innerHeight * 0.45;
      const passed = Math.min(
        Math.max(window.innerHeight * 0.72 - rect.top, 0),
        total,
      );
      fill.style.transform = `scaleY(${total > 0 ? passed / total : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const timer = window.setInterval(
      () => setQuote((current) => (current + 1) % quotes.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section aria-labelledby="years-title" className="years" id="years" ref={sectionRef}>
      <div className="years__inner page-width">
        <div className="years__heading" data-reveal>
          <p className="section-label">
            <Bolt /> <Scramble text="06 / CHRONOLOGY" />
          </p>
          <h2 id="years-title">
            EIGHT YEARS, <span>ONE VOLTAGE.</span>
          </h2>
        </div>

        <div className="years__stats" data-reveal>
          {stats.map((stat) => (
            <p key={stat.label}>
              <strong>
                <Counter decimals={stat.decimals} suffix={stat.suffix} value={stat.value} />
              </strong>
              <span>{stat.label}</span>
            </p>
          ))}
        </div>

        <div className="timeline">
          <span aria-hidden="true" className="timeline__spine">
            <span className="timeline__fill" ref={fillRef} />
          </span>

          {entries.map((entry, index) => (
            <article
              className="timeline__entry"
              data-reveal
              key={`${entry.year}-${entry.title}`}
              style={{ transitionDelay: `${(index % 3) * 70}ms` }}
            >
              <p className="timeline__year">{entry.year}</p>
              <span aria-hidden="true" className="timeline__node" />
              <div className="timeline__body">
                <p className="timeline__tag">{entry.tag}</p>
                <h3>{entry.title}</h3>
                <p>{entry.detail}</p>
              </div>
            </article>
          ))}
        </div>

        <div
          className="press"
          data-reveal
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <p className="press__label">
            <Bolt /> <span>WHAT THE PRESS SAYS</span>
          </p>
          <blockquote className="press__quote" key={quote}>
            <p>“{quotes[quote].text}”</p>
            <footer>
              <cite>{quotes[quote].source}</cite>
              <span>{quotes[quote].context}</span>
            </footer>
          </blockquote>
          <div className="press__dots">
            {quotes.map((item, index) => (
              <button
                aria-current={index === quote}
                aria-label={`Show quote from ${item.source}`}
                className={index === quote ? "is-active" : undefined}
                key={item.source}
                onClick={() => setQuote(index)}
                type="button"
              >
                {String(index + 1).padStart(2, "0")}
              </button>
            ))}
            <a href="https://x.com/ramdayo1122" rel="noreferrer" target="_blank">
              <span>FOLLOW @ramdayo1122</span>
              <Arrow />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
