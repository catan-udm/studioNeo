import { useCallback, useEffect, useRef, useState } from "react";
import { Arrow, Bolt } from "./ui";

/** Thin loader that runs on first paint only, locking scroll while it does. */
export function Intro({ ready }: { ready: boolean }) {
  const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("gone");
      return;
    }

    document.documentElement.classList.add("is-locked");
    if (!ready) return;

    const out = window.setTimeout(() => setPhase("leaving"), 420);
    const remove = window.setTimeout(() => {
      document.documentElement.classList.remove("is-locked");
      setPhase("gone");
    }, 1120);
    return () => {
      window.clearTimeout(out);
      window.clearTimeout(remove);
      document.documentElement.classList.remove("is-locked");
    };
  }, [ready]);

  if (phase === "gone") return <span className="visually-hidden" aria-live="polite">Page ready.</span>;

  return (
    <div
      className={`intro${phase === "leaving" ? " is-leaving" : ""}`}
      aria-hidden="true"
    >
      <div className="intro__mark">
        <Bolt />
        <span className="intro__word">LAM</span>
        <span className="intro__meta">PORTFOLIO / 2026</span>
      </div>
      <div className="intro__bar">
        <span />
      </div>
      <p className="intro__status">
        <span>LOADING ARTWORK</span>
        <span>© LAM</span>
      </p>
    </div>
  );
}

/** A small floating bar: share, keyboard help, back to the top. */
export function UtilityBar() {
  const [toast, setToast] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const toastTimer = useRef(0);

  const flash = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    setVisible(window.scrollY > 500);
    const onScroll = () => setVisible(window.scrollY > 500);
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;
      if (event.key === "?" || (event.shiftKey && event.key === "/")) {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent("lam:shortcuts"));
      }
      if (event.key === "Escape") document.dispatchEvent(new CustomEvent("lam:escape"));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(toastTimer.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const share = useCallback(async () => {
    const payload = {
      title: "LAM — Illustrator & Character Designer",
      text: "Colour that refuses to blend in. Selected work, art books and chronology for illustrator LAM.",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        flash("SHARED");
        return;
      }
      await navigator.clipboard.writeText(payload.url);
      flash("LINK COPIED");
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(payload.url);
        flash("LINK COPIED");
      } catch {
        flash("COPY UNAVAILABLE");
      }
    }
  }, [flash]);

  return (
    <>
      <div aria-live="polite" className={`toast${toast ? " is-shown" : ""}`}>
        <Bolt /> {toast ?? ""}
      </div>

      <div className={`util${visible ? " is-shown" : ""}`}>
        <button aria-label="Share this page" onClick={share} type="button">
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <path
              d="M8 12.5 15.5 8M8 12.5l7.5 4.5"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <circle cx="17" cy="7" r="2.6" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="17" cy="18" r="2.6" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="6" cy="12.5" r="2.6" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <span>SHARE</span>
        </button>
        <span aria-hidden="true" className="util__rule" />
        <a aria-label="Go to the contact section" href="#contact">
          <span className="util__pulse" />
          <span>GET IN TOUCH</span>
          <Arrow />
        </a>
      </div>
    </>
  );
}

const shortcuts = [
  { keys: ["?"], label: "Open / close this panel" },
  { keys: ["1", "…", "8"], label: "Jump to a numbered section" },
  { keys: ["←", "→"], label: "Turn the art-book pages" },
  { keys: ["Esc"], label: "Close viewer, book or panel" },
  { keys: ["0", "T"], label: "Return to the top" },
];

/** Global key map: number keys jump sections, ? opens this panel. */
export function Shortcuts() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen((value) => !value);
    const onEscape = () => setOpen(false);
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      // 1–8 mirror the printed section labels (01 Works … 08 Contact)
      const labelled = ["works", "practice", "profile", "color", "artbook", "years", "exhibition", "contact"];
      const index = Number(event.key);
      if (Number.isInteger(index) && index >= 1 && index <= labelled.length) {
        const target = document.getElementById(labelled[index - 1]);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.replaceState(null, "", `#${target.id}`);
        }
      }
      if (event.key === "0" || event.key.toLowerCase() === "t" || event.key === "Home") {
        event.preventDefault();
        document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
      }
    };

    document.addEventListener("lam:shortcuts", onOpen);
    document.addEventListener("lam:escape", onEscape);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("lam:shortcuts", onOpen);
      document.removeEventListener("lam:escape", onEscape);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="keys" onClick={() => setOpen(false)}>
      <div
        aria-label="Keyboard shortcuts"
        aria-modal="true"
        className="keys__panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="keys__head">
          <p>
            <Bolt /> KEYBOARD <span>/ SHORTCUTS</span>
          </p>
          <button aria-label="Close shortcuts" onClick={() => setOpen(false)} ref={closeRef} type="button">
            ESC <span aria-hidden="true">×</span>
          </button>
        </div>
        <ul>
          {shortcuts.map((item) => (
            <li key={item.label}>
              <span className="keys__keys">
                {item.keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </span>
              <span className="keys__desc">{item.label}</span>
            </li>
          ))}
        </ul>
        <p className="keys__foot">
          PRESS <kbd>?</kbd> AT ANY TIME — ARTWORK © LAM
        </p>
      </div>
    </div>
  );
}

export function ScrollSpyNav() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".header__nav a[href^='#']"),
    );
    const ids = links.map((link) => link.getAttribute("href")!.slice(1));
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!targets.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: [0, 0.25, 0.6] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    document.querySelectorAll<HTMLAnchorElement>(".header__nav a[href^='#']").forEach((link) => {
      const isActive = link.getAttribute("href") === `#${active}`;
      link.classList.toggle("is-current", isActive);
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }, [active]);

  return null;
}
