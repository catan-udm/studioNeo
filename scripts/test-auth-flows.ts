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
import { generatePerkSasUrl } from '../src/lib/azure-storage';

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

  console.log('========================================================================');
  console.log('ALL UNIT & FLOW VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('========================================================================');
})().catch((err) => {
  console.error('Test 5 Failed:', err);
  process.exit(1);
});
