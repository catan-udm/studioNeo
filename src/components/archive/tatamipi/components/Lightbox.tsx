import { useEffect, useRef, useState } from "react";
import type { Work } from "../data";
import { altFor } from "../data";
import { Arrow, ArrowUp, Close } from "../ui";

function Plate({ work }: { work: Work }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  return (
    <>
      {status !== "ready" && (
        <span className="lightbox-message" role="status">
          {status === "error" ? "Image unavailable — open the source." : "Loading plate…"}
        </span>
      )}
      {status !== "error" && (
        <img
          src={work.image}
          alt={altFor(work)}
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
        />
      )}
    </>
  );
}

export function Lightbox({
  work,
  pool,
  onClose,
  onNavigate,
  onPick,
}: {
  work: Work;
  pool: Work[];
  onClose: () => void;
  onNavigate: (direction: number) => void;
  onPick: (work: Work) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const position = Math.max(
    0,
    pool.findIndex((item) => item.image === work.image),
  );

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNavigate(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onNavigate(-1);
      }
      if (event.key === "Tab" && boxRef.current) {
        const focusable = Array.from(
          boxRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose, onNavigate]);

  return (
    <div
      className="lightbox-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="lightbox"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-title"
        ref={boxRef}
      >
        <button
          className="lightbox-close"
          type="button"
          ref={closeRef}
          onClick={onClose}
          aria-label="Close plate viewer"
        >
          <Close />
        </button>

        <div className="lightbox-image">
          <Plate key={work.image} work={work} />
        </div>

        <div className="lightbox-info">
          <p className="lightbox-count">
            Plate {String(position + 1).padStart(2, "0")} / {String(pool.length).padStart(2, "0")}
          </p>
          <h2 id="lightbox-title">
            No. {work.plate}
            <span className="wordmark-dot">.</span>
          </h2>
          <p className="lightbox-note">{work.note}</p>
          <a className="lightbox-source" href={work.source} target="_blank" rel="noreferrer">
            Source: {work.sourceName} <ArrowUp />
          </a>

          <div className="lightbox-thumbs" role="group" aria-label="All plates">
            {pool.map((item, index) => (
              <button
                key={item.image}
                type="button"
                className={`thumb ${index === position ? "is-active" : ""}`}
                onClick={() => onPick(item)}
                aria-label={`Plate ${item.plate}`}
                aria-current={index === position}
              >
                <img src={item.image} alt="" loading="lazy" />
              </button>
            ))}
          </div>

          <div className="lightbox-controls">
            <button type="button" onClick={() => onNavigate(-1)} aria-label="Previous plate">
              <Arrow className="arrow-back" />
            </button>
            <button type="button" onClick={() => onNavigate(1)} aria-label="Next plate">
              <Arrow />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
