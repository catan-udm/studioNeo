import assert from 'assert';
import crypto from 'crypto';
import {
  normalizeRole,
  createSessionToken,
  verifySessionToken,
  AccountRole,
  SessionPayload,
} from '../src/lib/auth';
import {
  execute,
  queryRow,
  queryRows,
  AccountRecord,
  SubscriberRecord,
  CelRecord,
} from '../src/lib/db';

console.log('========================================================================');
console.log('CHALLENGER 1: EMPIRICAL ADVERSARIAL STRESS HARNESS — MILESTONE 1');
console.log('========================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

interface TestFinding {
  name: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detail: string;
}

const findings: TestFinding[] = [];

async function runProbe(
  name: string,
  category: string,
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
  fn: () => void | Promise<void>
) {
  totalTests++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      await res;
    }
    passedTests++;
    console.log(`  [PASS] ${name}`);
  } catch (err: unknown) {
    failedTests++;
    const message = err instanceof Error ? err.message : String(err);
    findings.push({ name, category, severity, detail: message });
    console.error(`  [DEFECT DETECTED] ${name}: ${message}`);
  }
}

async function runAll() {
  console.log('--- SECTION 1: normalizeRole Edge Cases & Unexpected Inputs ---');

  await runProbe('1.1 Falsy and whitespace inputs fallback to "user"', 'Role Normalization', 'MEDIUM', () => {
    assert.strictEqual(normalizeRole(undefined), 'user');
    assert.strictEqual(normalizeRole(null), 'user');
    assert.strictEqual(normalizeRole(''), 'user');
    assert.strictEqual(normalizeRole('   '), 'user');
    assert.strictEqual(normalizeRole('\t\n\r'), 'user');
  });

  await runProbe('1.2 Standard Option A roles exact match', 'Role Normalization', 'HIGH', () => {
    assert.strictEqual(normalizeRole('user'), 'user');
    assert.strictEqual(normalizeRole('artist'), 'artist');
    assert.strictEqual(normalizeRole('featured'), 'featured');
    assert.strictEqual(normalizeRole('partner'), 'partner');
  });

  await runProbe('1.3 Case insensitivity and whitespace trimming for valid roles', 'Role Normalization', 'HIGH', () => {
    assert.strictEqual(normalizeRole('USER'), 'user');
    assert.strictEqual(normalizeRole('  Artist  '), 'artist');
    assert.strictEqual(normalizeRole('FeAtUrEd'), 'featured');
    assert.strictEqual(normalizeRole('   PARTNER\n'), 'partner');
  });

  await runProbe('1.4 Legacy commercial plan names fall back to "user"', 'Role Normalization', 'HIGH', () => {
    const legacyPlans = [
      'free',
      'collector',
      'studio',
      'studio-alpha',
      'enterprise',
      'studio-atelier',
      'COLLECTOR',
      '  Studio-Alpha  ',
      'ENTERPRISE',
      'Free',
    ];
    for (const plan of legacyPlans) {
      assert.strictEqual(
        normalizeRole(plan),
        'user',
        `Legacy plan ${plan} must fall back to "user"`
      );
    }
  });

  await runProbe('1.5 Legacy artist roles mapping to Option A roles', 'Role Normalization', 'HIGH', () => {
    assert.strictEqual(normalizeRole('artist_resident'), 'featured');
    assert.strictEqual(normalizeRole('ARTIST_RESIDENT'), 'featured');
    assert.strictEqual(normalizeRole('  artist_resident  '), 'featured');
    assert.strictEqual(normalizeRole('illustrator_pro'), 'artist');
    assert.strictEqual(normalizeRole('ILLUSTRATOR_PRO'), 'artist');
    assert.strictEqual(normalizeRole('illustrator'), 'artist');
    assert.strictEqual(normalizeRole('Illustrator'), 'artist');
  });

  await runProbe('1.6 Unknown, arbitrary, or privileged role injections fall back to "user"', 'Role Normalization', 'HIGH', () => {
    const maliciousRoles = [
      'admin',
      'ADMIN',
      'root',
      'superuser',
      'moderator',
      'curator',
      'partner_admin',
      'user; DROP TABLE accounts;--',
      '{"role":"partner"}',
      '<script>alert(1)</script>',
      'partner\0',
      'partner_fake',
    ];
    for (const role of maliciousRoles) {
      assert.strictEqual(normalizeRole(role), 'user', `Role "${role}" fallback mismatch`);
    }
  });

  await runProbe('1.7 Non-string primitive coercions safely default to "user"', 'Role Normalization', 'LOW', () => {
    assert.strictEqual(normalizeRole(123 as unknown as string), 'user');
    assert.strictEqual(normalizeRole(0 as unknown as string), 'user');
    assert.strictEqual(normalizeRole(false as unknown as string), 'user');
    assert.strictEqual(normalizeRole(true as unknown as string), 'user');
    assert.strictEqual(normalizeRole({} as unknown as string), 'user');
    assert.strictEqual(normalizeRole([] as unknown as string), 'user');
  });

  console.log('\n--- SECTION 2: Session Token Creation & Verification Adversarial Tests ---');

  await runProbe('2.1 Token creation with synchronized accountId and subscriberId', 'Auth Sessions', 'HIGH', () => {
    const token = createSessionToken({
      accountId: 101,
      email: 'creator@studioneo.tech',
      isVerified: true,
      role: 'artist',
    });
    const verified = verifySessionToken(token);
    assert.ok(verified !== null);
    assert.strictEqual(verified?.accountId, 101);
    assert.strictEqual(verified?.subscriberId, 101);
    assert.strictEqual(verified?.email, 'creator@studioneo.tech');
    assert.strictEqual(verified?.isVerified, true);
    assert.strictEqual(verified?.role, 'artist');
    assert.strictEqual(verified?.tier, 'artist');
  });

  await runProbe('2.2 Legacy payload without accountId (only subscriberId) synchronizes accountId', 'Auth Sessions', 'HIGH', () => {
    const token = createSessionToken({
      subscriberId: 202,
      email: 'legacy@studioneo.tech',
      isVerified: false,
      tier: 'featured',
    });
    const verified = verifySessionToken(token);
    assert.ok(verified !== null);
    assert.strictEqual(verified?.accountId, 202);
    assert.strictEqual(verified?.subscriberId, 202);
    assert.strictEqual(verified?.role, 'featured');
    assert.strictEqual(verified?.tier, 'featured');
  });

  await runProbe('2.3 Missing role and missing tier defaults safely to "user"', 'Auth Sessions', 'HIGH', () => {
    const token = createSessionToken({
      accountId: 303,
      email: 'default@studioneo.tech',
      isVerified: true,
    });
    const verified = verifySessionToken(token);
    assert.ok(verified !== null);
    assert.strictEqual(verified?.role, 'user');
    assert.strictEqual(verified?.tier, 'user');
  });

  await runProbe('2.4 Legacy commercial plan in session token mapped to "user"', 'Auth Sessions', 'HIGH', () => {
    const token = createSessionToken({
      subscriberId: 404,
      email: 'oldtier@studioneo.tech',
      isVerified: true,
      tier: 'collector',
    });
    const verified = verifySessionToken(token);
    assert.ok(verified !== null);
    assert.strictEqual(verified?.role, 'user');
    assert.strictEqual(verified?.tier, 'user');
  });

  await runProbe('2.5 Case-insensitive role input in session token', 'Auth Sessions', 'HIGH', () => {
    const token = createSessionToken({
      accountId: 505,
      email: 'partner@studioneo.tech',
      isVerified: true,
      role: 'PARTNER',
    });
    const verified = verifySessionToken(token);
    assert.ok(verified !== null);
    assert.strictEqual(verified?.role, 'partner');
  });

  await runProbe('2.6 Missing both accountId and subscriberId defaults to 0', 'Auth Sessions', 'LOW', () => {
    const token = createSessionToken({
      email: 'noid@studioneo.tech',
      isVerified: true,
      role: 'user',
    });
    const verified = verifySessionToken(token);
    assert.ok(verified !== null);
    assert.strictEqual(verified?.accountId, 0);
    assert.strictEqual(verified?.subscriberId, 0);
  });

  await runProbe('2.7 Decoding vintage pre-Option-A JWT token without role and accountId', 'Auth Sessions', 'HIGH', () => {
    const secret = crypto
      .createHash('sha256')
      .update(process.env.AUTH_SESSION_SECRET || 'dev_secret_key_sankobite_auth_32_chars_minimum!')
      .digest();

    const vintageHeader = { alg: 'HS256', typ: 'JWT' };
    const vintagePayload = {
      subscriberId: 888,
      email: 'vintage.collector@bikko.studio',
      isVerified: true,
      tier: 'studio-alpha',
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    };

    const b64Header = Buffer.from(JSON.stringify(vintageHeader)).toString('base64url');
    const b64Payload = Buffer.from(JSON.stringify(vintagePayload)).toString('base64url');
    const dataToSign = `${b64Header}.${b64Payload}`;
    const sig = crypto.createHmac('sha256', secret).update(dataToSign).digest('base64url');
    const vintageToken = `${dataToSign}.${sig}`;

    const verified = verifySessionToken(vintageToken);
    assert.ok(verified !== null, 'Vintage token must verify successfully');
    assert.strictEqual(verified?.accountId, 888, 'Must backfill accountId from subscriberId');
    assert.strictEqual(verified?.subscriberId, 888, 'Must keep subscriberId');
    assert.strictEqual(verified?.role, 'user', 'Obsolete tier "studio-alpha" must be normalized to "user"');
    assert.strictEqual(verified?.tier, 'user', 'Obsolete tier alias must be normalized to "user"');
    assert.strictEqual(verified?.email, 'vintage.collector@bikko.studio');
  });

  await runProbe('2.8 Vintage token with no role and no tier backfills role="user"', 'Auth Sessions', 'HIGH', () => {
    const secret = crypto
      .createHash('sha256')
      .update(process.env.AUTH_SESSION_SECRET || 'dev_secret_key_sankobite_auth_32_chars_minimum!')
      .digest();

    const minimalPayload = {
      subscriberId: 777,
      email: 'minimal@bikko.studio',
      isVerified: true,
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    };

    const b64Header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const b64Payload = Buffer.from(JSON.stringify(minimalPayload)).toString('base64url');
    const dataToSign = `${b64Header}.${b64Payload}`;
    const sig = crypto.createHmac('sha256', secret).update(dataToSign).digest('base64url');
    const token = `${dataToSign}.${sig}`;

    const verified = verifySessionToken(token);
    assert.ok(verified !== null);
    assert.strictEqual(verified?.accountId, 777);
    assert.strictEqual(verified?.role, 'user');
    assert.strictEqual(verified?.tier, 'user');
  });

  await runProbe('2.9 Expired tokens rejected (now - 1 second)', 'Auth Sessions', 'HIGH', () => {
    const secret = crypto
      .createHash('sha256')
      .update(process.env.AUTH_SESSION_SECRET || 'dev_secret_key_sankobite_auth_32_chars_minimum!')
      .digest();

    const expiredPayload = {
      accountId: 1,
      subscriberId: 1,
      email: 'expired@studioneo.tech',
      isVerified: true,
      role: 'user',
      tier: 'user',
      expiresAt: Math.floor(Date.now() / 1000) - 1,
    };

    const b64Header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const b64Payload = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
    const dataToSign = `${b64Header}.${b64Payload}`;
    const sig = crypto.createHmac('sha256', secret).update(dataToSign).digest('base64url');
    const token = `${dataToSign}.${sig}`;

    assert.strictEqual(verifySessionToken(token), null, 'Expired token must return null');
  });

  await runProbe('2.10 PROBE: Session token with expiresAt: 0 must be rejected as expired', 'Auth Sessions', 'HIGH', () => {
    const secret = crypto
      .createHash('sha256')
      .update(process.env.AUTH_SESSION_SECRET || 'dev_secret_key_sankobite_auth_32_chars_minimum!')
      .digest();

    const zeroExpPayload = {
      accountId: 1,
      subscriberId: 1,
      email: 'zero_exp@studioneo.tech',
      isVerified: true,
      role: 'partner',
      tier: 'partner',
      expiresAt: 0,
    };

    const b64Header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const b64Payload = Buffer.from(JSON.stringify(zeroExpPayload)).toString('base64url');
    const dataToSign = `${b64Header}.${b64Payload}`;
    const sig = crypto.createHmac('sha256', secret).update(dataToSign).digest('base64url');
    const token = `${dataToSign}.${sig}`;

    const res = verifySessionToken(token);
    assert.strictEqual(res, null, 'Token with epoch timestamp 0 (expiresAt = 0) must be rejected as expired');
  });

  await runProbe('2.11 PROBE: Session token with missing expiresAt must be rejected', 'Auth Sessions', 'HIGH', () => {
    const secret = crypto
      .createHash('sha256')
      .update(process.env.AUTH_SESSION_SECRET || 'dev_secret_key_sankobite_auth_32_chars_minimum!')
      .digest();

    const noExpPayload = {
      accountId: 1,
      subscriberId: 1,
      email: 'no_exp@studioneo.tech',
      isVerified: true,
      role: 'partner',
      tier: 'partner',
      // expiresAt intentionally omitted
    };

    const b64Header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const b64Payload = Buffer.from(JSON.stringify(noExpPayload)).toString('base64url');
    const dataToSign = `${b64Header}.${b64Payload}`;
    const sig = crypto.createHmac('sha256', secret).update(dataToSign).digest('base64url');
    const token = `${dataToSign}.${sig}`;

    const res = verifySessionToken(token);
    assert.strictEqual(res, null, 'Token without expiresAt must NOT be accepted as immortal');
  });

  await runProbe('2.12 Corrupted, malformed, and adversarial session tokens rejected', 'Auth Sessions', 'HIGH', () => {
    const validToken = createSessionToken({
      accountId: 1,
      email: 'valid@studioneo.tech',
      isVerified: true,
      role: 'user',
    });

    const adversaries = [
      '',
      'abc',
      'a.b',
      'a.b.c.d',
      validToken + 'x',
      validToken.slice(0, 10),
      'null',
      'undefined',
      'eyJhbGciOiJIUzI1NiJ9.invalidbase64!@#$.sig',
    ];

    for (const badToken of adversaries) {
      assert.strictEqual(verifySessionToken(badToken), null, `Adversarial token must return null`);
    }

    assert.strictEqual(verifySessionToken(null as unknown as string), null);
    assert.strictEqual(verifySessionToken(undefined as unknown as string), null);
    assert.strictEqual(verifySessionToken(12345 as unknown as string), null);
  });

  console.log('\n--- SECTION 3: Database Store & Query Evaluator Adversarial Tests ---');

  await runProbe('3.1 PROBE: SELECT from accounts without WHERE clause returns accounts list', 'Database Engine', 'MEDIUM', async () => {
    const accounts = await queryRows<AccountRecord>('SELECT id, email, role, tier FROM accounts');
    assert.ok(accounts.length >= 4, `Must return all seed accounts, got ${accounts.length}`);
  });

  await runProbe('3.2 Dual table SELECT accounts vs subscribers query parity', 'Database Engine', 'HIGH', async () => {
    const fromAccounts = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [1]);
    const fromSubscribers = await queryRow<SubscriberRecord>('SELECT * FROM subscribers WHERE id = ?', [1]);

    assert.ok(fromAccounts !== null);
    assert.ok(fromSubscribers !== null);
    assert.strictEqual(fromAccounts?.id, fromSubscribers?.id);
    assert.strictEqual(fromAccounts?.email, fromSubscribers?.email);
    assert.strictEqual(fromAccounts?.role, fromSubscribers?.role);
    assert.strictEqual(fromAccounts?.tier, fromSubscribers?.tier);
  });

  await runProbe('3.3 Case-insensitive and whitespace email queries', 'Database Engine', 'MEDIUM', async () => {
    const q1 = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE email = ?', ['USER@STUDIONEO.TECH']);
    const q2 = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE email = ?', ['  user@studioneo.tech  ']);
    const q3 = await queryRow<AccountRecord>('SELECT * FROM subscribers WHERE email = ?', ['UsEr@StUdIoNeO.tEcH']);

    assert.ok(q1 !== null);
    assert.ok(q2 !== null);
    assert.ok(q3 !== null);
    assert.strictEqual(q1?.id, 1);
    assert.strictEqual(q2?.id, 1);
    assert.strictEqual(q3?.id, 1);
  });

  await runProbe('3.4 Child tables foreign key alias parity (account_id vs subscriber_id)', 'Database Engine', 'HIGH', async () => {
    await execute('INSERT INTO totp_credentials (account_id, totp_secret, is_active) VALUES (?, ?, 1)', [
      1,
      'JBSWY3DPEHPK3PXP',
    ]);
    const totpByAccount = await queryRow<{ totp_secret: string }>('SELECT totp_secret FROM totp_credentials WHERE account_id = ?', [1]);
    const totpBySubscriber = await queryRow<{ totp_secret: string }>('SELECT totp_secret FROM totp_credentials WHERE subscriber_id = ?', [1]);
    assert.strictEqual(totpByAccount?.totp_secret, 'JBSWY3DPEHPK3PXP');
    assert.strictEqual(totpBySubscriber?.totp_secret, 'JBSWY3DPEHPK3PXP');

    await execute('INSERT INTO totp_backup_codes (account_id, code_hash, is_used) VALUES (?, ?, 0)', [
      1,
      'mock_hash_123',
    ]);
    const codeByAccount = await queryRows('SELECT * FROM totp_backup_codes WHERE account_id = ? AND code_hash = ?', [1, 'mock_hash_123']);
    const codeBySub = await queryRows('SELECT * FROM totp_backup_codes WHERE subscriber_id = ? AND code_hash = ?', [1, 'mock_hash_123']);
    assert.strictEqual(codeByAccount.length, 1);
    assert.strictEqual(codeBySub.length, 1);

    await execute('INSERT INTO webauthn_credentials (account_id, credential_id, public_key, counter) VALUES (?, ?, ?, 0)', [
      1,
      'cred_adv_01',
      'mock_pubkey_bytes',
    ]);
    const webauthnByAccount = await queryRows('SELECT * FROM webauthn_credentials WHERE account_id = ?', [1]);
    const webauthnBySub = await queryRows('SELECT * FROM webauthn_credentials WHERE subscriber_id = ?', [1]);
    assert.ok(webauthnByAccount.length >= 1);
    assert.ok(webauthnBySub.length >= 1);

    await execute('INSERT INTO subscriber_oauth_accounts (account_id, provider, provider_user_id) VALUES (?, ?, ?)', [
      1,
      'google',
      'g_12345',
    ]);
    const oauthByAccount = await queryRows('SELECT * FROM subscriber_oauth_accounts WHERE account_id = ?', [1]);
    const oauthBySub = await queryRows('SELECT * FROM subscriber_oauth_accounts WHERE subscriber_id = ?', [1]);
    assert.strictEqual(oauthByAccount.length, 1);
    assert.strictEqual(oauthBySub.length, 1);

    await execute('INSERT INTO cels (account_id, code, title, artist, artist_handle) VALUES (?, ?, ?, ?, ?)', [
      1,
      'CEL-PARITY-1',
      'Parity Cel',
      'User Artist',
      'user_art',
    ]);
    const celByAccount = await queryRows<CelRecord>('SELECT * FROM cels WHERE account_id = ?', [1]);
    const celBySub = await queryRows<CelRecord>('SELECT * FROM cels WHERE subscriber_id = ?', [1]);
    assert.ok(celByAccount.some((c) => c.code === 'CEL-PARITY-1'));
    assert.ok(celBySub.some((c) => c.code === 'CEL-PARITY-1'));
  });

  await runProbe('3.5 PROBE: INSERT subscribers with literal is_verified=1 creates verified account', 'Database Engine', 'HIGH', async () => {
    // Exact SQL from OAuth callback route (line 178)
    const ins = await execute(
      'INSERT INTO subscribers (email, is_verified) VALUES (?, 1)',
      ['oauth_verified_check@studioneo.tech']
    );
    const acc = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [ins.insertId]);
    assert.ok(acc !== null);
    assert.strictEqual(acc?.is_verified, 1, `Account must have is_verified = 1 per SQL specification, got ${acc?.is_verified}`);
  });

  await runProbe('3.6 INSERT accounts role normalization and default values', 'Database Engine', 'HIGH', async () => {
    const res1 = await execute('INSERT INTO accounts (email, is_verified, role) VALUES (?, ?, ?)', [
      'new_collector@studioneo.tech',
      1,
      'collector',
    ]);
    const acc1 = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [res1.insertId]);
    assert.strictEqual(acc1?.role, 'user', 'Legacy "collector" on insert must normalize to "user"');
    assert.strictEqual(acc1?.tier, 'user');

    const res2 = await execute('INSERT INTO accounts (email, is_verified, role) VALUES (?, ?, ?)', [
      'uppercase_partner@studioneo.tech',
      1,
      'PARTNER',
    ]);
    const acc2 = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [res2.insertId]);
    assert.strictEqual(acc2?.role, 'partner');

    const res3 = await execute('INSERT INTO accounts (email, is_verified, role) VALUES (?, ?, ?)', [
      'fake_admin@studioneo.tech',
      1,
      'admin',
    ]);
    const acc3 = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [res3.insertId]);
    assert.strictEqual(acc3?.role, 'user');

    const res4 = await execute('INSERT INTO accounts (email, is_verified) VALUES (?, ?)', [
      'no_role_param@studioneo.tech',
      1,
    ]);
    const acc4 = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [res4.insertId]);
    assert.strictEqual(acc4?.role, 'user');
  });

  await runProbe('3.7 UPDATE accounts role normalization and upsert behavior', 'Database Engine', 'HIGH', async () => {
    const email = 'upsert_test@studioneo.tech';
    await execute('UPDATE accounts SET role = ? WHERE email = ?', ['featured', email]);
    const acc = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE email = ?', [email]);
    assert.ok(acc !== null, 'Account should be created via upsert');
    assert.strictEqual(acc?.role, 'featured');
    assert.strictEqual(acc?.tier, 'featured');

    await execute('UPDATE accounts SET role = ? WHERE email = ?', ['superadmin', email]);
    const accUpdated = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE email = ?', [email]);
    assert.strictEqual(accUpdated?.role, 'user');

    await execute('UPDATE subscribers SET tier = ? WHERE id = ?', ['partner', acc!.id]);
    const accPartner = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [acc!.id]);
    assert.strictEqual(accPartner?.role, 'partner');
    assert.strictEqual(accPartner?.tier, 'partner');
  });

  await runProbe('3.8 Cascading DELETE removes associated child records', 'Database Engine', 'HIGH', async () => {
    const ins = await execute('INSERT INTO accounts (email, is_verified, role) VALUES (?, ?, ?)', [
      'cascade_delete_test@studioneo.tech',
      1,
      'user',
    ]);
    const testId = ins.insertId;

    await execute('INSERT INTO auth_magic_tokens (account_id, token_hash, expires_at) VALUES (?, ?, ?)', [
      testId,
      'hash_cascade_token',
      new Date().toISOString(),
    ]);
    await execute('INSERT INTO totp_credentials (account_id, totp_secret, is_active) VALUES (?, ?, 1)', [
      testId,
      'SECRET_CASCADE',
    ]);
    await execute('INSERT INTO totp_backup_codes (account_id, code_hash, is_used) VALUES (?, ?, 0)', [
      testId,
      'hash_cascade_code',
    ]);
    await execute('INSERT INTO webauthn_credentials (account_id, credential_id, public_key, counter) VALUES (?, ?, ?, 0)', [
      testId,
      'cred_cascade_01',
      'key_cascade',
    ]);
    await execute('INSERT INTO subscriber_oauth_accounts (account_id, provider, provider_user_id) VALUES (?, ?, ?)', [
      testId,
      'github',
      'gh_cascade',
    ]);

    assert.strictEqual((await queryRows('SELECT * FROM auth_magic_tokens WHERE account_id = ?', [testId])).length, 1);
    assert.ok((await queryRow('SELECT * FROM totp_credentials WHERE account_id = ?', [testId])) !== null);
    assert.strictEqual((await queryRows('SELECT * FROM totp_backup_codes WHERE account_id = ?', [testId])).length, 1);
    assert.strictEqual((await queryRows('SELECT * FROM webauthn_credentials WHERE account_id = ?', [testId])).length, 1);
    assert.strictEqual((await queryRows('SELECT * FROM subscriber_oauth_accounts WHERE account_id = ?', [testId])).length, 1);

    await execute('DELETE FROM accounts WHERE id = ?', [testId]);

    assert.strictEqual((await queryRow('SELECT * FROM accounts WHERE id = ?', [testId])), null);
    assert.strictEqual((await queryRows('SELECT * FROM auth_magic_tokens WHERE account_id = ?', [testId])).length, 0);
    assert.strictEqual((await queryRow('SELECT * FROM totp_credentials WHERE account_id = ?', [testId])), null);
    assert.strictEqual((await queryRows('SELECT * FROM totp_backup_codes WHERE account_id = ?', [testId])).length, 0);
    assert.strictEqual((await queryRows('SELECT * FROM webauthn_credentials WHERE account_id = ?', [testId])).length, 0);
    assert.strictEqual((await queryRows('SELECT * FROM subscriber_oauth_accounts WHERE account_id = ?', [testId])).length, 0);
  });

  console.log('\n--- SECTION 4: High-Volume & Concurrency Stress Testing ---');

  await runProbe('4.1 5,000 Rapid Session Token Create & Verify Cycles (Cryptographic Throughput)', 'Stress Test', 'HIGH', () => {
    const roles: Array<string | undefined> = [
      'user',
      'artist',
      'featured',
      'partner',
      'collector',
      'STUDIO',
      'artist_resident',
      'illustrator_pro',
      'superadmin',
      undefined,
    ];
    const startTime = Date.now();
    const ITERATIONS = 5000;

    for (let i = 0; i < ITERATIONS; i++) {
      const chosenRole = roles[i % roles.length];
      const token = createSessionToken({
        accountId: i + 1000,
        email: `stress_user_${i}@studioneo.tech`,
        isVerified: i % 2 === 0,
        role: chosenRole,
      });

      const payload = verifySessionToken(token);
      assert.ok(payload !== null, `Iteration ${i} verification must not return null`);
      assert.strictEqual(payload?.accountId, i + 1000);
      assert.strictEqual(payload?.subscriberId, i + 1000);
      assert.strictEqual(payload?.isVerified, i % 2 === 0);

      const expectedRole = normalizeRole(chosenRole);
      assert.strictEqual(payload?.role, expectedRole);
      assert.strictEqual(payload?.tier, expectedRole);
    }

    const elapsed = Date.now() - startTime;
    const avgMs = (elapsed / ITERATIONS).toFixed(4);
    console.log(`    -> Completed ${ITERATIONS} cycles in ${elapsed}ms (${avgMs}ms/cycle)`);
    assert.ok(elapsed < 5000, `Throughput SLA breached: ${elapsed}ms > 5000ms`);
  });

  await runProbe('4.2 1,000 Concurrent Database Mutations & Queries (Contention & Stability)', 'Stress Test', 'HIGH', async () => {
    const CONCURRENCY = 1000;
    const startTime = Date.now();

    const tasks = Array.from({ length: CONCURRENCY }, async (_, idx) => {
      const email = `concurrent_tester_${idx}@studioneo.tech`;
      const role: AccountRole = idx % 4 === 0 ? 'partner' : idx % 3 === 0 ? 'featured' : idx % 2 === 0 ? 'artist' : 'user';

      const insRes = await execute('INSERT INTO accounts (email, is_verified, role) VALUES (?, ?, ?)', [
        email,
        1,
        role,
      ]);
      const newId = insRes.insertId;

      const queried = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [newId]);
      assert.ok(queried !== null);
      assert.strictEqual(queried?.email, email);
      assert.strictEqual(queried?.role, role);

      await execute('UPDATE accounts SET role = ? WHERE id = ?', ['featured', newId]);

      await execute('INSERT INTO cels (account_id, code, title, artist, artist_handle) VALUES (?, ?, ?, ?, ?)', [
        newId,
        `CEL-CONCUR-${idx}`,
        `Concurrent Cel ${idx}`,
        'Artist Concurrent',
        `artist_${idx}`,
      ]);

      const cel = await queryRow<CelRecord>('SELECT * FROM cels WHERE code = ?', [`CEL-CONCUR-${idx}`]);
      assert.ok(cel !== null);
      assert.strictEqual(cel?.account_id, newId);

      await execute('DELETE FROM accounts WHERE id = ?', [newId]);
    });

    await Promise.all(tasks);
    const elapsed = Date.now() - startTime;
    console.log(`    -> Completed ${CONCURRENCY} concurrent full-lifecycle transactions in ${elapsed}ms`);
    assert.ok(elapsed < 10000, `Concurrency stress took too long: ${elapsed}ms`);
  });

  await runProbe('4.3 Zero Residual Stripe Footprint Audit in Active Memory Store', 'Stripe Purge', 'CRITICAL', async () => {
    // Check seed accounts via direct query
    for (let id = 1; id <= 4; id++) {
      const acc = await queryRow<Record<string, unknown>>('SELECT * FROM accounts WHERE id = ?', [id]);
      assert.ok(acc !== null);
      assert.strictEqual(acc?.stripe_customer_id, undefined, `Account ${id} must not have stripe_customer_id`);
      assert.strictEqual(acc?.stripe_subscription_id, undefined, `Account ${id} must not have stripe_subscription_id`);
    }
  });

  console.log('\n========================================================================');
  console.log(`STRESS HARNESS RESULTS: ${passedTests} PASSED, ${failedTests} DEFECTS/FINDINGS DETECTED (TOTAL: ${totalTests})`);
  console.log('========================================================================\n');

  if (findings.length > 0) {
    console.log('--- DEFECTS & VULNERABILITIES DETECTED ---');
    findings.forEach((f, idx) => {
      console.log(`[${idx + 1}] [${f.severity}] (${f.category}) ${f.name}`);
      console.log(`    Details: ${f.detail}\n`);
    });
  }
}

runAll().catch((err) => {
  console.error('Fatal Harness Failure:', err);
  process.exit(1);
});
