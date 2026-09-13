'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<'email' | 'otp' | '2fa'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Initialize from search query if redirected from registration
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const stepParam = searchParams.get('step');

    if (emailParam) {
      setEmail(emailParam);
      if (stepParam === 'otp') {
        setStep('otp');
        setInfoMsg('Please enter the 6-digit verification code sent to your email.');
      }
    }
  }, [searchParams]);

  // Handle Step 1: Email Submission -> Dispatch OTP
  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send login code.');
      }

      setStep('otp');
      setInfoMsg(data.message || 'Verification code sent to your email.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2 & 3: Verify OTP & Optional TOTP
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const payload: Record<string, string> = {
        email,
        otp,
      };

      if (step === '2fa') {
        if (useBackupCode && backupCode) {
          payload.backupCode = backupCode;
        } else if (totpCode) {
          payload.totpCode = totpCode;
        }
      }

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      // Check if account demands a second factor
      if (data.requires2FA) {
        setStep('2fa');
        setInfoMsg('Enter the 6-digit code from your authenticator app.');
        setLoading(false);
        return;
      }

      // Successful verification and session creation
      setInfoMsg('Authentication verified. Redirecting to your dashboard...');
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('email');
    setOtp('');
    setTotpCode('');
    setBackupCode('');
    setErrorMsg(null);
    setInfoMsg(null);
  };

  return (
    <main className="container auth-card card">
      <header className="card-header">
        <h1>
          {step === 'email' && 'Sign In'}
          {step === 'otp' && 'Enter Verification Code'}
          {step === '2fa' && 'Two-Factor Authentication'}
        </h1>
        <p>
          {step === 'email' && 'Passwordless login with a secure 6-digit magic code.'}
          {step === 'otp' && `Code dispatched to ${email}`}
          {step === '2fa' && 'Enter your authenticator app code or emergency backup code.'}
        </p>
      </header>

      {errorMsg && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
          {errorMsg}
        </div>
      )}

      {infoMsg && (
        <div className="alert alert-info" role="status" style={{ marginBottom: '1.25rem' }}>
          {infoMsg}
        </div>
      )}

      {step === 'email' && (
        <form onSubmit={handleSendOtp} noValidate={false} aria-label="Sign In Form">
          <fieldset>
            <legend>Subscriber Credentials</legend>

            <div className="field">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <span className="error-msg">Please enter a valid email address.</span>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Magic Login Code'}
            </button>
          </fieldset>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} noValidate={false} aria-label="Verify OTP Form">
          <fieldset>
            <legend>One-Time Password</legend>

            <div className="field">
              <label htmlFor="otp-input">6-Digit Code</label>
              <input
                id="otp-input"
                className="otp-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoComplete="one-time-code"
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                autoFocus
              />
              <span className="hint" style={{ textAlign: 'center' }}>
                Valid for 10 minutes. Check your terminal/server logs or inbox.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying Code...' : 'Verify & Sign In'}
            </button>

            <button
              type="button"
              className="btn btn-outline btn-block"
              onClick={handleReset}
              disabled={loading}
            >
              Change Email / Re-send
            </button>
          </fieldset>
        </form>
      )}

      {step === '2fa' && (
        <form onSubmit={handleVerifyOtp} noValidate={false} aria-label="2FA Verification Form">
          <fieldset>
            <legend>Second Factor Verification</legend>

            {!useBackupCode ? (
              <div className="field">
                <label htmlFor="totp-input">Authenticator TOTP Code</label>
                <input
                  id="totp-input"
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  autoFocus
                />
                <span className="hint">
                  Open Google Authenticator, Microsoft Authenticator, or 1Password.
                </span>
              </div>
            ) : (
              <div className="field">
                <label htmlFor="backup-input">Single-Use Backup Code</label>
                <input
                  id="backup-input"
                  type="text"
                  required
                  placeholder="e.g. A1B2C3D4"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.trim().toUpperCase())}
                  disabled={loading}
                  autoFocus
                />
                <span className="hint">Enter one of your saved recovery backup codes.</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || (!useBackupCode && totpCode.length !== 6) || (useBackupCode && !backupCode)}
            >
              {loading ? 'Verifying...' : 'Authenticate'}
            </button>

            <div className="cluster-between" style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.8rem' }}
                onClick={() => setUseBackupCode(!useBackupCode)}
              >
                {useBackupCode ? 'Use Authenticator App' : 'Use Backup Code'}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem' }}
                onClick={handleReset}
              >
                Cancel
              </button>
            </div>
          </fieldset>
        </form>
      )}

      <footer style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <p>
          Don&apos;t have an account?{' '}
          <a href="/register" style={{ fontWeight: 600 }}>
            Register as a Subscriber
          </a>
        </p>
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="card auth-card"><p>Loading login form...</p></div>}>
      <LoginFormContent />
    </Suspense>
  );
}
