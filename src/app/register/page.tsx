'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Utilize the HTML5 Constraint Validation API
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit registration.');
      }

      setSuccessMsg(
        'Registration initiated! A 6-digit verification code has been dispatched. Redirecting to verification...'
      );

      // Redirect directly to login with the email prefilled to verify the OTP
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}&step=otp`);
      }, 1500);
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
        <p>Enter your email to receive an instant 6-digit magic login OTP.</p>
      </header>

      {errorMsg && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" role="status" style={{ marginBottom: '1.25rem' }}>
          {successMsg}
        </div>
      )}

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
