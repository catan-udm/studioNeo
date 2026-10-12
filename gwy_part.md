# Technical Documentation & Code Audit: Gwy's Scope of Implementation

> **Document Name**: `gwy_part.md`  
> **Repository**: `bikko.studio` (`studioNeo`)  
> **Scope Source**: Highlighted Sections in Project Objectives Breakdown (Items 1.1, 1.2, 1.3, and 2.1)

---

## 1. Executive Summary & Objective Mapping

Based on the project breakdown, the highlighted tasks delineate the complete **Identity, Cryptographic Security, Federated Single Sign-On (SSO), and Database-Driven Authorization Engine** for the platform. Below is the mapping of each highlighted item to its corresponding architecture modules, files, and exact line ranges in the repository.

| Highlighted Objective from Image | Architectural Domain | Core Files in Codebase | Line Numbers |
| :--- | :--- | :--- | :--- |
| **1.1. Build a FIDO2 / WebAuthn Level 3 passkey login system using `@simplewebauthn` to support biometric login and hardware security keys** | Hardware-Bound WebAuthn Authentication | [`src/lib/webauthn.ts`](file:///home/sankobite/studioNeo/src/lib/webauthn.ts)<br>[`src/app/api/auth/passkey/login-options/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/passkey/login-options/route.ts)<br>[`src/app/api/auth/passkey/login-verify/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/passkey/login-verify/route.ts)<br>[`src/app/api/auth/passkey/register-options/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/passkey/register-options/route.ts)<br>[`src/app/api/auth/passkey/register-verify/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/passkey/register-verify/route.ts)<br>[`src/app/api/auth/passkey/list/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/passkey/list/route.ts)<br>[`src/app/components/AuthSlider.tsx`](file:///home/sankobite/studioNeo/src/app/components/AuthSlider.tsx)<br>[`src/app/dashboard/DashboardClient.tsx`](file:///home/sankobite/studioNeo/src/app/dashboard/DashboardClient.tsx) | `webauthn.ts`: L1–170<br>`login-options`: L1–91<br>`login-verify`: L1–141<br>`register-options`: L1–76<br>`register-verify`: L1–89<br>`list`: L1–61<br>`AuthSlider.tsx`: L290–347<br>`DashboardClient.tsx`: L178–226 |
| **1.2. Implement secure fallback login options, including 6-digit email OTPs sent via Azure Communication Services and TOTP through authenticator apps with hashed recovery codes** | Zero-Knowledge Fallback & MFA Pipeline | [`src/lib/auth.ts`](file:///home/sankobite/studioNeo/src/lib/auth.ts)<br>[`src/app/api/auth/login/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/login/route.ts)<br>[`src/app/api/auth/verify-otp/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/verify-otp/route.ts)<br>[`src/app/components/AuthSlider.tsx`](file:///home/sankobite/studioNeo/src/app/components/AuthSlider.tsx)<br>[`scripts/schema.sql`](file:///home/sankobite/studioNeo/scripts/schema.sql) | `auth.ts`: L16–45, L218–376<br>`login/route.ts`: L1–100<br>`verify-otp/route.ts`: L1–177<br>`AuthSlider.tsx`: L135–288<br>`schema.sql`: L25–67 |
| **1.3. Integrate third-party social logins using Google Identity Services and Microsoft Entra ID** | Federated OAuth 2.0 / OIDC with PKCE | [`src/lib/oauth.ts`](file:///home/sankobite/studioNeo/src/lib/oauth.ts)<br>[`src/app/api/auth/oauth/[provider]/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/oauth/%5Bprovider%5D/route.ts)<br>[`src/app/api/auth/oauth/[provider]/callback/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/oauth/%5Bprovider%5D/callback/route.ts)<br>[`src/app/components/AuthSlider.tsx`](file:///home/sankobite/studioNeo/src/app/components/AuthSlider.tsx) | `oauth.ts`: L1–318<br>`[provider]/route.ts`: L1–148<br>`callback/route.ts`: L1–294<br>`AuthSlider.tsx`: L500–542 |
| **2.1. Build a subscriber verification engine using an Azure Database for MySQL Flexible Server to check user permissions securely** | Cloud Database Entitlement & Permission Verification Engine | [`src/lib/db.ts`](file:///home/sankobite/studioNeo/src/lib/db.ts)<br>[`src/app/api/assets/download/[slug]/route.ts`](file:///home/sankobite/studioNeo/src/app/api/assets/download/%5Bslug%5D/route.ts)<br>[`src/app/api/auth/me/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/me/route.ts)<br>[`src/lib/azure-storage.ts`](file:///home/sankobite/studioNeo/src/lib/azure-storage.ts)<br>[`scripts/schema.sql`](file:///home/sankobite/studioNeo/scripts/schema.sql) | `db.ts`: L1–195<br>`download/[slug]/route.ts`: L18–92<br>`me/route.ts`: L20–103<br>`azure-storage.ts`: L98–153<br>`schema.sql`: L13–24, L70–98 |

---

## 2. Topic 1 — Bullet 1: FIDO2 / WebAuthn Level 3 Passkey Login System

### Objective Statement
> *"Build a FIDO2 / WebAuthn Level 3 passkey login system using `@simplewebauthn` to support biometric login (fingerprint and facial recognition) and hardware security keys."*

### 2.1. Specific Code Encased
1. **Helper & Protocol Configuration**: [`src/lib/webauthn.ts`](file:///home/sankobite/studioNeo/src/lib/webauthn.ts#L1-L170)
2. **Server Challenge & Options Generation**:
   - Login: [`src/app/api/auth/passkey/login-options/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/passkey/login-options/route.ts#L1-L91)
   - Registration: [`src/app/api/auth/passkey/register-options/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/passkey/register-options/route.ts#L1-L76)
3. **Cryptographic Signature Verification**:
   - Login: [`src/app/api/auth/passkey/login-verify/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/passkey/login-verify/route.ts#L1-L141)
   - Registration: [`src/app/api/auth/passkey/register-verify/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/passkey/register-verify/route.ts#L1-L89)
4. **Credential Lifecycle & Revocation**: [`src/app/api/auth/passkey/list/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/passkey/list/route.ts#L1-L61)
5. **Client-Side Biometric Prompts**:
   - Login Ceremony: [`src/app/components/AuthSlider.tsx`](file:///home/sankobite/studioNeo/src/app/components/AuthSlider.tsx#L290-L347)
   - Enrollment Ceremony: [`src/app/dashboard/DashboardClient.tsx`](file:///home/sankobite/studioNeo/src/app/dashboard/DashboardClient.tsx#L178-L211)

---

### 2.2. Code Snippets, Syntax Analysis & Technical Rationale

#### A. Relying Party (RP) ID and Origin Normalization ([`src/lib/webauthn.ts`](file:///home/sankobite/studioNeo/src/lib/webauthn.ts#L46-L86))
```typescript
export function getRPConfig(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const baseDomain = cleanDomain(baseUrl);
  const originHeader = request.headers.get('origin');
  const origin = originHeader ? cleanOrigin(originHeader) : cleanOrigin(baseUrl);

  const rawRpId = process.env.WEBAUTHN_RP_ID?.trim();
  const rpID = rawRpId ? cleanDomain(rawRpId) : (baseDomain || 'localhost');
  const rpName = process.env.WEBAUTHN_RP_NAME || 'Azure Cloud Studio';

  const expectedOrigins = Array.from(
    new Set([
      origin,
      cleanOrigin(baseUrl),
      process.env.APP_URL ? cleanOrigin(process.env.APP_URL) : '',
      `https://${rpID}`,
      'http://localhost:3000',
      'http://localhost:4280', // Azure Static Web Apps CLI
    ].filter(Boolean))
  );

  return { rpID, rpName, origin, expectedOrigins };
}
```
* **Syntax & Purpose**:
  - `cleanDomain()` strips port numbers, paths, and URL protocols (e.g., turning `https://ashy-mushroom-07675a400.6.azurestaticapps.net` into `ashy-mushroom-07675a400.6.azurestaticapps.net`).
  - WebAuthn Level 3 specifications dictate that the **Relying Party ID (RP ID)** must be an effective domain without schema or port.
* **Why it was used**: WebAuthn passkeys are hardware-bound and strictly origin-isolated by the browser sandbox. If the origin or RP ID differs by even a trailing slash or port, the authenticator (Apple Touch ID / Windows Hello / YubiKey) refuses to sign the challenge to prevent cross-site phishing.

#### B. Cryptographic Challenge Issuance ([`src/lib/webauthn.ts`](file:///home/sankobite/studioNeo/src/lib/webauthn.ts#L91-L114))
```typescript
export async function setPasskeyChallenge(
  payload: Omit<PasskeyChallengePayload, 'expiresAt'>
): Promise<void> {
  const cookieStore = await cookies();
  const secret = process.env.AUTH_SESSION_SECRET || 'dev_secret_key...';
  const expiresAt = Math.floor(Date.now() / 1000) + CHALLENGE_TTL_SECONDS; // 300s (5m)

  const data: PasskeyChallengePayload = { ...payload, expiresAt };
  const serialized = JSON.stringify(data);
  const signature = crypto.createHmac('sha256', secret).update(serialized).digest('hex');
  const value = Buffer.from(JSON.stringify({ data, sig: signature })).toString('base64url');

  cookieStore.set('passkey_challenge', value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CHALLENGE_TTL_SECONDS,
  });
}
```
* **Syntax & Purpose**:
  - Signs the random challenge string using **HMAC-SHA256** and saves it to a short-lived (5-minute), tamper-proof `httpOnly`, `SameSite=Lax` cookie.
* **Why it was used**: Storing the expected challenge stateless on the client inside an HMAC-signed cookie prevents server memory exhaustion attacks (anti-DDoS) while guaranteeing the client cannot forge or alter the challenge prior to verification.

#### C. Authentication Verification & Anti-Replay Counter ([`src/app/api/auth/passkey/login-verify/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/passkey/login-verify/route.ts#L77-L105))
```typescript
// Convert stored base64url public key to Uint8Array required by SimpleWebAuthn
const publicKeyBytes = new Uint8Array(Buffer.from(credRecord.public_key, 'base64url'));

const verification = await verifyAuthenticationResponse({
  response: body,
  expectedChallenge: challengePayload.challenge,
  expectedOrigin: expectedOrigins,
  expectedRPID: rpID,
  credential: {
    id: credRecord.credential_id,
    publicKey: publicKeyBytes,
    counter: Number(credRecord.counter),
  },
  requireUserVerification: false,
});

if (!verification.verified) {
  return NextResponse.json({ error: 'Passkey signature verification failed.' }, { status: 401 });
}

// Update credential counter to prevent replay attacks
const newCounter = verification.authenticationInfo.newCounter;
await execute('UPDATE webauthn_credentials SET counter = ? WHERE id = ?', [
  newCounter,
  credRecord.id,
]);
```
* **Syntax & Purpose**:
  - `verifyAuthenticationResponse` checks that the client's authenticator signed `expectedChallenge` with the private key corresponding to `publicKeyBytes`.
  - Increments `counter` in the database.
* **Why it was used**:
  - Passkeys use asymmetric cryptography: private keys never leave the secure enclave (TPM / Apple Secure Enclave / YubiKey chip). Only the public key is stored in `webauthn_credentials`.
  - The monotonic counter verifies that an authenticator signature is fresh. If an attacker intercepts and replays a previous response, the counter value will not advance, and the verification engine immediately rejects the request.

#### D. Browser Biometric Invocation ([`src/app/components/AuthSlider.tsx`](file:///home/sankobite/studioNeo/src/app/components/AuthSlider.tsx#L311-L322))
```typescript
import { startAuthentication } from '@simplewebauthn/browser';

// 1. Request options from backend
const optRes = await fetch('/api/auth/passkey/login-options', ...);
const options = await optRes.json();

// 2. Prompt browser native biometric UI (Touch ID, Face ID, Windows Hello)
const asseResp = await startAuthentication({ optionsJSON: options });

// 3. Send signed assertion response back to server
const verifyRes = await fetch('/api/auth/passkey/login-verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(asseResp),
});
```
* **Syntax & Purpose**:
  - `startAuthentication()` invokes the browser's native `navigator.credentials.get()` WebAuthn API.
* **Why it was used**: Standardizes the complex WebAuthn binary conversion (converting ArrayBuffers to base64url strings) across different browsers (Chromium, WebKit, Gecko).

---

## 3. Topic 1 — Bullet 2: Secure Fallback Login Options (Email OTP & TOTP MFA)

### Objective Statement
> *"Implement secure fallback login options, including 6-digit email one-time passwords (OTP) sent via Azure Communication Services and Time-Based One-Time Passwords (TOTP) through authenticator apps with hashed recovery codes."*

### 3.1. Specific Code Encased
1. **Cryptographic Core & RFC 6238 TOTP Engine**: [`src/lib/auth.ts`](file:///home/sankobite/studioNeo/src/lib/auth.ts#L16-L45,L218-L376)
2. **OTP Dispatch Route**: [`src/app/api/auth/login/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/login/route.ts#L1-L100)
3. **Multi-Factor Verification Route**: [`src/app/api/auth/verify-otp/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/verify-otp/route.ts#L1-L177)
4. **Client-Side OTP/TOTP Forms**: [`src/app/components/AuthSlider.tsx`](file:///home/sankobite/studioNeo/src/app/components/AuthSlider.tsx#L135-L288)
5. **Database Relational Schemas**: [`scripts/schema.sql`](file:///home/sankobite/studioNeo/scripts/schema.sql#L25-L67) (`auth_magic_tokens`, `totp_credentials`, `totp_backup_codes`)

---

### 3.2. Code Snippets, Syntax Analysis & Technical Rationale

#### A. Cryptographic OTP Generation & Timing-Safe Comparison ([`src/lib/auth.ts`](file:///home/sankobite/studioNeo/src/lib/auth.ts#L16-L44))
```typescript
export function generateOTP(): string {
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
```
* **Syntax & Purpose**:
  - `crypto.randomInt(100000, 1000000)`: Uses CSPRNG (Cryptographically Secure Pseudo-Random Number Generator) rather than `Math.random()`, yielding a uniform 6-digit distribution $[100000, 999999]$.
  - `hashToken()`: Converts the raw OTP to a 64-character SHA-256 hexadecimal string before saving to the database.
  - `timingSafeEqual()`: Compares memory buffers in constant time $O(1)$.
* **Why it was used**:
  - **Zero-Knowledge Security**: Plaintext OTPs are never stored in the database. Even if the database is dumped, attackers cannot reconstruct the active OTPs.
  - **Timing Attack Mitigation**: Standard string comparison (`===`) terminates on the first mismatched character, allowing attackers to measure execution time down to nanoseconds to guess token hashes. `crypto.timingSafeEqual` prevents this vulnerability.

#### B. RFC 6238 Time-Based One-Time Password (TOTP) Algorithm ([`src/lib/auth.ts`](file:///home/sankobite/studioNeo/src/lib/auth.ts#L249-L300))
```typescript
function generateTOTPForCounter(secretKey: Buffer, counter: number): string {
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter)); // 64-bit big endian integer

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

export function verifyTOTP(
  base32Secret: string,
  token: string,
  timeStepSeconds = 30,
  windowTolerance = 1 // +/- 30 seconds drift tolerance
): boolean {
  const secretBuffer = base32Decode(base32Secret);
  const currentEpoch = Math.floor(Date.now() / 1000);
  const currentStep = Math.floor(currentEpoch / timeStepSeconds);

  for (let i = -windowTolerance; i <= windowTolerance; i++) {
    const step = currentStep + i;
    const expectedToken = generateTOTPForCounter(secretBuffer, step);
    if (timingSafeCompare(token.trim(), expectedToken)) {
      return true;
    }
  }
  return false;
}
```
* **Syntax & Purpose**:
  - Implements the IETF **RFC 6238** standard (compatible with Google Authenticator, Microsoft Authenticator, and 1Password).
  - Uses dynamic truncation on HMAC-SHA1 output with a 30-second time window $T = \lfloor \frac{\text{Epoch}}{30} \rfloor$.
  - Includes a `windowTolerance = 1` ($\pm 1$ step) to account for clock drift between client smartphones and cloud servers.
* **Why it was used**: Provides a standardized, offline second authentication factor that functions even without cellular data or internet access.

#### C. Transactional Email Dispatch via Azure Communication Services ([`src/lib/auth.ts`](file:///home/sankobite/studioNeo/src/lib/auth.ts#L320-L373))
```typescript
import { EmailClient } from '@azure/communication-email';

const acsConnString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
const sender = process.env.ACS_SENDER_EMAIL || 'DoNotReply@yourdomain.azurecomm.net';

const emailClient = new EmailClient(acsConnString);
const poller = await emailClient.beginSend({
  senderAddress: sender,
  content: {
    subject: `${otp} is your verification code`,
    plainText: `Your verification code is ${otp}. Valid for 10 minutes.`,
    html: `...<span style="font-size: 32px; letter-spacing: 6px;">${otp}</span>...`,
  },
  recipients: { to: [{ address: email }] },
});

const result = await poller.pollUntilDone();
```
* **Syntax & Purpose**:
  - Utilizes `@azure/communication-email` SDK to dispatch transactional emails using an asynchronous long-running operation poller.
* **Why it was used**: Azure Communication Services provides high-reputation transactional delivery with high throughput, SPF/DKIM authentication compliance, and low latency for OTP delivery.

#### D. Two-Factor Authentication & Hashed Single-Use Recovery Codes ([`src/app/api/auth/verify-otp/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/verify-otp/route.ts#L89-L134))
```typescript
// 4. TOTP 2FA Verification (if active on the account)
const totpRecord = await queryRow<{ totp_secret: string; is_active: number }>(
  'SELECT totp_secret, is_active FROM totp_credentials WHERE subscriber_id = ? AND is_active = 1 LIMIT 1',
  [subscriber.id]
);

if (totpRecord && totpRecord.is_active === 1) {
  if (!totpCode && !backupCode) {
    return NextResponse.json({ requires2FA: true }, { status: 200 });
  }

  let is2faValid = false;

  if (totpCode) {
    is2faValid = verifyTOTP(totpRecord.totp_secret, totpCode);
  } else if (backupCode) {
    const backupHash = hashToken(backupCode.trim());
    const matchedBackup = await queryRow<{ id: number }>(
      'SELECT id FROM totp_backup_codes WHERE subscriber_id = ? AND code_hash = ? AND is_used = 0 LIMIT 1',
      [subscriber.id, backupHash]
    );

    if (matchedBackup) {
      is2faValid = true;
      // Immediately burn the one-time recovery code
      await execute(
        'UPDATE totp_backup_codes SET is_used = 1, used_at = NOW() WHERE id = ?',
        [matchedBackup.id]
      );
    }
  }

  if (!is2faValid) {
    return NextResponse.json({ error: 'Invalid 2FA code or backup code.' }, { status: 401 });
  }
}
```
* **Syntax & Purpose**:
  - Verifies the OTP, checks if 2FA is active, and validates either the rolling TOTP code or an unused SHA-256 hashed emergency recovery code.
  - Consumes the recovery code immediately upon use (`is_used = 1`).
* **Why it was used**: Protects users against phone loss or authenticator reset while ensuring recovery codes cannot be intercepted and reused.

---

## 4. Topic 1 — Bullet 3: Federated Social Logins (Google Identity Services & Microsoft Entra ID)

### Objective Statement
> *"Integrate third-party social logins using Google Identity Services and Microsoft Entra ID."*

### 4.1. Specific Code Encased
1. **OAuth 2.0 / OIDC Core & PKCE Engine**: [`src/lib/oauth.ts`](file:///home/sankobite/studioNeo/src/lib/oauth.ts#L1-L318)
2. **Provider Redirect & Authorization Route**: [`src/app/api/auth/oauth/[provider]/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/oauth/%5Bprovider%5D/route.ts#L1-L148)
3. **Provider Callback & Account Reconciliation Engine**: [`src/app/api/auth/oauth/[provider]/callback/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/oauth/%5Bprovider%5D/callback/route.ts#L1-L294)
4. **Client Social Action Buttons**: [`src/app/components/AuthSlider.tsx`](file:///home/sankobite/studioNeo/src/app/components/AuthSlider.tsx#L500-L542)

---

### 4.2. Code Snippets, Syntax Analysis & Technical Rationale

#### A. RFC 7636 PKCE (Proof Key for Code Exchange) with S256 ([`src/lib/oauth.ts`](file:///home/sankobite/studioNeo/src/lib/oauth.ts#L130-L154))
```typescript
export function generatePKCE() {
  const codeVerifier = crypto
    .randomBytes(32)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return { codeVerifier, codeChallenge };
}

export function generateState(): string {
  return crypto.randomBytes(24).toString('hex');
}
```
* **Syntax & Purpose**:
  - `generatePKCE()` produces a high-entropy 32-byte `code_verifier` and its base64url SHA-256 digest `code_challenge`.
  - `generateState()` creates a 48-hex-character unguessable CSRF mitigation token.
* **Why it was used**:
  - Adheres strictly to **RFC 7636** and **OAuth 2.1** security standards. PKCE stops authorization code interception attacks (where malicious actors intercept the `code` parameter on redirect).

#### B. Provider Specific Endpoint Mapping ([`src/lib/oauth.ts`](file:///home/sankobite/studioNeo/src/lib/oauth.ts#L100-L125))
```typescript
export function getProviderConfig(provider: OAuthProvider) {
  if (provider === 'google') {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
      scopes: ['openid', 'email', 'profile'],
    };
  }

  if (provider === 'microsoft') {
    const tenant = process.env.MICROSOFT_TENANT_ID || 'common';
    return {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      authUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
      tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
      scopes: ['openid', 'email', 'profile', 'User.Read'],
    };
  }
  throw new Error(`Unsupported OAuth provider: ${provider}`);
}
```
* **Syntax & Purpose**:
  - Configures OpenID Connect (OIDC) endpoints for **Google Identity Services** and **Microsoft Entra ID** (OAuth 2.0 v2.0 endpoint with multi-tenant `common` support and Microsoft Graph API).
* **Why it was used**: Enables self-hosted, vendor-agnostic federated identity without heavy dependencies like NextAuth.js/Auth.js, maintaining total control over session tokens and MySQL records.

#### C. Atomic 3-Way Identity Reconciliation ([`src/app/api/auth/oauth/[provider]/callback/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/oauth/%5Bprovider%5D/callback/route.ts#L68-L268))
```typescript
// 1. Verify CSRF State from Signed Cookie
const oauthSession = await getOAuthSessionCookie();
if (!oauthSession || oauthSession.state !== state || oauthSession.provider !== provider) {
  return NextResponse.redirect(new URL('/login?error=InvalidOAuthStateOrExpired', baseUrl));
}

// 2. Exchange authorization code using PKCE code_verifier
const accessToken = await exchangeCodeForToken(provider, code, oauthSession.codeVerifier, redirectUri);

// 3. Fetch verified user profile (email and provider subject ID)
const profile = await fetchOAuthUserProfile(provider, accessToken);

// 4. Atomic database reconciliation inside transaction
const result = await transaction(async (conn) => {
  // Flow A: Explicit Linking (User logged in on Dashboard)
  // Flow B: Explicit Registration (/register)
  // Flow C: Sign-In (/login) with Auto-Linking for verified existing emails
  ...
  await conn.execute(
    `INSERT INTO subscriber_oauth_accounts (subscriber_id, provider, provider_user_id)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE subscriber_id = VALUES(subscriber_id)`,
    [subId, provider, profile.providerUserId]
  );
  return { subscriberId: subId, sessionEmail: profile.email, issueSession: true };
});
```
* **Syntax & Purpose**:
  - Encapsulates authorization token exchange, profile extraction, and database persistence inside a MySQL atomic transaction.
* **Why it was used**:
  - Prevents race conditions during identity linkage.
  - Safely auto-links social identities if the user's email was already verified, avoiding duplicate accounts while maintaining zero password dependencies.

---

## 5. Topic 2 — Bullet 1: Subscriber Verification Engine (Azure Database for MySQL Flexible Server)

### Objective Statement
> *"Build a subscriber verification engine using an Azure Database for MySQL Flexible Server to check user permissions securely."*

### 5.1. Specific Code Encased
1. **Azure MySQL Flexible Server Connection Pooling**: [`src/lib/db.ts`](file:///home/sankobite/studioNeo/src/lib/db.ts#L1-L195)
2. **Entitlement & Permission Verification Engine**: [`src/app/api/assets/download/[slug]/route.ts`](file:///home/sankobite/studioNeo/src/app/api/assets/download/%5Bslug%5D/route.ts#L18-L92)
3. **Session & Entitlement Status Check API**: [`src/app/api/auth/me/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/me/route.ts#L20-L103)
4. **Time-Limited Cloud SAS Delegation**: [`src/lib/azure-storage.ts`](file:///home/sankobite/studioNeo/src/lib/azure-storage.ts#L98-L153)
5. **Relational Constraints & Foreign Key Rules**: [`scripts/schema.sql`](file:///home/sankobite/studioNeo/scripts/schema.sql#L13-L24,L70-L98)

---

### 5.2. Code Snippets, Syntax Analysis & Technical Rationale

#### A. Azure MySQL Flexible Server TLS & TCP Keepalive Pool ([`src/lib/db.ts`](file:///home/sankobite/studioNeo/src/lib/db.ts#L47-L84))
```typescript
function createConnectionPool(): Pool {
  const poolOptions: PoolOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    ssl: getSSLConfig(), // Enforces SSL/TLS with CA verification
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000, // 10 seconds
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: 'Z',
    dateStrings: true,
  };
  return mysql.createPool(poolOptions);
}
```
* **Syntax & Purpose**:
  - Creates a singleton connection pool using `mysql2/promise`.
  - Configures `enableKeepAlive: true` with a 10-second `keepAliveInitialDelay`.
  - Enforces `charset: 'utf8mb4'` and strict UTC `timezone: 'Z'`.
* **Why it was used**:
  - **Azure Cloud Infrastructure Requirement**: Azure Network Security Groups (NSGs) and Azure Load Balancers silently terminate idle TCP connections after 4 to 5 minutes without sending TCP RST packets. Without `enableKeepAlive`, serverless API routes crash with `ETIMEDOUT` or `ECONNRESET`.
  - **Security**: Azure Database for MySQL Flexible Server rejects plaintext connections by default; `getSSLConfig()` enforces TLS encryption over the wire.

#### B. SQL Entitlement & Permission Verification Engine ([`src/app/api/assets/download/[slug]/route.ts`](file:///home/sankobite/studioNeo/src/app/api/assets/download/%5Bslug%5D/route.ts#L18-L67))
```typescript
// 1. Authenticate the subscriber's session cookie
const session = await getSessionUser();
if (!session || !session.subscriberId) {
  return NextResponse.json(
    { error: 'Unauthorized. You must be authenticated to download this asset.' },
    { status: 401 }
  );
}

const { slug } = await context.params;

// 2. Query perk_unlocks joined with perks to verify subscriber authorization
const perk = await queryRow<PerkDownloadRecord>(
  `SELECT p.id, p.slug, p.title, p.storage_file_path
   FROM perks p
   INNER JOIN perk_unlocks pu ON pu.perk_id = p.id
   WHERE pu.subscriber_id = ? AND p.slug = ?
   LIMIT 1`,
  [session.subscriberId, slug]
);

// 3. Deny access if no permission record exists
if (!perk) {
  return NextResponse.json(
    {
      error: 'Access denied. This digital perk has not been unlocked for your subscriber account.',
      slug,
    },
    { status: 403 }
  );
}

// 4. Generate read-only 15-minute expiring Azure Blob Storage SAS URL
const sasUrl = await generatePerkSasUrl(perk.storage_file_path, {
  expiresInMinutes: 15,
  contentDisposition: `attachment; filename="${filename}"`,
});

return NextResponse.redirect(sasUrl, 302);
```
* **Syntax & Purpose**:
  - Evaluates subscriber session identity and runs a parameterized `INNER JOIN` query between `perks` and `perk_unlocks`.
  - If the database query returns `null`, the request is rejected with **HTTP 403 Forbidden**.
  - If authorized, dynamically mints a short-lived (15 minutes), read-only (`r`) **Azure Blob Storage Shared Access Signature (SAS)** URL.
* **Why it was used**:
  - **Zero Direct Exposure**: Assets in Azure Blob Storage remain private and non-public (`publicAccess: None`).
  - **Permission Enforcement**: Users cannot bypass authorization by guessing asset URLs; every single download request must be verified by the MySQL Flexible Server engine before a temporary SAS token is signed.

#### C. User Permissions and Account State Aggregation ([`src/app/api/auth/me/route.ts`](file:///home/sankobite/studioNeo/src/app/api/auth/me/route.ts#L25-L103))
```typescript
// 1. Check verified subscriber status
const subscriber = await queryRow<{ id: number; email: string; is_verified: number }>(
  'SELECT id, email, is_verified, created_at FROM subscribers WHERE id = ? LIMIT 1',
  [session.subscriberId]
);

// 2. Check active 2FA status
const totp = await queryRow<{ is_active: number }>(
  'SELECT is_active FROM totp_credentials WHERE subscriber_id = ? LIMIT 1',
  [subscriber.id]
);

// 3. Fetch all unlocked perk permissions
const unlockedPerks = await queryRows<{ id: number; slug: string; title: string }>(
  `SELECT p.id, p.slug, p.title, p.description, pu.unlocked_at
   FROM perks p
   INNER JOIN perk_unlocks pu ON pu.perk_id = p.id
   WHERE pu.subscriber_id = ?
   ORDER BY pu.unlocked_at DESC`,
  [subscriber.id]
);

// 4. Check linked external OAuth accounts and WebAuthn passkey count
...
return jsonWithNoCache({
  authenticated: true,
  subscriber: {
    id: subscriber.id,
    email: subscriber.email,
    is_verified: subscriber.is_verified === 1,
    twoFactorActive: totp?.is_active === 1,
    passkeyCount,
    linkedOAuth,
  },
  perks: unlockedPerks,
});
```
* **Syntax & Purpose**:
  - Returns an un-cached (`Cache-Control: no-store`) snapshot of subscriber privileges and entitlements for the dashboard UI.
* **Why it was used**: Provides single-source-of-truth authorization data so the frontend navigation, dynamic island, and asset download buttons reflect real-time database permissions.

---

## 6. Summary Defense Reference Table

For rapid reference during project defense or code review, the table below summarizes the key libraries, standards, and security properties authored for Gwy's section:

| Highlighted Topic | Technologies & RFCs | Core Security Mechanism | Primary Files Involved |
| :--- | :--- | :--- | :--- |
| **Passkey Biometrics & Hardware Keys** | `@simplewebauthn/server`<br>`@simplewebauthn/browser`<br>W3C WebAuthn Level 3 / FIDO2 | Asymmetric ECDSA/Ed25519 cryptography, origin-binding, monotonic counter anti-replay checks | [`src/lib/webauthn.ts`](file:///home/sankobite/studioNeo/src/lib/webauthn.ts)<br>[`src/app/api/auth/passkey/*`](file:///home/sankobite/studioNeo/src/app/api/auth/passkey) |
| **Fallback Email OTP & TOTP MFA** | `@azure/communication-email`<br>Node.js `crypto`<br>RFC 6238 / RFC 4648 | CSPRNG `randomInt`, SHA-256 zero-knowledge token hashing, `timingSafeEqual` constant-time comparison, burned recovery codes | [`src/lib/auth.ts`](file:///home/sankobite/studioNeo/src/lib/auth.ts)<br>[`src/app/api/auth/login`](file:///home/sankobite/studioNeo/src/app/api/auth/login)<br>[`src/app/api/auth/verify-otp`](file:///home/sankobite/studioNeo/src/app/api/auth/verify-otp) |
| **Social Logins (Google & Microsoft)** | OAuth 2.0 / OpenID Connect<br>RFC 7636 (PKCE)<br>Microsoft Graph API | PKCE S256 code challenge/verifier, CSRF cryptographic state token, signed session cookies, transactional auto-linking | [`src/lib/oauth.ts`](file:///home/sankobite/studioNeo/src/lib/oauth.ts)<br>[`src/app/api/auth/oauth/*`](file:///home/sankobite/studioNeo/src/app/api/auth/oauth) |
| **Subscriber Verification Engine** | MySQL 8 (`mysql2/promise`)<br>Azure Database for MySQL Flexible Server<br>Azure Blob Storage SAS | Parameterized SQL queries (preventing SQL injection), TLS over wire, TCP keepalive against Azure NSG timeouts, 15-minute time-bounded read-only SAS URL generation | [`src/lib/db.ts`](file:///home/sankobite/studioNeo/src/lib/db.ts)<br>[`src/app/api/assets/download/[slug]`](file:///home/sankobite/studioNeo/src/app/api/assets/download/%5Bslug%5D)<br>[`src/app/api/auth/me`](file:///home/sankobite/studioNeo/src/app/api/auth/me) |
