"use client";

import { useMemo, useState } from "react";
import { Lightbox } from "./components/Lightbox";
import {
  aboutArt,
  agencyProfile,
  altFor,
  appearances,
  chronology,
  commissions,
  currently,
  details,
  encounter,
  facts,
  heroArt,
  instagram,
  interview,
  policy,
  principles,
  quotes,
  sections,
  skeb,
  stats,
  ticker,
  works,
  xProfile,
  type Work,
} from "./data";
import {
  useActiveSection,
  useCountUp,
  useInterval,
  useReveal,
  useScrollProgress,
} from "./hooks";
import { ArrowDown, ArrowUp, Reveal, SectionRow, Wordmark } from "./ui";
import "./tatamipi.css";

function WorkTile({
  work,
  index,
  total,
  onOpen,
  onFail,
}: {
  work: Work;
  index: number;
  total: number;
  onOpen: () => void;
  onFail: () => void;
}) {
  const { setRef, shown } = useReveal<HTMLButtonElement>(0.1);
  return (
    <button
      ref={setRef}
      className={`work-item ${work.wide ? "is-wide" : ""} reveal ${shown ? "is-shown" : ""}`.trim()}
      style={{ transitionDelay: `${(index % 3) * 70}ms` }}
      type="button"
      onClick={onOpen}
      aria-label={`Open plate ${work.plate}, ${index + 1} of ${total}`}
    >
      <img src={work.image} alt={altFor(work)} loading="lazy" onError={onFail} />
      <span className="work-caption">
        <span className="work-number">{work.plate}</span>
        {work.note}
      </span>
    </button>
  );
}

function Stat({ value, label, pad = 2 }: { value: number; label: string; pad?: number }) {
  const { setRef, shown } = useReveal<HTMLDivElement>(0.4);
  const counted = useCountUp(value, shown, 1100);
  return (
    <div className="stat" ref={setRef}>
      <span className="stat-value">{String(counted).padStart(pad, "0")}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function Words() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const quote = quotes[index];

  useInterval(
    () => setIndex((current) => (current + 1) % quotes.length),
    paused ? null : 7000,
  );

  return (
    <div
      className="words-stage"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") setIndex((c) => (c + 1) % quotes.length);
        if (event.key === "ArrowLeft") setIndex((c) => (c - 1 + quotes.length) % quotes.length);
      }}
    >
      <blockquote className="quote" key={index}>
        <p className="quote-ja" lang="ja">
          {quote.ja}
        </p>
        <p className="quote-en">{quote.en}</p>
        <footer className="quote-cite">
          <a href={quote.href} target="_blank" rel="noreferrer">
            {quote.source} <ArrowUp />
          </a>
        </footer>
      </blockquote>

      <div className="quote-dots" role="group" aria-label="Choose a quote">
        {quotes.map((item, i) => (
          <button
            key={item.en}
            type="button"
            aria-current={i === index}
            aria-label={`Quote ${i + 1} of ${quotes.length}`}
            className={`dot ${i === index ? "is-active" : ""}`}
            onClick={() => setIndex(i)}
          >
            <span className="dot-fill" key={i === index ? `${item.en}-run` : item.en} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function TatamipiPage() {
  const [viewer, setViewer] = useState<{ work: Work; pool: Work[] } | null>(null);
  const [missing, setMissing] = useState<ReadonlySet<string>>(new Set());

  const progress = useScrollProgress();
  const active = useActiveSection(sections.map((section) => section.id).join("|"));

  const gallery = useMemo(
    () => works.filter((work) => !missing.has(work.image)),
    [missing],
  );
  const detailPool = useMemo(
    () => details.filter((work) => !missing.has(work.image)),
    [missing],
  );

  function drop(image: string) {
    setMissing((prev) => (prev.has(image) ? prev : new Set(prev).add(image)));
  }

  function open(work: Work, pool: Work[]) {
    setViewer({ work, pool });
  }

  function navigate(direction: number) {
    setViewer((current) => {
      if (!current) return current;
      const at = current.pool.findIndex((item) => item.image === current.work.image);
      const base = at === -1 ? 0 : at;
      return {
        ...current,
        work: current.pool[(base + direction + current.pool.length) % current.pool.length],
      };
    });
  }

  return (
    <div id="top" className="tatamipi-page site">
      <div className="grain" aria-hidden="true" />
      <div
        className="scroll-progress"
        aria-hidden="true"
        style={{ transform: `scaleX(${progress})` }}
      />

      {/* Top navigation bar replaced by studioNeo's StudioNav */}

      <nav className="rail" aria-label="Sections">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`rail-item ${active === section.id ? "is-active" : ""}`}
            aria-current={active === section.id}
          >
            <span className="rail-line" />
            <span className="rail-label">
              {section.n} {section.label}
            </span>
          </a>
        ))}
      </nav>

      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div
            className="hero-art"
            role="img"
            aria-label="Artwork by tatamipi, via R11R"
            style={{ backgroundImage: `url("${heroArt}")` }}
          />
          <div className="hero-inner page-width">
            <div className="hero-copy">
              <p className="micro">Illustrator — Osaka born, Tokyo based</p>
              <h1 id="hero-title">
                <Wordmark className="hero-wordmark" />
              </h1>
              <p className="hero-tagline">
                A little cute. A little curious.
                <br />
                One long stroke at a time.
              </p>
              <a className="hero-link" href="#work">
                <span>Twelve plates</span>
                <ArrowDown className="hero-link-arrow" />
              </a>
            </div>
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1].map((copy) => (
              <span className="ticker-run" key={copy}>
                {ticker.map((word) => (
                  <span className="ticker-word" key={`${copy}-${word}`}>
                    {word}
                    <span className="ticker-dot" />
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <section className="work-section" id="work" aria-labelledby="work-title">
          <div className="page-width">
            <Reveal>
              <SectionRow
                n="01"
                title="Work"
                aside={
                  <span className="micro">
                    Plates numbered — titles unpublished
                  </span>
                }
              />
            </Reveal>

            <div className="work-grid">
              {gallery.map((work, index) => (
                <WorkTile
                  key={work.image}
                  work={work}
                  index={index}
                  total={gallery.length}
                  onOpen={() => open(work, gallery)}
                  onFail={() => drop(work.image)}
                />
              ))}
              <a
                className="work-more reveal is-shown"
                href={instagram}
                target="_blank"
                rel="noreferrer"
              >
                <span className="micro">More work</span>
                <span className="work-more-title">
                  Instagram &amp; X <ArrowUp className="work-more-arrow" />
                </span>
                <span className="work-more-note">
                  Everything is posted first on social — this page only links, it never
                  rehosts.
                </span>
              </a>
            </div>
          </div>
        </section>

        <section className="words-section" id="words" aria-labelledby="words-title">
          <div className="page-width">
            <Reveal>
              <SectionRow
                n="02"
                title="Words"
                aside={<span className="micro">In the artist&apos;s own words</span>}
              />
            </Reveal>
            <Words />
          </div>
        </section>

        <section className="detail-section" id="detail" aria-labelledby="detail-title">
          <div className="page-width">
            <Reveal>
              <SectionRow
                n="03"
                title="Detail"
                aside={<span className="micro">Two more plates</span>}
              />
            </Reveal>
            <div className="detail-grid">
              {detailPool.map((work, index) => (
                <Reveal key={work.image} delay={index * 90}>
                  <button
                    className="detail-item"
                    type="button"
                    onClick={() => open(work, detailPool)}
                    aria-label={`Open plate ${work.plate}`}
                  >
                    <img
                      src={work.image}
                      alt={altFor(work)}
                      loading="lazy"
                      onError={() => drop(work.image)}
                    />
                    <span className="detail-caption">
                      <span className="work-number">{work.plate}</span>
                      {work.note}
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <p className="detail-note">
                Restraint is the point: few colours, no busy rendering, and a line that
                carries the whole drawing.{" "}
                <a href={encounter} target="_blank" rel="noreferrer">
                  On the ENCOUNTER collaboration <ArrowUp />
                </a>
              </p>
            </Reveal>
          </div>
        </section>

        <section className="process-section" id="process" aria-labelledby="process-title">
          <div className="page-width">
            <Reveal>
              <SectionRow
                n="04"
                title="Process"
                aside={
                  <a className="text-link" href={interview} target="_blank" rel="noreferrer">
                    Read the interview <ArrowUp />
                  </a>
                }
              />
            </Reveal>

            <ol className="principles">
              {principles.map((item, index) => (
                <li key={item.title}>
                  <Reveal delay={index * 60}>
                    <div className="principle">
                      <span className="principle-n">{String(index + 1).padStart(2, "0")}</span>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>

            <Reveal>
              <div className="stats">
                {stats.map((stat) => (
                  <Stat key={stat.label} {...stat} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="chrono-section" id="chronology" aria-labelledby="chronology-title">
          <div className="page-width">
            <Reveal>
              <SectionRow
                n="05"
                title="Chronology"
                aside={<span className="micro">Drawing in public, 2013 &rarr;</span>}
              />
            </Reveal>
            <ol className="chrono">
              {chronology.map((item, index) => (
                <li key={item.title}>
                  <Reveal delay={index * 50}>
                    <div className="chrono-row">
                      <span className="chrono-year">{item.year}</span>
                      <span className="chrono-marker" aria-hidden="true" />
                      <div className="chrono-body">
                        {item.href ? (
                          <a href={item.href} target="_blank" rel="noreferrer">
                            <h3>
                              {item.title} <ArrowUp className="chrono-arrow" />
                            </h3>
                          </a>
                        ) : (
                          <h3>{item.title}</h3>
                        )}
                        <p>{item.text}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="about-section" id="about" aria-labelledby="about-title">
          <div className="page-width">
            <Reveal>
              <SectionRow
                n="06"
                title="About"
                aside={
                  <a className="text-link" href={agencyProfile} target="_blank" rel="noreferrer">
                    Artist profile <ArrowUp />
                  </a>
                }
              />
            </Reveal>

            <div className="about-grid">
              <div className="about-copy">
                <Reveal>
                  <p className="about-lead">
                    tatamipi is an illustrator in Tokyo who draws the things she finds
                    cute, in a cute shape — girls, cats, and small everyday moments, held
                    together by one long, confident line.
                  </p>
                  <p className="about-jp" lang="ja">
                    かわいいと思うものを、かわいいかたちで切り取りたいです。
                  </p>
                </Reveal>
                <Reveal delay={80}>
                  <dl className="facts">
                    {facts.map((fact) => (
                      <div key={fact.k}>
                        <dt>{fact.k}</dt>
                        <dd>{fact.v}</dd>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              </div>
              <Reveal delay={120}>
                <a
                  className="about-art"
                  href={agencyProfile}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Artwork by tatamipi — open the R11R profile"
                >
                  <img src={aboutArt} alt="Artwork by tatamipi, via R11R" loading="lazy" />
                  <span className="about-art-tag micro">Plate 13 — R11R</span>
                </a>
              </Reveal>
            </div>

            <Reveal>
              <div className="now">
                <h3 className="micro">Currently</h3>
                <ul className="now-list">
                  {currently.map((item) => (
                    <li key={item.title}>
                      <h4>{item.title}</h4>
                      <p>{item.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          className="commission-section"
          id="commissions"
          aria-labelledby="commissions-title"
        >
          <div className="page-width">
            <Reveal>
              <SectionRow
                n="07"
                title="Commissions"
                aside={<span className="micro">Three ways in</span>}
              />
            </Reveal>
            <ol className="steps">
              {commissions.map((item, index) => (
                <li key={item.step}>
                  <Reveal delay={index * 70}>
                    <a className="step" href={item.href} target="_blank" rel="noreferrer">
                      <span className="step-n">{item.step}</span>
                      <span className="step-body">
                        <h3>
                          {item.title} <ArrowUp className="step-arrow" />
                        </h3>
                        <p>{item.text}</p>
                      </span>
                      <span className="step-cta">{item.cta}</span>
                    </a>
                  </Reveal>
                </li>
              ))}
            </ol>
            <Reveal>
              <p className="policy">
                <span className="micro">Policy</span>
                {policy.map((rule) => (
                  <span key={rule}>{rule}</span>
                ))}
              </p>
            </Reveal>
          </div>
        </section>

        <section className="press-section" id="press" aria-labelledby="press-title">
          <div className="page-width">
            <Reveal>
              <SectionRow
                n="08"
                title="Press"
                aside={<span className="micro">Books, shows &amp; interviews</span>}
              />
            </Reveal>
            <ul className="appear-list">
              {appearances.map((item, index) => (
                <li key={item.title}>
                  <Reveal delay={index * 45}>
                    <a href={item.href} target="_blank" rel="noreferrer">
                      <span className="appear-year">{item.year}</span>
                      <span className="appear-title">{item.title}</span>
                      <span className="appear-place">{item.place}</span>
                      <ArrowUp className="appear-arrow" />
                    </a>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="connect">
        <div className="page-width">
          <div className="footer-main">
            <a href="#top" aria-label="tatamipi — back to top">
              <Wordmark className="footer-wordmark" />
            </a>
            <ul className="socials" aria-label="Tatamipi elsewhere">
              <li>
                <a href={xProfile} target="_blank" rel="noreferrer">
                  X <ArrowUp className="social-arrow" />
                </a>
              </li>
              <li>
                <a href={instagram} target="_blank" rel="noreferrer">
                  Instagram <ArrowUp className="social-arrow" />
                </a>
              </li>
              <li>
                <a href={skeb} target="_blank" rel="noreferrer">
                  Skeb <ArrowUp className="social-arrow" />
                </a>
              </li>
              <li>
                <a href={agencyProfile} target="_blank" rel="noreferrer">
                  R11R <ArrowUp className="social-arrow" />
                </a>
              </li>
            </ul>
            <a className="back-top" href="#top">
              Top <ArrowUp className="social-arrow" />
            </a>
          </div>

          <div className="footer-meta">
            <p>
              Artwork &copy; tatamipi. {policy.join(" · ")}.
            </p>
            <p>
              Images linked from{" "}
              <a href={agencyProfile} target="_blank" rel="noreferrer">
                R11R
              </a>
              ,{" "}
              <a href={interview} target="_blank" rel="noreferrer">
                erumina
              </a>{" "}
              and{" "}
              <a href={encounter} target="_blank" rel="noreferrer">
                ENCOUNTER
              </a>
              .
            </p>
            <p className="colophon">
              Set in Space Grotesk, DM Sans &amp; Noto Sans JP. Unofficial fan-made
              profile — not affiliated with the artist.
            </p>
          </div>
        </div>
      </footer>

      {viewer && (
        <Lightbox
          work={viewer.work}
          pool={viewer.pool}
          onClose={() => setViewer(null)}
          onNavigate={navigate}
          onPick={(work) => setViewer((current) => (current ? { ...current, work } : current))}
        />
      )}
    </div>
  );
}
