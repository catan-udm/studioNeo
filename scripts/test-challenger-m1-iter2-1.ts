/**
 * Challenger 1 Adversarial Verification Harness — Milestone 1 Iteration 2
 * 
 * Deep stress testing of:
 * 1. src/lib/auth.ts (extreme edge cases: NaN, Infinity, negative timestamps, stringified zero, etc.)
 * 2. src/app/api/curator/toggle-role (authentication, authorization, and input validation under adversarial inputs)
 */

import assert from 'node:assert';
import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import {
  normalizeRole,
  createSessionToken,
  verifySessionToken,
  SessionPayload,
  AccountRole,
  AUTH_COOKIE_NAME,
} from '../src/lib/auth';
import { POST, VALID_ROLES } from '../src/app/api/curator/toggle-role/route';
import { queryRow, execute, AccountRecord } from '../src/lib/db';

interface TestReport {
  name: string;
  category: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  error?: string;
}

const reports: TestReport[] = [];

function pass(category: string, name: string, details?: string) {
  reports.push({ category, name, status: 'PASS', details });
  console.log(`  [PASS] [${category}] ${name}${details ? ` -> ${details}` : ''}`);
}

function fail(category: string, name: string, error: string) {
  reports.push({ category, name, status: 'FAIL', error });
  console.error(`  [FAIL] [${category}] ${name} -> ${error}`);
}

function getSecret(): Buffer {
  return crypto
    .createHash('sha256')
    .update(process.env.AUTH_SESSION_SECRET || 'dev_secret_key_sankobite_auth_32_chars_minimum!')
    .digest();
}

function buildCustomToken(header: object, payload: object, customSecret?: Buffer): string {
  const b64H = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64P = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${b64H}.${b64P}`;
  const sig = crypto
    .createHmac('sha256', customSecret || getSecret())
    .update(data)
    .digest('base64url');
  return `${data}.${sig}`;
}

async function runAuthExtremeEdgeCases() {
  console.log('\n========================================================================');
  console.log('PART 1: src/lib/auth.ts EXTREME ADVERSARIAL & EDGE CASE PROBES');
  console.log('========================================================================');

  const cat = 'Auth Expiration & Numeric Boundaries';
  const now = Math.floor(Date.now() / 1000);

  // Group 1.1: Falsy and Zero Expirations
  const zeroExps: Array<{ label: string; val: any }> = [
    { label: 'Numeric 0', val: 0 },
    { label: 'String "0"', val: '0' },
    { label: 'String "-0"', val: '-0' },
    { label: 'String "+0"', val: '+0' },
    { label: 'String "0.0"', val: '0.0' },
    { label: 'Hex string "0x0"', val: '0x0' },
    { label: 'Octal string "00"', val: '00' },
    { label: 'Empty string ""', val: '' },
    { label: 'Whitespace string "   "', val: '   ' },
    { label: 'Tab/Newline string "\\t\\n"', val: '\t\n' },
  ];

  for (const { label, val } of zeroExps) {
    const token = buildCustomToken(
      { alg: 'HS256', typ: 'JWT' },
      { accountId: 101, email: 'exp-zero@studioneo.tech', isVerified: true, role: 'partner', expiresAt: val }
    );
    const result = verifySessionToken(token);
    if (result === null) {
      pass(cat, `Reject zero/falsy expiration: ${label}`);
    } else {
      fail(cat, `Reject zero/falsy expiration: ${label}`, `Expected null, got: ${JSON.stringify(result)}`);
    }
  }

  // Group 1.2: Negative and Sub-Zero Expirations
  const negExps: Array<{ label: string; val: any }> = [
    { label: 'Numeric -1', val: -1 },
    { label: 'Numeric -999999999', val: -999999999 },
    { label: 'String "-1"', val: '-1' },
    { label: 'String "-999999999"', val: '-999999999' },
    { label: 'Number.MIN_SAFE_INTEGER', val: Number.MIN_SAFE_INTEGER },
    { label: 'String Number.MIN_SAFE_INTEGER', val: String(Number.MIN_SAFE_INTEGER) },
  ];

  for (const { label, val } of negExps) {
    const token = buildCustomToken(
      { alg: 'HS256', typ: 'JWT' },
      { accountId: 102, email: 'exp-neg@studioneo.tech', isVerified: true, role: 'partner', expiresAt: val }
    );
    const result = verifySessionToken(token);
    if (result === null) {
      pass(cat, `Reject negative expiration: ${label}`);
    } else {
      fail(cat, `Reject negative expiration: ${label}`, `Expected null, got: ${JSON.stringify(result)}`);
    }
  }

  // Group 1.3: Non-Finite & Special IEEE 754 Floating Values
  const specialExps: Array<{ label: string; val: any }> = [
    { label: 'String "NaN"', val: 'NaN' },
    { label: 'String "Infinity"', val: 'Infinity' },
    { label: 'String "+Infinity"', val: '+Infinity' },
    { label: 'String "-Infinity"', val: '-Infinity' },
    { label: 'String "1e309" (Overflow to Infinity)', val: '1e309' },
    { label: 'String "-1e309" (Overflow to -Infinity)', val: '-1e309' },
  ];

  for (const { label, val } of specialExps) {
    const token = buildCustomToken(
      { alg: 'HS256', typ: 'JWT' },
      { accountId: 103, email: 'exp-special@studioneo.tech', isVerified: true, role: 'partner', expiresAt: val }
    );
    const result = verifySessionToken(token);
    if (result === null) {
      pass(cat, `Reject special/non-finite IEEE value: ${label}`);
    } else {
      fail(cat, `Reject special/non-finite IEEE value: ${label}`, `Expected null, got: ${JSON.stringify(result)}`);
    }
  }

  // Group 1.4: Non-Numeric Types in expiresAt
  const nonNumericExps: Array<{ label: string; val: any }> = [
    { label: 'Boolean true', val: true },
    { label: 'Boolean false', val: false },
    { label: 'Array []', val: [] },
    { label: 'Array [9999999999]', val: [9999999999] },
    { label: 'Object {}', val: {} },
    { label: 'Object { value: 9999999999 }', val: { value: 9999999999 } },
    { label: 'String "forever"', val: 'forever' },
    { label: 'String "never"', val: 'never' },
    { label: 'String "2099-01-01"', val: '2099-01-01' },
    { label: 'String "true"', val: 'true' },
    { label: 'Null', val: null },
    { label: 'Missing / undefined', val: undefined },
  ];

  for (const { label, val } of nonNumericExps) {
    const payload: Record<string, any> = {
      accountId: 104,
      email: 'exp-nonnum@studioneo.tech',
      isVerified: true,
      role: 'partner',
    };
    if (val !== undefined) {
      payload.expiresAt = val;
    }
    const token = buildCustomToken({ alg: 'HS256', typ: 'JWT' }, payload);
    const result = verifySessionToken(token);
    if (result === null) {
      pass(cat, `Reject non-numeric expiresAt: ${label}`);
    } else {
      fail(cat, `Reject non-numeric expiresAt: ${label}`, `Expected null, got: ${JSON.stringify(result)}`);
    }
  }

  // Group 1.5: Strict Temporal Boundary Probing
  const boundaries: Array<{ label: string; exp: number; shouldPass: boolean }> = [
    { label: 'now - 3600 (1 hour in the past)', exp: now - 3600, shouldPass: false },
    { label: 'now - 1 (1 second in the past)', exp: now - 1, shouldPass: false },
    { label: 'now (exact current second)', exp: now, shouldPass: false },
    { label: 'now + 0.5 (sub-second future, rounds to current epoch window)', exp: now + 0.5, shouldPass: true },
    { label: 'now + 1 (1 second in future)', exp: now + 1, shouldPass: true },
    { label: 'now + 3600 (1 hour in future)', exp: now + 3600, shouldPass: true },
    { label: 'Number.MAX_SAFE_INTEGER (far future)', exp: Number.MAX_SAFE_INTEGER, shouldPass: true },
  ];

  for (const { label, exp, shouldPass } of boundaries) {
    const token = buildCustomToken(
      { alg: 'HS256', typ: 'JWT' },
      { accountId: 105, email: 'boundary@studioneo.tech', isVerified: true, role: 'partner', expiresAt: exp }
    );
    const result = verifySessionToken(token);
    if (shouldPass) {
      if (result !== null && result.expiresAt === exp) {
        pass(cat, `Boundary check: ${label}`, `Accepted valid future timestamp`);
      } else {
        fail(cat, `Boundary check: ${label}`, `Expected valid payload, got: ${JSON.stringify(result)}`);
      }
    } else {
      if (result === null) {
        pass(cat, `Boundary check: ${label}`, `Correctly rejected as expired/current`);
      } else {
        fail(cat, `Boundary check: ${label}`, `Expected null, got: ${JSON.stringify(result)}`);
      }
    }
  }

  // Group 1.6: Stringified Valid Future Numbers
  const stringValid = String(now + 7200);
  const tokenStrExp = buildCustomToken(
    { alg: 'HS256', typ: 'JWT' },
    { accountId: 106, email: 'str-exp@studioneo.tech', isVerified: true, role: 'partner', expiresAt: stringValid }
  );
  const resStrExp = verifySessionToken(tokenStrExp);
  if (resStrExp !== null && resStrExp.expiresAt === Number(stringValid)) {
    pass(cat, 'Stringified valid future timestamp coerced to number', `exp=${resStrExp.expiresAt}`);
  } else {
    fail(cat, 'Stringified valid future timestamp coerced to number', `Got: ${JSON.stringify(resStrExp)}`);
  }

  // Group 1.7: Cryptographic & Integrity Adversarial Probes
  const secCat = 'Auth Cryptographic Integrity';
  const validToken = createSessionToken({
    accountId: 200,
    email: 'valid@studioneo.tech',
    isVerified: true,
    role: 'user',
  });

  // 1.7.1 Alg: none attack
  const noneToken = buildCustomToken({ alg: 'none', typ: 'JWT' }, { accountId: 200, email: 'valid@studioneo.tech', expiresAt: now + 3600 });
  const partsNone = noneToken.split('.');
  const noneAttackToken = `${partsNone[0]}.${partsNone[1]}.`;
  assert.strictEqual(verifySessionToken(noneAttackToken), null);
  pass(secCat, 'Reject alg: none signature bypass');

  // 1.7.2 Signature signed with wrong secret
  const wrongSecret = crypto.createHash('sha256').update('wrong_key_that_does_not_match_32_chars').digest();
  const forgedToken = buildCustomToken(
    { alg: 'HS256', typ: 'JWT' },
    { accountId: 200, email: 'hacker@studioneo.tech', role: 'partner', expiresAt: now + 3600 },
    wrongSecret
  );
  assert.strictEqual(verifySessionToken(forgedToken), null);
  pass(secCat, 'Reject token signed with forged secret');

  // 1.7.3 Payload privilege elevation tampering
  const [vH, vP, vSig] = validToken.split('.');
  const tamperedPayload = JSON.parse(Buffer.from(vP, 'base64url').toString('utf8'));
  tamperedPayload.role = 'partner';
  const tamperedB64P = Buffer.from(JSON.stringify(tamperedPayload)).toString('base64url');
  const tamperedToken = `${vH}.${tamperedB64P}.${vSig}`;
  assert.strictEqual(verifySessionToken(tamperedToken), null);
  pass(secCat, 'Reject payload tampering with preserved signature');

  // 1.7.4 Structural corruptions
  const structuralBugs = [
    '',
    'single-string',
    'header.payload', // 2 parts
    'header.payload.sig.extra', // 4 parts
    `${validToken}bad`,
    `bad${validToken}`,
    validToken.slice(0, 15),
    null as unknown as string,
    undefined as unknown as string,
    123456 as unknown as string,
    {} as unknown as string,
  ];
  for (const bad of structuralBugs) {
    assert.strictEqual(verifySessionToken(bad), null);
  }
  pass(secCat, 'Reject structural corruptions (missing parts, malformed lengths, wrong types)');
}

async function runToggleRoleAdversarialProbes() {
  console.log('\n========================================================================');
  console.log('PART 2: /api/curator/toggle-role ADVERSARIAL AUTH & ROLE PROBES');
  console.log('========================================================================');

  const cat = 'API toggle-role Access Control';

  async function invokeToggle(headers: Record<string, string>, body: any) {
    const req = new NextRequest('http://localhost:3000/api/curator/toggle-role', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    const res = await POST(req);
    const json = await res.json().catch(() => ({}));
    return { status: res.status, body: json };
  }

  // 2.1 Unauthenticated requests
  const unauthNoHeader = await invokeToggle({}, { role: 'partner', email: 'anon@studioneo.tech' });
  if (unauthNoHeader.status === 401 && unauthNoHeader.body.error?.includes('Authentication required')) {
    pass(cat, 'Reject unauthenticated request without credentials', '401 Unauthorized');
  } else {
    fail(cat, 'Reject unauthenticated request without credentials', `Got status ${unauthNoHeader.status}`);
  }

  // 2.2 Invalid Bearer formats
  const invalidBearers = [
    'Bearer',
    'Bearer ',
    'Basic dXNlcjpwYXNz',
    'Bearer invalid.jwt.token',
    'Bearer null',
    'Bearer undefined',
  ];
  for (const b of invalidBearers) {
    const res = await invokeToggle({ authorization: b }, { role: 'partner', email: 'anon@studioneo.tech' });
    if (res.status === 401) {
      pass(cat, `Reject invalid authorization header: "${b.slice(0, 15)}"`, '401 Unauthorized');
    } else {
      fail(cat, `Reject invalid authorization header: "${b.slice(0, 15)}"`, `Got status ${res.status}`);
    }
  }

  // 2.3 Expired and Zero-Epoch Bearer tokens
  const expiredBearerToken = buildCustomToken(
    { alg: 'HS256', typ: 'JWT' },
    { accountId: 1, email: 'curator@studioneo.tech', role: 'partner', isVerified: true, expiresAt: Math.floor(Date.now() / 1000) - 10 }
  );
  const expiredRes = await invokeToggle({ authorization: `Bearer ${expiredBearerToken}` }, { role: 'artist', email: 'target@studioneo.tech' });
  if (expiredRes.status === 401) {
    pass(cat, 'Reject expired Bearer token', '401 Unauthorized');
  } else {
    fail(cat, 'Reject expired Bearer token', `Got status ${expiredRes.status}`);
  }

  const zeroExpBearerToken = buildCustomToken(
    { alg: 'HS256', typ: 'JWT' },
    { accountId: 1, email: 'curator@studioneo.tech', role: 'partner', isVerified: true, expiresAt: 0 }
  );
  const zeroExpRes = await invokeToggle({ authorization: `Bearer ${zeroExpBearerToken}` }, { role: 'artist', email: 'target@studioneo.tech' });
  if (zeroExpRes.status === 401) {
    pass(cat, 'Reject zero-epoch Bearer token', '401 Unauthorized');
  } else {
    fail(cat, 'Reject zero-epoch Bearer token', `Got status ${zeroExpRes.status}`);
  }

  // 2.4 Token with accountId: 0
  const zeroIdBearerToken = createSessionToken({
    accountId: 0,
    email: 'curator@studioneo.tech',
    role: 'partner',
    isVerified: true,
  });
  const zeroIdRes = await invokeToggle({ authorization: `Bearer ${zeroIdBearerToken}` }, { role: 'artist', email: 'target@studioneo.tech' });
  if (zeroIdRes.status === 401) {
    pass(cat, 'Reject session token with accountId: 0', '401 Unauthorized');
  } else {
    fail(cat, 'Reject session token with accountId: 0', `Got status ${zeroIdRes.status}`);
  }

  // 2.5 Unauthorized non-curator roles (Forbidden: 403)
  const forbiddenRoles = ['user', 'artist', 'featured'];
  for (const fRole of forbiddenRoles) {
    const token = createSessionToken({
      accountId: 10,
      email: `normal_${fRole}@studioneo.tech`,
      role: fRole,
      isVerified: true,
    });
    const res = await invokeToggle({ authorization: `Bearer ${token}` }, { role: 'partner', email: 'target@studioneo.tech' });
    if (res.status === 403 && res.body.error?.includes('Forbidden')) {
      pass(cat, `Reject non-curator role "${fRole}"`, '403 Forbidden');
    } else {
      fail(cat, `Reject non-curator role "${fRole}"`, `Expected 403, got status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  }

  // 2.6 Authorized curatorial credentials (partner, curator, admin, curator@studioneo.tech, admin@studioneo.tech)
  const curatorBearer = createSessionToken({
    accountId: 4,
    email: 'curator@studioneo.tech',
    role: 'partner',
    isVerified: true,
  });

  const adminEmailBearer = createSessionToken({
    accountId: 99,
    email: 'admin@studioneo.tech',
    role: 'user', // non-partner role but privileged email
    isVerified: true,
  });

  const curatorEmailRes = await invokeToggle(
    { authorization: `Bearer ${adminEmailBearer}` },
    { role: 'artist', accountId: 1 }
  );
  if (curatorEmailRes.status === 200) {
    pass(cat, 'Authorize session via admin@studioneo.tech email override', '200 OK');
  } else {
    fail(cat, 'Authorize session via admin@studioneo.tech email override', `Got status ${curatorEmailRes.status}`);
  }

  // 2.7 Malformed JSON body handling
  const malformedRes = await invokeToggle(
    { authorization: `Bearer ${curatorBearer}` },
    '{ invalid: json, body: true }'
  );
  if (malformedRes.status === 400 && malformedRes.body.error?.includes('Invalid role')) {
    pass(cat, 'Gracefully handle malformed raw JSON body', '400 Bad Request');
  } else {
    fail(cat, 'Gracefully handle malformed raw JSON body', `Got status ${malformedRes.status}`);
  }

  // 2.8 Invalid requested role rejection
  const invalidRoles = [
    'admin',
    'curator',
    'superadmin',
    'root',
    'collector',
    'studio-alpha',
    '',
    '   ',
    'user; DROP TABLE accounts;--',
    '<script>alert(1)</script>',
  ];
  for (const invRole of invalidRoles) {
    const res = await invokeToggle(
      { authorization: `Bearer ${curatorBearer}` },
      { role: invRole, accountId: 1 }
    );
    if (res.status === 400 && res.body.error?.includes('Invalid role')) {
      pass(cat, `Reject invalid role specification: "${invRole.slice(0, 20)}"`, '400 Bad Request');
    } else {
      fail(cat, `Reject invalid role specification: "${invRole.slice(0, 20)}"`, `Expected 400, got status ${res.status}`);
    }
  }

  // 2.9 Valid roles toggle ceremony (user, artist, featured, partner)
  const validOptionARoles: AccountRole[] = ['user', 'artist', 'featured', 'partner'];
  for (const vRole of validOptionARoles) {
    const res = await invokeToggle(
      { authorization: `Bearer ${curatorBearer}` },
      { role: vRole, accountId: 1 }
    );
    if (res.status === 200 && res.body.account?.role === vRole && res.body.subscriber?.role === vRole) {
      pass(cat, `Successfully toggle existing account to role "${vRole}"`, '200 OK');
    } else {
      fail(cat, `Successfully toggle existing account to role "${vRole}"`, `Expected 200, got: ${JSON.stringify(res.body)}`);
    }
  }

  // 2.10 Legacy alias keys ('tier' and 'subscriberId')
  const legacyRes = await invokeToggle(
    { authorization: `Bearer ${curatorBearer}` },
    { tier: 'partner', subscriberId: 1 }
  );
  if (legacyRes.status === 200 && legacyRes.body.account?.role === 'partner') {
    pass(cat, 'Support backward-compatible "tier" and "subscriberId" keys', '200 OK');
  } else {
    fail(cat, 'Support backward-compatible "tier" and "subscriberId" keys', `Got status ${legacyRes.status}`);
  }

  // 2.11 Non-existent numeric target without email -> 404
  const notFoundRes = await invokeToggle(
    { authorization: `Bearer ${curatorBearer}` },
    { role: 'partner', accountId: 99999999 }
  );
  if (notFoundRes.status === 404 && notFoundRes.body.error?.includes('not found')) {
    pass(cat, 'Return 404 for non-existent target accountId', '404 Not Found');
  } else {
    fail(cat, 'Return 404 for non-existent target accountId', `Expected 404, got status ${notFoundRes.status}`);
  }

  // 2.12 Target new email auto-registration with verified status
  const testNewEmail = `auto_curated_${Date.now()}@studioneo.tech`;
  const autoRegRes = await invokeToggle(
    { authorization: `Bearer ${curatorBearer}` },
    { role: 'featured', email: testNewEmail }
  );
  if (autoRegRes.status === 200 && autoRegRes.body.account?.email === testNewEmail && autoRegRes.body.account?.role === 'featured') {
    // Verify in db
    const dbRecord = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE email = ?', [testNewEmail]);
    if (dbRecord && dbRecord.is_verified === 1 && dbRecord.role === 'featured') {
      pass(cat, 'Auto-register new account with verified status and requested role in DB', `id=${dbRecord.id}`);
    } else {
      fail(cat, 'Auto-register new account with verified status in DB', `DB record mismatch: ${JSON.stringify(dbRecord)}`);
    }
  } else {
    fail(cat, 'Auto-register new account via toggle-role', `Got status ${autoRegRes.status}: ${JSON.stringify(autoRegRes.body)}`);
  }

  // 2.13 Self-toggle when neither targetEmail nor targetAccountId provided
  const selfToggleBearer = createSessionToken({
    accountId: 1,
    email: 'user@studioneo.tech',
    role: 'partner', // curator permission
    isVerified: true,
  });
  const selfToggleRes = await invokeToggle(
    { authorization: `Bearer ${selfToggleBearer}` },
    { role: 'featured' }
  );
  if (selfToggleRes.status === 200 && selfToggleRes.body.account?.id === 1 && selfToggleRes.body.account?.role === 'featured') {
    pass(cat, 'Default to session user identity when no explicit target provided', '200 OK');
  } else {
    fail(cat, 'Default to session user identity when no explicit target provided', `Got status ${selfToggleRes.status}`);
  }
}

async function main() {
  console.log('========================================================================');
  console.log('CHALLENGER 1 EMPIRICAL VERIFICATION HARNESS (ITERATION 2)');
  console.log('========================================================================');
  const t0 = performance.now();

  await runAuthExtremeEdgeCases();
  await runToggleRoleAdversarialProbes();

  const duration = (performance.now() - t0).toFixed(2);
  const total = reports.length;
  const passed = reports.filter((r) => r.status === 'PASS').length;
  const failed = reports.filter((r) => r.status === 'FAIL').length;

  console.log('\n========================================================================');
  console.log(`HARNESS RESULTS (${duration}ms)`);
  console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('========================================================================\n');

  if (failed > 0) {
    console.error(`FAILED PROBES (${failed}):`);
    for (const f of reports.filter((r) => r.status === 'FAIL')) {
      console.error(`- [${f.category}] ${f.name}: ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log('ALL EMPIRICAL PROBES PASSED WITH ZERO DEFECTS!');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal test harness failure:', err);
  process.exit(1);
});
