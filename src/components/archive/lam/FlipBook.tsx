import { useCallback, useEffect, useRef, useState } from "react";
import { Arrow, Bolt, FallbackImage } from "./ui";

type Plate =
  | {
      kind: "image";
      src: string;
      fallbackSrc: string;
      alt: string;
      caption: string;
      fit: "cover" | "contain";
    }
  | { kind: "colophon" };

type Volume = {
  id: string;
  index: string;
  title: string;
  japanese: string;
  role: string;
  year: string;
  accent: "red" | "cyan" | "acid";
  cover: string;
  coverFallback: string;
  coverAlt: string;
  blurb: string;
  specs: { label: string; value: string }[];
  link: string;
  linkLabel: string;
  plates: Plate[];
};

const PIE = "https://pie.co.jp/wp/wp-content/uploads/2024/10";

const volumes: Volume[] = [
  {
    id: "ikaduchi",
    index: "01",
    title: "IKADUCHI",
    japanese: "LAM画集 いかづち",
    role: "AUTHOR / FIRST SOLO ART BOOK",
    year: "2024",
    accent: "red",
    cover: "/images/book-ikaduchi-cover.jpg",
    coverFallback: `${PIE}/a9d152038a180d25ca33a7797e45cdab-610x906.jpg`,
    coverAlt: "Cover of LAM Artworks IKADUCHI, showing a striking character illustration.",
    blurb:
      "LAM's first commercial art book. A curated selection of published work sits alongside numerous original illustrations — character designs, key visuals and cover art gathered into one full-colour volume.",
    specs: [
      { label: "PUBLISHER", value: "PIE International" },
      { label: "RELEASE", value: "2024.10.23" },
      { label: "FORMAT", value: "297 × 200 mm / Softcover" },
      { label: "EXTENT", value: "182 pages / Full colour" },
      { label: "ISBN", value: "978-4-7562-5948-6" },
      { label: "ROLE", value: "Author / Illustrator" },
    ],
    link: "https://pie.co.jp/book/i/5948/?lang=asia",
    linkLabel: "FIND THIS BOOK",
    plates: [
      { kind: "colophon" },
      {
        kind: "image",
        src: "/images/spread-01.jpg",
        fallbackSrc: `${PIE}/58e3bbcf09729715e332937ffd1b8e34-1000x742.jpg`,
        alt: "IKADUCHI interior spread: two LAM character illustrations in red, teal and black.",
        caption: "SPREAD / CHARACTER",
        fit: "cover",
      },
      {
        kind: "image",
        src: "/images/spread-02.jpg",
        fallbackSrc: `${PIE}/99ffdda30d170d78dfd3030bded7f54f-1000x742.jpg`,
        alt: "IKADUCHI interior spread: a green-eyed LAM character surrounded by black serpents.",
        caption: "SPREAD / SERPENT",
        fit: "cover",
      },
      {
        kind: "image",
        src: "/images/spread-03.jpg",
        fallbackSrc: `${PIE}/0ac255d65dec89a4efddff0b35bb1817-1000x742.jpg`,
        alt: "IKADUCHI interior spread: a tattooed LAM figure against a brilliant yellow field.",
        caption: "SPREAD / YELLOW",
        fit: "cover",
      },
      {
        kind: "image",
        src: "/images/spread-04.jpg",
        fallbackSrc: `${PIE}/d295afb78e77693a59162706f4b82a2a-1000x742.jpg`,
        alt: "IKADUCHI interior spread: a dark-haired LAM character with white flowers on scarlet.",
        caption: "SPREAD / SCARLET",
        fit: "cover",
      },
      {
        kind: "image",
        src: "/images/spread-05.jpg",
        fallbackSrc: `${PIE}/f632f339422e6523c68d80d7166c0aa0-1000x742.jpg`,
        alt: "IKADUCHI interior spread: a red-haired LAM character amid flames and serpents.",
        caption: "SPREAD / FLAME",
        fit: "cover",
      },
    ],
  },
  {
    id: "visions2027",
    index: "02",
    title: "VISIONS 2027",
    japanese: "視界（せかい）を広げる、イラストの力。",
    role: "COVER ILLUSTRATION / 描き下ろし",
    year: "2026",
    accent: "cyan",
    cover: "/images/book-visions2027-cover.jpg",
    coverFallback:
      "https://img.kai-you.net/storage/2026/07/dcd31f09-f36d-46fd-9250-63574e72f764/main/71yleIvsKXL._SL1500_.webp",
    coverAlt:
      "Cover of VISIONS 2027 ILLUSTRATORS BOOK, an original illustration drawn by LAM for the series.",
    blurb:
      "The latest volume of pixiv's long-running ILLUSTRATORS BOOK series, gathering 170 creators from around the world. LAM drew the cover illustration specifically for the edition.",
    specs: [
      { label: "PUBLISHER", value: "KADOKAWA / pixiv" },
      { label: "RELEASE", value: "2026.09.26" },
      { label: "FORMAT", value: "B5 · 257 × 182 mm" },
      { label: "EXTENT", value: "352 pages / 170 creators" },
      { label: "PRICE", value: "¥3,300" },
      { label: "ROLE", value: "Cover illustration" },
    ],
    link: "https://visions.pr-pixiv.net/2027/",
    linkLabel: "VISIT THE SPECIAL SITE",
    plates: [
      { kind: "colophon" },
      {
        kind: "image",
        src: "/images/book-visions2027-cover.jpg",
        fallbackSrc:
          "https://img.kai-you.net/storage/2026/07/dcd31f09-f36d-46fd-9250-63574e72f764/main/71yleIvsKXL._SL1500_.webp",
        alt: "LAM's original cover illustration for VISIONS 2027, shown in full.",
        caption: "PLATE / COVER ART",
        fit: "contain",
      },
      {
        kind: "image",
        src: "/images/lam-visions2027-detail.jpg",
        fallbackSrc:
          "https://img.kai-you.net/storage/2026/07/dcd31f09-f36d-46fd-9250-63574e72f764/main/71yleIvsKXL._SL1500_.webp",
        alt: "Detail of LAM's VISIONS 2027 cover illustration, focusing on the character's eyes.",
        caption: "DETAIL / THE EYES",
        fit: "cover",
      },
    ],
  },
  {
    id: "visions2021",
    index: "03",
    title: "VISIONS 2021",
    japanese: "ILLUSTRATORS BOOK",
    role: "FEATURED CREATOR",
    year: "2020",
    accent: "acid",
    cover: "/images/book-visions2021-cover.jpg",
    coverFallback: "https://s.pximg.net/common/images/visions2021/book.jpg",
    coverAlt: "Cover of VISIONS 2021 ILLUSTRATORS BOOK, the pixiv-supervised art book featuring LAM.",
    blurb:
      "The inaugural volume of the VISIONS series, supervised by pixiv. LAM appears among the featured illustrators, with the edition accompanied by a launch exhibition in Ikebukuro.",
    specs: [
      { label: "PUBLISHER", value: "pixiv × KADOKAWA" },
      { label: "RELEASE", value: "2020.11" },
      { label: "SERIES", value: "VISIONS / Volume 01" },
      { label: "LANGUAGE", value: "Japanese" },
      { label: "EXHIBITION", value: "Seibu Ikebukuro" },
      { label: "ROLE", value: "Featured illustrator" },
    ],
    link: "https://www.pixiv.net/special/visions2021/",
    linkLabel: "VISIT THE SPECIAL SITE",
    plates: [
      { kind: "colophon" },
      {
        kind: "image",
        src: "/images/lam-visions2021-art.jpg",
        fallbackSrc: "https://s.pximg.net/common/images/visions2021/creators/69.jpg",
        alt: "The LAM illustration featured inside VISIONS 2021 ILLUSTRATORS BOOK.",
        caption: "PLATE / LAM IN VISIONS",
        fit: "contain",
      },
      {
        kind: "image",
        src: "/images/lam-visions2022-art.jpg",
        fallbackSrc: "https://s.pximg.net/common/images/visions2022/creators/128.png",
        alt: "The LAM illustration featured inside the follow-up volume, VISIONS 2022.",
        caption: "PLATE / VISIONS 2022",
        fit: "contain",
      },
    ],
  },
];

type Turn = { from: number; to: number; dir: 1 | -1; key: number } | null;

export default function FlipBook() {
  const [volumeIndex, setVolumeIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [plate, setPlate] = useState(0);
  const [turn, setTurn] = useState<Turn>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hasOpened, setHasOpened] = useState(false);

  const volume = volumes[volumeIndex];
  const pageCount = volume.plates.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const turnKey = useRef(0);

  const selectVolume = useCallback(
    (index: number) => {
      if (index === volumeIndex) return;
      setVolumeIndex(index);
      setPlate(0);
      setOpen(false);
      setTurn(null);
    },
    [volumeIndex],
  );

  const toggleOpen = useCallback(() => {
    setOpen((value) => {
      if (!value) setHasOpened(true);
      return !value;
    });
    if (open) setTurn(null);
  }, [open]);

  const goTo = useCallback(
    (target: number) => {
      if (!open || turn) return;
      const next = Math.max(0, Math.min(pageCount - 1, target));
      if (next === plate) return;
      turnKey.current += 1;
      setTurn({ from: plate, to: next, dir: next > plate ? 1 : -1, key: turnKey.current });
      setPlate(next);
    },
    [open, pageCount, plate, turn],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!open) {
        setOpen(true);
        setHasOpened(true);
        return;
      }
      if (dir === 1) {
        if (plate < pageCount - 1) goTo(plate + 1);
        else setOpen(false);
      } else if (plate > 0) goTo(plate - 1);
    },
    [goTo, open, pageCount, plate],
  );

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "Escape" && open) {
        setOpen(false);
      }
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [open, step]);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (open || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -9, y: px * 15 });
  };

  const current = volume.plates[plate];
  const fromPlate = turn ? volume.plates[turn.from] : null;
  const toPlate = turn ? volume.plates[turn.to] : null;

  return (
    <section aria-labelledby="shelf-title" className="shelfroom" id="artbook">
      <div className="shelfroom__inner page-width">
        <div className="shelfroom__intro" data-reveal>
          <p className="section-label">
            <Bolt /> <span>05 / IN PRINT</span>
          </p>
          <div>
            <h2 id="shelf-title">
              PULL A BOOK <span>OFF THE SHELF.</span>
            </h2>
            <p className="shelfroom__blurb">
              Three published volumes carrying LAM&apos;s work. Choose one, then open it — turn the
              pages with the arrows, the thumbnails, or your keyboard.
            </p>
          </div>
        </div>

        <div className="shelf" data-reveal>
          {volumes.map((item, index) => (
            <button
              aria-pressed={index === volumeIndex}
              className={`shelf__book shelf__book--${item.accent}${
                index === volumeIndex ? " is-active" : ""
              }`}
              key={item.id}
              onClick={() => selectVolume(index)}
              type="button"
            >
              <span className="shelf__cover">
                <FallbackImage
                  alt=""
                  aria-hidden="true"
                  fallbackSrc={item.coverFallback}
                  loading="lazy"
                  src={item.cover}
                />
              </span>
              <span className="shelf__meta">
                <span className="shelf__index">{item.index}</span>
                <span className="shelf__title">{item.title}</span>
                <span className="shelf__year">{item.year}</span>
              </span>
            </button>
          ))}
          <span aria-hidden="true" className="shelf__board" />
        </div>

        <div className="reader">
          <div
            className="reader__stage"
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                step(1);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                step(-1);
              }
            }}
            onPointerLeave={() => setTilt({ x: 0, y: 0 })}
            onPointerMove={onPointerMove}
            ref={stageRef}
          >
            <div
              className={`book${open ? " is-open" : ""}`}
              style={
                open
                  ? undefined
                  : { transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }
              }
            >
              <div className="book__pages">
                <div aria-live="polite" className="book__plate">
                  {current.kind === "colophon" ? (
                    <div className="colophon">
                      <p className="colophon__rule" />
                      <p className="colophon__kicker">LAM / {volume.year}</p>
                      <p className="colophon__title">{volume.title}</p>
                      <p className="colophon__japanese" lang="ja">
                        {volume.japanese}
                      </p>
                      <p className="colophon__role">{volume.role}</p>
                      <p className="colophon__foot">
                        {volume.specs[0].value} <span>/</span> {volume.specs[1].value}
                      </p>
                    </div>
                  ) : (
                    <>
                      <FallbackImage
                        alt={current.alt}
                        className={`book__image book__image--${current.fit}`}
                        fallbackSrc={current.fallbackSrc}
                        src={current.src}
                      />
                      <span className="book__caption">{current.caption}</span>
                    </>
                  )}
                </div>
                <span aria-hidden="true" className="book__gutter" />
              </div>

              {turn && fromPlate && toPlate && (
                <div
                  className={`book__leaf book__leaf--${turn.dir === 1 ? "forward" : "backward"}`}
                  key={turn.key}
                  onAnimationEnd={() => setTurn(null)}
                >
                  <span className="leaf__face leaf__face--front">
                    {turn.dir === 1 ? (
                      fromPlate.kind === "image" ? (
                        <FallbackImage
                          alt=""
                          aria-hidden="true"
                          className={`book__image book__image--${fromPlate.fit}`}
                          fallbackSrc={fromPlate.fallbackSrc}
                          src={fromPlate.src}
                        />
                      ) : (
                        <span className="leaf__paper" />
                      )
                    ) : toPlate.kind === "image" ? (
                      <FallbackImage
                        alt=""
                        aria-hidden="true"
                        className={`book__image book__image--${toPlate.fit}`}
                        fallbackSrc={toPlate.fallbackSrc}
                        src={toPlate.src}
                      />
                    ) : (
                      <span className="leaf__paper" />
                    )}
                  </span>
                  <span className="leaf__face leaf__face--back">
                    {turn.dir === 1 ? (
                      toPlate.kind === "image" ? (
                        <FallbackImage
                          alt=""
                          aria-hidden="true"
                          className={`book__image book__image--${toPlate.fit}`}
                          fallbackSrc={toPlate.fallbackSrc}
                          src={toPlate.src}
                        />
                      ) : (
                        <span className="leaf__paper" />
                      )
                    ) : fromPlate.kind === "image" ? (
                      <FallbackImage
                        alt=""
                        aria-hidden="true"
                        className={`book__image book__image--${fromPlate.fit}`}
                        fallbackSrc={fromPlate.fallbackSrc}
                        src={fromPlate.src}
                      />
                    ) : (
                      <span className="leaf__paper" />
                    )}
                  </span>
                </div>
              )}

              <button
                aria-expanded={open}
                className="book__cover"
                onClick={toggleOpen}
                type="button"
              >
                <span className="cover__face cover__face--front">
                  <FallbackImage
                    alt={open ? "" : volume.coverAlt}
                    aria-hidden={open}
                    fallbackSrc={volume.coverFallback}
                    src={volume.cover}
                  />
                  <span aria-hidden="true" className="cover__sheen" />
                  <span aria-hidden="true" className="cover__spine" />
                  <span className="cover__hint">
                    <span>{open ? "CLOSE" : "OPEN"}</span>
                    <Arrow direction="right" />
                  </span>
                </span>
                <span aria-hidden="true" className="cover__face cover__face--back">
                  <span className="titlepage">
                    <Bolt />
                    <span className="titlepage__title">{volume.title}</span>
                    <span className="titlepage__japanese" lang="ja">
                      {volume.japanese}
                    </span>
                    <span className="titlepage__role">{volume.role}</span>
                  </span>
                </span>
              </button>
            </div>

            {!hasOpened && (
              <p aria-hidden="true" className="reader__hint">
                <span>CLICK THE COVER</span>
              </p>
            )}
          </div>

          <div className="reader__panel" key={volume.id}>
            <p className="reader__role">{volume.role}</p>
            <h3 className="reader__title">
              {volume.title}
              <span className="reader__index">VOL {volume.index}</span>
            </h3>
            <p className="reader__japanese" lang="ja">
              {volume.japanese}
            </p>
            <p className="reader__blurb">{volume.blurb}</p>

            <dl className="reader__specs">
              {volume.specs.map((spec) => (
                <div key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>

            <div className="reader__controls">
              <button
                className="reader__turn"
                disabled={!open || plate === 0}
                onClick={() => step(-1)}
                type="button"
              >
                <Arrow direction="right" /> <span>PREV</span>
              </button>
              <p aria-live="polite" className="reader__counter">
                {open ? (
                  <>
                    PLATE {String(plate + 1).padStart(2, "0")}
                    <span>/ {String(pageCount).padStart(2, "0")}</span>
                  </>
                ) : (
                  <>CLOSED</>
                )}
              </p>
              <button
                className="reader__turn reader__turn--next"
                disabled={open && plate === pageCount - 1}
                onClick={() => step(1)}
                type="button"
              >
                <span>{open && plate === pageCount - 1 ? "CLOSE" : "NEXT"}</span>{" "}
                <Arrow direction="right" />
              </button>
            </div>

            <div className="reader__strip">
              {volume.plates.map((item, index) => (
                <button
                  aria-current={index === plate && open}
                  aria-label={`Go to plate ${index + 1}`}
                  className={`reader__thumb${index === plate && open ? " is-active" : ""}`}
                  disabled={!open}
                  key={`${volume.id}-${index}`}
                  onClick={() => goTo(index)}
                  type="button"
                >
                  {item.kind === "image" ? (
                    <FallbackImage
                      alt=""
                      aria-hidden="true"
                      fallbackSrc={item.fallbackSrc}
                      loading="lazy"
                      src={item.src}
                    />
                  ) : (
                    <span className="reader__thumb-colophon">
                      <Bolt />
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="reader__actions">
              <a className="reader__link" href={volume.link} rel="noreferrer" target="_blank">
                <span>{volume.linkLabel}</span>
                <Arrow direction="right" />
              </a>
              <a
                className="reader__credit"
                href="https://x.com/ramdayo1122"
                rel="noreferrer"
                target="_blank"
              >
                ARTWORK © LAM <Arrow />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
