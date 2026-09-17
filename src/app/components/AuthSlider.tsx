'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import '../landing.css';
import '../auth.css';
import { startAuthentication } from '@simplewebauthn/browser';

interface AuthSliderProps {
  initialMode?: 'login' | 'register';
}

export function AuthSliderContent({ initialMode = 'login' }: AuthSliderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form Step: 'email' | 'otp' | '2fa'
  const [step, setStep] = useState<'email' | 'otp' | '2fa'>('email');

  // Input States
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Terms and Privacy Notice Popup State
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Loading & Feedback States
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [resending, setResending] = useState(false);

  // Contextual errors
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // In-place text swap mode switch
  const handleSwitchMode = (targetMode: 'login' | 'register') => {
    if (targetMode === mode) return;
    setMode(targetMode);
    setErrorMsg(null);
    setInfoMsg(null);
    setAccountNotFound(false);
    setAccountExists(false);

    // Synchronize browser URL bar without page reload
    const newPath = targetMode === 'login' ? '/login' : '/register';
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    window.history.pushState({ mode: targetMode }, '', newPath + query);
  };

  // Browser popstate navigation
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.includes('/register')) {
        setMode('register');
      } else {
        setMode('login');
      }
      setErrorMsg(null);
      setInfoMsg(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showTermsModal) {
        setShowTermsModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTermsModal]);

  // Initialize query parameters
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const stepParam = searchParams.get('step');
    const errorParam = searchParams.get('error');
    const noticeParam = searchParams.get('notice');

    if (emailParam) {
      setEmail(emailParam);
    }

    if (errorParam) {
      const decoded = decodeURIComponent(errorParam);
      setErrorMsg(decoded);
      if (decoded.toLowerCase().includes('already exists') || decoded.toLowerCase().includes('already registered')) {
        setAccountExists(true);
      }
    }

    if (noticeParam === 'LoggedOut') {
      setInfoMsg('You have been signed out safely.');
    } else if (noticeParam === 'PleaseSignIn') {
      setInfoMsg('Please sign in to access your subscriber dashboard.');
    }

    if (stepParam === 'otp') {
      setStep('otp');
      setResendCountdown(30);
      setInfoMsg('Please enter the 6-digit verification code sent to your email.');
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

  // Execute Email Dispatch (Shared by direct submit and terms modal acceptance)
  const executeEmailSubmit = async (cleanEmail: string) => {
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);
    setAccountNotFound(false);
    setAccountExists(false);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (mode === 'login' && (res.status === 404 || data.code === 'ACCOUNT_NOT_FOUND')) {
          setAccountNotFound(true);
        }
        if (mode === 'register' && (res.status === 409 || data.code === 'ACCOUNT_ALREADY_EXISTS')) {
          setAccountExists(true);
        }
        throw new Error(data.error || 'Request failed. Please try again.');
      }

      setStep('otp');
      setResendCountdown(30);
      setOtp('');
      setInfoMsg(data.message || 'A 6-digit verification code has been dispatched to your email.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Submit Email
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    // Show Terms & Privacy notice popup before dispatching register OTP
    if (mode === 'register') {
      setShowTermsModal(true);
      return;
    }

    await executeEmailSubmit(cleanEmail);
  };

  // Handler for accepting terms inside the popup card
  const handleAgreeAndRegister = async () => {
    setShowTermsModal(false);
    await executeEmailSubmit(email.trim().toLowerCase());
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resending) return;
    setResending(true);
    setErrorMsg(null);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend verification code.');
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

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMsg('Verification code must be exactly 6 digits.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const payload: Record<string, string> = {
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
      };

      if (step === '2fa') {
        if (useBackupCode && backupCode.trim()) {
          payload.backupCode = backupCode.trim().toUpperCase();
        } else if (totpCode.trim()) {
          payload.totpCode = totpCode.trim();
        }
      }

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed. Please check your code.');
      }

      if (data.requires2FA) {
        setStep('2fa');
        setInfoMsg('Please enter the 6-digit code from your authenticator app.');
        setLoading(false);
        return;
      }

      setActionSuccess(true);
      setInfoMsg(
        mode === 'login'
          ? 'Signed in successfully! Redirecting to your dashboard...'
          : 'Account verified and created! Redirecting to your dashboard...'
      );
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // Passkey Login Handler
  const handlePasskeyLogin = async () => {
    setLoading(true);
    setPasskeyLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const optRes = await fetch('/api/auth/passkey/login-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() ? email.trim().toLowerCase() : undefined }),
      });

      const options = await optRes.json();
      if (!optRes.ok) {
        throw new Error(options.error || 'Failed to initialize passkey authentication.');
      }

      setInfoMsg('Please verify your biometrics, Windows Hello, Touch ID, or security key...');

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

      setPasskeyLoading(false);
      setActionSuccess(true);
      setInfoMsg('Passkey verified successfully! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 700);
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
      setPasskeyLoading(false);
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
    setAccountNotFound(false);
    setAccountExists(false);
  };

  return (
    <main className="landing-page">
      <section className="landing-hero auth-hero">
        <div className="auth-container">
          {/* Segmented Mode Switcher */}
          <div className="auth-toggle-pill">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`auth-toggle-btn ${mode === 'login' ? 'active' : ''}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`auth-toggle-btn ${mode === 'register' ? 'active' : ''}`}
            >
              Register
            </button>
            <div className={`auth-toggle-indicator ${mode === 'register' ? 'register' : ''}`} />
          </div>

          {/* Unified Auth Card with In-Place Text Swaps */}
          <div className="bikko-auth-wrapper">
            <div className="auth-header auth-swap-text">
              <h2>
                {step === 'email' && (mode === 'login' ? 'Welcome Back' : 'Create an Account')}
                {step === 'otp' && (mode === 'login' ? 'Enter Verification Code' : 'Verify Your Email')}
                {step === '2fa' && 'Two-Factor Authentication'}
              </h2>
              <p>
                {step === 'email' &&
                  (mode === 'login'
                    ? 'Sign in to your account to continue.'
                    : 'Sign up as a subscriber with passwordless email or social SSO.')}
                {step === 'otp' && `We sent a 6-digit code to ${email}`}
                {step === '2fa' && 'Enter your authenticator app code or backup code.'}
              </p>
            </div>

            {/* Feedback Alerts */}
            {errorMsg && (
              <div className="alert alert-error" role="alert" style={{ textAlign: 'left' }}>
                <div>{errorMsg}</div>
                {accountNotFound && mode === 'login' && (
                  <div style={{ marginTop: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('register')}
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
                    >
                      Create Account with this Email &rarr;
                    </button>
                  </div>
                )}
                {accountExists && mode === 'register' && (
                  <div style={{ marginTop: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('login')}
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
                    >
                      Sign In to Existing Account &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

            {infoMsg && !errorMsg && (
              <div
                className={`alert ${actionSuccess ? 'alert-success' : 'alert-info'}`}
                role="status"
                style={{ textAlign: 'left' }}
              >
                {infoMsg}
              </div>
            )}

            <div className="auth-content">
              {/* Step 1: Email Form */}
              {step === 'email' && (
                <>
                  <div className="auth-form-section">
                    <form onSubmit={handleEmailSubmit} className="auth-form">
                      <div className="auth-field">
                        <input
                          type="email"
                          id="auth-email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          disabled={loading}
                          className="auth-input"
                          autoComplete="email"
                        />
                      </div>
                      <button
                        type="submit"
                        className="auth-btn auth-btn-primary auth-swap-text"
                        disabled={loading || !email.trim()}
                      >
                        {loading
                          ? 'Sending Code...'
                          : mode === 'login'
                          ? 'Continue'
                          : 'Register'}
                      </button>

                      {/* Terms link on Register mode */}
                      {mode === 'register' && (
                        <p className="terms-consent-note">
                          By continuing, you agree to our{' '}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="auth-switch-link"
                            style={{ fontSize: 'inherit' }}
                          >
                            Terms &amp; Privacy Notice
                          </button>
                        </p>
                      )}
                    </form>
                  </div>

                  {/* Divider */}
                  <div className="auth-divider">
                    <span>Or continue with</span>
                  </div>

                  {/* SSO Section */}
                  <div className="auth-sso-section">
                    <div className="auth-sso-group">
                      <div className="auth-sso-socials">
                        <a
                          href={`/api/auth/oauth/google?action=${mode}`}
                          className="auth-btn auth-btn-social"
                          style={{ textDecoration: 'none' }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
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
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Continue with Google
                        </a>

                        <a
                          href={`/api/auth/oauth/microsoft?action=${mode}`}
                          className="auth-btn auth-btn-social"
                          style={{ textDecoration: 'none' }}
                        >
                          <svg width="20" height="20" viewBox="0 0 23 23" style={{ flexShrink: 0 }}>
                            <path fill="#f35325" d="M1 1h10v10H1z" />
                            <path fill="#81bc06" d="M12 1h10v10H12z" />
                            <path fill="#05a6f0" d="M1 12h10v10H1z" />
                            <path fill="#ffba08" d="M12 12h10v10H12z" />
                          </svg>
                          Continue with Microsoft
                        </a>
                      </div>

                      {mode === 'login' ? (
                        <button
                          type="button"
                          onClick={handlePasskeyLogin}
                          disabled={passkeyLoading || loading}
                          className="auth-btn auth-btn-passkey auth-swap-text"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ flexShrink: 0 }}
                          >
                            <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
                          </svg>
                          {passkeyLoading ? 'Authenticating Passkey...' : 'Continue with Passkey'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSwitchMode('login')}
                          className="auth-btn auth-btn-passkey auth-swap-text"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ flexShrink: 0 }}
                          >
                            <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
                          </svg>
                          Already have a Passkey? Sign In
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: OTP Verification */}
              {step === 'otp' && (
                <div className="auth-form-section" style={{ width: '100%' }}>
                  <form onSubmit={handleVerifyOtp} className="auth-form">
                    <div className="auth-field">
                      <input
                        type="text"
                        id="auth-otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        required
                        autoFocus
                        disabled={loading || actionSuccess}
                        className="auth-input"
                        style={{
                          textAlign: 'center',
                          fontSize: '1.4rem',
                          letterSpacing: '0.4em',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="auth-btn auth-btn-primary auth-swap-text"
                      disabled={loading || otp.length !== 6 || actionSuccess}
                    >
                      {loading
                        ? 'Verifying Code...'
                        : mode === 'login'
                        ? 'Verify & Sign In'
                        : 'Verify & Complete Registration'}
                    </button>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.75rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendCountdown > 0 || resending || loading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: resendCountdown > 0 ? '#94a3b8' : 'var(--brand-primary, #2563eb)',
                          cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer',
                          padding: 0,
                          fontWeight: 500,
                        }}
                      >
                        {resending
                          ? 'Resending...'
                          : resendCountdown > 0
                          ? `Resend code in ${resendCountdown}s`
                          : 'Resend verification code'}
                      </button>

                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Change email
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: 2FA Verification */}
              {step === '2fa' && (
                <div className="auth-form-section" style={{ width: '100%' }}>
                  <form onSubmit={handleVerifyOtp} className="auth-form">
                    {!useBackupCode ? (
                      <div className="auth-field">
                        <input
                          type="text"
                          id="auth-totp"
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          inputMode="numeric"
                          required
                          autoFocus
                          disabled={loading || actionSuccess}
                          className="auth-input"
                          style={{
                            textAlign: 'center',
                            fontSize: '1.4rem',
                            letterSpacing: '0.4em',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="auth-field">
                        <input
                          type="text"
                          id="auth-backup"
                          value={backupCode}
                          onChange={(e) => setBackupCode(e.target.value.trim().toUpperCase())}
                          placeholder="A1B2C3D4"
                          required
                          autoFocus
                          disabled={loading || actionSuccess}
                          className="auth-input"
                          style={{ textAlign: 'center', letterSpacing: '0.15em', fontWeight: 600 }}
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="auth-btn auth-btn-primary"
                      disabled={
                        loading ||
                        actionSuccess ||
                        (!useBackupCode && totpCode.length !== 6) ||
                        (useBackupCode && !backupCode.trim())
                      }
                    >
                      {loading ? 'Authenticating...' : 'Authenticate'}
                    </button>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.75rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setUseBackupCode(!useBackupCode)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--brand-primary, #2563eb)',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        {useBackupCode ? 'Use Authenticator App' : 'Use Backup Code'}
                      </button>

                      <button
                        type="button"
                        onClick={handleReset}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Footer Switching Prompt */}
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '0.75rem' }}>
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register')}
                    className="auth-switch-link"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="auth-switch-link"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          Terms of Service & Privacy Notice Popup Card Modal
          ======================================================= */}
      {showTermsModal && (
        <div
          className="terms-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTermsModal(false);
            }
          }}
        >
          <div className="terms-card">
            <div className="terms-header">
              <div>
                <h3 id="terms-modal-title">Terms &amp; Privacy Notice</h3>
                <p>Subscriber agreements and privacy policy for Bikko Studio</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="terms-close-btn"
                aria-label="Close terms popup"
              >
                ✕
              </button>
            </div>

            <div className="terms-body">
              <section className="terms-section">
                <h4>1. Terms of Service</h4>
                <p>
                  Welcome to Bikko Studio. By registering a subscriber account, you agree to comply with
                  these Terms of Service:
                </p>
                <ul>
                  <li>
                    <strong>Subscriber Access:</strong> Registration grants you personalized, passwordless
                    access to exclusive project downloads, digital assets, and perks.
                  </li>
                  <li>
                    <strong>Account Integrity:</strong> You are responsible for safeguarding your email inbox,
                    FIDO2 passkey hardware, and biometric credentials used for authentication.
                  </li>
                  <li>
                    <strong>Digital Asset Licensing:</strong> All unlocked digital perk assets are provided under
                    a revocable, non-exclusive license for subscriber use and may not be resold or re-hosted.
                  </li>
                  <li>
                    <strong>Service Availability:</strong> We strive for continuous availability but reserves the
                    right to modify or discontinue features with appropriate notice.
                  </li>
                </ul>
              </section>

              <section className="terms-section">
                <h4>2. Privacy Notice &amp; Data Protection</h4>
                <p>
                  We are committed to privacy-first, minimal data collection practices under global standards:
                </p>
                <ul>
                  <li>
                    <strong>Information We Collect:</strong> We collect only your email address, authentication
                    timestamps, and cryptographic public keys (for WebAuthn passkey biometrics).
                  </li>
                  <li>
                    <strong>Cryptographic Security:</strong> Authentication OTP tokens and session cookies are
                    hashed and signed with HMAC-SHA256. Passkey biometric data never leaves your physical device.
                  </li>
                  <li>
                    <strong>No Tracking or Sale of Data:</strong> We never sell, rent, or trade your personal
                    information to third-party ad networks or brokers.
                  </li>
                  <li>
                    <strong>Subscriber Control:</strong> You have the right to review your data, unlink external
                    OAuth providers (Google, Microsoft), and delete registered passkeys at any time.
                  </li>
                </ul>
              </section>
            </div>

            <div className="terms-footer">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAgreeAndRegister}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                Agree &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AuthSlider({ initialMode = 'login' }: AuthSliderProps) {
  return (
    <Suspense
      fallback={
        <main className="landing-page">
          <section className="landing-hero auth-hero">
            <div className="bikko-auth-wrapper" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p>Loading authentication...</p>
            </div>
          </section>
        </main>
      }
    >
      <AuthSliderContent initialMode={initialMode} />
    </Suspense>
  );
}
