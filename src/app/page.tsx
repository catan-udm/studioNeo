'use client';

import React, { useEffect, useState } from 'react';

interface Perk {
  id: number;
  slug: string;
  title: string;
  description: string;
  unlocked_at: string;
}

interface Subscriber {
  id: number;
  email: string;
  is_verified: boolean;
  twoFactorActive: boolean;
  created_at: string;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [perks, setPerks] = useState<Perk[]>([]);
  const [jsonDetails, setJsonDetails] = useState<Record<string, unknown> | null>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated) {
        setAuthenticated(true);
        setSubscriber(data.subscriber);
        setPerks(data.perks || []);
      } else {
        setAuthenticated(false);
        setSubscriber(null);
        setPerks([]);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAuthenticated(false);
      setSubscriber(null);
      setPerks([]);
      window.location.reload();
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const handleInspectSas = async (slug: string) => {
    try {
      const res = await fetch(`/api/assets/download/${slug}?format=json`);
      const data = await res.json();
      setJsonDetails(data);
    } catch (err) {
      console.error('Failed to inspect SAS token:', err);
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p>Loading application state...</p>
      </main>
    );
  }

  if (!authenticated || !subscriber) {
    return (
      <main className="container stack" style={{ maxWidth: '720px', gap: '2rem' }}>
        <article className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <header className="card-header">
            <span className="badge badge-warning" style={{ marginBottom: '1rem' }}>
              Authentication Required
            </span>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>
              Azure Cloud Studio Asset Portal
            </h1>
            <p style={{ fontSize: '1.1rem', maxWidth: '540px', margin: '0 auto 2rem' }}>
              Secure passwordless authentication with 6-digit email OTPs, RFC 6238 TOTP two-factor
              protection, and time-limited Azure Blob Storage Shared Access Signatures (SAS).
            </p>
          </header>

          <div className="cluster" style={{ justifyContent: 'center' }}>
            <a href="/login" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Sign In with Magic OTP
            </a>
            <a href="/register" className="btn btn-secondary" style={{ padding: '0.75rem 2rem' }}>
              Register Subscriber Account
            </a>
          </div>
        </article>

        <section className="grid grid-cols-2">
          <div className="card">
            <h3>Passwordless & 2FA Security</h3>
            <p>
              Cryptographically hashed SHA-256 OTP tokens with 10-minute validity, constant-time
              comparisons, and RFC 6238 TOTP hardware authenticator validation.
            </p>
          </div>
          <div className="card">
            <h3>Time-Limited Blob SAS</h3>
            <p>
              Direct, read-only 15-minute expiring Shared Access Signatures generated via Azure Blob
              Storage SDK mapped strictly to authorized subscriber unlocks.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="container stack" style={{ gap: '2rem' }}>
      {/* Subscriber Profile Header */}
      <section className="card">
        <div className="cluster-between">
          <div className="stack" style={{ gap: '0.35rem' }}>
            <div className="cluster">
              <h2>Subscriber Dashboard</h2>
              <span className="badge badge-success">
                {subscriber.is_verified ? 'Verified' : 'Pending Verification'}
              </span>
              {subscriber.twoFactorActive && (
                <span className="badge badge-warning">2FA Active</span>
              )}
            </div>
            <p style={{ margin: 0 }}>
              Signed in as <strong>{subscriber.email}</strong> (Subscriber ID: #{subscriber.id})
            </p>
          </div>

          <button onClick={handleLogout} className="btn btn-outline">
            Sign Out
          </button>
        </div>
      </section>

      {/* Unlocked Assets & Downloads */}
      <section className="stack">
        <header className="cluster-between">
          <div>
            <h2>Authorized Perk Assets</h2>
            <p>
              Assets unlocked for your account. Each download generates a cryptographically signed,
              15-minute expiring SAS URL.
            </p>
          </div>
        </header>

        {perks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p>No perk unlocks found for this subscriber yet.</p>
            <p className="hint">
              Insert records into <code>perk_unlocks</code> in <code>experimental_studio_db</code> to authorize downloads.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2">
            {perks.map((perk) => (
              <article key={perk.id} className="card stack" style={{ justifyContent: 'space-between' }}>
                <div className="stack" style={{ gap: '0.5rem' }}>
                  <div className="cluster-between">
                    <h3>{perk.title}</h3>
                    <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {perk.slug}
                    </code>
                  </div>
                  <p>{perk.description || 'Exclusive subscriber digital asset.'}</p>
                  <span className="hint">
                    Unlocked on: {new Date(perk.unlocked_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="cluster" style={{ marginTop: '1rem' }}>
                  <a
                    href={`/api/assets/download/${perk.slug}`}
                    className="btn btn-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download (302 SAS)
                  </a>
                  <button
                    onClick={() => handleInspectSas(perk.slug)}
                    className="btn btn-secondary"
                  >
                    Inspect SAS JSON
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SAS Token Inspection Modal / Panel */}
      {jsonDetails && (
        <section className="card stack" style={{ borderLeft: '4px solid var(--brand-primary)' }}>
          <div className="cluster-between">
            <h3>Shared Access Signature (SAS) Inspection Output</h3>
            <button onClick={() => setJsonDetails(null)} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              Close
            </button>
          </div>
          <p className="hint">
            Direct response from <code>/api/assets/download/[slug]?format=json</code> verifying time-limited read permission:
          </p>
          <pre
            style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(jsonDetails, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}