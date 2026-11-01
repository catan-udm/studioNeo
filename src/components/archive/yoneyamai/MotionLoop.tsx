"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { prefersReducedMotion } from "./useSiteMotion";

type Props = {
  src: string;
  poster?: string;
  label: string;
};

/**
 * A looping, muted clip that only plays while it is on screen, never
 * autoplays for visitors who prefer reduced motion, and always offers a
 * visible pause / play control.
 */
export default function MotionLoop({ src, poster, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const choice = useRef<"play" | "pause" | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const sync = () => setPlaying(!video.paused);
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);

    const reduced = prefersReducedMotion();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }
        const allowed = choice.current === "play" || (!reduced && choice.current !== "pause");
        if (allowed) video.play().catch(() => undefined);
      },
      { threshold: 0.35 }
    );
    observer.observe(video);

    return () => {
      observer.disconnect();
      video.removeEventListener("play", sync);
      video.removeEventListener("pause", sync);
    };
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      choice.current = "play";
      video.play().catch(() => undefined);
    } else {
      choice.current = "pause";
      video.pause();
    }
  };

  return (
    <div className="screen">
      <video
        ref={ref}
        src={src}
        poster={poster || undefined}
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        aria-label={label}
      />
      <button
        type="button"
        className="loop-btn"
        onClick={toggle}
        aria-label={playing ? "Pause animation" : "Play animation"}
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </div>
  );
}
