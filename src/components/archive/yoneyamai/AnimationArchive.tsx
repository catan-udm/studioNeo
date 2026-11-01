"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Clapperboard, Play } from "lucide-react";
import { additionalCredits, animationFilters, animationWorks, type AnimationKind } from "@/yoneyamaiAnimation";

type Filter = "All" | AnimationKind;

function previewImage(work: (typeof animationWorks)[number]) {
  return work.image.startsWith("yt:")
    ? `https://img.youtube.com/vi/${work.image.slice(3)}/hqdefault.jpg`
    : work.image;
}

/** A film-program wall: select a credit, see its actual preview, then play or visit its source. */
export default function AnimationArchive() {
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedId, setSelectedId] = useState("cyberpunk-edgerunners");
  const [playing, setPlaying] = useState(false);

  const visible = useMemo(
    () => animationWorks.filter((work) => filter === "All" || work.kind === filter),
    [filter]
  );
  const selected = visible.find((work) => work.id === selectedId) ?? visible[0];

  useEffect(() => {
    if (!visible.some((work) => work.id === selectedId)) setSelectedId(visible[0].id);
    setPlaying(false);
  }, [filter, visible, selectedId]);

  useEffect(() => setPlaying(false), [selectedId]);

  if (!selected) return null;

  return (
    <div className="animation-archive">
      <div className="animation-archive-head">
        <p className="animation-kicker"><Clapperboard size={15} /> Screen credits · 2010–2025</p>
        <p className="animation-source-note">
          The work is listed with Mai&apos;s specific credit. Portfolio frames are her own; trailer previews are from the title&apos;s official channel.
        </p>
      </div>

      <div className="animation-program">
        <div className="animation-preview" aria-live="polite">
          {playing && selected.videoId ? (
            <iframe
              title={`${selected.title} official preview`}
              src={`https://www.youtube-nocookie.com/embed/${selected.videoId}?autoplay=1&rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewImage(selected)} alt={selected.alt} />
          )}
          <span className="animation-preview-tag">{playing ? "Now screening · official preview" : selected.previewLabel}</span>
          {selected.videoId && !playing && (
            <button type="button" className="animation-play" onClick={() => setPlaying(true)} aria-label={`Play official preview for ${selected.title}`}>
              <Play size={22} fill="currentColor" />
              <span>Play preview</span>
            </button>
          )}
        </div>

        <div className="animation-record">
          <div className="animation-record-meta"><span>{selected.year}</span><span>{selected.kind}</span></div>
          <h3>{selected.title}</h3>
          <p className="animation-role-label">Yoneyama Mai · contribution</p>
          <p className="animation-role">{selected.role}</p>
          <div className="animation-record-actions">
            {selected.videoId && (
              <button type="button" onClick={() => setPlaying((value) => !value)}>
                {playing ? "Show frame" : "Play official preview"}<Play size={13} />
              </button>
            )}
            <a href={selected.sourceUrl} target="_blank" rel="noreferrer">
              {selected.sourceLabel}<ArrowUpRight size={14} />
            </a>
          </div>
          <div className="animation-record-index">
            <span>SCREENING ARCHIVE</span>
            <strong>{String(visible.findIndex((work) => work.id === selected.id) + 1).padStart(2, "0")}</strong>
            <span>/ {String(visible.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>

      <div className="animation-filter" role="group" aria-label="Filter animation works">
        {animationFilters.map((item) => (
          <button
            key={item}
            type="button"
            className={filter === item ? "is-active" : ""}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
        <span>{String(visible.length).padStart(2, "0")} previews</span>
      </div>

      <div className="animation-catalog" role="group" aria-label="Select an animated work">
        {visible.map((work, index) => (
          <button
            key={work.id}
            type="button"
            className={`animation-item ${selected.id === work.id ? "is-selected" : ""}`}
            aria-pressed={selected.id === work.id}
            onClick={() => setSelectedId(work.id)}
          >
            <span className="animation-item-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewImage(work)} alt="" loading={index < 5 ? "eager" : "lazy"} />
              <span className="animation-item-no">{String(index + 1).padStart(2, "0")}</span>
              {work.videoId && <span className="animation-item-play"><Play size={12} fill="currentColor" /></span>}
              <span className="animation-item-credit-source">{work.imageCredit === "Artist portfolio" ? "MAI / ORIGINAL" : "TITLE PREVIEW"}</span>
            </span>
            <span className="animation-item-title">{work.title}</span>
            <span className="animation-item-credit">{work.year} · {work.role}</span>
          </button>
        ))}
      </div>

      <details className="additional-animation-credits">
        <summary>Additional episode &amp; key-animation credits</summary>
        <div className="additional-animation-list">
          {additionalCredits.map((credit) => (
            <div key={`${credit.year}-${credit.title}`}>
              <span>{credit.year}</span><strong>{credit.title}</strong><em>{credit.role}</em>
            </div>
          ))}
        </div>
        <a className="additional-animation-source" href="https://www.animenewsnetwork.com/encyclopedia/people.php?id=83260" target="_blank" rel="noreferrer">
          Detailed staff-credit index at Anime News Network <ArrowUpRight size={13} />
        </a>
      </details>
    </div>
  );
}
