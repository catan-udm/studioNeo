'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getAuthenticatedSession, invalidateAuthCache } from '@/lib/clientAuthCache';
import './studioUpload.css';

const PALETTE_PRESETS = [
  { name: 'Lavender', hex: '#c496ff' },
  { name: 'Warm Gold', hex: '#f4cc7f' },
  { name: 'Coral', hex: '#ff9d96' },
  { name: 'Hot Pink', hex: '#ff3380' },
  { name: 'Acid Lime', hex: '#bffc3f' },
  { name: 'Sky Cyan', hex: '#A9DEF9' },
  { name: 'Jade Green', hex: '#10b981' },
  { name: 'Solar Amber', hex: '#f59e0b' },
  { name: 'Slate Gray', hex: '#737373' },
  { name: 'Deep Navy', hex: '#344553' },
];

function isArtistTier(tier?: string): boolean {
  if (!tier) return false;
  const t = tier.toLowerCase();
  return (
    t.startsWith('artist') ||
    t.startsWith('illustrator') ||
    t === 'admin' ||
    t === 'curator'
  );
}

export default function StudioUploadClient() {
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userTier, setUserTier] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [artistName, setArtistName] = useState('');
  const [artistHandle, setArtistHandle] = useState('');
  const [category, setCategory] = useState<'Generative' | 'Kinetic' | 'Vectors' | 'Mono'>('Generative');
  const [edition, setEdition] = useState('Ed. 1/12');
  const [color, setColor] = useState('#c496ff');
  const [price, setPrice] = useState('$180');
  const [isVault, setIsVault] = useState(false);

  // File Upload State
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [svgPreviewContent, setSvgPreviewContent] = useState<string | null>(null);
  const [gifFile, setGifFile] = useState<File | null>(null);
  const [gifPreviewUrl, setGifPreviewUrl] = useState<string | null>(null);

  // Submission & Minting State
  const [isMinting, setIsMinting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mintedCel, setMintedCel] = useState<{
    id: number;
    code: string;
    title: string;
    artist: string;
    artistHandle: string;
    category: string;
    edition: string;
    color: string;
    svgUrl: string;
    gifUrl: string | null;
  } | null>(null);

  // Check authenticated session
  const verifySession = useCallback(async () => {
    try {
      setAuthLoading(true);
      const res = await getAuthenticatedSession();
      if (res.authenticated && res.subscriber) {
        setIsAuthenticated(true);
        setUserEmail(res.subscriber.email);
        setUserTier(res.subscriber.tier || 'free');

        const emailPrefix = res.subscriber.email.split('@')[0];
        setArtistName((prev) => prev || (emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)));
        setArtistHandle((prev) => prev || emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
      } else {
        setIsAuthenticated(false);
        setUserEmail('');
        setUserTier(null);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void verifySession();
    }, 0);
    return () => clearTimeout(timer);
  }, [verifySession]);

  // Clean up object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (gifPreviewUrl) {
        URL.revokeObjectURL(gifPreviewUrl);
      }
    };
  }, [gifPreviewUrl]);

  // Handle SVG File Selection
  const handleSvgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      setUploadError('File must be an SVG (.svg) vector format.');
      return;
    }

    setUploadError(null);
    setSvgFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const safeContent = content
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
        .replace(/\s+on\w+\s*=\s*(['"]).*?\1/gi, '')
        .replace(/\s+on\w+\s*=\s*[^>\s]+/gi, '');
      setSvgPreviewContent(safeContent);
    };
    reader.readAsText(file);
  };

  // Handle GIF File Selection
  const handleGifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.gif') && file.type !== 'image/gif') {
      setUploadError('Kinetic motion master must be a .gif animation.');
      return;
    }

    if (gifPreviewUrl) {
      URL.revokeObjectURL(gifPreviewUrl);
    }
    setUploadError(null);
    setGifFile(file);
    const objectUrl = URL.createObjectURL(file);
    setGifPreviewUrl(objectUrl);
  };

  // Fast-track dev activation for testing
  const handleFastTrackCurator = async () => {
    try {
      const target = userEmail || 'resident_creator@bikko.studio';
      const res = await fetch('/api/curator/toggle-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target, tier: 'artist_resident' }),
      });
      if (res.ok) {
        invalidateAuthCache();
        setUserTier('artist_resident');
        setIsAuthenticated(true);
        if (!userEmail) setUserEmail(target);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Minting
  const handleMintCel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!svgFile) {
      setUploadError('Please select a prepared .svg vector master file.');
      return;
    }

    setIsMinting(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('edition', edition);
      formData.append('color', color);
      formData.append('price', price);
      formData.append('isVault', isVault ? 'true' : 'false');
      formData.append('svgFile', svgFile);

      if (artistName.trim()) {
        formData.append('artist', artistName.trim());
      }
      if (artistHandle.trim()) {
        formData.append('artistHandle', artistHandle.trim());
      }

      if (gifFile) {
        formData.append('gifFile', gifFile);
      }

      const res = await fetch('/api/studio/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to mint digital cel.');
      }

      setMintedCel(data.cel);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Minting operation failed.';
      setUploadError(msg);
    } finally {
      setIsMinting(false);
    }
  };

  // Derived live preview code
  const previewCode = useMemo(() => {
    const prefix = title.trim() ? title.slice(0, 3).toUpperCase() : 'NEO';
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = (hash * 31 + title.charCodeAt(i)) % 9000;
    }
    return `CEL-${prefix}-${String(1000 + hash).slice(-3)}`;
  }, [title]);

  if (authLoading) {
    return (
      <main id="main-content" className="studio-upload-page">
        <div className="atelier-restricted-wrap">
          <p style={{ color: 'var(--text-muted)' }}>Checking curatorial credentials...</p>
        </div>
      </main>
    );
  }

  // Gated View: Non-Artists
  const isAllowed = isArtistTier(userTier || undefined);

  if (!isAllowed) {
    return (
      <main id="main-content" className="studio-upload-page">
        <div className="atelier-restricted-wrap">
          <section className="atelier-restricted-card">
            <div className="atelier-restricted-icon-bubble">✦</div>
            <span className="atelier-restricted-overline">
              ACCESS RESERVED • CREATOR ATELIER
            </span>
            <h1 className="atelier-restricted-title">Access Reserved</h1>
            <p className="atelier-restricted-desc">
              Access Reserved: Creator Studio is exclusively available to verified artists and illustrators. Apply via our Curatorial Desk to register your portfolio and obtain minting credentials.
            </p>
            <div className="atelier-restricted-actions">
              <Link
                href="/contact?topic=artist_application"
                className="btn-pill-primary btn-pill-lg"
              >
                Apply via our Curatorial Desk ↗
              </Link>
              {!isAuthenticated ? (
                <Link href="/login" className="btn-pill-secondary btn-pill-lg">
                  Sign In with Existing Account
                </Link>
              ) : (
                <Link href="/gallery" className="btn-pill-secondary btn-pill-lg">
                  Return to Gallery Archive
                </Link>
              )}
            </div>

            {/* Curatorial Fast-Track helper for evaluation */}
            <div className="curator-fasttrack-helper">
              <p className="hint">
                Curatorial Evaluation Mode: Testing or verifying as an invited creator? You can activate the <code style={{ fontSize: '0.8rem' }}>artist_resident</code> role instantly.
              </p>
              <button
                type="button"
                className="btn-pill-secondary btn-pill-sm"
                onClick={handleFastTrackCurator}
              >
                Activate Artist Resident Role (Instant Dev Grant)
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // Minted Success Modal
  if (mintedCel) {
    return (
      <main id="main-content" className="studio-upload-page">
        <div className="mint-success-overlay" role="dialog" aria-modal="true" aria-labelledby="mint-title">
          <div className="mint-success-card">
            <div className="mint-success-icon">✓</div>
            <span className="mint-success-code">{mintedCel.code}</span>
            <h2 id="mint-title" className="mint-success-title">Cel Minted Successfully</h2>
            <p className="mint-success-desc">
              Your digital cel <strong>{mintedCel.title}</strong> has been minted and persisted to Azure Blob Storage and the studioNeo digital archive.
            </p>
            <div className="mint-success-actions">
              <Link href={`/artist/${mintedCel.artistHandle}`} className="btn-pill-primary btn-pill-lg">
                View on Artist Portfolio (@{mintedCel.artistHandle}) ↗
              </Link>
              <Link href="/gallery" className="btn-pill-secondary btn-pill-lg">
                View in Gallery Archive ↗
              </Link>
              <button
                type="button"
                className="btn-pill-secondary btn-pill-sm"
                onClick={() => {
                  setMintedCel(null);
                  setTitle('');
                  setDescription('');
                  setSvgFile(null);
                  setSvgPreviewContent(null);
                  setGifFile(null);
                  setGifPreviewUrl(null);
                }}
              >
                + Mint Another Cel
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Active Creator Studio Upload View
  return (
    <main id="main-content" className="studio-upload-page">
      {/* 1. Header */}
      <section className="studio-upload-header" aria-labelledby="studio-heading">
        <span className="studio-upload-overline">STUDIONEO CREATOR STUDIO • MINTING ATELIER</span>
        <div className="studio-upload-title-row">
          <h1 id="studio-heading" className="studio-upload-title">Mint Digital Cel</h1>
          <span className="studio-verified-badge">
            ✓ Verified Creator ({userTier})
          </span>
        </div>
        <p className="studio-upload-lead">
          Upload prepared SVG vector masters and optional kinetic motion GIFs. Mint directly to the studio archive with Azure Blob Storage persistence and verifiable editions.
        </p>
      </section>

      {/* 2. Main Studio Workspace Grid */}
      <div className="studio-upload-container">
        {/* Left Column: Upload & Metadata Form */}
        <section className="studio-upload-card" aria-label="Cel Metadata Form">
          <form className="studio-form" onSubmit={handleMintCel}>
            {uploadError && (
              <div
                className="alert alert-error"
                role="alert"
                style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#ef4444',
                  fontSize: '0.9rem',
                }}
              >
                {uploadError}
              </div>
            )}

            {/* Primary SVG File Dropzone */}
            <div className="file-dropzone-group">
              <label htmlFor="svg-file-input" className="file-dropzone-label">
                <span>PREPARED SVG VECTOR MASTER *</span>
                <span>(Lossless Vector)</span>
              </label>
              <div className={`file-dropzone ${svgFile ? 'has-file' : ''}`}>
                <input
                  id="svg-file-input"
                  type="file"
                  accept=".svg,image/svg+xml"
                  required
                  onChange={handleSvgChange}
                />
                <div className="dropzone-inner">
                  <span className="dropzone-icon">⬡</span>
                  {svgFile ? (
                    <div className="dropzone-file-info">
                      <span>✓ {svgFile.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>({(svgFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <>
                      <span className="dropzone-title">Click or drop .svg vector file</span>
                      <span className="dropzone-sub">Prepared SVG with crisp paths and scalable viewbox</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Optional Kinetic GIF File Dropzone */}
            <div className="file-dropzone-group">
              <label htmlFor="gif-file-input" className="file-dropzone-label">
                <span>KINETIC MOTION MASTER (.GIF) (OPTIONAL)</span>
                <span>(Azure CDN Stream)</span>
              </label>
              <div className={`file-dropzone ${gifFile ? 'has-file' : ''}`}>
                <input
                  id="gif-file-input"
                  type="file"
                  accept=".gif,image/gif"
                  onChange={handleGifChange}
                />
                <div className="dropzone-inner">
                  <span className="dropzone-icon">✦</span>
                  {gifFile ? (
                    <div className="dropzone-file-info">
                      <span>✓ {gifFile.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>({(gifFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <>
                      <span className="dropzone-title">Attach animated .gif loop</span>
                      <span className="dropzone-sub">Optional for Kinetic category motion cels</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="artist-name-input" className="form-label">ARTIST DISPLAY NAME</label>
                <input
                  id="artist-name-input"
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="e.g., Neo Tokyo or Adrian"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="artist-handle-input" className="form-label">PORTFOLIO HANDLE</label>
                <input
                  id="artist-handle-input"
                  type="text"
                  value={artistHandle}
                  onChange={(e) => setArtistHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                  placeholder="e.g., neo_tokyo"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="title-input" className="form-label">CEL TITLE *</label>
              <input
                id="title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Matrix Shift VII, Torus Tension 04"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category-select" className="form-label">CATEGORY *</label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'Generative' | 'Kinetic' | 'Vectors' | 'Mono')}
                className="form-input"
              >
                <option value="Generative">Generative (Algorithmic)</option>
                <option value="Kinetic">Kinetic (Motion &amp; Loop)</option>
                <option value="Vectors">Vectors (Precision Mesh)</option>
                <option value="Mono">Mono (Monochrome Topography)</option>
              </select>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="edition-input" className="form-label">EDITION COUNT / TYPE *</label>
                <input
                  id="edition-input"
                  type="text"
                  required
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  placeholder="Ed. 1/12 or Ed. 1/1 (Unique)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="price-input" className="form-label">PRICE / RESERVE *</label>
                <input
                  id="price-input"
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., $180 or Vault Reserve"
                  className="form-input"
                />
              </div>
            </div>

            {/* Accent Color Picker & Studio Presets */}
            <div className="form-group">
              <label className="form-label">ACCENT COLOR (STUDIO PALETTE) *</label>
              <div className="palette-swatches-row">
                {PALETTE_PRESETS.map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    title={swatch.name}
                    aria-label={`Select ${swatch.name}`}
                    className={`swatch-btn ${color.toLowerCase() === swatch.hex.toLowerCase() ? 'active' : ''}`}
                    style={{ backgroundColor: swatch.hex }}
                    onClick={() => setColor(swatch.hex)}
                  />
                ))}
                <div className="custom-color-input-wrap">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    aria-label="Custom Accent Color"
                  />
                  <span className="custom-hex-text">{color}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description-input" className="form-label">ATELIER NOTES &amp; GENESIS DESCRIPTION</label>
              <textarea
                id="description-input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Parametric formulation, spline tension formulas, or resonance notes..."
                className="form-textarea"
              />
            </div>

            {/* Subscriber Vault Gating Switch */}
            <label className="vault-switch-box">
              <input
                type="checkbox"
                checked={isVault}
                onChange={(e) => setIsVault(e.target.checked)}
              />
              <div className="vault-switch-text">
                <span className="vault-switch-title">Lock in Subscriber Vault (Members Only)</span>
                <span className="vault-switch-desc">
                  When enabled, lossless SVG master and kinetic loop are gated to active membership tier holders (studio-alpha, studio-atelier, enterprise).
                </span>
              </div>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isMinting}
              className="btn-pill-primary btn-pill-lg"
              style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
            >
              {isMinting ? 'Persisting to Azure Blob Storage & Minting...' : 'Mint Cel to Digital Archive'}
            </button>
          </form>
        </section>

        {/* Right Column: Live Interactive Atelier Cel Preview */}
        <aside className="studio-preview-col" aria-label="Interactive Cel Preview">
          <div className="studio-preview-card">
            <div className="preview-card-header">
              <span className="preview-overline">LIVE ATELIER PREVIEW</span>
              <span className="preview-status-pill">{category}</span>
            </div>

            {/* 1:1 Live Media Tile */}
            <div className="live-cel-tile" style={{ backgroundColor: color }}>
              {gifPreviewUrl && category === 'Kinetic' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={gifPreviewUrl} alt="Kinetic Cel Preview" className="live-cel-gif-preview" />
              ) : svgPreviewContent ? (
                <div
                  className="live-cel-svg-container"
                  dangerouslySetInnerHTML={{ __html: svgPreviewContent }}
                />
              ) : (
                /* Procedural Blueprint Preview when no SVG uploaded yet */
                <svg viewBox="0 0 400 400" className="live-cel-svg-container" aria-hidden="true">
                  <defs>
                    <pattern id="preview-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="400" height="400" fill="url(#preview-grid)" />
                  <g stroke="rgba(0,0,0,0.4)" fill="none" strokeWidth="1.6">
                    <circle cx="200" cy="200" r="110" strokeDasharray="5 3" />
                    <circle cx="200" cy="200" r="70" />
                    <polygon points="200,90 295,250 105,250" fill="rgba(0,0,0,0.06)" />
                    <circle cx="200" cy="200" r="10" fill="rgba(0,0,0,0.4)" />
                  </g>
                </svg>
              )}

              {/* Watermark */}
              <div className="live-cel-footer">
                {title || 'Untitled Cel'} • {edition}
              </div>
            </div>

            {/* Live Specs Breakdown */}
            <div className="preview-specs-table">
              <div className="spec-item">
                <span className="spec-label">CEL CODE</span>
                <span className="spec-val" style={{ fontFamily: 'monospace' }}>{previewCode}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">FORMAT</span>
                <span className="spec-val">{category === 'Kinetic' && gifFile ? '4K / GIF' : 'SVG Master'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">ACCENT TONE</span>
                <span className="spec-val" style={{ fontFamily: 'monospace' }}>{color}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">RESERVE</span>
                <span className="spec-val">{price || '$180'}</span>
              </div>
              <div className="spec-item" style={{ gridColumn: 'span 2' }}>
                <span className="spec-label">VAULT STATUS</span>
                <span className="spec-val" style={{ color: isVault ? '#f43f5e' : '#10b981' }}>
                  {isVault ? '🔒 Locked Vault' : '🔓 Public Stream'}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
