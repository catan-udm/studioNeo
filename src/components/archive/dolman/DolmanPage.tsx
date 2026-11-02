"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { animationPoster, artistAvatar, artistEmail, featuredAnimation, heroWork, socials, works } from './data';
import type { Work, WorkFilter } from './data';
import "./dolman.css";

type IconName =
  | 'up-right' | 'arrow-down' | 'arrow-up' | 'left' | 'right'
  | 'close' | 'plus' | 'minus' | 'menu' | 'play' | 'copy' | 'check'
  | 'x' | 'instagram' | 'youtube' | 'heart';

function Icon({ name, size = 20, className = '' }: { name: IconName; size?: number; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    'up-right': <path d="M6 18 18 6M6 6h12v12" />,
    'arrow-down': <path d="M12 4v16m-6-6 6 6 6-6" />,
    'arrow-up': <path d="M12 20V4m-6 6 6-6 6 6" />,
    left: <path d="m14 5-7 7 7 7" />,
    right: <path d="m9 5 7 7-7 7" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    play: <path d="m9 5 11 7-11 7Z" fill="currentColor" strokeWidth="0" />,
    copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M15 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    x: <path d="M4 4l16 16M20 4 4 20" />,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none" /></>,
    youtube: <><path d="M21 7.5a3 3 0 0 0-2.2-2.2C17 5 12 5 12 5s-5 0-6.8.3A3 3 0 0 0 3 7.5a26 26 0 0 0 0 9 3 3 0 0 0 2.2 2.2C7 19 12 19 12 19s5 0 6.8-.3a3 3 0 0 0 2.2-2.2 26 26 0 0 0 0-9Z" /><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" /></>,
    heart: <path d="M20.2 4.8a5.5 5.5 0 0 0-7.8 0l-.4.4-.4-.4a5.5 5.5 0 0 0-7.8 7.8L12 21l8.2-8.4a5.5 5.5 0 0 0 0-7.8Z" />,
  };
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Star({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><path d="m32 3 6.7 19.5L57 12l-9.5 19.4L64 36l-21.5 3.5L44 60 30.5 43 17 60l2-21.2L0 34l17.2-8.2L11 6l16 15Z" /></svg>;
}

function Brand() {
  return <a href="#top" className="brand" aria-label="Dolman — home"><span>dolman<span className="brand-dot">.</span></span><Star /></a>;
}

function Modal({ children, onClose, className, label }: { children: ReactNode; onClose: () => void; className: string; label: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const oldOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = oldOverflow;
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className={`modal ${className}`}
      aria-label={label}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="modal-inner">
        <button className="modal-close" onClick={onClose} aria-label="Close dialog" autoFocus><Icon name="close" size={20} /></button>
        {children}
      </div>
    </dialog>
  );
}

function ArtworkViewer({ work, collection, onSelect, onClose }: { work: Work; collection: Work[]; onSelect: (work: Work) => void; onClose: () => void }) {
  const index = collection.findIndex((item) => item.id === work.id);
  const move = useCallback((direction: number) => {
    if (collection.length < 2) return;
    onSelect(collection[(index + direction + collection.length) % collection.length]);
  }, [collection, index, onSelect]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [move]);

  return (
    <Modal onClose={onClose} className="viewer-modal" label={`${work.title} — artwork viewer`}>
      <div className="viewer-layout">
        <div className={`viewer-stage ${work.category === 'Animation' ? 'is-video' : ''}`} style={{ backgroundColor: work.accent }}>
          {work.category === 'Animation'
            ? <iframe src={`https://www.youtube-nocookie.com/embed/${work.videoId}?autoplay=1&rel=0`} title={`${work.title} — official music video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            : <img className="viewer-image" src={work.image} alt={`${work.title} — original artwork by Dolman`} />}
        </div>
        <div className="viewer-details">
          <p className="eyebrow">{work.category} <span aria-hidden="true">/</span> {work.year}</p>
          <h2>{work.title}</h2>
          <p className="original-title">Original title: {work.originalTitle}</p>
          <p className="viewer-description">{work.description}</p>
          <div className="viewer-artist">
            <img src={artistAvatar} alt="Dolman’s illustrated avatar" />
            <div>
              <strong>Dolman <span>돌만</span></strong>
              <a href="https://x.com/dolman4878" target="_blank" rel="noreferrer">@dolman4878 <Icon name="up-right" size={12} /></a>
            </div>
          </div>
          {work.credit && <p className="project-credit">{work.credit}</p>}
          <a className="button button-blue viewer-source" href={work.source} target="_blank" rel="noreferrer">
            {work.category === 'Animation' ? 'Watch on YouTube' : 'View original on Pixiv'} <Icon name="up-right" size={16} />
          </a>
          <p className="art-credit">All artwork © Dolman. Please support the artist directly.</p>
          <div className="viewer-navigation">
            <span>{String(index + 1).padStart(2, '0')} <i>/</i> {String(collection.length).padStart(2, '0')}</span>
            <div>
              <button className="icon-button" onClick={() => move(-1)} aria-label="Previous artwork" disabled={collection.length < 2}><Icon name="left" size={18} /></button>
              <button className="icon-button" onClick={() => move(1)} aria-label="Next artwork" disabled={collection.length < 2}><Icon name="right" size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ContactDialog({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', type: 'Illustration', message: '' });

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(artistEmail);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = `${form.type} inquiry from ${form.name}`;
    const body = `Hello Dolman,\n\n${form.message}\n\nBest,\n${form.name}\n${form.email}`;
    window.location.href = `mailto:${artistEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setDraftReady(true);
  };

  return (
    <Modal onClose={onClose} className="contact-modal" label="Get in touch with Dolman">
      <div className="contact-dialog">
        <p className="eyebrow">Get in touch</p>
        <h2>Let’s make something <em>colorful.</em></h2>
        <p className="contact-lead">Have a character, a project, or a colorful thought in mind? Send a note.</p>
        <div className="contact-email-row">
          <a href={`mailto:${artistEmail}`}>{artistEmail}</a>
          <button className="icon-button" onClick={copyEmail} aria-label={copied ? 'Email address copied' : 'Copy email address'}><Icon name={copied ? 'check' : 'copy'} size={17} /></button>
        </div>
        {copied && <p className="copy-status" role="status">Email copied.</p>}
        {copyError && <p className="copy-status" role="status">Select the address above to copy it.</p>}
        <form onSubmit={submit}>
          <div className="form-row">
            <label>Your name<input autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" required maxLength={100} /></label>
            <label>Your email<input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required maxLength={200} /></label>
          </div>
          <label>What do you have in mind?
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option>Illustration</option><option>Animation</option><option>Collaboration</option><option>Just saying hello</option>
            </select>
          </label>
          <label>A little about your idea<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="A few words about your project or daydream…" required minLength={10} maxLength={3000} rows={4} /></label>
          <button type="submit" className="button button-blue">Create email draft <Icon name="up-right" size={17} /></button>
          <p className="form-note">This opens your email app. Nothing is sent from this website.</p>
          {draftReady && <p className="draft-status" role="status"><Icon name="check" size={17} /> Your draft is ready in your email app. If it didn’t open, copy the address above.</p>}
        </form>
      </div>
    </Modal>
  );
}

function ArtworkCard({ work, onOpen }: { work: Work; onOpen: (work: Work) => void }) {
  const isAnimation = work.category === 'Animation';
  return (
    <article className="artwork-card">
      <button
        className={isAnimation ? 'artwork-image is-animation' : 'artwork-image'}
        onClick={() => onOpen(work)}
        aria-label={`${isAnimation ? 'Play' : 'View'} ${work.title}`}
        style={{ backgroundColor: work.accent }}
      >
        <img src={work.image} alt={`${work.title} — ${isAnimation ? 'music video artwork' : 'original illustration'} by Dolman`} decoding="async" style={{ objectPosition: work.position }} />
        {isAnimation
          ? <><span className="motion-label">Animation</span><span className="play-button"><Icon name="play" size={22} /></span></>
          : <span className="artwork-open"><Icon name="up-right" size={18} /></span>}
      </button>
      <div className="artwork-caption">
        <button className="artwork-title" onClick={() => onOpen(work)}>{work.title}</button>
        <p>{isAnimation ? work.credit : `Illustration · ${work.year}`}</p>
      </div>
    </article>
  );
}

export function DolmanPage() {
  const [filter, setFilter] = useState<WorkFilter>('All work');
  const [showAll, setShowAll] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [viewerCollection, setViewerCollection] = useState<Work[]>(works);
  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeViewer = useCallback(() => setSelectedWork(null), []);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const filteredWorks = works.filter((work) => filter === 'All work' || (filter === 'Illustrations' ? work.category === 'Illustration' : work.category === 'Animation'));
  const visibleWorks = showAll ? filteredWorks : filteredWorks.slice(0, 6);

  const openWork = (work: Work) => { setViewerCollection(filteredWorks); setSelectedWork(work); };
  const openFeatured = (work: Work) => { setViewerCollection(works.filter((item) => item.category === 'Animation')); setSelectedWork(work); };
  const chooseFilter = (nextFilter: WorkFilter) => { setFilter(nextFilter); setShowAll(false); };
  const copyFooterEmail = async () => {
    try { await navigator.clipboard.writeText(artistEmail); setCopied(true); } catch { setContactOpen(true); }
  };

  return (
    <div className="dolman-page" id="top">
      <a className="skip-link" href="#work">Skip to the artwork</a>

      <header className="site-header" id="top">
        <div className="container header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#work" onClick={() => chooseFilter('Illustrations')}>Illustrations</a>
            <a href="#animations">Animation</a>
            <a href="#about">About</a>
          </nav>
          <button className="button button-dark header-contact" onClick={() => setContactOpen(true)}>Get in touch <Icon name="up-right" size={16} /></button>
          <button
            className="mobile-menu-toggle"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
        {menuOpen && (
          <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
            <a href="#work" onClick={() => { chooseFilter('Illustrations'); setMenuOpen(false); }}>Illustrations</a>
            <a href="#animations" onClick={() => setMenuOpen(false)}>Animation</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <button onClick={() => { setMenuOpen(false); setContactOpen(true); }}>Get in touch</button>
          </nav>
        )}
      </header>

      <main id="main-content">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Illustrator &amp; animator</p>
            <h1 id="hero-title">A little world<br />of <em>daydreams.</em></h1>
            <p className="hero-description">Hi, I’m Dolman. I draw playful characters, colorful worlds, and the little moments in between.</p>
            <div className="hero-actions">
              <a className="button button-blue" href="#work" onClick={() => chooseFilter('Illustrations')}>See the artwork <Icon name="arrow-down" size={17} /></a>
              <button className="button button-quiet" onClick={() => setContactOpen(true)}>Work with me <Icon name="up-right" size={16} /></button>
            </div>
            <div className="hero-byline">
              <img src={artistAvatar} alt="Dolman’s illustrated profile picture" />
              <span>Original illustrations by <a href="https://x.com/dolman4878" target="_blank" rel="noreferrer">@dolman4878 <Icon name="up-right" size={11} /></a></span>
              <span className="no-ai">No AI</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-color-block" aria-hidden="true" />
            <button className="hero-art" onClick={() => { setViewerCollection(works); setSelectedWork(heroWork); }} aria-label="View Starry bunnies, a featured original illustration">
              <img src={heroWork.image} alt="Starry bunnies by Dolman — a blue-hooded character surrounded by flying rabbits, a moon, and golden stars" />
              <span className="hero-art-hover">View artwork <Icon name="up-right" size={16} /></span>
            </button>
            <div className="hero-caption">
              <span>Starry bunnies</span>
              <span>Original illustration, 2024</span>
            </div>
          </div>
        </section>

        <section id="work" className="work-section container" aria-labelledby="work-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2 id="work-title">Illustrations &amp; <em>daydreams.</em></h2>
            </div>
            <p className="section-intro">A few favorite characters and colorful worlds, made by hand.</p>
          </div>

          <div className="gallery-toolbar">
            <div className="gallery-filters" role="group" aria-label="Filter artwork">
              {(['All work', 'Illustrations', 'Animations'] as WorkFilter[]).map((name) => (
                <button key={name} className={filter === name ? 'filter-button is-active' : 'filter-button'} aria-pressed={filter === name} onClick={() => chooseFilter(name)}>{name}</button>
              ))}
            </div>
            <span className="gallery-count">{String(visibleWorks.length).padStart(2, '0')} / {String(filteredWorks.length).padStart(2, '0')}</span>
          </div>

          <div className="artwork-grid" key={filter} aria-live="polite">
            {visibleWorks.map((work) => <ArtworkCard key={work.id} work={work} onOpen={openWork} />)}
          </div>

          <div className="gallery-footer">
            {filteredWorks.length > 6
              ? <button className="button button-outline" onClick={() => setShowAll(!showAll)} aria-expanded={showAll}>{showAll ? 'Show fewer' : `View all ${filteredWorks.length} works`} <Icon name={showAll ? 'minus' : 'plus'} size={17} /></button>
              : <span />}
            <a className="text-link" href="https://www.pixiv.net/en/users/5956449" target="_blank" rel="noreferrer">More on Pixiv <Icon name="up-right" size={15} /></a>
          </div>
        </section>

        <section className="animation-section" id="animations" aria-labelledby="animation-title">
          <div className="container animation-inner">
            <div className="animation-copy">
              <p className="eyebrow">Animation</p>
              <h2 id="animation-title">Dreams don’t<br /><em>sit still.</em></h2>
              <p>When a little imagination starts to move, a whole new world opens up. A selection of music videos and animation work.</p>
              <button className="button button-light" onClick={() => openFeatured(featuredAnimation)}>Watch animation <Icon name="play" size={16} /></button>
            </div>
            <div className="animation-feature">
              <button className="animation-poster" aria-label="Play HELLO SODADADA, a music video animated by Dolman" onClick={() => openFeatured(featuredAnimation)}>
                <img src={animationPoster} alt="HELLO SODADADA music video artwork by Dolman" />
                <span className="animation-play"><Icon name="play" size={24} /></span>
              </button>
              <div className="animation-caption">
                <div><h3>HELLO SODADADA</h3><span>Music video · animation by Dolman</span></div>
                <a href="https://www.youtube.com/watch?v=XF50Ok6350g" target="_blank" rel="noreferrer" aria-label="Watch HELLO SODADADA on YouTube"><Icon name="up-right" size={20} /></a>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section container" id="about" aria-labelledby="about-title">
          <div className="about-art">
            <img src={works.find((work) => work.id === 'pocket-universe')!.image} alt="Pocket universe — an original illustration by Dolman" />
          </div>
          <div className="about-copy">
            <p className="eyebrow">About</p>
            <h2 id="about-title">Hi, I’m Dolman.<br /><em>I draw the daydreams.</em></h2>
            <p>I’m an illustrator and animator, making colorful characters and the wonderful little worlds they live in.</p>
            <p>From a quick sketch to a full music video, I love bringing a bit of imagination to life. Soft colors, expressive faces, and a touch of the unexpected — that’s my kind of magic.</p>
            <div className="about-philosophy">
              <Icon name="heart" size={20} />
              <span>Drawn by hand, made with heart. <strong>No AI.</strong></span>
            </div>
            <div className="about-socials">
              <p className="eyebrow">Find me online</p>
              <div>
                {socials.map((social) => (
                  <a key={social.name} href={social.href} target="_blank" rel="noreferrer">
                    {social.name === 'X / Twitter' ? <Icon name="x" size={14} /> : social.name === 'Instagram' ? <Icon name="instagram" size={16} /> : social.name === 'YouTube' ? <Icon name="youtube" size={18} /> : null}
                    {social.name} <Icon name="up-right" size={12} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="container contact-inner">
            <div>
              <p className="eyebrow">Have a project in mind?</p>
              <h2 id="contact-title">Let’s make<br />something <em>colorful.</em></h2>
            </div>
            <div className="contact-side">
              <button className="contact-circle" onClick={() => setContactOpen(true)} aria-label="Start a conversation with Dolman"><Icon name="up-right" size={44} /></button>
              <p>For collaborations, projects &amp; hellos.</p>
              <button className="footer-email" onClick={copyFooterEmail}>{copied ? 'Email copied!' : artistEmail}<Icon name={copied ? 'check' : 'copy'} size={15} /></button>
              {copied && <span className="email-status" role="status">Ready to paste.</span>}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <Brand />
          <p>A little world by Dolman. All artwork © Dolman.</p>
          <div className="footer-socials">
            <a href="https://x.com/dolman4878" target="_blank" rel="noreferrer" aria-label="Dolman on X"><Icon name="x" size={16} /></a>
            <a href="https://www.instagram.com/dolman_00/" target="_blank" rel="noreferrer" aria-label="Dolman on Instagram"><Icon name="instagram" size={17} /></a>
            <a href="https://www.youtube.com/@dolman4878" target="_blank" rel="noreferrer" aria-label="Dolman on YouTube"><Icon name="youtube" size={19} /></a>
          </div>
          <a className="back-to-top" href="#top">Back to top <Icon name="arrow-up" size={14} /></a>
        </div>
      </footer>

      {selectedWork && <ArtworkViewer work={selectedWork} collection={viewerCollection} onSelect={setSelectedWork} onClose={closeViewer} />}
      {contactOpen && <ContactDialog onClose={closeContact} />}
    </div>
  );
}
