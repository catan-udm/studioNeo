import crypto from 'crypto';
import { cookies } from 'next/headers';

export const AUTH_COOKIE_NAME = process.env.AUTH_SESSION_COOKIE_NAME || 'sanko_auth_session';
export const SESSION_TTL_SECONDS = Number(process.env.AUTH_SESSION_TTL_SECONDS) || 604800; // 7 days
export const OTP_TTL_MINUTES = Number(process.env.AUTH_OTP_TTL_MINUTES) || 10;

export interface SessionPayload {
  subscriberId: number | string;
  email: string;
  isVerified: boolean;
  expiresAt: number;
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP using crypto.randomInt.
 */
export function generateOTP(): string {
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
}

/**
 * Computes a SHA-256 hex digest for an input token or OTP.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Performs a constant-time comparison of two string values to mitigate timing attacks.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Retrieves the cryptographic secret used for HMAC-SHA256 session signatures.
 */
function getSessionSecret(): Buffer {
  const secret = process.env.AUTH_SESSION_SECRET || 'dev_secret_key_sankobite_auth_32_chars_minimum!';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encodes an object to Base64URL string.
 */
function base64UrlEncode(data: unknown): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Decodes a Base64URL string to UTF-8.
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Creates a signed JWT session token (HMAC-SHA256).
 */
export function createSessionToken(payload: Omit<SessionPayload, 'expiresAt'>): string {
  const secret = getSessionSecret();
  const header = { alg: 'HS256', typ: 'JWT' };
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;

  const fullPayload: SessionPayload = {
    ...payload,
    expiresAt,
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(fullPayload);
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${dataToSign}.${signature}`;
}

/**
 * Verifies and decodes a signed session token. Returns null if invalid or expired.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const secret = getSessionSecret();

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(dataToSign)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (!timingSafeCompare(signature, expectedSignature)) {
      return null;
    }

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: SessionPayload = JSON.parse(payloadJson);

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.expiresAt && payload.expiresAt < nowSeconds) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    console.error('[Auth] Session token verification error:', err);
    return null;
  }
}

/**
 * Sets an httpOnly, SameSite=Lax session cookie on the outgoing response.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

/**
 * Reads and verifies the current session from request cookies.
 */
export async function getSessionUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    return verifySessionToken(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Clears the session cookie on logout.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

// ========================================================================
// RFC 6238 TOTP (Time-Based One-Time Password) Verification
// ========================================================================

/**
 * Decodes a Base32 RFC 4648 string into a Buffer.
 */
function base32Decode(base32: string): Buffer {
  const cleaned = base32.toUpperCase().replace(/[\s=-]/g, '');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const index = alphabet.indexOf(char);
    if (index === -1) {
      continue;
    }
    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

/**
 * Generates an RFC 6238 TOTP code for a given secret at counter step T.
 */
function generateTOTPForCounter(secretKey: Buffer, counter: number): string {
  const buffer = Buffer.alloc(8);
  // Write counter as 64-bit big endian integer
  buffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', secretKey).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;

  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, '0');
  return otp;
}

/**
 * Verifies an RFC 6238 TOTP code against a Base32 secret with +/- 1 time step drift tolerance.
 *
 * @param base32Secret The Base32 encoded TOTP secret
 * @param token The 6-digit code submitted by the user
 * @param timeStepSeconds Default 30s per RFC 6238
 * @param windowTolerance Number of time steps to check before and after (default 1 = +/- 30s)
 */
export function verifyTOTP(
  base32Secret: string,
  token: string,
  timeStepSeconds = 30,
  windowTolerance = 1
): boolean {
  try {
    const secretBuffer = base32Decode(base32Secret);
    if (secretBuffer.length === 0) {
      return false;
    }

    const currentEpoch = Math.floor(Date.now() / 1000);
    const currentStep = Math.floor(currentEpoch / timeStepSeconds);
    const cleanToken = token.trim();

    for (let i = -windowTolerance; i <= windowTolerance; i++) {
      const step = currentStep + i;
      const expectedToken = generateTOTPForCounter(secretBuffer, step);
      if (timingSafeCompare(cleanToken, expectedToken)) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error('[Auth] TOTP verification failed:', err);
    return false;
  }
}

export interface DispatchResult {
  dispatched: boolean;
  channel: 'acs' | 'console';
  error?: string;
}

/**
 * Dispatches an OTP verification email to the user.
 * - When AZURE_COMMUNICATION_CONNECTION_STRING is provided: sends a real transactional email via Azure Communication Services.
 * - In local development: logs the code prominently to server console/stdout.
 */
export async function sendOTPEmail(email: string, otp: string): Promise<DispatchResult> {
  const acsConnString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
  const sender = process.env.ACS_SENDER_EMAIL || 'DoNotReply@yourdomain.azurecomm.net';

  // Always log clear dispatch information to the server stdout for dev & audit
  console.log('------------------------------------------------------------');
  console.log(`[AUTH NOTIFICATION DISPATCH]`);
  console.log(`To: ${email}`);
  console.log(`Your 6-digit Verification Code: [ ${otp} ]`);
  console.log(
    `Valid for: ${OTP_TTL_MINUTES} minutes (Expires: ${new Date(
      Date.now() + OTP_TTL_MINUTES * 60 * 1000
    ).toISOString()})`
  );
  console.log('------------------------------------------------------------');

  if (acsConnString) {
    try {
      const { EmailClient } = await import('@azure/communication-email');
      const emailClient = new EmailClient(acsConnString);

      console.log(`[Auth] Sending email via Azure Communication Services from ${sender} to ${email}...`);

      const poller = await emailClient.beginSend({
        senderAddress: sender,
        content: {
          subject: `${otp} is your verification code`,
          plainText: `Your verification code is ${otp}. This code expires in ${OTP_TTL_MINUTES} minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0f172a; margin-top: 0;">Verification Code</h2>
              <p style="color: #475569; font-size: 15px;">Enter the following 6-digit code to complete your sign-in:</p>
              <div style="background-color: #f1f5f9; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0;">
                <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 13px;">This code will expire in ${OTP_TTL_MINUTES} minutes. If you did not request this, you can ignore this email.</p>
            </div>
          `,
        },
        recipients: {
          to: [{ address: email }],
        },
      });

      // Poll until message is accepted by Azure Communication Services
      const result = await poller.pollUntilDone();
      console.log(`[Auth] Email accepted by Azure Communication Services:`, result.status);
      return { dispatched: true, channel: 'acs' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Auth] Failed to send email via Azure Communication Services:', message);
      return { dispatched: false, channel: 'acs', error: message };
    }
  }

  return { dispatched: true, channel: 'console' };
}

export default {
  AUTH_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  OTP_TTL_MINUTES,
  generateOTP,
  hashToken,
  timingSafeCompare,
  createSessionToken,
  verifySessionToken,
  setSessionCookie,
  getSessionUser,
  clearSessionCookie,
  verifyTOTP,
  sendOTPEmail,
};
