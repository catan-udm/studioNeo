'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global root layout error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#090d16',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            textAlign: 'center',
            padding: '2rem',
            background: '#111827',
            borderRadius: '16px',
            border: '1px solid #374151',
          }}
        >
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Critical System Failure</h1>
          <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            A fatal exception occurred in the root layout. Please refresh or reboot the session.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '10px 24px',
              borderRadius: '9999px',
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reboot Session
          </button>
        </div>
      </body>
    </html>
  );
}
