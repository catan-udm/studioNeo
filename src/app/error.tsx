'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import BikkoMark from './components/BikkoMark';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime errors
    console.error('Next.js Client Runtime Exception caught by boundary:', error);
  }, [error]);

  return (
    <main
      id="main-content"
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        fontFamily: 'var(--font-body), sans-serif',
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '24px',
          padding: '2.5rem',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
          <BikkoMark width={56} height={48} color="var(--text-primary)" />
        </div>

        <span
          style={{
            display: 'block',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-error)',
            marginBottom: '0.5rem',
          }}
        >
          ANOMALY DETECTED &bull; 500
        </span>

        <h1
          style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            color: 'var(--text-primary)',
          }}
        >
          Transient Rendering Fault
        </h1>

        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: '1.5rem',
          }}
        >
          The atelier engine encountered an unexpected runtime condition while compiling visual cels.
          You can attempt an instantaneous hot reset or return to the main archive.
        </p>

        {error.digest && (
          <code
            style={{
              display: 'block',
              padding: '6px 12px',
              background: 'var(--bg-subtle)',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
              wordBreak: 'break-all',
            }}
          >
            Digest: {error.digest}
          </code>
        )}

        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 22px',
              borderRadius: '9999px',
              background: 'var(--text-primary)',
              color: 'var(--bg-canvas)',
              fontWeight: 600,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span>Hot Reset</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '9px 22px',
              borderRadius: '9999px',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            Return to Studio
          </Link>
        </div>
      </div>
    </main>
  );
}
