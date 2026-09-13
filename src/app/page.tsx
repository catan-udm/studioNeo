'use client';

import React, { useEffect, useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';

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
  passkeyCount?: number;
  linkedOAuth?: string[];
  linkedAccounts?: Array<{ provider: string; created_at: string }>;
  created_at: string;
}

interface PasskeyRecord {
  id: number;
  credential_id: string;
  counter: number;
  created_at: string;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [perks, setPerks] = useState<Perk[]>([]);
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyMsg, setPasskeyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);
  const [jsonDetails, setJsonDetails] = useState<Record<string, unknown> | null>(null);

  // Danger Zone / Account Deletion states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDeleteEmail, setConfirmDeleteEmail] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
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

  const fetchPasskeys = async () => {
    try {
      const res = await fetch('/api/auth/passkey/list');
      const data = await res.json();
      if (data.passkeys) {
        setPasskeys(data.passkeys);
      }
    } catch (err) {
      console.error('Failed to load passkeys:', err);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const linked = params.get('linked');
      const error = params.get('error');

      if (linked) {
        setActionMsg({
          type: 'success',
          text: `Successfully linked your ${linked.charAt(0).toUpperCase() + linked.slice(1)} account!`,
        });
        window.history.replaceState({}, '', '/');
      } else if (error) {
        setActionMsg({
          type: 'error',
          text: `Account linking error: ${decodeURIComponent(error)}`,
        });
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchPasskeys();
    }
  }, [authenticated]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Cache-Control': 'no-cache' },
      });
    } catch (err) {
      console.error('Failed to log out:', err);
    } finally {
      setAuthenticated(false);
      setSubscriber(null);
      setPerks([]);
      setPasskeys([]);
      window.location.href = '/login?notice=LoggedOut';
    }
  };

  const handleUnlinkOAuth = async (provider: 'google' | 'microsoft') => {
    const name = provider === 'google' ? 'Google' : 'Microsoft';
    if (!confirm(`Disconnect your ${name} account from this subscriber profile?`)) {
      return;
    }

    setUnlinkingProvider(provider);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/auth/oauth/${provider}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to unlink ${name}.`);
      }

      setActionMsg({
        type: 'success',
        text: `${name} account disconnected successfully.`,
      });
      fetchSession();
    } catch (err: unknown) {
      console.error(`Failed to unlink ${provider}:`, err);
      const text = err instanceof Error ? err.message : `Failed to unlink ${name}.`;
      setActionMsg({ type: 'error', text });
    } finally {
      setUnlinkingProvider(null);
    }
  };

  const handleRegisterPasskey = async () => {
    setPasskeyLoading(true);
    setPasskeyMsg(null);
    try {
      const optRes = await fetch('/api/auth/passkey/register-options', { method: 'POST' });
      const options = await optRes.json();
      if (!optRes.ok) {
        throw new Error(options.error || 'Failed to initialize passkey registration.');
      }

      const attResp = await startRegistration({ optionsJSON: options });

      const verifyRes = await fetch('/api/auth/passkey/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attResp),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Passkey verification failed.');
      }

      setPasskeyMsg({ type: 'success', text: 'Passkey registered successfully for this device!' });
      fetchPasskeys();
      fetchSession();
    } catch (err: unknown) {
      console.error('Passkey registration error:', err);
      const text = err instanceof Error ? err.message : 'Passkey registration canceled or failed.';
      setPasskeyMsg({ type: 'error', text });
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleDeletePasskey = async (credentialId: string) => {
    if (!confirm('Remove this passkey from your account?')) return;
    try {
      await fetch('/api/auth/passkey/list', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId }),
      });
      fetchPasskeys();
      fetchSession();
    } catch (err) {
      console.error('Failed to delete passkey:', err);
    }
  };

  const handleInspectSas = async (slug: string) => {
    try {
      const res = await fetch(`/api/assets/download/${slug}?format=json`);
      const data = await res.json();
      setJsonDetails(data);
    } catch {
      setActionMsg({ type: 'error', text: 'Failed to inspect SAS token.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!subscriber) return;
    if (confirmDeleteEmail.trim().toLowerCase() !== subscriber.email.toLowerCase()) {
      setDeleteError(`Email does not match. Please type ${subscriber.email} exactly.`);
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmEmail: confirmDeleteEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account.');
      }

      window.location.href = '/login?notice=AccountDeleted';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete account.';
      setDeleteError(msg);
      setDeleteLoading(false);
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
              Azure Cloud Studio Portal
            </h1>
            <p style={{ fontSize: '1.1rem', maxWidth: '540px', margin: '0 auto 2rem' }}>
              Enterprise multi-method passwordless authentication: WebAuthn Passkeys (Windows Hello,
              Touch ID, Face ID), Social OAuth 2.0 (Google &amp; Microsoft), and Email OTP.
            </p>
          </header>

          <div className="cluster" style={{ justifyContent: 'center' }}>
            <a href="/login" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Sign In with Multi-Method
            </a>
            <a href="/register" className="btn btn-secondary" style={{ padding: '0.75rem 2rem' }}>
              Register Subscriber Account
            </a>
          </div>
        </article>

        <section className="grid grid-cols-2">
          <div className="card">
            <h3>FIDO2 / WebAuthn Passkeys</h3>
            <p>
              Hardware-backed phishing-resistant biometric authentication via <code>@simplewebauthn</code> with
              replay counter detection and discoverable passkey support.
            </p>
          </div>
          <div className="card">
            <h3>Enterprise Social OAuth 2.0</h3>
            <p>
              Direct PKCE (RFC 7636) authentication with Google and Microsoft Entra ID with automatic account
              linking and single-sign-on.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="container stack" style={{ gap: '2rem' }}>
      {actionMsg && (
        <div
          className={`alert ${actionMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}
          role="status"
          style={{ marginBottom: '0.5rem' }}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Subscriber Profile Header */}
      <section className="card">
        <div className="cluster-between">
          <div className="stack" style={{ gap: '0.35rem' }}>
            <div className="cluster">
              <h2>Subscriber Dashboard</h2>
              <span className="badge badge-success">
                {subscriber.is_verified ? 'Verified' : 'Pending Verification'}
              </span>
              {subscriber.passkeyCount && subscriber.passkeyCount > 0 ? (
                <span className="badge badge-success">
                  {subscriber.passkeyCount} Passkey{subscriber.passkeyCount > 1 ? 's' : ''} Active
                </span>
              ) : null}
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

      {/* Passkeys & Biometrics Management */}
      <section className="card stack">
        <header className="cluster-between">
          <div>
            <h3>Passkeys &amp; Hardware Biometrics</h3>
            <p style={{ margin: 0 }}>
              Log in instantly without typing codes using Windows Hello, Touch ID, Face ID, or a FIDO2 USB key.
            </p>
          </div>
          <button
            onClick={handleRegisterPasskey}
            className="btn btn-primary"
            disabled={passkeyLoading}
          >
            {passkeyLoading ? 'Waiting for Authenticator...' : '+ Register New Passkey'}
          </button>
        </header>

        {passkeyMsg && (
          <div
            className={`alert ${passkeyMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}
            role="status"
          >
            {passkeyMsg.text}
          </div>
        )}

        {passkeys.length === 0 ? (
          <p className="hint">No passkeys registered on this account yet. Click above to add your first device passkey.</p>
        ) : (
          <div className="stack" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
            {passkeys.map((pk) => (
              <div
                key={pk.id}
                className="cluster-between"
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="stack" style={{ gap: '0.2rem' }}>
                  <div className="cluster">
                    <strong style={{ fontSize: '0.9rem' }}>FIDO2 / WebAuthn Passkey</strong>
                    <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {pk.credential_id.slice(0, 16)}...
                    </code>
                  </div>
                  <span className="hint">
                    Added: {new Date(pk.created_at).toLocaleDateString()} (Used {pk.counter} times)
                  </span>
                </div>

                <button
                  onClick={() => handleDeletePasskey(pk.credential_id)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Linked Social Accounts */}
      <section className="card stack">
        <h3>Linked Social &amp; Cloud Accounts</h3>
        <p style={{ margin: 0 }}>
          Connect multiple external identity providers to this single account for one-click authentication.
        </p>

        <div className="grid grid-cols-2" style={{ marginTop: '0.5rem' }}>
          {/* Google */}
          <div
            className="cluster-between"
            style={{
              padding: '1rem',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div className="cluster">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div>
                <strong>Google Account</strong>
                <p className="hint" style={{ margin: 0 }}>
                  {subscriber.linkedOAuth?.includes('google') ? 'Connected to this account' : 'Not linked'}
                </p>
              </div>
            </div>

            {subscriber.linkedOAuth?.includes('google') ? (
              <div className="cluster" style={{ gap: '0.5rem' }}>
                <span className="badge badge-success">Linked</span>
                <button
                  type="button"
                  onClick={() => handleUnlinkOAuth('google')}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  disabled={unlinkingProvider === 'google'}
                >
                  {unlinkingProvider === 'google' ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            ) : (
              <a
                href="/api/auth/oauth/google?action=link"
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
              >
                Connect Google
              </a>
            )}
          </div>

          {/* Microsoft */}
          <div
            className="cluster-between"
            style={{
              padding: '1rem',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div className="cluster">
              <svg width="24" height="24" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <div>
                <strong>Microsoft Account</strong>
                <p className="hint" style={{ margin: 0 }}>
                  {subscriber.linkedOAuth?.includes('microsoft') ? 'Connected to this account' : 'Not linked'}
                </p>
              </div>
            </div>

            {subscriber.linkedOAuth?.includes('microsoft') ? (
              <div className="cluster" style={{ gap: '0.5rem' }}>
                <span className="badge badge-success">Linked</span>
                <button
                  type="button"
                  onClick={() => handleUnlinkOAuth('microsoft')}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  disabled={unlinkingProvider === 'microsoft'}
                >
                  {unlinkingProvider === 'microsoft' ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            ) : (
              <a
                href="/api/auth/oauth/microsoft?action=link"
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
              >
                Connect Microsoft
              </a>
            )}
          </div>
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

      {/* Danger Zone: GDPR & Privacy Account Deletion */}
      <section
        className="card stack"
        style={{
          border: '1px solid #ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.04)',
          marginTop: '1.5rem',
        }}
      >
        <header className="cluster-between">
          <div>
            <h3 style={{ color: '#ef4444', margin: 0 }}>Danger Zone: Permanent Account Deletion</h3>
            <p className="hint" style={{ margin: '0.25rem 0 0 0' }}>
              GDPR Right to be Forgotten. Irreversibly wipe your account, biometric passkeys, social logins, and stored data.
            </p>
          </div>
          <button
            onClick={() => {
              setConfirmDeleteEmail('');
              setDeleteError(null);
              setShowDeleteModal(true);
            }}
            className="btn"
            style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              padding: '0.5rem 1.25rem',
            }}
          >
            Delete Account
          </button>
        </header>
      </section>

      {/* Confirmation Modal */}
      {showDeleteModal && subscriber && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card stack"
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: 'var(--bg-card, #1e293b)',
              border: '1px solid #ef4444',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3 id="delete-modal-title" style={{ color: '#ef4444', marginTop: 0 }}>
              Permanently Delete Account?
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-main)' }}>
              This action <strong>cannot be undone</strong>. All your subscriber records, registered passkeys, linked OAuth accounts, and perk access will be permanently destroyed immediately.
            </p>

            <div className="stack" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
              <label htmlFor="confirm-email-input" style={{ fontSize: '0.85rem' }}>
                Please type your email (<strong>{subscriber.email}</strong>) to confirm:
              </label>
              <input
                id="confirm-email-input"
                type="email"
                value={confirmDeleteEmail}
                onChange={(e) => {
                  setConfirmDeleteEmail(e.target.value);
                  setDeleteError(null);
                }}
                placeholder={subscriber.email}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border-subtle, #334155)',
                  backgroundColor: 'var(--bg-subtle, #0f172a)',
                  color: 'inherit',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            {deleteError && (
              <div className="alert alert-error" style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}>
                {deleteError}
              </div>
            )}

            <div className="cluster" style={{ justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-outline"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={
                  deleteLoading ||
                  confirmDeleteEmail.trim().toLowerCase() !== subscriber.email.toLowerCase()
                }
                className="btn"
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  opacity:
                    confirmDeleteEmail.trim().toLowerCase() !== subscriber.email.toLowerCase()
                      ? 0.5
                      : 1,
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}