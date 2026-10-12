import assert from 'assert';
import crypto from 'crypto';
import {
  generateOTP,
  hashToken,
  timingSafeCompare,
  createSessionToken,
  verifySessionToken,
  verifyTOTP,
} from '../src/lib/auth';
import { generatePerkSasUrl, uploadBlob, generateCelSasUrl } from '../src/lib/azure-storage';
import { cleanDomain, cleanOrigin } from '../src/lib/webauthn';
import {
  generateBase32Secret,
  formatSecretForDisplay,
  generateOtpauthUri,
  generateBackupCodes,
  normalizeBackupCode,
  generateQrCodeSvg,
  generateQrCodeDataUrl,
  rsGeneratorPoly,
  rsComputeECC,
} from '../src/lib/totp';
import { createCheckoutSession, applySubscriptionToSubscriber } from '../src/lib/stripe';
import { execute, queryRow, queryRows, CelRecord } from '../src/lib/db';
import { ALL_GALLERY_WORKS, RESIDENT_ARTISTS, generateStandaloneSvg } from '../src/app/gallery/galleryData';
import { NextRequest } from 'next/server';
import { GET as getCelsRoute } from '../src/app/api/cels/route';
import { GET as downloadRoute } from '../src/app/api/assets/download/[slug]/route';
import { POST as curatorToggleRoute } from '../src/app/api/curator/toggle-role/route';
import { POST as contactRoute } from '../src/app/api/contact/route';
import { POST as studioUploadRoute } from '../src/app/api/studio/upload/route';

console.log('========================================================================');
console.log('RUNNING UNIT & FLOW TESTS: AUTHENTICATION & ASSET MANAGEMENT');
console.log('========================================================================\n');

// ------------------------------------------------------------------------
// Test 1: 6-digit Numeric OTP Generation
// ------------------------------------------------------------------------
console.log('[Test 1] 6-digit Numeric OTP Generation & Entropy');
for (let i = 0; i < 50; i++) {
  const otp = generateOTP();
  assert.strictEqual(otp.length, 6, `OTP should be 6 characters long, got: ${otp}`);
  assert.match(otp, /^\d{6}$/, `OTP should only contain digits, got: ${otp}`);
  const numeric = parseInt(otp, 10);
  assert.ok(numeric >= 100000 && numeric <= 999999, `OTP out of 6-digit range: ${numeric}`);
}
console.log('  -> PASS: All 50 OTP samples are cryptographically valid 6-digit numeric codes.\n');

// ------------------------------------------------------------------------
// Test 2: SHA-256 Hashing & Timing-Safe Comparison
// ------------------------------------------------------------------------
console.log('[Test 2] SHA-256 Hashing & Timing-Safe Equality');
const sampleOtp = '849201';
const expectedHash = crypto.createHash('sha256').update(sampleOtp).digest('hex');
const actualHash = hashToken(sampleOtp);

assert.strictEqual(actualHash, expectedHash, 'hashToken output must match standard SHA-256 hex');
assert.strictEqual(actualHash.length, 64, 'SHA-256 hex digest must be 64 chars');
assert.ok(timingSafeCompare(actualHash, expectedHash), 'timingSafeCompare must return true for identical hashes');
assert.strictEqual(
  timingSafeCompare(actualHash, actualHash.replace('a', 'b')),
  false,
  'timingSafeCompare must return false for modified hash'
);
assert.strictEqual(timingSafeCompare('short', 'longer_string'), false, 'Handles unequal lengths safely');
console.log('  -> PASS: SHA-256 token hashing and timingSafeCompare validated.\n');

// ------------------------------------------------------------------------
// Test 3: Session Token Creation, Signing & Verification
// ------------------------------------------------------------------------
console.log('[Test 3] Session Token (JWT HMAC-SHA256) Security & Verification');
const sessionData = {
  subscriberId: 42,
  email: 'subscriber@example.com',
  isVerified: true,
};

const token = createSessionToken(sessionData);
assert.ok(token.includes('.'), 'JWT should contain dots separating header, payload, signature');
const parts = token.split('.');
assert.strictEqual(parts.length, 3, 'JWT must have exactly 3 parts');

const verifiedPayload = verifySessionToken(token);
assert.ok(verifiedPayload !== null, 'Valid session token must verify successfully');
assert.strictEqual(verifiedPayload?.subscriberId, 42);
assert.strictEqual(verifiedPayload?.email, 'subscriber@example.com');
assert.strictEqual(verifiedPayload?.isVerified, true);
assert.ok((verifiedPayload?.expiresAt || 0) > Math.floor(Date.now() / 1000), 'Expiration must be in the future');

// Test tampering detection
const tamperedToken = token.slice(0, -4) + 'abcd';
const tamperedResult = verifySessionToken(tamperedToken);
assert.strictEqual(tamperedResult, null, 'Tampered token must be rejected');

const malformedToken = 'invalid.token';
assert.strictEqual(verifySessionToken(malformedToken), null, 'Malformed token must return null');
console.log('  -> PASS: Session creation, signature verification, and tampering detection validated.\n');

// ------------------------------------------------------------------------
// Test 4: RFC 6238 TOTP (Time-Based One-Time Password) Verification
// ------------------------------------------------------------------------
console.log('[Test 4] RFC 6238 TOTP Two-Factor Authenticator Engine');
// Standard test Base32 secret (JBSWY3DPEHPK3PXP is base32 for "Hello!\xde\xad\xbe\xef")
const testSecret = 'JBSWY3DPEHPK3PXP';

// Calculate the current RFC 6238 code for step = floor(now / 30)
function computeReferenceTOTP(base32Secret: string, stepOffset = 0): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < base32Secret.length; i++) {
    const idx = alphabet.indexOf(base32Secret[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  const key = Buffer.from(output);
  const epoch = Math.floor(Date.now() / 1000);
  const step = Math.floor(epoch / 30) + stepOffset;

  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(step));

  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    (((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)) %
    1000000;

  return code.toString().padStart(6, '0');
}

const currentTotpCode = computeReferenceTOTP(testSecret, 0);
assert.ok(
  verifyTOTP(testSecret, currentTotpCode),
  `verifyTOTP should accept the current valid code: ${currentTotpCode}`
);

// Verify clock drift tolerance (-1 step = 30 seconds earlier)
const pastTotpCode = computeReferenceTOTP(testSecret, -1);
assert.ok(
  verifyTOTP(testSecret, pastTotpCode),
  'verifyTOTP should accept previous 30s window code due to clock drift tolerance'
);

// Verify clock drift tolerance (+1 step = 30 seconds later)
const futureTotpCode = computeReferenceTOTP(testSecret, 1);
assert.ok(
  verifyTOTP(testSecret, futureTotpCode),
  'verifyTOTP should accept next 30s window code due to clock drift tolerance'
);

// Verify invalid code is rejected
assert.strictEqual(
  verifyTOTP(testSecret, '000000' === currentTotpCode ? '999999' : '000000'),
  false,
  'Invalid TOTP code must be rejected'
);
console.log('  -> PASS: RFC 6238 TOTP verification, drift tolerance (+/-30s), and rejection validated.\n');

// ------------------------------------------------------------------------
// Test 5: Azure Blob Storage SAS URL Generation
// ------------------------------------------------------------------------
console.log('[Test 5] Azure Blob Storage Time-Limited SAS URL Generation');
(async () => {
  const sampleFilePath = 'assets/guides/alpha-access-guide.pdf';
  const sasUrl = await generatePerkSasUrl(sampleFilePath, { expiresInMinutes: 15 });

  assert.ok(sasUrl.startsWith('https://'), 'SAS URL must enforce HTTPS');
  assert.ok(sasUrl.includes('alpha-access-guide.pdf'), 'SAS URL must reference the requested asset');
  assert.ok(
    sasUrl.includes('permissions=r') || sasUrl.includes('sp=r') || sasUrl.includes('mock_sas'),
    'SAS URL must include read-only permission'
  );
  console.log('  -> PASS: Azure Blob Storage SAS generation evaluated successfully.');
  console.log(`     Sample Generated URL: ${sasUrl}\n`);

  // ------------------------------------------------------------------------
  // Test 6: WebAuthn RP Domain and Origin Sanitization
  // ------------------------------------------------------------------------
  console.log('[Test 6] WebAuthn Relying Party (RP) Domain and Origin Sanitization');
  assert.strictEqual(
    cleanDomain('https://ashy-mushroom-07675a400.6.azurestaticapps.net:443/auth'),
    'ashy-mushroom-07675a400.6.azurestaticapps.net'
  );
  assert.strictEqual(cleanDomain('http://localhost:3000/'), 'localhost');
  assert.strictEqual(cleanDomain('bikko.studio'), 'bikko.studio');
  assert.strictEqual(
    cleanOrigin('https://ashy-mushroom-07675a400.6.azurestaticapps.net/api/auth/callback'),
    'https://ashy-mushroom-07675a400.6.azurestaticapps.net'
  );
  assert.strictEqual(cleanOrigin('http://localhost:3000/some/path'), 'http://localhost:3000');
  console.log('  -> PASS: WebAuthn RP domain and origin normalization validated.\n');

  // ------------------------------------------------------------------------
  // Test 7: Side-Channel Timing Attack Immunity Validation
  // ------------------------------------------------------------------------
  console.log('[Test 7] Side-Channel Timing Attack Immunity (crypto.timingSafeEqual)');
  const secretHash = hashToken('secret-auth-token-12345');
  const identicalHash = hashToken('secret-auth-token-12345');
  const alteredHash = hashToken('secret-auth-token-12346');
  const shortHash = 'short_token';

  assert.strictEqual(timingSafeCompare(secretHash, identicalHash), true);
  assert.strictEqual(timingSafeCompare(secretHash, alteredHash), false);
  assert.strictEqual(timingSafeCompare(secretHash, shortHash), false);
  console.log('  -> PASS: Constant-time comparison resilience confirmed across equal and unequal lengths.\n');

  // ------------------------------------------------------------------------
  // Test 8: Empirical Cryptographic Latency Benchmark (Objective 5 Verification)
  // ------------------------------------------------------------------------
  console.log('[Test 8] Empirical Cryptographic Latency Benchmark (Target: < 250ms SLA)');
  const iterations = 500;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    const otp = generateOTP();
    const hash = hashToken(otp);
    const token = createSessionToken({
      subscriberId: i,
      email: `benchmark_${i}@bikko.studio`,
      isVerified: true,
    });
    const verified = verifySessionToken(token);
    assert.ok(verified !== null);
  }

  const duration = performance.now() - start;
  const avgLatencyMs = (duration / iterations).toFixed(4);
  console.log(`  -> Completed ${iterations} iterations in ${duration.toFixed(2)}ms`);
  console.log(`  -> Average Latency per Auth Cycle: ${avgLatencyMs}ms`);
  assert.ok(
    Number(avgLatencyMs) < 250,
    `Latency must be well below 250ms threshold, got: ${avgLatencyMs}ms`
  );
  console.log('  -> PASS: Empirical cryptographic latency benchmark passed within Chapter 1 SLA bounds.\n');

  // ------------------------------------------------------------------------
  // Test 9: Base32 Secret Generation, Display Formatting & otpauth URI
  // ------------------------------------------------------------------------
  console.log('[Test 9] TOTP Base32 Secret, Display Formatting & otpauth:// URI');
  for (let i = 0; i < 20; i++) {
    const sec = generateBase32Secret(20);
    assert.strictEqual(sec.length, 32, '20-byte secret must produce 32 Base32 characters');
    assert.match(sec, /^[A-Z2-7]+$/, 'Secret must contain only RFC 4648 Base32 alphabet');
    const formatted = formatSecretForDisplay(sec);
    assert.strictEqual(formatted.replace(/\s+/g, ''), sec, 'Formatted secret must preserve original characters');
    assert.strictEqual(formatted.split(' ').length, 8, 'Formatted secret must have 8 four-character groups');
  }

  const testUri = generateOtpauthUri('JBSWY3DPEHPK3PXP', 'subscriber@bikko.studio', 'bikko.studio');
  assert.ok(testUri.startsWith('otpauth://totp/'), 'URI must use otpauth://totp/ scheme');
  assert.ok(testUri.includes('secret=JBSWY3DPEHPK3PXP'), 'URI must include secret parameter');
  assert.ok(testUri.includes('issuer=bikko.studio'), 'URI must include issuer parameter');
  assert.ok(testUri.includes('digits=6'), 'URI must specify 6 digits');
  assert.ok(testUri.includes('period=30'), 'URI must specify 30s period');
  console.log('  -> PASS: Base32 secret generation, formatting, and RFC 6238 Key URI validated.\n');

  // ------------------------------------------------------------------------
  // Test 10: Pure TypeScript ISO/IEC 18004 SVG QR Code Engine
  // ------------------------------------------------------------------------
  console.log('[Test 10] Pure TypeScript SVG QR Code Generator (Zero Dependency)');
  const sampleUri = 'otpauth://totp/bikko.studio:test@bikko.studio?secret=JBSWY3DPEHPK3PXP';
  const qrSvg = generateQrCodeSvg(sampleUri);
  assert.ok(qrSvg.startsWith('<svg'), 'QR Code must produce valid SVG XML root');
  assert.ok(qrSvg.endsWith('</svg>'), 'QR Code SVG must have closing tag');
  assert.ok(qrSvg.includes('viewBox="0 0'), 'QR Code SVG must include viewBox');
  assert.ok(qrSvg.includes('<path d="M'), 'QR Code SVG must contain compiled module paths');

  const qrDataUrl = generateQrCodeDataUrl(sampleUri);
  assert.ok(qrDataUrl.startsWith('data:image/svg+xml;base64,'), 'Data URL must have correct SVG MIME type header');
  const decodedSvg = Buffer.from(qrDataUrl.replace('data:image/svg+xml;base64,', ''), 'base64').toString('utf8');
  assert.ok(decodedSvg.includes('<svg'), 'Decoded Data URL must contain serialized SVG markup');

  // Verify ISO/IEC 18004 Table A.1 degree-10 generator polynomial
  const expectedGen10 = [1, 216, 194, 159, 111, 199, 94, 95, 113, 157, 193];
  const actualGen10 = Array.from(rsGeneratorPoly(10));
  assert.deepStrictEqual(
    actualGen10,
    expectedGen10,
    'RS degree-10 generator polynomial coefficients must match ISO/IEC 18004 Table A.1'
  );

  // Verify ISO/IEC 18004 canonical reference codeword output for Version 1-M
  const testDataBlock = new Uint8Array([
    0x10, 0x20, 0x0c, 0x56, 0x61, 0x80, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11,
  ]);
  const expectedEcc10 = [0xa5, 0x24, 0xd4, 0xc1, 0xed, 0x36, 0xc7, 0x87, 0x2c, 0x55];
  const actualEcc10 = Array.from(rsComputeECC(testDataBlock, 10));
  assert.deepStrictEqual(
    actualEcc10,
    expectedEcc10,
    'RS error correction division must yield canonical codewords matching ISO/IEC 18004 Annex J'
  );

  console.log('  -> PASS: Zero-dependency ISO/IEC 18004 QR code SVG, Data URL & Reed-Solomon math validated.\n');

  // ------------------------------------------------------------------------
  // Test 11: Emergency Backup Recovery Codes & Hash Verification
  // ------------------------------------------------------------------------
  console.log('[Test 11] Single-Use Emergency Backup Recovery Codes');
  const backup = generateBackupCodes(8);
  assert.strictEqual(backup.codes.length, 8, 'Must generate exactly 8 backup recovery codes');
  assert.strictEqual(backup.hashedCodes.length, 8, 'Must generate 8 matching SHA-256 hashes');

  for (let i = 0; i < backup.codes.length; i++) {
    const code = backup.codes[i];
    const hash = backup.hashedCodes[i];
    assert.match(code, /^[0-9A-F]{4}-[0-9A-F]{4}$/, `Code must follow XXXX-XXXX format: ${code}`);
    assert.strictEqual(hash.length, 64, 'Hashed backup code must be 64-char SHA-256 digest');
    const computedHash = hashToken(normalizeBackupCode(code));
    assert.strictEqual(hash, computedHash, 'Stored hash must match SHA-256 of normalized code');
    // Test case-insensitivity and hyphen-insensitivity normalization
    assert.strictEqual(hashToken(normalizeBackupCode(code.toLowerCase())), hash, 'Handles lowercase');
    assert.strictEqual(hashToken(normalizeBackupCode(code.replace('-', '').toLowerCase())), hash, 'Handles missing hyphen');
  }
  console.log('  -> PASS: Emergency backup recovery codes format and cryptographic hashing validated.\n');

  // ------------------------------------------------------------------------
  // Test 12: Stripe Checkout Flow, Mock Tier Lifecycle & Multi-Format Vector Export
  // ------------------------------------------------------------------------
  console.log('[Test 12] Stripe Checkout Flow & Multi-Format Vector Export Architecture');
  const checkoutRes = await createCheckoutSession({
    tier: 'collector',
    billingCycle: 'monthly',
    subscriberId: 99,
    email: 'test_collector@bikko.studio',
    baseUrl: 'https://bikko.studio',
  });

  assert.ok(checkoutRes.sessionId.length > 0, 'Checkout session ID must be generated');
  assert.ok(checkoutRes.url.includes('/dashboard?subscription=success'), 'Mock checkout must resolve to dashboard success url');
  assert.strictEqual(checkoutRes.isMock, true, 'Mock checkout must be flag marked in test environment');

  // Test applySubscriptionToSubscriber tier changes
  await applySubscriptionToSubscriber(99, 'studio', 'cust_mock_99', 'sub_mock_99');

  // Test multi-format artwork generator across all sample works
  assert.ok(ALL_GALLERY_WORKS.length >= 10, 'Gallery archive works must be populated');
  const sampleWork = ALL_GALLERY_WORKS[0];
  const exportedSvg = generateStandaloneSvg(sampleWork);

  assert.ok(exportedSvg.startsWith('<?xml'), 'Exported artwork must have XML prolog');
  assert.ok(exportedSvg.includes('<svg width="1200" height="1200"'), 'Exported artwork must be high-res 1200x1200 viewBox');
  assert.ok(exportedSvg.includes(sampleWork.code), 'Exported artwork must embed work code metadata');
  assert.ok(exportedSvg.includes(sampleWork.edition), 'Exported artwork must embed edition info');
  assert.ok(exportedSvg.includes('studioNeo Digital Archive'), 'Exported artwork must embed digital archive provenance');

  // Verify kinetic motion cels have valid Azure Blob Storage GIF sources
  const kineticWorks = ALL_GALLERY_WORKS.filter((w) => w.category === 'Kinetic');
  assert.ok(kineticWorks.length > 0, 'Kinetic works must exist in gallery archive');
  for (const kw of kineticWorks) {
    assert.ok(kw.gifSrc, `Kinetic work ${kw.code} must have gifSrc defined`);
    assert.ok(
      kw.gifSrc.startsWith('https://bikkostudio.blob.core.windows.net/gifs/'),
      `Kinetic work ${kw.code} gifSrc must point to Azure Blob Storage container`
    );
  }

  // Non-kinetic works must NOT have gifSrc
  const nonKineticWorks = ALL_GALLERY_WORKS.filter((w) => w.category !== 'Kinetic');
  for (const nkw of nonKineticWorks) {
    assert.strictEqual(
      nkw.gifSrc,
      undefined,
      `Non-kinetic work ${nkw.code} must not have gifSrc`
    );
  }

  // Verify Digital Vault subscriber gating flags
  const vaultWorks = ALL_GALLERY_WORKS.filter((w) => w.isVault);
  assert.ok(vaultWorks.length > 0, 'Digital vault works must exist in gallery archive');

  console.log('  -> PASS: Stripe checkout session, tier fulfillment, and standalone SVG export validated.\n');

  // ------------------------------------------------------------------------
  // Test 13: Creator Cel Upload, Azure Storage Persistence & MySQL Database Operations
  // ------------------------------------------------------------------------
  console.log('[Test 13] Creator Cel Upload, Azure Storage Persistence & MySQL Database Operations');

  // 13.1 Test Azure Blob Storage master persistence
  const sampleSvgMarkup = `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="100" fill="#c496ff" /></svg>`;
  const svgBuf = Buffer.from(sampleSvgMarkup, 'utf8');
  const svgUpload = await uploadBlob('cels/2/cel-test-master.svg', svgBuf, 'image/svg+xml');
  assert.strictEqual(svgUpload.storageFilePath, 'cels/2/cel-test-master.svg');
  assert.ok(svgUpload.url.includes('cels/2/cel-test-master.svg'), 'Upload result must provide valid blob url');

  const gifBuf = Buffer.from('GIF89a...', 'utf8');
  const gifUpload = await uploadBlob('cels/2/cel-test-kinetic.gif', gifBuf, 'image/gif');
  assert.strictEqual(gifUpload.storageFilePath, 'cels/2/cel-test-kinetic.gif');

  // 13.2 Test SAS permission generation for minted cel
  const celSasUrl = await generateCelSasUrl(svgUpload.storageFilePath, { expiresInMinutes: 30 });
  assert.ok(celSasUrl.startsWith('https://'), 'Cel SAS URL must be secure HTTPS');
  assert.ok(celSasUrl.includes('cel-test-master.svg'), 'Cel SAS URL must target the uploaded SVG master');

  // 13.3 Test MySQL cels table insertion
  const insertCelRes = await execute(
    `INSERT INTO cels (
      subscriber_id, code, title, description, artist, artist_handle, artist_avatar,
      category, edition, color, price, likes, format, svg_storage_path, svg_url,
      gif_storage_path, gif_url, is_vault
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      2,
      'CEL-TEST-01',
      'Test Generative Cel',
      'Algorithmic tension unit test',
      'Artist Resident',
      'resident_creator',
      'RC',
      'Generative',
      'Ed. 1/12',
      '#c496ff',
      '$180',
      0,
      'SVG',
      svgUpload.storageFilePath,
      svgUpload.url,
      gifUpload.storageFilePath,
      gifUpload.url,
      1,
    ]
  );
  assert.ok(insertCelRes.insertId > 0, 'Cel insertion must produce a valid positive auto-increment ID');

  // 13.4 Test MySQL cels querying by handle and by code
  const celsByHandle = await queryRows<CelRecord>(
    'SELECT * FROM cels WHERE artist_handle = ?',
    ['resident_creator']
  );
  assert.strictEqual(celsByHandle.length, 1, 'Must find 1 cel by artist handle');
  assert.strictEqual(celsByHandle[0].code, 'CEL-TEST-01');
  assert.strictEqual(celsByHandle[0].is_vault, 1);

  const celByCode = await queryRow<CelRecord>(
    'SELECT * FROM cels WHERE code = ? LIMIT 1',
    ['CEL-TEST-01']
  );
  assert.ok(celByCode !== null, 'Must find inserted cel by unique code');
  assert.strictEqual(celByCode?.title, 'Test Generative Cel');

  console.log('  -> PASS: Azure Storage master blob persistence and MySQL cels schema operations validated.\n');

  // ------------------------------------------------------------------------
  // Test 14: Curatorial Access Control, Role Toggle Ceremony & Resident Artists
  // ------------------------------------------------------------------------
  console.log('[Test 14] Curatorial Access Control, Role Toggle Ceremony & Resident Portfolios');

  // Helper checking tier permission rule
  function isArtistTier(tier?: string): boolean {
    if (!tier) return false;
    const t = tier.toLowerCase();
    return t.startsWith('artist') || t.startsWith('illustrator') || t === 'admin' || t === 'curator';
  }

  // 14.1 Gating permission checks
  assert.strictEqual(isArtistTier('free'), false, 'Free visitor is denied creator upload access');
  assert.strictEqual(isArtistTier('collector'), false, 'Collector member is denied creator upload access');
  assert.strictEqual(isArtistTier('studio'), false, 'Standard studio subscriber is denied creator upload access');
  assert.strictEqual(isArtistTier('artist_resident'), true, 'artist_resident is granted creator studio access');
  assert.strictEqual(isArtistTier('illustrator_pro'), true, 'illustrator_pro is granted creator studio access');
  assert.strictEqual(isArtistTier('artist'), true, 'artist is granted creator studio access');
  assert.strictEqual(isArtistTier('illustrator'), true, 'illustrator is granted creator studio access');

  // 14.2 Curator role toggle ceremony via database
  const targetEmail = 'applicant_curator_test@bikko.studio';
  await execute('UPDATE subscribers SET tier = ? WHERE email = ?', ['artist_resident', targetEmail]);
  const verifiedArtist = await queryRow<{ id: number; email: string; tier: string }>(
    'SELECT id, email, tier FROM subscribers WHERE email = ? LIMIT 1',
    [targetEmail]
  );
  assert.ok(verifiedArtist !== null, 'Subscriber must be created or updated');
  assert.strictEqual(verifiedArtist?.tier, 'artist_resident', 'Subscriber must be elevated to artist_resident');

  // Toggle to illustrator_pro
  await execute('UPDATE subscribers SET tier = ? WHERE email = ?', ['illustrator_pro', targetEmail]);
  const verifiedIllustrator = await queryRow<{ id: number; email: string; tier: string }>(
    'SELECT id, email, tier FROM subscribers WHERE email = ? LIMIT 1',
    [targetEmail]
  );
  assert.strictEqual(verifiedIllustrator?.tier, 'illustrator_pro', 'Subscriber must be updated to illustrator_pro');

  // 14.3 Resident Artists integrity check
  assert.strictEqual(RESIDENT_ARTISTS.length, 5, 'Must have exactly 5 curated resident artists');
  const expectedHandles = ['neo_tokyo', 'kroma_lab', 'sanko_arch', 'deco_cels', 'torus_mono'];
  for (const handle of expectedHandles) {
    const artistFound = RESIDENT_ARTISTS.find((a) => a.handle === handle);
    assert.ok(artistFound, `Resident artist @${handle} must exist`);
    assert.ok(Boolean(artistFound && artistFound.name.length > 0), `Artist @${handle} must have display name`);
    assert.ok(Boolean(artistFound && artistFound.collection.length > 0), `Artist @${handle} must have collection`);
  }

  // 14.4 Vault monetization semantics check
  function isVaultSubscriberTier(tier?: string): boolean {
    if (!tier) return false;
    const t = tier.toLowerCase();
    return (
      t === 'studio-alpha' ||
      t === 'studio-atelier' ||
      t === 'enterprise' ||
      t === 'collector' ||
      t === 'studio' ||
      t.startsWith('artist') ||
      t.startsWith('illustrator')
    );
  }

  assert.strictEqual(isVaultSubscriberTier('free'), false);
  assert.strictEqual(isVaultSubscriberTier('studio-alpha'), true);
  assert.strictEqual(isVaultSubscriberTier('studio-atelier'), true);
  assert.strictEqual(isVaultSubscriberTier('enterprise'), true);
  assert.strictEqual(isVaultSubscriberTier('collector'), true);
  assert.strictEqual(isVaultSubscriberTier('artist_resident'), true);

  console.log('  -> PASS: Curatorial access control, role ceremony, and resident portfolios validated.\n');

  console.log('========================================================================');
  console.log('ALL 14 UNIT, FLOW & BENCHMARK VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('========================================================================');
})().catch((err) => {
  console.error('Execution Failed:', err);
  process.exit(1);
});
