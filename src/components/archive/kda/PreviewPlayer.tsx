"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { ArrowUpRight, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { releases, type Track } from "./catalog";

type PreviewContextValue = {
  track: Track | null;
  playing: boolean;
  playTrack: (track: Track) => void;
  pause: () => void;
};

const PreviewContext = createContext<PreviewContextValue | null>(null);

export function usePreview() {
  const context = useContext(PreviewContext);
  if (!context) throw new Error("usePreview must be used inside PreviewProvider");
  return context;
}

function formatTime(time: number) {
  if (!Number.isFinite(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function LiveVisualizer({
  analyserRef,
  audioRef,
  active,
}: {
  analyserRef: RefObject<AnalyserNode | null>;
  audioRef: RefObject<HTMLAudioElement | null>;
  active: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let bins: Uint8Array<ArrayBuffer> | null = null;
    const bars = 28;
    const smooth = new Array<number>(bars).fill(0.08);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, canvas.clientWidth);
      const h = Math.max(1, canvas.clientHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const fallback = (i: number, time: number) => {
      const t = time;
      const a = 0.55 + 0.45 * Math.sin(t * (2.4 + i * 0.17) + i * 0.6);
      const b = 0.5 + 0.5 * Math.sin(t * 5.1 + i * 0.35);
      const c = 0.5 + 0.5 * Math.sin(t * 1.15 + i * 0.9);
      const envelope = 0.55 + 0.45 * Math.abs(Math.sin(t * 2.05));
      return Math.min(1, Math.abs(a * b) * c * envelope);
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w < 2 || h < 2) {
        raf = requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, w, h);
      const playing = activeRef.current;
      const analyser = analyserRef.current;
      const audio = audioRef.current;
      const time = audio && !audio.paused ? audio.currentTime : performance.now() / 1000;
      let energy = 0;
      if (playing && analyser) {
        if (!bins || bins.length !== analyser.frequencyBinCount) {
          bins = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
        }
        analyser.getByteFrequencyData(bins);
        for (let i = 0; i < bins.length; i++) energy += bins[i];
        energy /= bins.length * 255;
      }

      const gap = 2.5;
      const bw = Math.max(2, (w - gap * (bars - 1)) / bars);
      for (let i = 0; i < bars; i++) {
        let v = 0.07;
        if (playing && energy > 0.02 && bins) {
          const idx = Math.min(bins.length - 1, Math.floor(Math.pow(i / bars, 1.15) * bins.length * 0.55));
          v = Math.pow(bins[idx] / 255, 0.85);
        } else if (playing) {
          v = fallback(i, time);
        }
        smooth[i] += (v - smooth[i]) * (playing ? 0.42 : 0.12);
        const bh = Math.max(2, smooth[i] * h);
        ctx.fillStyle = i % 4 === 0 ? "#ff9ab8" : "#f43e72";
        ctx.globalAlpha = playing ? 0.55 + smooth[i] * 0.45 : 0.28;
        ctx.fillRect(i * (bw + gap), h - bh, bw, bh);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [analyserRef, audioRef]);

  return <canvas ref={canvasRef} className="viz-canvas" aria-hidden="true" />;
}

export function PreviewProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const playRequest = useRef(0);
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");

  function ensureGraph() {
    const audio = audioRef.current;
    if (!audio || ctxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.68;
      const gain = ctx.createGain();
      gain.gain.value = muted ? 0 : volume;
      source.connect(analyser);
      analyser.connect(gain);
      gain.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      gainRef.current = gain;
    } catch {
      ctxRef.current = null;
    }
  }

  function start(audio: HTMLAudioElement) {
    const request = ++playRequest.current;
    setError("");
    if (audio.ended) audio.currentTime = 0;
    ensureGraph();
    if (ctxRef.current?.state === "suspended") void ctxRef.current.resume();
    void audio.play().catch(() => {
      if (request !== playRequest.current) return;
      setPlaying(false);
      setError("Preview unavailable. Open the track on Apple Music instead.");
    });
  }

  function playTrack(next: Track) {
    const audio = audioRef.current;
    if (!audio) return;

    if (track?.id === next.id && audio.src) {
      if (audio.paused) start(audio);
      else pause();
      return;
    }

    audio.pause();
    audio.src = next.previewUrl;
    audio.load();
    setTrack(next);
    setPosition(0);
    setDuration(0);
    start(audio);
  }

  function pause() {
    playRequest.current += 1;
    audioRef.current?.pause();
  }

  function close() {
    playRequest.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setTrack(null);
    setError("");
    setPosition(0);
  }

  useEffect(() => {
    const level = muted ? 0 : volume;
    const audio = audioRef.current;
    if (audio) audio.volume = level;
    const gain = gainRef.current;
    const ctx = ctxRef.current;
    if (gain && ctx) {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setTargetAtTime(level, ctx.currentTime, 0.03);
    }
  }, [volume, muted]);

  const cover = releases.find((release) => release.id === track?.release)?.cover;

  return (
    <PreviewContext.Provider value={{ track, playing, playTrack, pause }}>
      {children}
      {track && <div className="player-spacer" aria-hidden="true" />}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration;
          setDuration(Number.isFinite(value) ? value : 0);
        }}
        onError={() => {
          if (audioRef.current?.getAttribute("src")) {
            setPlaying(false);
            setError("Preview unavailable. Open the track on Apple Music instead.");
          }
        }}
      />
      {track && (
        <aside className="player-bar" aria-label="Apple Music preview player">
          <div className="player-inner">
            <img src={cover} alt="" className="player-cover" />
            <div className="player-info" aria-live="polite">
              <span className="player-label">APPLE MUSIC PREVIEW</span>
              <strong>{track.title}</strong>
              <span className="player-artist">K/DA</span>
            </div>
            <div className="player-viz">
              <LiveVisualizer analyserRef={analyserRef} audioRef={audioRef} active={playing} />
            </div>
            <button
              className="player-play"
              onClick={() => {
                const audio = audioRef.current;
                if (!audio) return;
                if (audio.paused) start(audio);
                else pause();
              }}
              aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
            >
              {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            <div className="player-progress">
              <span>{formatTime(position)}</span>
              <input
                type="range"
                min="0"
                max={duration || 1}
                step="0.1"
                value={Math.min(position, duration || 1)}
                aria-label="Seek within the preview"
                onChange={(event) => {
                  const value = Number(event.target.value);
                  const audio = audioRef.current;
                  if (audio) audio.currentTime = value;
                  setPosition(value);
                }}
                style={{ "--progress": `${duration ? (position / duration) * 100 : 0}%` } as React.CSSProperties}
              />
              <span>{formatTime(duration)}</span>
            </div>
            <div className="player-volume-group">
              <button
                className="player-icon player-volume"
                aria-label={muted ? "Unmute preview" : "Mute preview"}
                onClick={() => setMuted((value) => !value)}
              >
                {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                className="player-volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                aria-label="Preview volume"
                onChange={(event) => {
                  setVolume(Number(event.target.value));
                  setMuted(false);
                }}
                style={{ "--progress": `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
              />
            </div>
            <a className="player-link" href={track.appleUrl} target="_blank" rel="noreferrer">
              FULL TRACK <ArrowUpRight size={14} />
            </a>
            <button className="player-icon" aria-label="Close preview player" onClick={close}>
              <X size={18} />
            </button>
          </div>
          {error && (
            <p className="player-error" role="status">
              {error} <a href={track.appleUrl} target="_blank" rel="noreferrer">Open track</a>
            </p>
          )}
        </aside>
      )}
    </PreviewContext.Provider>
  );
}
