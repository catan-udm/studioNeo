'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { startAuthentication } from '@simplewebauthn/browser';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<'email' | 'otp' | '2fa'>('email');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [passkeyScanning, setPasskeyScanning] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [otpShake, setOtpShake] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [resending, setResending] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Input refs for the 6-cell segmented OTP component
  const inputRef0 = useRef<HTMLInputElement>(null);
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const inputRef3 = useRef<HTMLInputElement>(null);
  const inputRef4 = useRef<HTMLInputElement>(null);
  const inputRef5 = useRef<HTMLInputElement>(null);
  const otpRefs = [inputRef0, inputRef1, inputRef2, inputRef3, inputRef4, inputRef5];

  const otp = otpDigits.join('');

  // Initialize from search query if redirected from registration or OAuth
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const stepParam = searchParams.get('step');
    const devOtpParam = searchParams.get('devOtp');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setErrorMsg(`Sign in error: ${decodeURIComponent(errorParam)}`);
    }

    if (devOtpParam) {
      setDevOtp(devOtpParam);
      if (devOtpParam.length === 6) {
        setOtpDigits(devOtpParam.split(''));
      }
    }

    if (emailParam) {
      setEmail(emailParam);
      if (stepParam === 'otp') {
        setDirection('forward');
        setStep('otp');
        setResendCountdown(30);
        setInfoMsg('Please enter the 6-digit verification code sent to your email.');
      }
    }
  }, [searchParams]);

  // Resend Countdown Timer
  useEffect(() => {
    if (step === 'otp' && resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, resendCountdown]);

  // Auto-focus first empty OTP cell on entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      const emptyIdx = otpDigits.findIndex((d) => d === '');
      const idxToFocus = emptyIdx === -1 ? 5 : emptyIdx;
      otpRefs[idxToFocus]?.current?.focus();
    }
  }, [step]);

  // Handle OTP digit entry
  const handleOtpChange = (index: number, val: string) => {
    const sanitized = val.replace(/\D/g, '');
    if (!sanitized) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Handle single digit
    const char = sanitized.charAt(sanitized.length - 1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Advance to next box if available
    if (index < 5 && char) {
      otpRefs[index + 1]?.current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Move back to previous cell
        otpRefs[index - 1]?.current?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs[index - 1]?.current?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs[index + 1]?.current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);

    const nextIdx = Math.min(pasted.length, 5);
    otpRefs[nextIdx]?.current?.focus();
  };

  // Biometric / Passkey Login Handler
  const handlePasskeyLogin = async () => {
    setLoading(true);
    setPasskeyScanning(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const optRes = await fetch('/api/auth/passkey/login-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email ? email : undefined }),
      });

      const options = await optRes.json();
      if (!optRes.ok) {
        throw new Error(options.error || 'Failed to initialize passkey login.');
      }

      setInfoMsg('Please verify your biometrics, Windows Hello, or security key...');

      const asseResp = await startAuthentication({ optionsJSON: options });

      const verifyRes = await fetch('/api/auth/passkey/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asseResp),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Passkey verification failed.');
      }

      setPasskeyScanning(false);
      setLoginSuccess(true);
      setInfoMsg('Passkey verified successfully! Redirecting...');
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 750);
    } catch (err: unknown) {
      console.error('Passkey error:', err);
      const message = err instanceof Error ? err.message : 'Passkey authentication failed.';
      if (
        message.includes('The operation either timed out or was not allowed') ||
        message.includes('abort') ||
        message.includes('cancel')
      ) {
        setErrorMsg('Passkey prompt was canceled or timed out.');
      } else {
        setErrorMsg(message);
      }
    } finally {
      setPasskeyScanning(false);
      setLoading(false);
    }
  };

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

      setDirection('forward');
      setStep('otp');
      setResendCountdown(30);
      setOtpDigits(['', '', '', '', '', '']);
      setInfoMsg(data.message || 'Verification code sent to your email.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code action
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resending) return;
    setResending(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend login code.');
      }

      setResendCountdown(30);
      setInfoMsg('A fresh verification code has been dispatched to your email.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend code.';
      setErrorMsg(message);
    } finally {
      setResending(false);
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
        // Trigger shake animation on OTP failure
        setOtpShake(true);
        setTimeout(() => setOtpShake(false), 500);
        throw new Error(data.error || 'Verification failed.');
      }

      // Check if account demands a second factor
      if (data.requires2FA) {
        setDirection('forward');
        setStep('2fa');
        setInfoMsg('Enter the 6-digit code from your authenticator app.');
        setLoading(false);
        return;
      }

      // Successful verification and session creation
      setLoginSuccess(true);
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
    setDirection('backward');
    setStep('email');
    setOtpDigits(['', '', '', '', '', '']);
    setTotpCode('');
    setBackupCode('');
    setDevOtp(null);
    setErrorMsg(null);
    setInfoMsg(null);
  };

  return (
    <main className="container auth-card card">
      {/* Animated Success State */}
      {loginSuccess ? (
        <div className="auth-success-card" role="status">
          <div className="success-icon-wrapper">
            <svg
              className="success-icon-svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2>Authentication Verified</h2>
          <p style={{ marginTop: '0.25rem' }}>Welcome back! Launching your studio dashboard...</p>
          <span className="spinner spinner-sm" style={{ marginTop: '0.75rem' }} />
        </div>
      ) : (
        <>
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

          {/* Passkey active scanning pulse indicator */}
          {passkeyScanning && (
            <div className="passkey-pulse-banner" role="status">
              <div className="passkey-beacon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.07 4.93a10 10 0 0 0-14.14 0" />
                  <path d="M15.54 8.46a5 5 0 0 0-7.07 0" />
                </svg>
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                <strong>Awaiting Passkey Prompt</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Use Windows Hello, Touch ID, Face ID, or your physical FIDO2 key.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="alert alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
              <div>{errorMsg}</div>
              {(errorMsg.toLowerCase().includes('register') ||
                errorMsg.toLowerCase().includes('no account') ||
                errorMsg.toLowerCase().includes('not found') ||
                errorMsg.toLowerCase().includes('verification')) && (
                  <div style={{ marginTop: '0.6rem' }}>
                    <Link
                      href={`/register${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
                    >
                      Go to Registration &rarr;
                    </Link>
                  </div>
                )}
            </div>
          )}

          {infoMsg && !loginSuccess && (
            <div className="alert alert-info" role="status" style={{ marginBottom: '1.25rem' }}>
              {infoMsg}
            </div>
          )}

          {/* STEP 1: EMAIL & MULTI-METHOD LOGIN */}
          {step === 'email' && (
            <div
              key="step-email"
              className={`step-panel ${direction === 'backward' ? 'slide-backward' : 'fade-scale'}`}
            >
              {/* Multi-Method: Passkey & Social OAuth */}
              <div className="stack" style={{ gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-passkey"
                  onClick={handlePasskeyLogin}
                  disabled={loading}
                  title="Sign in with Windows Hello, Face ID, Touch ID, or Security Key"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.07 4.93a10 10 0 0 0-14.14 0" />
                    <path d="M15.54 8.46a5 5 0 0 0-7.07 0" />
                    <path d="M21.9 2.1a14 14 0 0 0-19.8 0" />
                  </svg>
                  {passkeyScanning ? 'Awaiting Biometrics...' : 'Sign In with Passkey / Biometrics'}
                </button>

                <div className="cluster" style={{ width: '100%', gap: '0.75rem' }}>
                  <a
                    href="/api/auth/oauth/google?action=signin"
                    className="btn btn-social"
                    style={{ flex: 1 }}
                    title="Sign in with Google Account"
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
                    href="/api/auth/oauth/microsoft?action=signin"
                    className="btn btn-social"
                    style={{ flex: 1 }}
                    title="Sign in with Microsoft Entra / Outlook / Live"
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
              </div>

              <div className="auth-divider">
                <span>or sign in with email OTP</span>
              </div>

              <form onSubmit={handleSendOtp} noValidate={false} aria-label="Sign In Form">
                <fieldset>
                  <legend>Passwordless Email Magic Code</legend>

                  <div className="field">
                    <label htmlFor="login-email">Email Address</label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email webauthn"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                    <span className="error-msg">Please enter a valid email address.</span>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner spinner-sm" />
                        Sending Code...
                      </>
                    ) : (
                      'Send Magic Login Code &rarr;'
                    )}
                  </button>
                </fieldset>
              </form>
            </div>
          )}

          {/* STEP 2: SEGMENTED 6-DIGIT OTP VERIFICATION */}
          {step === 'otp' && (
            <div
              key="step-otp"
              className={`step-panel ${direction === 'forward' ? 'slide-forward' : 'slide-backward'}`}
            >
              <form onSubmit={handleVerifyOtp} noValidate={false} aria-label="Verify OTP Form">
                <fieldset>
                  <legend>Enter One-Time Password</legend>

                  <div className={`otp-container ${otpShake ? 'otp-shake' : ''}`}>
                    <label htmlFor="otp-box-0" style={{ marginBottom: '0.25rem' }}>
                      6-Digit Security Code
                    </label>

                    {/* Interactive 6-Cell Segmented Input */}
                    <div className="otp-digit-group">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={`otp-cell-${idx}`}
                          id={`otp-box-${idx}`}
                          ref={otpRefs[idx]}
                          className={`otp-box ${digit ? 'filled' : ''}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          pattern="[0-9]"
                          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          disabled={loading}
                          required
                          aria-label={`Digit ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <span className="hint" style={{ textAlign: 'center', marginTop: '0.35rem' }}>
                      Valid for 10 minutes. Check your server console or inbox.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <>
                        <span className="spinner spinner-sm" />
                        Verifying Code...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </button>

                  <div
                    className="cluster-between"
                    style={{ marginTop: '0.5rem', width: '100%', gap: '0.5rem' }}
                  >
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: '0.825rem', flex: 1 }}
                      onClick={handleReset}
                      disabled={loading}
                    >
                      &larr; Change Email
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.825rem', flex: 1 }}
                      onClick={handleResendOtp}
                      disabled={loading || resendCountdown > 0 || resending}
                    >
                      {resending ? (
                        <>
                          <span className="spinner spinner-sm" /> Sending...
                        </>
                      ) : resendCountdown > 0 ? (
                        `Resend in ${resendCountdown}s`
                      ) : (
                        'Resend Code'
                      )}
                    </button>
                  </div>
                </fieldset>
              </form>
            </div>
          )}

          {/* STEP 3: 2FA TOTP OR BACKUP CODE */}
          {step === '2fa' && (
            <div key="step-2fa" className="step-panel slide-forward">
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
                    disabled={
                      loading ||
                      (!useBackupCode && totpCode.length !== 6) ||
                      (useBackupCode && !backupCode)
                    }
                  >
                    {loading ? (
                      <>
                        <span className="spinner spinner-sm" />
                        Authenticating...
                      </>
                    ) : (
                      'Authenticate & Sign In'
                    )}
                  </button>

                  <div className="cluster-between" style={{ marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem' }}
                      onClick={() => setUseBackupCode(!useBackupCode)}
                      disabled={loading}
                    >
                      {useBackupCode ? 'Use Authenticator App' : 'Use Backup Code'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem' }}
                      onClick={handleReset}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </fieldset>
              </form>
            </div>
          )}

          <footer style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/register" style={{ fontWeight: 600 }}>
                Register as a Subscriber
              </Link>
            </p>
          </footer>
        </>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="card auth-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <span className="spinner" style={{ marginBottom: '1rem' }} />
          <p>Loading secure login...</p>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
