'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [accountExists, setAccountExists] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const errorParam = searchParams.get('error');

    if (emailParam) {
      setEmail(emailParam);
    }

    if (errorParam) {
      const decoded = decodeURIComponent(errorParam);
      setErrorMsg(decoded);
      if (decoded.toLowerCase().includes('already exists')) {
        setAccountExists(true);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setAccountExists(false);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 || data.code === 'ACCOUNT_ALREADY_EXISTS') {
          setAccountExists(true);
        }
        throw new Error(data.error || 'Failed to submit registration.');
      }

      setSuccessMsg(
        data.message || 'Registration initiated! Redirecting to verification...'
      );

      const devOtpQuery = data.devOtp ? `&devOtp=${encodeURIComponent(data.devOtp)}` : '';
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}&step=otp${devOtpQuery}`);
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-card card">
      <header className="card-header">
        <h1>Subscriber Registration</h1>
        <p>Create your subscriber account with passwordless email OTP or social SSO.</p>
      </header>

      {errorMsg && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
          <div>{errorMsg}</div>
          {accountExists && (
            <div style={{ marginTop: '0.65rem' }}>
              <a
                href={`/login?email=${encodeURIComponent(email)}`}
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              >
                Sign In to Existing Account &rarr;
              </a>
            </div>
          )}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" role="status" style={{ marginBottom: '1.25rem' }}>
          {successMsg}
        </div>
      )}

      {/* Social Registration */}
      <div className="cluster" style={{ width: '100%', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <a
          href="/api/auth/oauth/google?action=register"
          className="btn btn-social"
          style={{ flex: 1 }}
          title="Register with Google Account"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
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
          Google
        </a>

        <a
          href="/api/auth/oauth/microsoft?action=register"
          className="btn btn-social"
          style={{ flex: 1 }}
          title="Register with Microsoft Account"
        >
          <svg width="18" height="18" viewBox="0 0 23 23">
            <path fill="#f35325" d="M1 1h10v10H1z" />
            <path fill="#81bc06" d="M12 1h10v10H12z" />
            <path fill="#05a6f0" d="M1 12h10v10H1z" />
            <path fill="#ffba08" d="M12 12h10v10H12z" />
          </svg>
          Microsoft
        </a>
      </div>

      <div className="auth-divider">
        <span>or register with email verification</span>
      </div>

      <form onSubmit={handleSubmit} noValidate={false} aria-label="Registration Form">
        <fieldset>
          <legend>Account Details</legend>

          <div className="field">
            <label htmlFor="email">Email Address</label>
            <span id="email-hint" className="hint">
              We support international format (e.g. user@domain.com)
            </span>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby="email-hint email-error"
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              disabled={loading}
            />
            <span id="email-error" className="error-msg" aria-live="polite">
              Please enter a valid, complete email address.
            </span>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Generating OTP...' : 'Send Verification OTP'}
          </button>
        </fieldset>
      </form>

      <footer style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <p>
          Already registered?{' '}
          <a href="/login" style={{ fontWeight: 600 }}>
            Sign In with Magic Code
          </a>
        </p>
      </footer>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="card auth-card"><p>Loading registration form...</p></div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
