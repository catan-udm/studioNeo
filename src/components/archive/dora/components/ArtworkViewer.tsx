import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, Pause, Play, X } from "lucide-react";
import { kindLabels, moodLabels } from "../data/artworks";
import type { Artwork } from "../data/artworks";
import { ArtworkImage } from "./ArtworkImage";

type ArtworkViewerProps = {
  artwork: Artwork | null;
  collection: Artwork[];
  onClose: () => void;
  onNavigate: (direction: -1 | 1) => void;
  onSelect: (artwork: Artwork) => void;
  isSaved: boolean;
  onToggleSave: (artwork: Artwork) => void;
};

export function ArtworkViewer({ artwork, collection, onClose, onNavigate, onSelect, isSaved, onToggleSave }: ArtworkViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const isOpen = artwork !== null;
  const currentIndex = collection.findIndex((item) => item.id === artwork?.id);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!playing || !isOpen) return;
    const timer = window.setInterval(() => onNavigate(1), 4200);
    return () => window.clearInterval(timer);
  }, [playing, isOpen, onNavigate]);

  useEffect(() => {
    if (!isOpen) setPlaying(false);
  }, [isOpen]);

  useEffect(() => {
    const selected = stripRef.current?.querySelector<HTMLElement>("[data-current='true']");
    selected?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [artwork?.id]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      onNavigate(event.key === "ArrowRight" ? 1 : -1);
    }
    if (event.key === " ") {
      event.preventDefault();
      setPlaying((value) => !value);
    }
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  };

  return (
    <dialog
      className="art-viewer"
      ref={dialogRef}
      aria-labelledby="viewer-title"
      aria-describedby="viewer-credit"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      {artwork && (
        <div className="viewer-shell">
          <div className="viewer-topbar">
            <span className="mono">DORA’S STUDIO <span className="viewer-topbar__slash">/</span> ARTWORK {artwork.id}</span>
            <div className="viewer-topbar-actions">
              <button type="button" className={`viewer-play ${playing ? "is-playing" : ""}`} onClick={() => setPlaying((value) => !value)} aria-pressed={playing} aria-label={playing ? "暂停幻灯片" : "播放幻灯片"}>
                {playing ? <Pause size={14} /> : <Play size={14} />}
                <span>{playing ? "暂停" : "幻灯片"}</span>
              </button>
              <button type="button" className="viewer-close" onClick={onClose} aria-label="关闭作品预览" autoFocus><span>关闭</span><X size={18} /></button>
            </div>
          </div>
          <div className="viewer-body">
            <div className="viewer-canvas">
              <ArtworkImage key={artwork.id} src={artwork.image} alt={artwork.alt} loading="eager" />
              <span className="viewer-canvas__credit">© 哆啦小熙 / DORA · {artwork.year}</span>
            </div>
            <div className="viewer-info">
              <div>
                <p className="mono viewer-kind">{kindLabels[artwork.kind]} · {artwork.year}</p>
                <h2 id="viewer-title">{artwork.title}</h2>
                <p className="viewer-english">{artwork.englishTitle}</p>
                <div className="viewer-moods">
                  {artwork.moods.map((mood) => <span key={mood}>{moodLabels[mood]}</span>)}
                </div>
                <p id="viewer-credit" className="viewer-credit">Artwork by 哆啦小熙。<br />画作版权归原作者所有。<br />本站为非官方、非商业的个人作品选集。</p>
                <a className="button button--ink viewer-original" href={artwork.source} target="_blank" rel="noreferrer">在 Pixiv 查看原作 <ArrowUpRight size={15} /></a>
                <button className={`button viewer-save ${isSaved ? "is-saved" : ""}`} type="button" aria-pressed={isSaved} onClick={() => onToggleSave(artwork)}>
                  <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />{isSaved ? "已收藏 · 点击取消" : "收藏这幅作品"}
                </button>
              </div>
              <div className="viewer-navigation">
                <div className="viewer-navigation__buttons">
                  <button type="button" onClick={() => onNavigate(-1)} aria-label="上一幅作品" disabled={collection.length < 2}><ArrowLeft size={16} /></button>
                  <button type="button" onClick={() => onNavigate(1)} aria-label="下一幅作品" disabled={collection.length < 2}><ArrowRight size={16} /></button>
                </div>
                <span className="mono">{String(currentIndex + 1).padStart(2, "0")} / {String(collection.length).padStart(2, "0")}</span>
              </div>
              <p className="viewer-hint mono">← → 切换 · 空格播放 · ESC 关闭</p>
            </div>
          </div>
          {collection.length > 1 && (
            <div className="viewer-strip" ref={stripRef} aria-label="当前序列作品">
              {collection.map((work) => (
                <button
                  key={work.id}
                  type="button"
                  data-current={work.id === artwork.id}
                  className={work.id === artwork.id ? "is-current" : ""}
                  onClick={() => onSelect(work)}
                  aria-label={`查看：${work.title}`}
                >
                  <ArtworkImage src={work.thumb} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
