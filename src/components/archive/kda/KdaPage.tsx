"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, Pause, Play, X } from "lucide-react";
import {
  members,
  milestone,
  preorder,
  quotes,
  releases,
  singles,
  videos,
  type Track,
} from "./catalog";
import { PreviewProvider, usePreview } from "./PreviewPlayer";
import "./kda.css";

const heroArt = "/images/kda/riot-splash.jpg";
const groupArt = "/images/kda/hero.jpg";
const filmArt = "/images/kda/video.jpg";
const watchArt = "/images/kda/watchme-riot.jpg";
const neverArt = "/images/kda/never-riot.jpg";
const moreArt = "/images/kda/more-video.jpg";
const popArt = "/images/kda/popstars-video.jpg";
const choreoArt = "/images/kda/choreo.jpg";
const merchArt = "/images/kda/merch.jpg";
const sonaArt = "/images/kda/sona.jpg";

type Video = (typeof videos)[number];

const filmImages: Record<string, string> = {
  "Mmw-PpWhKFg": filmArt,
  "R-JywodifoE": watchArt,
  WZpcuRYP26E: neverArt,
  "3VTkBuxU4yk": moreArt,
  UOxkGD8qRB4: popArt,
  Ko9VF6dDnAk: choreoArt,
};

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      K<span>/</span>DA
    </span>
  );
}

function useReveals() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    elements.forEach((element) => {
      element.classList.add("will-reveal");
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
}

function Hero({ onWatch }: { onWatch: () => void }) {
  return (
    <section className="hero" id="top">
      <div className="hero-art" style={{ backgroundImage: `url(${heroArt})` }} aria-hidden="true" />
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-content page-width">
        <div className="hero-intro">
          <p className="hero-kicker">K/DA / RIOT GAMES MUSIC</p>
          <h1>
            <Wordmark className="hero-wordmark" />
            <span className="hero-title">FIRESTARTER</span>
          </h1>
          <p className="hero-copy">The new era starts here. The FIRESTARTER EP is out now.</p>
          <div className="hero-actions">
            <a className="button button-light" href="#music">
              EXPLORE THE EP <ArrowDown size={16} />
            </a>
            <button className="button button-outline" onClick={onWatch}>
              <Play size={14} fill="currentColor" /> WATCH THE VIDEO
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrackRow({ track, index }: { track: Track; index: number }) {
  const { track: current, playing, playTrack } = usePreview();
  const active = current?.id === track.id && playing;
  return (
    <li>
      <button
        className={`track-row ${active ? "track-row-playing" : ""}`}
        onClick={() => playTrack(track)}
        aria-label={`${active ? "Pause" : "Play"} ${track.title} preview`}
        aria-pressed={active}
      >
        <span className="track-number">{String(index + 1).padStart(2, "0")}</span>
        <span className="track-details">
          <strong>{track.title}</strong>
          <span>{track.artists}</span>
        </span>
        <span className="track-duration">{track.duration}</span>
        <span className="track-play">
          {active ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
        </span>
      </button>
    </li>
  );
}

function FeaturedEP() {
  const ep = releases[0];
  return (
    <section id="music" className="ep-section section-pad">
      <div className="page-width">
        <div className="section-heading" data-reveal>
          <div>
            <p className="section-kicker">
              <span>01</span> THE NEW EP
            </p>
            <h2>
              FOUR TRACKS.
              <br />
              <em>ONE FIRE.</em>
            </h2>
          </div>
          <p>The sound of K/DA's next chapter. Listen to a preview, then take the full EP with you.</p>
        </div>
        <div className="ep-layout" data-reveal>
          <figure className="ep-cover">
            <img src={ep.cover} alt="Official K/DA FIRESTARTER EP cover artwork" />
            <figcaption>
              <span>FIRESTARTER / K/DA</span>
              <span>2026</span>
            </figcaption>
          </figure>
          <div className="ep-tracklist">
            <div className="tracklist-heading">
              <div>
                <span>THE TRACKLIST</span>
                <h3>
                  FIRESTARTER <small>EP</small>
                </h3>
              </div>
              <span>04 TRACKS</span>
            </div>
            <ol className="track-list">
              {ep.tracks.map((track, index) => (
                <TrackRow key={track.id} track={track} index={index} />
              ))}
            </ol>
            <div className="listen-footer">
              <a href={ep.listenUrl} target="_blank" rel="noreferrer" className="text-link">
                LISTEN TO THE FULL EP <ArrowUpRight size={16} />
              </a>
              <span>PREVIEWS PROVIDED BY APPLE MUSIC</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Film({ onWatch }: { onWatch: (video: Video) => void }) {
  const [selected, setSelected] = useState<Video>(videos[0]);
  return (
    <section id="film" className="film-section section-pad">
      <div className="page-width">
        <div className="film-layout">
          <div className="film-visual" data-reveal>
            <button
              className="film-frame"
              onClick={() => onWatch(selected)}
              aria-label={`Watch ${selected.title} ${selected.type.toLowerCase()}`}
            >
              <img src={filmImages[selected.id]} alt={`Official K/DA ${selected.title} video artwork`} />
              <span className="film-overlay" />
              <span className="film-play">
                <Play size={23} fill="currentColor" />
              </span>
            </button>
            <div className="film-caption">
              <span>
                K/DA / {selected.title}
              </span>
              <span>
                {selected.year} / {selected.type}
              </span>
            </div>
          </div>
          <div className="film-copy" data-reveal>
            <p className="section-kicker">
              <span>02</span> THE FILM
            </p>
            <h2>
              WATCH
              <br />
              <em>IT BURN.</em>
            </h2>
            <p>
              The FIRESTARTER music video reunites K/DA with Fortiche Production, with choreography by Sean
              Bankhead.
            </p>
            <button className="text-link" onClick={() => onWatch(selected)}>
              WATCH {selected.title} <ArrowUpRight size={16} />
            </button>
            <div className="video-list">
              <div className="video-list-heading">
                THE OFFICIAL VIDEOS <span>SELECT A FILM</span>
              </div>
              {videos.map((video, index) => (
                <button
                  key={video.id}
                  className={selected.id === video.id ? "is-selected" : ""}
                  onClick={() => setSelected(video)}
                  aria-pressed={selected.id === video.id}
                >
                  <span>0{index + 1}</span>
                  <strong>{video.title}</strong>
                  <span>{video.year}</span>
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Discography() {
  const [selected, setSelected] = useState(1);
  const release = releases[selected];
  const { track: current, playing, playTrack } = usePreview();

  return (
    <section id="discography" className="discography-section section-pad">
      <div className="page-width">
        <div className="section-heading" data-reveal>
          <div>
            <p className="section-kicker">
              <span>03</span> THE DISCOGRAPHY
            </p>
            <h2>
              EVERY ERA.
              <br />
              <em>ALL K/DA.</em>
            </h2>
          </div>
          <p>From the first stage to FIRESTARTER. Explore the EPs and the single that started it all.</p>
        </div>
        <div className="release-grid" data-reveal aria-label="Choose a release">
          {releases.map((item, index) => (
            <button
              key={item.id}
              className={`release-choice ${selected === index ? "release-choice-active" : ""}`}
              onClick={() => setSelected(index)}
              aria-pressed={selected === index}
              aria-label={`Explore ${item.title}, ${item.type.toLowerCase()}`}
            >
              <span className="release-image">
                <img src={item.cover} alt={`Official ${item.title} cover artwork`} loading="lazy" />
                <span className="release-image-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </span>
              <span className="release-meta">
                <span>
                  {item.year} / {item.type}
                </span>
                <ArrowRight size={15} />
              </span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </div>
        <div className="release-detail" key={release.id} aria-live="polite">
          <div className="release-description">
            <span className="detail-label">SELECTED RELEASE / {release.date}</span>
            <h3>
              {release.title}
              <small>{release.type}</small>
            </h3>
            <p>{release.description}</p>
            <a className="text-link" href={release.appleUrl} target="_blank" rel="noreferrer">
              OPEN ON APPLE MUSIC <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="release-tracks">
            <div className="detail-list-head">
              <span>TRACKLIST</span>
              <span>
                {String(release.tracks.length).padStart(2, "0")}{" "}
                {release.tracks.length === 1 ? "TRACK" : "TRACKS"}
              </span>
            </div>
            <ol className="track-list compact-tracks">
              {release.tracks.map((track, index) => (
                <TrackRow key={track.id} track={track} index={index} />
              ))}
            </ol>
          </div>
        </div>
        <div className="singles-section" data-reveal>
          <div className="singles-heading">
            <div>
              <p className="section-kicker">
                <span>+</span> THE SINGLES
              </p>
              <h3>THE SONGS THAT STARTED IT.</h3>
            </div>
            <p>Listen to a preview or open the official single.</p>
          </div>
          <div className="singles-grid">
            {singles.map((single) => {
              const active = current?.id === single.track.id && playing;
              return (
                <div className="single-item" key={single.title}>
                  <img src={single.cover} alt={`Official ${single.title} single artwork`} loading="lazy" />
                  <div>
                    <span>{single.year} / SINGLE</span>
                    <strong>{single.title}</strong>
                    <a href={single.url} target="_blank" rel="noreferrer">
                      OPEN SINGLE <ArrowUpRight size={12} />
                    </a>
                  </div>
                  <button
                    onClick={() => playTrack(single.track)}
                    aria-label={`${active ? "Pause" : "Play"} ${single.title} preview`}
                    aria-pressed={active}
                  >
                    {active ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <SonaCard />
      </div>
    </section>
  );
}

function Lineup() {
  return (
    <section id="lineup" className="lineup-section section-pad">
      <div className="page-width">
        <div className="section-heading" data-reveal>
          <div>
            <p className="section-kicker">
              <span>04</span> THE LINEUP
            </p>
            <h2>
              FOUR ICONS.
              <br />
              <em>ONE K/DA.</em>
            </h2>
          </div>
          <p>Ahri, Akali, Evelynn and Kai'Sa return with the voices behind the FIRESTARTER era.</p>
        </div>
        <div className="member-grid" data-reveal>
          {members.map((member, index) => (
            <article className="member" key={member.name}>
              <div className="member-image">
                <img
                  src={groupArt}
                  alt={`${member.name} in official K/DA FIRESTARTER artwork`}
                  style={{ objectPosition: member.imagePosition }}
                  loading="lazy"
                />
              </div>
              <div className="member-number">
                0{index + 1} / {member.role}
              </div>
              <h3>{member.name}</h3>
              <p>
                FIRESTARTER VOCALS <span>{member.vocalist}</span>
              </p>
            </article>
          ))}
        </div>
        <div className="lineup-credit">
          <span>ARTWORK FROM THE OFFICIAL FIRESTARTER MUSIC VIDEO</span>
          <a href="https://www.youtube.com/watch?v=Mmw-PpWhKFg" target="_blank" rel="noreferrer">
            VIEW THE ORIGINAL <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </section>
  );
}

const statData = [
  { value: 2.7, suffix: "B+", label: "GLOBAL STREAMS", note: "Across the K/DA catalogue" },
  { value: 1.8, suffix: "B+", label: "VIDEO VIEWS", note: "Since the 2018 debut" },
  { value: 9.2, suffix: "M", label: "VIEWS IN 24 HOURS", note: "FIRESTARTER music video" },
  { value: null, suffix: "", label: "RIAA CERTIFIED", note: "POP/STARS · platinum single" },
];

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started) return;
        started = true;
        io.disconnect();
        const t0 = performance.now();
        const dur = 1600;
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - k, 4);
          node.textContent = (value * eased).toFixed(1) + suffix;
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [value, suffix]);
  return <span ref={ref}>0.0{suffix}</span>;
}

function StatsStrip() {
  return (
    <section className="stats-strip" aria-label="K/DA by the numbers">
      <div className="page-width stats-grid">
        {statData.map((stat, index) => (
          <div className="stat" key={stat.label}>
            <span className="stat-index">0{index + 1}</span>
            <strong className={stat.value === null ? "stat-plain" : undefined}>
              {stat.value === null ? (
                <>
                  ×1 <em>PLATINUM</em>
                </>
              ) : (
                <CountUp value={stat.value} suffix={stat.suffix} />
              )}
            </strong>
            <span className="stat-label">{stat.label}</span>
            <span className="stat-note">{stat.note}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function EraCompare() {
  const [era, setEra] = useState<"2018" | "2026">("2026");
  const now = era === "2026";

  return (
    <section className="era-section section-pad" id="eras" aria-label="Compare the 2018 and 2026 eras">
      <div className="page-width">
        <div className="section-heading" data-reveal>
          <div>
            <p className="section-kicker">
              <span>02</span> THEN AND NOW
            </p>
            <h2>OUT WITH THE OLD.</h2>
          </div>
          <p>
            Flip the switch. POP/STARS opened 2018 in neon; FIRESTARTER burns 2026 red. Same stage, new
            temperature.
          </p>
        </div>
        <div className="era-toggle-row" data-reveal>
          <button
            type="button"
            className={!now ? "is-on" : ""}
            onClick={() => setEra("2018")}
            aria-pressed={!now}
          >
            2018 · POP/STARS
          </button>
          <button
            type="button"
            className="era-switch"
            role="switch"
            aria-checked={now}
            aria-label={
              now
                ? "Showing 2026 FIRESTARTER. Switch to 2018 POP/STARS."
                : "Showing 2018 POP/STARS. Switch to 2026 FIRESTARTER."
            }
            onClick={() => setEra(now ? "2018" : "2026")}
          >
            <span className="era-switch-knob" />
          </button>
          <button
            type="button"
            className={now ? "is-on" : ""}
            onClick={() => setEra("2026")}
            aria-pressed={now}
          >
            2026 · FIRESTARTER
          </button>
        </div>
        <button
          type="button"
          className={`era-compare era-${era}`}
          data-reveal
          onClick={() => setEra(now ? "2018" : "2026")}
          aria-label={now ? "Switch to 2018 POP/STARS artwork" : "Switch to 2026 FIRESTARTER artwork"}
        >
          <img
            src={popArt}
            alt="Official POP/STARS music video artwork, 2018"
            className={!now ? "is-visible" : ""}
          />
          <img
            src={filmArt}
            alt="Official FIRESTARTER music video artwork, 2026"
            className={now ? "is-visible" : ""}
          />
          <span className="era-label">{now ? "2026 · FIRESTARTER" : "2018 · POP/STARS"}</span>
        </button>
        <div className="era-sources">
          <span>OFFICIAL VIDEO ART · LEAGUE OF LEGENDS</span>
          <span className="era-hint">TAP THE SWITCH · OR THE FRAME</span>
        </div>
      </div>
    </section>
  );
}

function PressQuotes() {
  return (
    <section className="quotes-section section-pad" aria-label="What the teams behind FIRESTARTER said">
      <div className="page-width">
        <div className="quotes-grid">
          {quotes.map((quote, index) => (
            <figure className="quote-card" key={quote.name} data-reveal>
              <span className="quote-mark" aria-hidden="true">
                ”
              </span>
              <blockquote>
                <p>{quote.text}</p>
              </blockquote>
              <figcaption>
                <span className="quote-index">0{index + 1}</span>
                <span className="quote-person">
                  <strong>{quote.name}</strong>
                  <span>{quote.role}</span>
                </span>
                <a
                  href={quote.source}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Read the source of this quote from ${quote.name}`}
                >
                  SOURCE <ArrowUpRight size={11} />
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function SonaCard() {
  const { track, playing, playTrack } = usePreview();
  const girls = releases[0].tracks[3];
  const active = track?.id === girls.id && playing;
  return (
    <div className="sona-card" data-reveal>
      <div className="sona-text">
        <p className="section-kicker">
          <span>+</span> GUEST APPEARANCE
        </p>
        <h3>
          DJ SONA JOINS <em>GIRLS</em>.
        </h3>
        <p className="sona-copy">
          Eleven years after her last release, League's original virtual DJ returns to close the FIRESTARTER EP
          with Sophie Powers, Sorana and Royal &amp; the Serpent.
        </p>
        <button
          className="text-link"
          onClick={() => playTrack(girls)}
          aria-label={`${active ? "Pause" : "Play"} GIRLS, the DJ Sona collaboration`}
        >
          {active ? "PAUSE GIRLS" : "PREVIEW GIRLS"}{" "}
          {active ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
        </button>
      </div>
      <div className="sona-art">
        <img src={sonaArt} alt="DJ Sona — official Riot Games splash artwork" loading="lazy" />
        <span>DJ SONA · RIOT GAMES</span>
      </div>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="count-unit">
      <strong>{String(value).padStart(2, "0")}</strong>
      <span>{label}</span>
    </div>
  );
}

function StageSection() {
  const calc = () => {
    const diff = Math.max(0, milestone.target - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
    };
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const id = window.setInterval(() => setLeft(calc()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="stage-section section-pad" id="stage" aria-label="The next K/DA stage and physical editions">
      <div className="page-width stage-grid">
        <div data-reveal>
          <p className="section-kicker">
            <span>05</span> NEXT SHOW
          </p>
          <h2 className="stage-title">
            THE BIGGEST
            <br />
            <em>STAGE.</em>
          </h2>
          <p className="stage-note">{milestone.note}</p>
          <div
            className="countdown"
            role="timer"
            aria-label={`Countdown: ${left.days} days, ${left.hours} hours, ${left.minutes} minutes until the Worlds 2026 Opening Ceremony`}
          >
            <CountdownUnit value={left.days} label="DAYS" />
            <span className="count-sep" aria-hidden="true">
              :
            </span>
            <CountdownUnit value={left.hours} label="HRS" />
            <span className="count-sep" aria-hidden="true">
              :
            </span>
            <CountdownUnit value={left.minutes} label="MIN" />
          </div>
          <dl className="stage-meta">
            <div>
              <dt>{milestone.event}</dt>
              <dd>{milestone.when}</dd>
            </div>
            <div>
              <dt>VENUE</dt>
              <dd>{milestone.where}</dd>
            </div>
          </dl>
          <a className="text-link" href={milestone.url} target="_blank" rel="noreferrer">
            WATCH ON LOLESPORTS <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="preorder-card" data-reveal>
          <img
            src={merchArt}
            alt="K/DA FIRESTARTER physical editions — official CD, vinyl and box set artwork"
            loading="lazy"
          />
          <div className="preorder-body">
            <span className="preorder-label">OFFICIAL COLLECTION</span>
            <h3>{preorder.title}</h3>
            <p>{preorder.note}</p>
            <a className="button button-light" href={preorder.url} target="_blank" rel="noreferrer">
              {preorder.label} <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="page-width">
        <div className="footer-top">
          <div>
            <Wordmark className="footer-wordmark" />
            <p>THE MUSIC. THE WORLD. THE MOMENT.</p>
          </div>
          <a href="#top" className="back-to-top">
            BACK TO TOP <ArrowUpRight size={16} />
          </a>
        </div>
        <details className="art-sources">
          <summary>
            OFFICIAL ARTWORK &amp; MEDIA SOURCES <span>VIEW SOURCES +</span>
          </summary>
          <p>
            The visuals are original Riot Games artwork, official video imagery and release covers. The
            FIRESTARTER video was created in partnership with Fortiche Production.
          </p>
          <div className="source-links">
            <a
              href="https://pbs.twimg.com/media/HVC6ohbWwAAH9vX?format=jpg&name=4096x4096"
              target="_blank"
              rel="noreferrer"
            >
              FIRESTARTER ILLUSTRATION <ArrowUpRight size={12} />
            </a>
            <a
              href="https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/5dfc8d38402e1da4e1d970287948ef6b2189b686-3072x1294.jpg?accountingTag=LoL"
              target="_blank"
              rel="noreferrer"
            >
              FIRESTARTER GROUP ART <ArrowUpRight size={12} />
            </a>
            <a href="https://www.leagueoflegends.com/en-us/news/media/" target="_blank" rel="noreferrer">
              RIOT VIDEO ARTWORK <ArrowUpRight size={12} />
            </a>
            {releases.map((release) => (
              <a key={release.id} href={release.appleUrl} target="_blank" rel="noreferrer">
                {release.title} COVER <ArrowUpRight size={12} />
              </a>
            ))}
            {singles.slice(0, 3).map((single) => (
              <a key={single.title} href={single.url} target="_blank" rel="noreferrer">
                {single.title} SINGLE COVER <ArrowUpRight size={12} />
              </a>
            ))}
          </div>
        </details>
        <div className="footer-bottom">
          <p>
            Fan-made tribute. K/DA and League of Legends are trademarks of Riot Games. FIRESTARTER music
            video created in partnership with Fortiche Production. Artwork and recordings belong to their
            respective rights holders.
          </p>
          <div className="footer-links">
            <a href="https://www.leagueoflegends.com/en-us/news/tags/kda/" target="_blank" rel="noreferrer">
              RIOT GAMES <ArrowUpRight size={12} />
            </a>
            <a href="https://forticheprod.com/portfolio/kda/" target="_blank" rel="noreferrer">
              FORTICHE <ArrowUpRight size={12} />
            </a>
            <a href="https://music.apple.com/us/artist/k-da/1439420229" target="_blank" rel="noreferrer">
              APPLE MUSIC <ArrowUpRight size={12} />
            </a>
            <a
              href="https://pbs.twimg.com/media/HVC6ohbWwAAH9vX?format=jpg&name=4096x4096"
              target="_blank"
              rel="noreferrer"
            >
              HERO ART SOURCE <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function VideoModal({ video, onClose }: { video: Video; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && modalRef.current) {
        const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>("button, a[href], iframe"));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="video-modal" role="dialog" aria-modal="true" aria-labelledby="video-modal-title" ref={modalRef}>
        <div className="modal-header">
          <div>
            <span>K/DA / OFFICIAL VIDEO</span>
            <h2 id="video-modal-title">{video.title}</h2>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Close video">
            <X size={21} />
          </button>
        </div>
        <div className="modal-video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={`K/DA ${video.title} official video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="modal-footer">
          <span>STREAMED FROM THE OFFICIAL LEAGUE OF LEGENDS CHANNEL</span>
          <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer">
            OPEN ON YOUTUBE <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Page() {
  useReveals();
  const [video, setVideo] = useState<Video | null>(null);
  const { pause } = usePreview();
  const openVideo = (next: Video) => {
    pause();
    setVideo(next);
  };
  const closeVideo = useCallback(() => setVideo(null), []);

  return (
    <>
      <main id="main">
        <Hero onWatch={() => openVideo(videos[0])} />
        <StatsStrip />
        <FeaturedEP />
        <EraCompare />
        <Film onWatch={openVideo} />
        <PressQuotes />
        <Discography />
        <Lineup />
        <StageSection />
      </main>
      <Footer />
      {video && <VideoModal video={video} onClose={closeVideo} />}
    </>
  );
}

export function KdaPage() {
  return (
    <div className="kda-page">
      <PreviewProvider>
        <Page />
      </PreviewProvider>
    </div>
  );
}
