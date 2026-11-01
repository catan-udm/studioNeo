"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { catalogueNo, imageUrl, wallImage, type Piece } from "@/yoneyamaiData";

type Props = {
  items: Piece[];
  index: number | null;
  onIndex: (index: number) => void;
  onClose: () => void;
};

/** A close-looking dialog: full-size plate, wall label, click to magnify. */
export default function Viewer({ items, index, onIndex, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const open = index !== null;
  const piece = index !== null ? items[index] : null;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setZoom(false);
    setOrigin("50% 50%");
    setLoaded(false);
  }, [index]);

  const move = (step: number) => {
    if (index === null) return;
    onIndex((index + step + items.length) % items.length);
  };

  return (
    <dialog
      ref={ref}
      className="viewer"
      aria-label="Artwork viewer"
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
      }}
    >
      {piece && (
        <>
          <div className="viewer-top">
            <span>{String(index! + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
            <button type="button" onClick={onClose} aria-label="Close viewer">
              <X size={20} />
            </button>
          </div>

          <div className="viewer-stage" onClick={(event) => event.target === event.currentTarget && onClose()}>
            <div
              className={`viewer-frame ${zoom ? "is-zoomed" : ""}`}
              style={
                {
                  "--ar": piece.w / piece.h,
                  backgroundImage: `url(${wallImage(piece)})`,
                } as CSSProperties
              }
              onClick={() => setZoom((value) => !value)}
              onPointerMove={(event) => {
                if (!zoom) return;
                const box = event.currentTarget.getBoundingClientRect();
                setOrigin(
                  `${((event.clientX - box.left) / box.width) * 100}% ${((event.clientY - box.top) / box.height) * 100}%`
                );
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={piece.id}
                ref={(node) => {
                  if (node && node.complete && node.naturalWidth > 0) setLoaded(true);
                }}
                src={imageUrl(piece.file, Math.min(2200, piece.w))}
                alt={piece.alt}
                className={loaded ? "is-loaded" : ""}
                style={{ transformOrigin: origin }}
                draggable={false}
                onLoad={() => setLoaded(true)}
              />
            </div>
          </div>

          <div className="viewer-foot">
            <p className="label label--light">
              <span className="label-no">No. {catalogueNo(piece.id)}</span>
              <strong>Yoneyama Mai</strong>
              <span><em>{piece.title}</em>, {piece.year}</span>
              <span>{piece.medium}</span>
              {piece.shown && <span>{piece.shown}</span>}
            </p>
            <div className="viewer-actions">
              <a href={piece.source} target="_blank" rel="noreferrer">
                Portfolio <ArrowUpRight size={14} />
              </a>
              <button type="button" onClick={() => move(-1)} aria-label="Previous work"><ArrowLeft size={18} /></button>
              <button type="button" onClick={() => move(1)} aria-label="Next work"><ArrowRight size={18} /></button>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
