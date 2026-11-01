"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown, ArrowDownUp, ArrowRight, ArrowUpRight, Asterisk, AtSign,
  Bookmark, Check, ChevronLeft, ChevronRight, ExternalLink, FolderOpen,
  Frame, Grid2X2, Images, LayoutDashboard, LayoutGrid, List, Maximize2, Menu,
  MousePointer2, Pause, Play, Search, Shuffle, UserRound, X,
} from "lucide-react";
import { artist, artworks, kindLabels, moodLabels } from "./data/artworks";
import type { Artwork, ArtworkKind, ArtworkMood } from "./data/artworks";
import { ArtworkViewer } from "./components/ArtworkViewer";
import { ArtworkImage } from "./components/ArtworkImage";
import { useStoredIds } from "./hooks/useStoredIds";
import "./dora.css";

type Filter = "all" | ArtworkKind | ArtworkMood | "saved";
type GalleryLayout = "grid" | "list" | "wall";
type SortOrder = "curated" | "title-az" | "newest";
type Section = "overview" | "works" | "about" | "connect";

const sectionLabels: Record<Section, string> = {
  overview: "工作室概览",
  works: "作品档案",
  about: "关于画者",
  connect: "关注画者",
};

const navigation = [
  { id: "overview" as const, label: "工作室概览", english: "Overview", icon: LayoutDashboard },
  { id: "works" as const, label: "作品档案", english: "Artwork archive", icon: Images },
  { id: "about" as const, label: "关于画者", english: "The artist", icon: UserRound },
];

const filterOptions: { id: Filter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "figures", label: "人物" },
  { id: "places", label: "场景" },
  { id: "night", label: "夜色" },
  { id: "city", label: "城市" },
  { id: "indoor", label: "室内" },
  { id: "nature", label: "自然" },
  { id: "fashion", label: "时尚" },
  { id: "saved", label: "已收藏" },
];

const kindKeys: ArtworkKind[] = ["figures", "places"];
const moodKeys: ArtworkMood[] = ["night", "day", "dusk", "indoor", "nature", "city", "fashion"];

export function DoraPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 1050px)").matches);
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [featuredId, setFeaturedId] = useState(artworks[0].id);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("curated");
  const [galleryLayout, setGalleryLayout] = useState<GalleryLayout>("grid");
  const [slideshow, setSlideshow] = useState(false);
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);
  const [viewerCollection, setViewerCollection] = useState<Artwork[]>(artworks);
  const [savedIds, setSavedIds] = useStoredIds("dora-studio-saved");
  const [recentIds, setRecentIds] = useStoredIds("dora-studio-recent");
  const [toast, setToast] = useState<{ message: string; saved: boolean } | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);

  const featured = artworks.find((work) => work.id === featuredId) ?? artworks[0];
  const featuredPosition = artworks.findIndex((work) => work.id === featured.id);
  const recentWorks = recentIds.map((id) => artworks.find((work) => work.id === id)).filter((work): work is Artwork => Boolean(work)).slice(0, 3);

  const visibleArtworks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const result = artworks.filter((work) => {
      const matchesFilter = filter === "all"
        || (filter === "saved" ? savedIds.includes(work.id)
          : kindKeys.includes(filter as ArtworkKind) ? work.kind === filter
          : moodKeys.includes(filter as ArtworkMood) && work.moods.includes(filter as ArtworkMood));
      const haystack = `${work.title} ${work.englishTitle} ${kindLabels[work.kind]} ${work.moods.map((mood) => moodLabels[mood]).join(" ")} ${work.year} ${work.alt}`.toLocaleLowerCase();
      return matchesFilter && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
    if (sortOrder === "title-az") result.sort((a, b) => a.englishTitle.localeCompare(b.englishTitle));
    if (sortOrder === "newest") result.sort((a, b) => b.year.localeCompare(a.year) || b.id.localeCompare(a.id));
    return result;
  }, [filter, query, savedIds, sortOrder]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1050px)");
    const update = () => {
      setIsMobile(media.matches);
      if (!media.matches) setMenuOpen(false);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!menuOpen && !activeArtwork) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuOpen, activeArtwork]);

  useEffect(() => {
    if (!menuOpen) return;
    const frame = requestAnimationFrame(() => sidebarRef.current?.querySelector<HTMLElement>(".sidebar-nav a")?.focus());
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === "Tab") {
        const focusable = Array.from(sidebarRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []).filter((element) => element.offsetParent !== null);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("keydown", handleKey); };
  }, [menuOpen]);

  useEffect(() => {
    let frame = 0;
    const updateActiveSection = () => {
      frame = 0;
      const marker = window.innerHeight * 0.28;
      let current: Section = "overview";
      (Object.keys(sectionLabels) as Section[]).forEach((id) => {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= marker) current = id;
      });
      setActiveSection(current);
    };
    const scheduleUpdate = () => { if (!frame) frame = requestAnimationFrame(updateActiveSection); };
    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable || activeArtwork || menuOpen) return;
      if (event.key === "/" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      if (event.key === "j" || event.key === "ArrowRight") {
        event.preventDefault();
        setFeaturedId((current) => {
          const index = artworks.findIndex((work) => work.id === current);
          return artworks[(index + 1) % artworks.length].id;
        });
      }
      if (event.key === "k" || event.key === "ArrowLeft") {
        event.preventDefault();
        setFeaturedId((current) => {
          const index = artworks.findIndex((work) => work.id === current);
          return artworks[(index - 1 + artworks.length) % artworks.length].id;
        });
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [activeArtwork, menuOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const strip = filmstripRef.current;
    const selected = strip?.querySelector<HTMLElement>(`[data-artwork-id="${featuredId}"]`);
    if (!strip || !selected) return;
    const left = selected.offsetLeft - strip.clientWidth / 2 + selected.clientWidth / 2;
    strip.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [featuredId]);

  useEffect(() => {
    if (!slideshow || activeArtwork) return;
    const timer = window.setInterval(() => {
      setFeaturedId((current) => {
        const index = artworks.findIndex((work) => work.id === current);
        return artworks[(index + 1) % artworks.length].id;
      });
    }, 3800);
    return () => window.clearInterval(timer);
  }, [slideshow, activeArtwork]);

  const rememberArtwork = useCallback((id: string) => {
    setRecentIds((current) => [id, ...current.filter((item) => item !== id)].slice(0, 4));
  }, [setRecentIds]);

  const openArtwork = useCallback((artwork: Artwork, collection: Artwork[] = artworks) => {
    setViewerCollection(collection);
    setActiveArtwork(artwork);
    setMenuOpen(false);
    setSlideshow(false);
    rememberArtwork(artwork.id);
  }, [rememberArtwork]);

  const closeArtwork = useCallback(() => setActiveArtwork(null), []);

  const navigateArtwork = useCallback((direction: -1 | 1) => {
    if (!activeArtwork || viewerCollection.length < 2) return;
    const index = viewerCollection.findIndex((work) => work.id === activeArtwork.id);
    const next = viewerCollection[(index + direction + viewerCollection.length) % viewerCollection.length];
    setActiveArtwork(next);
    rememberArtwork(next.id);
  }, [activeArtwork, viewerCollection, rememberArtwork]);

  const selectViewerArtwork = useCallback((artwork: Artwork) => {
    setActiveArtwork(artwork);
    rememberArtwork(artwork.id);
  }, [rememberArtwork]);

  const toggleSaved = (artwork: Artwork) => {
    const wasSaved = savedIds.includes(artwork.id);
    setSavedIds((current) => wasSaved ? current.filter((id) => id !== artwork.id) : [...current, artwork.id]);
    setToast({ message: wasSaved ? `已取消收藏「${artwork.title}」` : `已收藏「${artwork.title}」`, saved: !wasSaved });
  };

  const changeFeatured = (direction: -1 | 1) => {
    const next = artworks[(featuredPosition + direction + artworks.length) % artworks.length];
    setFeaturedId(next.id);
  };

  const shuffleFeatured = () => {
    const others = artworks.filter((work) => work.id !== featuredId);
    setFeaturedId(others[Math.floor(Math.random() * others.length)].id);
  };

  const goToSection = (section: Section) => {
    setActiveSection(section);
    setMenuOpen(false);
  };

  const resetFilters = () => { setFilter("all"); setQuery(""); setSortOrder("curated"); };
  const filterCount = (id: Filter) => {
    if (id === "all") return artworks.length;
    if (id === "saved") return savedIds.length;
    if (kindKeys.includes(id as ArtworkKind)) return artworks.filter((work) => work.kind === id).length;
    return artworks.filter((work) => work.moods.includes(id as ArtworkMood)).length;
  };

  return (
    <div className="dora-page">
      <div className="studio-app" id="top">
      <a className="skip-link" href="#works">跳转到作品档案</a>
      {menuOpen && <button className="sidebar-backdrop" type="button" aria-label="关闭工作室导航" tabIndex={-1} onClick={() => { setMenuOpen(false); menuButton.current?.focus(); }} />}

      <aside id="studio-sidebar" className={`studio-sidebar flex flex-col ${menuOpen ? "is-open" : ""}`} ref={sidebarRef} aria-label="工作室导航" inert={isMobile && !menuOpen}>
        <div className="sidebar-brand-row flex items-center justify-between">
          <a href="#overview" className="studio-brand" onClick={() => goToSection("overview")} aria-label="哆啦小熙工作室首页">
            <span className="brand-wordmark">dora<span>.</span></span>
            <span className="brand-caption">哆啦小熙 / STUDIO</span>
          </a>
          <button className="sidebar-close" type="button" aria-label="关闭导航" onClick={() => { setMenuOpen(false); menuButton.current?.focus(); }}><X size={18} /></button>
        </div>

        <p className="sidebar-label mono">WORKSPACE</p>
        <nav className="sidebar-nav flex flex-col" aria-label="工作室分区">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id && !(item.id === "works" && filter === "saved");
            return (
              <a key={item.id} href={`#${item.id}`} className={`sidebar-nav-item ${active ? "is-active" : ""}`} aria-current={active ? "location" : undefined} onClick={() => goToSection(item.id)}>
                <Icon size={18} strokeWidth={1.6} /><span>{item.label}<small>{item.english}</small></span>{item.id === "works" && <em className="nav-count mono">{String(artworks.length).padStart(2, "0")}</em>}
              </a>
            );
          })}
          <a href="#works" className={`sidebar-nav-item ${activeSection === "works" && filter === "saved" ? "is-active" : ""}`} aria-current={activeSection === "works" && filter === "saved" ? "location" : undefined} onClick={() => { setFilter("saved"); setQuery(""); goToSection("works"); }}>
            <Bookmark size={18} strokeWidth={1.6} /><span>我的收藏<small>Saved collection</small></span><em className="nav-count mono">{String(savedIds.length).padStart(2, "0")}</em>
          </a>
        </nav>

        <div className="sidebar-divider" />
        <p className="sidebar-label mono">COLLECTION NOTES</p>
        <div className="sidebar-stats">
          <span><strong>{artworks.length}</strong>作品</span>
          <span><strong>{artworks.filter((work) => work.kind === "figures").length}</strong>人物</span>
          <span><strong>{artworks.filter((work) => work.kind === "places").length}</strong>场景</span>
        </div>

        <div className="sidebar-divider" />
        <p className="sidebar-label mono">THE ARTIST’S CORNER</p>
        <div className="sidebar-socials flex flex-col">
          <a href={artist.x} target="_blank" rel="noreferrer"><span className="social-icon"><AtSign size={14} /></span><span>X / Twitter</span><ArrowUpRight size={14} /></a>
          <a href={artist.pixiv} target="_blank" rel="noreferrer"><span className="social-icon"><Images size={14} /></span><span>Pixiv</span><ArrowUpRight size={14} /></a>
          <a href={artist.artstation} target="_blank" rel="noreferrer"><span className="social-icon"><Frame size={14} /></span><span>ArtStation</span><ArrowUpRight size={14} /></a>
        </div>

        {recentWorks.length > 0 && (
          <div className="recent-block">
            <p className="sidebar-label mono">RECENTLY OPENED</p>
            {recentWorks.map((work) => (
              <button type="button" className="recent-item" key={work.id} onClick={() => openArtwork(work)} aria-label={`重新查看：${work.title}`}>
                <ArtworkImage src={work.thumb} alt="" /><span>{work.title}<small className="mono">NO. {work.id}</small></span><ArrowUpRight size={13} />
              </button>
            ))}
          </div>
        )}

        <div className="sidebar-bottom mt-auto">
          <a href="#about" className="sidebar-artist flex items-center" onClick={() => goToSection("about")}>
            <span className="artist-avatar"><ArtworkImage src={artworks[1].thumb} alt="" /></span>
            <span><strong>哆啦小熙</strong><small>@{artist.handle}</small></span>
            <ArrowUpRight size={14} />
          </a>
          <p className="sidebar-note">A little world, made with care.<br /><span>非官方粉丝作品工作室</span></p>
        </div>
      </aside>

      <div className="studio-workspace min-w-0">
        <header className="studio-topbar flex items-center justify-between">
          <div className="topbar-left flex items-center">
            <button className="menu-toggle" ref={menuButton} type="button" aria-label={menuOpen ? "关闭导航" : "打开工作室导航"} aria-expanded={menuOpen} aria-controls="studio-sidebar" onClick={() => setMenuOpen((open) => !open)}><Menu size={18} /><span>菜单</span></button>
            <div className="breadcrumb flex items-center"><FolderOpen size={15} strokeWidth={1.5} /><span>工作室</span><ChevronRight size={12} /><strong>{sectionLabels[activeSection]}</strong></div>
          </div>
          <div className="topbar-right flex items-center">
            <span className="archive-status"><span className="status-dot" />{artworks.length} 幅原作已加载</span>
            <a href={artist.x} target="_blank" rel="noreferrer" className="topbar-profile">艺术家主页 <ArrowUpRight size={14} /></a>
          </div>
        </header>

        <main className="workspace-content">
          <section className="overview-section" id="overview" aria-labelledby="studio-title">
            <div className="workspace-heading flex items-end justify-between">
              <div>
                <p className="eyebrow mono"><span className="eyebrow-square" />ILLUSTRATION &amp; CONCEPT ART</p>
                <h1 id="studio-title">Dora’s studio<span>.</span></h1>
                <p className="workspace-subtitle">哆啦小熙的作品工作室 <span>·</span> {artworks.length} 幅人物、场景与日常光影</p>
              </div>
              <a href="#works" className="archive-summary" onClick={() => goToSection("works")}><strong>{String(artworks.length).padStart(2, "0")}</strong><span className="mono">SELECTED<br />ARTWORKS</span><ArrowDown size={17} /></a>
            </div>

            <section className="artboard" aria-label="精选画作展示台">
              <div className="artboard-toolbar flex items-center justify-between">
                <div className="artboard-label flex items-center"><Frame size={15} strokeWidth={1.5} /><span className="mono">ON THE ARTBOARD</span><span className="artboard-label-cn">精选画作</span></div>
                <div className="artboard-controls flex items-center">
                  <button type="button" onClick={() => changeFeatured(-1)} aria-label="上一幅精选画作" title="上一幅"><ChevronLeft size={16} /></button>
                  <span className="mono" aria-live="polite">{String(featuredPosition + 1).padStart(2, "0")} <i>/</i> {String(artworks.length).padStart(2, "0")}</span>
                  <button type="button" onClick={() => changeFeatured(1)} aria-label="下一幅精选画作" title="下一幅"><ChevronRight size={16} /></button>
                  <span className="control-divider" />
                  <button type="button" className={slideshow ? "is-active" : ""} onClick={() => setSlideshow((value) => !value)} aria-pressed={slideshow} aria-label={slideshow ? "停止轮播" : "开始轮播"} title="轮播">
                    {slideshow ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button type="button" onClick={shuffleFeatured} aria-label="随机一幅作品" title="随机"><Shuffle size={14} /></button>
                  <span className="control-divider" />
                  <button type="button" className="expand-button" aria-label="放大当前作品" onClick={() => openArtwork(featured)}><Maximize2 size={14} /><span>放大</span></button>
                </div>
              </div>
              <div className="artboard-body">
                <button className="artboard-canvas" type="button" onClick={() => openArtwork(featured)} aria-label={`放大查看：${featured.title}`}>
                  <ArtworkImage key={featured.id} src={featured.image} alt={featured.alt} fetchPriority="high" loading="eager" />
                  <span className="canvas-tag mono">ARTWORK {featured.id} · {featured.year}</span>
                  <span className="canvas-zoom"><Maximize2 size={17} /></span>
                </button>
                <div className="artboard-details flex flex-col">
                  <span className="work-kind-pill">{featured.kind === "places" ? <Frame size={12} /> : <UserRound size={12} />}{kindLabels[featured.kind]}</span>
                  <div className="artboard-title" aria-live="polite"><h2>{featured.title}</h2><p>{featured.englishTitle}</p></div>
                  <div className="artboard-moods">
                    {featured.moods.map((mood) => <span key={mood}>{moodLabels[mood]}</span>)}
                    <span>{featured.year}</span>
                  </div>
                  <p className="artboard-description">{featured.alt.replace("哆啦小熙的", "").replace("哆啦小熙创作的", "")}</p>
                  <div className="artboard-artist flex items-center"><span className="mini-avatar"><ArtworkImage src={artworks[1].thumb} alt="" /></span><span><small className="mono">ORIGINAL ART BY</small><strong>哆啦小熙 / Dora</strong></span></div>
                  <div className="artboard-actions flex flex-col">
                    <a className="button button--ink" href={featured.source} target="_blank" rel="noreferrer">在 Pixiv 查看原作 <ExternalLink size={14} /></a>
                    <button className={`button button--save ${savedIds.includes(featured.id) ? "is-saved" : ""}`} type="button" aria-pressed={savedIds.includes(featured.id)} onClick={() => toggleSaved(featured)}>
                      <Bookmark size={14} fill={savedIds.includes(featured.id) ? "currentColor" : "none"} />{savedIds.includes(featured.id) ? "已收藏 · 点击取消" : "收藏这幅作品"}
                    </button>
                  </div>
                  <p className="artboard-hint"><MousePointer2 size={12} />点击画作进入全屏 · J / K 切换</p>
                </div>
              </div>
              <div className="filmstrip-row flex items-center">
                <span className="filmstrip-label mono">THE<br />COLLECTION</span>
                <div className="filmstrip flex items-center" ref={filmstripRef} aria-label="选择展示画作">
                  {artworks.map((work) => (
                    <button key={work.id} type="button" data-artwork-id={work.id} className={`filmstrip-item ${featured.id === work.id ? "is-selected" : ""}`} aria-pressed={featured.id === work.id} aria-label={`展示作品：${work.title}`} onClick={() => setFeaturedId(work.id)}>
                      <ArtworkImage src={work.thumb} alt="" /><span className="mono">{work.id}</span>
                    </button>
                  ))}
                </div>
                <span className="filmstrip-total mono">{String(artworks.length).padStart(2, "0")}<small>PIECES</small></span>
              </div>
            </section>

            <div className="studio-note flex items-center justify-between" data-reveal>
              <div className="flex items-center"><span className="note-icon"><Asterisk size={25} strokeWidth={1.5} /></span><p>把日常，画成一个小小世界。<small>{artworks.length} original works, collected with care.</small></p></div>
              <a href="#about" className="text-link" onClick={() => goToSection("about")}>关于画者 <ArrowUpRight size={15} /></a>
            </div>
          </section>

          <section className="archive-section" id="works" aria-labelledby="archive-title">
            <div className="archive-heading flex items-end justify-between" data-reveal>
              <div><p className="section-index mono">01 / THE COLLECTION</p><h2 id="archive-title">Artwork archive <span>作品档案</span></h2></div>
              <p>每一幅画，都有自己的时间。</p>
            </div>
            <div className="archive-controls flex items-center justify-between">
              <div className="archive-filters flex flex-wrap" role="group" aria-label="筛选作品">
                {filterOptions.map((option) => (
                  <button key={option.id} type="button" className={`filter-button ${filter === option.id ? "is-active" : ""}`} aria-pressed={filter === option.id} onClick={() => setFilter(option.id)}>
                    {option.id === "saved" && <Bookmark size={13} />}{option.label}<span className="mono">{String(filterCount(option.id)).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
              <div className="archive-search flex items-center">
                <Search size={15} strokeWidth={1.6} />
                <input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索作品 / Search" aria-label="搜索作品名称或描述" />
                {query ? <button type="button" aria-label="清除搜索" onClick={() => { setQuery(""); searchRef.current?.focus(); }}><X size={14} /></button> : <kbd>/</kbd>}
              </div>
            </div>
            <div className="archive-subbar flex items-center justify-between">
              <p className="results-count" role="status" aria-live="polite">显示 <strong>{visibleArtworks.length}</strong> 件作品{filter === "saved" && <span className="saved-filter-note"><Bookmark size={11} />我的收藏</span>}{query && <span className="query-note">“{query}”</span>}</p>
              <div className="archive-options flex items-center">
                <label className="sort-control flex items-center"><ArrowDownUp size={13} /><span className="sr-only">作品排序</span>
                  <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
                    <option value="curated">策展顺序</option>
                    <option value="newest">年份由新到旧</option>
                    <option value="title-az">英文名称 A–Z</option>
                  </select>
                </label>
                <div className="layout-switch flex items-center" role="group" aria-label="作品排列方式">
                  <button type="button" className={galleryLayout === "grid" ? "is-active" : ""} aria-pressed={galleryLayout === "grid"} onClick={() => setGalleryLayout("grid")}><Grid2X2 size={14} /><span>网格</span></button>
                  <button type="button" className={galleryLayout === "wall" ? "is-active" : ""} aria-pressed={galleryLayout === "wall"} onClick={() => setGalleryLayout("wall")}><LayoutGrid size={14} /><span>展墙</span></button>
                  <button type="button" className={galleryLayout === "list" ? "is-active" : ""} aria-pressed={galleryLayout === "list"} onClick={() => setGalleryLayout("list")}><List size={15} /><span>列表</span></button>
                </div>
              </div>
            </div>

            {visibleArtworks.length > 0 ? (
              <div className={`artwork-gallery artwork-gallery--${galleryLayout}`} aria-label="作品档案列表">
                {visibleArtworks.map((work) => {
                  const isSaved = savedIds.includes(work.id);
                  return (
                    <article className={`artwork-card artwork-card--${work.kind}`} key={work.id}>
                      <div className="artwork-preview">
                        <button className="artwork-open-button" type="button" onClick={() => openArtwork(work, visibleArtworks)} aria-label={`放大查看：${work.title}`}>
                          <ArtworkImage src={galleryLayout === "wall" ? work.image : work.thumb} alt={work.alt} />
                          <span className="artwork-hover-label"><Maximize2 size={14} />打开作品</span>
                        </button>
                        <span className="artwork-number mono">{work.id}</span>
                        <button className={`artwork-save ${isSaved ? "is-saved" : ""}`} type="button" aria-pressed={isSaved} aria-label={`${isSaved ? "取消收藏" : "收藏"}：${work.title}`} title={isSaved ? "取消收藏" : "收藏作品"} onClick={() => toggleSaved(work)}>
                          <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <div className="artwork-card-body">
                        <p className="artwork-english">{work.englishTitle} · {work.year}</p>
                        <h3>{work.title}</h3>
                        <p className="artwork-description">{work.alt}</p>
                        <div className="artwork-card-footer flex items-center justify-between">
                          <span className="artwork-kind">{work.kind === "places" ? <Frame size={11} /> : <UserRound size={11} />}{work.kind === "places" ? "场景插画" : "人物插画"}</span>
                          <a href={work.source} target="_blank" rel="noreferrer" aria-label={`在 Pixiv 查看原作：${work.title}`}>Pixiv <ArrowUpRight size={12} /></a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state flex flex-col items-center">
                <span className="empty-icon">{filter === "saved" && !query ? <Bookmark size={28} strokeWidth={1.3} /> : <Search size={28} strokeWidth={1.3} />}</span>
                <h3>{filter === "saved" && !query ? "把喜欢的画，留在这里。" : "暂时没有找到这幅画。"}</h3>
                <p>{filter === "saved" && !query ? "点击作品右上角的收藏图标，建立你的小小画集。" : "试试作品名称、人物、夜色或城市，或清除筛选重新浏览。"}</p>
                <button className="button button--ink" type="button" onClick={resetFilters}>浏览全部作品 <ArrowRight size={15} /></button>
              </div>
            )}
            <div className="archive-footer flex items-center justify-between">
              <p>作品版权归哆啦小熙所有。<span>中英文展示标题为本选集编辑名称。共收录 {artworks.length} 幅原作。</span></p>
              <a href={artist.pixiv} target="_blank" rel="noreferrer" className="text-link">更多作品见 Pixiv <ArrowUpRight size={15} /></a>
            </div>
          </section>

          <section className="artist-section" id="about" aria-labelledby="artist-title" data-reveal>
            <div className="artist-section-image">
              <ArtworkImage src={artworks[5].image} alt={artworks[5].alt} />
              <span className="artist-image-caption mono">A LITTLE WORLD BY DORA</span>
              <span className="artist-image-sticker" aria-hidden="true"><Asterisk size={35} strokeWidth={1.4} /></span>
            </div>
            <div className="artist-section-copy">
              <p className="section-index mono">02 / BEHIND THE FRAMES</p>
              <h2 id="artist-title">Meet the artist<span>.</span></h2>
              <h3>哆啦小熙 <span>/ Dora</span></h3>
              <p className="artist-role">插画师 · 角色与概念设计师</p>
              <p className="artist-bio">用真实的光影、细密的环境与鲜活的人物，把熟悉的日常变成值得停留的画面。</p>
              <div className="artist-tags flex flex-wrap"><span>Illustration</span><span>Character design</span><span>Concept art</span></div>
              <p className="artist-fan-note">这是一个非官方粉丝作品选集，收录 {artworks.length} 幅原作。<br />新作与画者日常，请在她的个人主页查看。</p>
              <div className="artist-profile-links flex flex-wrap">
                <a href={artist.x} target="_blank" rel="noreferrer"><AtSign size={13} /> Twitter <ArrowUpRight size={13} /></a>
                <a href={artist.pixiv} target="_blank" rel="noreferrer">Pixiv <ArrowUpRight size={13} /></a>
                <a href={artist.artstation} target="_blank" rel="noreferrer">ArtStation <ArrowUpRight size={13} /></a>
              </div>
            </div>
          </section>

          <section className="connect-section flex items-center justify-between" id="connect" aria-labelledby="connect-title" data-reveal>
            <div><p className="mono">MORE ART. MORE LITTLE WORLDS.</p><h2 id="connect-title">See you in the next frame<span>.</span></h2><p className="connect-cn">新作、日常，与更多想象。</p></div>
            <a className="connect-button" href={artist.x} target="_blank" rel="noreferrer"><span>关注画者<strong>@{artist.handle}</strong></span><ArrowUpRight size={25} /></a>
          </section>

          <footer className="studio-footer flex items-center justify-between">
            <a href="#overview" className="brand-wordmark" onClick={() => goToSection("overview")} aria-label="返回工作室概览">dora<span>.</span></a>
            <p>UNOFFICIAL FAN-MADE STUDIO<br /><span>All artwork © 哆啦小熙. {artworks.length} original works. Made with appreciation.</span></p>
            <a href="#overview" className="back-top" onClick={() => goToSection("overview")}>返回顶部 <ArrowUpRight size={15} /></a>
          </footer>
        </main>
      </div>

      <ArtworkViewer
        artwork={activeArtwork}
        collection={viewerCollection}
        onClose={closeArtwork}
        onNavigate={navigateArtwork}
        onSelect={selectViewerArtwork}
        isSaved={activeArtwork ? savedIds.includes(activeArtwork.id) : false}
        onToggleSave={toggleSaved}
      />
      {toast && <div className="studio-toast flex items-center" role="status"><span className="toast-icon">{toast.saved ? <Check size={15} /> : <Bookmark size={15} />}</span><p>{toast.message}</p><button type="button" aria-label="关闭提示" onClick={() => setToast(null)}><X size={14} /></button></div>}
      </div>
    </div>
  );
}

export default DoraPage;
