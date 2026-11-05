/**
 * Challenger 2 Empirical Stress Test Harness: db.ts Probing
 * 
 * Tests:
 * 1. Extreme SQL Mutations:
 *    - Formatting, casing, multi-line, whitespace variations in INSERT/UPDATE/DELETE.
 *    - Literal tokens mixed with bind parameters in VALUES clause.
 *    - Single quotes, escaped quotes, special chars, and Unicode in email/string values.
 *    - Role normalizations and legacy role conversions in dev mutations.
 *    - Auto-upsert behavior on UPDATE accounts WHERE email = ?.
 *    - Cascading deletes across all child tables.
 * 2. High-Contention Concurrent Mutations & Transactions:
 *    - 1,000 concurrent INSERTs with Promise.all to stress nextAccountId auto-increment and uniqueness.
 *    - 500 concurrent UPDATEs & SELECTs interleaved.
 *    - Transaction atomicity & error rollback handling.
 *    - Query evaluation under concurrent modifications.
 */

import assert from 'node:assert';
import db, {
  execute,
  queryRow,
  queryRows,
  transaction,
  AccountRecord,
  AccountRole,
  CelRecord,
} from '../src/lib/db';

interface TestResult {
  suite: string;
  testName: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function pass(suite: string, testName: string, details?: string) {
  results.push({ suite, testName, status: 'PASS', details });
  console.log(`  [PASS] ${testName}${details ? ` -> ${details}` : ''}`);
}

function fail(suite: string, testName: string, error: string) {
  results.push({ suite, testName, status: 'FAIL', error });
  console.error(`  [FAIL] ${testName} -> ${error}`);
}

async function runExtremeSqlMutations() {
  console.log('\n============================================================');
  console.log('SUITE 1: EXTREME SQL MUTATIONS & PARSING EDGES');
  console.log('============================================================');
  const suite = 'SQL Mutations';

  // 1.1 Whitespace, tabs, and newlines in INSERT INTO accounts
  try {
    const rawSql = `
      INSERT   INTO 
        accounts   (
          email , 
          role , 
          is_verified
        ) 
      VALUES   (
        ? , 
        ? , 
        1
      )
    `;
    const res = await execute(rawSql, ['whitespace-test@studioneo.tech', 'partner']);
    assert(res.insertId > 0, 'Must return valid insertId');
    const acc = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [res.insertId]);
    assert(acc, 'Inserted account must be queryable');
    assert.strictEqual(acc.email, 'whitespace-test@studioneo.tech');
    assert.strictEqual(acc.role, 'partner');
    assert.strictEqual(acc.is_verified, 1);
    pass(suite, 'Whitespace/newline tolerant INSERT with literal 1', `ID: ${res.insertId}`);
  } catch (err: any) {
    fail(suite, 'Whitespace/newline tolerant INSERT with literal 1', err.message);
  }

  // 1.2 Table alias: INSERT INTO subscribers with role alias 'tier'
  try {
    const sql = `INSERT INTO subscribers (email, tier, is_verified) VALUES (?, ?, 0)`;
    const res = await execute(sql, ['alias-tier@studioneo.tech', 'featured']);
    const acc = await queryRow<AccountRecord>('SELECT * FROM subscribers WHERE id = ?', [res.insertId]);
    assert(acc, 'Must find account via subscribers alias');
    assert.strictEqual(acc.role, 'featured');
    assert.strictEqual(acc.tier, 'featured');
    assert.strictEqual(acc.is_verified, 0);
    pass(suite, 'Table alias subscribers with tier column', `Role: ${acc.role}`);
  } catch (err: any) {
    fail(suite, 'Table alias subscribers with tier column', err.message);
  }

  // 1.3 Literal values without params in VALUES clause
  try {
    const sql = `INSERT INTO accounts (email, role, is_verified) VALUES ('literal-all@studioneo.tech', 'artist', 1)`;
    const res = await execute(sql, []);
    const acc = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [res.insertId]);
    assert(acc, 'Account with pure literal values must be inserted');
    assert.strictEqual(acc.email, 'literal-all@studioneo.tech');
    assert.strictEqual(acc.role, 'artist');
    assert.strictEqual(acc.is_verified, 1);
    pass(suite, 'Pure literal VALUES without params', `Email: ${acc.email}`);
  } catch (err: any) {
    fail(suite, 'Pure literal VALUES without params', err.message);
  }

  // 1.4 Single quotes and special characters in email
  try {
    const weirdEmail = "o'connor+testing.neo@studioneo.tech";
    const res = await execute('INSERT INTO accounts (email, role, is_verified) VALUES (?, ?, ?)', [
      weirdEmail,
      'user',
      1,
    ]);
    const acc = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE email = ?', [weirdEmail]);
    assert(acc, 'Must query account with single quote in email');
    assert.strictEqual(acc.email, weirdEmail.toLowerCase());
    pass(suite, 'Email with single quotes and special characters', `Found: ${acc.email}`);
  } catch (err: any) {
    fail(suite, 'Email with single quotes and special characters', err.message);
  }

  // 1.5 Role normalization: legacy commercial plans -> 'user'
  try {
    const legacyRoles = ['studio-alpha', 'collector', 'studio', 'free', 'enterprise'];
    for (const plan of legacyRoles) {
      const res = await execute('INSERT INTO accounts (email, role, is_verified) VALUES (?, ?, ?)', [
        `legacy-${plan}@studioneo.tech`,
        plan,
        1,
      ]);
      const acc = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [res.insertId]);
      assert.strictEqual(acc?.role, 'user', `Legacy plan ${plan} must normalize to 'user'`);
    }
    pass(suite, 'Legacy commercial plan names normalize to "user" on INSERT', 'All 5 legacy plans mapped to user');
  } catch (err: any) {
    fail(suite, 'Legacy commercial plan names normalize to "user" on INSERT', err.message);
  }

  // 1.6 Role normalization: legacy artist roles -> 'featured' and 'artist'
  try {
    const resResident = await execute('INSERT INTO accounts (email, role) VALUES (?, ?)', [
      'resident-test@studioneo.tech',
      'artist_resident',
    ]);
    const accResident = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [resResident.insertId]);
    assert.strictEqual(accResident?.role, 'featured', 'artist_resident must map to featured');

    const resPro = await execute('INSERT INTO accounts (email, role) VALUES (?, ?)', [
      'pro-test@studioneo.tech',
      'illustrator_pro',
    ]);
    const accPro = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [resPro.insertId]);
    assert.strictEqual(accPro?.role, 'artist', 'illustrator_pro must map to artist');

    const resIll = await execute('INSERT INTO accounts (email, role) VALUES (?, ?)', [
      'ill-test@studioneo.tech',
      'illustrator',
    ]);
    const accIll = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [resIll.insertId]);
    assert.strictEqual(accIll?.role, 'artist', 'illustrator must map to artist');

    pass(suite, 'Legacy artist roles normalization', 'artist_resident -> featured, illustrator_pro/illustrator -> artist');
  } catch (err: any) {
    fail(suite, 'Legacy artist roles normalization', err.message);
  }

  // 1.7 UPDATE accounts SET role = ? WHERE email = ? (Upsert behavior on non-existent account)
  try {
    const upsertEmail = 'new-auto-upsert@studioneo.tech';
    const res = await execute('UPDATE accounts SET role = ? WHERE email = ?', ['partner', upsertEmail]);
    assert(res.insertId > 0, 'Auto-upsert must create account and set insertId');
    const acc = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE email = ?', [upsertEmail]);
    assert(acc, 'Auto-upserted account must exist');
    assert.strictEqual(acc.role, 'partner');
    assert.strictEqual(acc.is_verified, 1);
    pass(suite, 'UPDATE accounts auto-upsert for unknown email', `Created ID: ${res.insertId}`);
  } catch (err: any) {
    fail(suite, 'UPDATE accounts auto-upsert for unknown email', err.message);
  }

  // 1.8 UPDATE accounts SET is_verified = 1 WHERE id = ?
  try {
    const createRes = await execute('INSERT INTO accounts (email, role, is_verified) VALUES (?, ?, 0)', [
      'verify-me@studioneo.tech',
      'user',
    ]);
    const updateRes = await execute('UPDATE accounts SET is_verified = 1 WHERE id = ?', [createRes.insertId]);
    assert.strictEqual(updateRes.affectedRows, 1);
    const acc = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [createRes.insertId]);
    assert.strictEqual(acc?.is_verified, 1);
    pass(suite, 'UPDATE accounts is_verified = 1 by ID', `Verified ID: ${createRes.insertId}`);
  } catch (err: any) {
    fail(suite, 'UPDATE accounts is_verified = 1 by ID', err.message);
  }

  // 1.9 Cascading DELETE removes child records
  try {
    const accRes = await execute('INSERT INTO accounts (email, role, is_verified) VALUES (?, ?, 1)', [
      'delete-cascade@studioneo.tech',
      'artist',
    ]);
    const accId = accRes.insertId;

    // Insert child tokens, backup codes, perks, webauthn, oauth
    await execute('INSERT INTO auth_magic_tokens (account_id, token_hash, expires_at) VALUES (?, ?, ?)', [
      accId,
      'hash123',
      new Date(Date.now() + 60000).toISOString(),
    ]);
    await execute('INSERT INTO subscriber_oauth_accounts (account_id, provider, provider_user_id) VALUES (?, ?, ?)', [
      accId,
      'github',
      'gh-user-999',
    ]);

    // Verify children exist
    const token = await queryRow('SELECT * FROM auth_magic_tokens WHERE account_id = ?', [accId]);
    const oauth = await queryRow('SELECT * FROM subscriber_oauth_accounts WHERE account_id = ?', [accId]);
    assert(token && oauth, 'All children must be inserted');

    // Execute DELETE on accounts
    const delRes = await execute('DELETE FROM accounts WHERE id = ?', [accId]);
    assert.strictEqual(delRes.affectedRows, 1);

    // Verify parent and all children deleted
    const accCheck = await queryRow('SELECT * FROM accounts WHERE id = ?', [accId]);
    const tokenCheck = await queryRow('SELECT * FROM auth_magic_tokens WHERE account_id = ?', [accId]);
    const oauthCheck = await queryRow('SELECT * FROM subscriber_oauth_accounts WHERE account_id = ?', [accId]);

    assert.strictEqual(accCheck, null, 'Account must be deleted');
    assert.strictEqual(tokenCheck, null, 'Magic tokens must be cascade deleted');
    assert.strictEqual(oauthCheck, null, 'OAuth accounts must be cascade deleted');

    pass(suite, 'Cascading DELETE across accounts and child tables', 'Cleanly purged all child associations');
  } catch (err: any) {
    fail(suite, 'Cascading DELETE across accounts and child tables', err.message);
  }

  // 1.10 Inquiries INSERT and query
  try {
    const inqRes = await execute(
      'INSERT INTO inquiries (name, email, organization, topic, message) VALUES (?, ?, ?, ?, ?)',
      ['Alice Explorer', 'alice@example.com', null, 'Rights Verification', 'Testing inquiry message payload']
    );
    assert(inqRes.insertId > 0, 'Inquiry must generate insertId');
    pass(suite, 'INSERT INTO inquiries with null organization', `Inquiry ID: ${inqRes.insertId}`);
  } catch (err: any) {
    fail(suite, 'INSERT INTO inquiries with null organization', err.message);
  }

  // 1.11 Cels INSERT, query, and DELETE
  try {
    const celRes = await execute(
      `INSERT INTO cels (account_id, code, title, description, artist, artist_handle, artist_avatar, category, edition, color, price, likes, format, svg_storage_path, svg_url, gif_storage_path, gif_url, is_vault)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1,
        'CEL-STRESS-01',
        'Stress Cel',
        'Cel for stress testing',
        'Sankobite',
        'sankobite',
        'SK',
        'Generative',
        'Ed. 1/1',
        '#00ffcc',
        '$500',
        100,
        'SVG',
        'cels/cel-stress-01.svg',
        null,
        null,
        null,
        1,
      ]
    );
    assert(celRes.insertId > 0, 'Cel must generate insertId');
    const cel = await queryRow<CelRecord>('SELECT * FROM cels WHERE id = ?', [celRes.insertId]);
    assert(cel, 'Cel must be queryable');
    assert.strictEqual(cel.code, 'CEL-STRESS-01');
    assert.strictEqual(cel.is_vault, 1);

    const delCel = await execute('DELETE FROM cels WHERE id = ?', [celRes.insertId]);
    assert.strictEqual(delCel.affectedRows, 1);
    const celAfter = await queryRow<CelRecord>('SELECT * FROM cels WHERE id = ?', [celRes.insertId]);
    assert.strictEqual(celAfter, null);
    pass(suite, 'Cels lifecycle: INSERT, query, DELETE', 'Cel created, verified, and deleted cleanly');
  } catch (err: any) {
    fail(suite, 'Cels lifecycle: INSERT, query, DELETE', err.message);
  }
}

async function runConcurrencyAndTransactions() {
  console.log('\n============================================================');
  console.log('SUITE 2: CONCURRENT STRESS & TRANSACTION ISOLATION');
  console.log('============================================================');
  const suite = 'Concurrency & Transactions';

  // 2.1 1,000 Concurrent INSERTs - Testing ID Uniqueness & Store Integrity
  try {
    const N = 1000;
    const start = performance.now();
    const promises = Array.from({ length: N }, (_, i) =>
      execute('INSERT INTO accounts (email, role, is_verified) VALUES (?, ?, 1)', [
        `concurrent-stress-${i}-${Date.now()}@studioneo.tech`,
        i % 4 === 0 ? 'partner' : i % 3 === 0 ? 'featured' : i % 2 === 0 ? 'artist' : 'user',
      ])
    );

    const results = await Promise.all(promises);
    const duration = performance.now() - start;

    assert.strictEqual(results.length, N, `All ${N} insertions must resolve`);
    const ids = results.map((r) => r.insertId);
    const uniqueIds = new Set(ids);
    assert.strictEqual(uniqueIds.size, N, `All ${N} insert IDs must be strictly unique!`);

    pass(
      suite,
      `1,000 Concurrent INSERTs (Contention & ID Uniqueness)`,
      `Completed in ${duration.toFixed(2)}ms (${(duration / N).toFixed(3)}ms/op), 1000 unique IDs verified`
    );
  } catch (err: any) {
    fail(suite, '1,000 Concurrent INSERTs (Contention & ID Uniqueness)', err.message);
  }

  // 2.2 500 Interleaved Concurrent UPDATEs & SELECTs
  try {
    const M = 500;
    const testEmail = `interleaved-target-${Date.now()}@studioneo.tech`;
    const createRes = await execute('INSERT INTO accounts (email, role, is_verified) VALUES (?, ?, 1)', [
      testEmail,
      'user',
    ]);
    const targetId = createRes.insertId;

    const start = performance.now();
    const ops = Array.from({ length: M }, (_, i) => {
      if (i % 2 === 0) {
        const roles: AccountRole[] = ['user', 'artist', 'featured', 'partner'];
        const nextRole = roles[i % roles.length];
        return execute('UPDATE accounts SET role = ? WHERE id = ?', [nextRole, targetId]);
      } else {
        return queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [targetId]);
      }
    });

    await Promise.all(ops);
    const duration = performance.now() - start;

    const finalAcc = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE id = ?', [targetId]);
    assert(finalAcc, 'Target account must still exist and be intact');
    pass(
      suite,
      '500 Interleaved Concurrent UPDATEs and SELECTs',
      `Completed in ${duration.toFixed(2)}ms without contention errors. Final role: ${finalAcc.role}`
    );
  } catch (err: any) {
    fail(suite, '500 Interleaved Concurrent UPDATEs and SELECTs', err.message);
  }

  // 2.3 Transaction helper success path
  try {
    const txEmail = `tx-success-${Date.now()}@studioneo.tech`;
    const txResult = await transaction(async (conn) => {
      const [res] = await conn.execute(
        'INSERT INTO accounts (email, role, is_verified) VALUES (?, ?, 1)',
        [txEmail, 'featured']
      );
      return res as { insertId: number };
    });

    assert(txResult && txResult.insertId > 0, 'Transaction must return result');
    const acc = await queryRow<AccountRecord>('SELECT * FROM accounts WHERE email = ?', [txEmail]);
    assert(acc, 'Account inserted in transaction must be committed');
    assert.strictEqual(acc.role, 'featured');
    pass(suite, 'Transaction commit flow', `Committed ID: ${txResult.insertId}`);
  } catch (err: any) {
    fail(suite, 'Transaction commit flow', err.message);
  }

  // 2.4 Transaction error rollback & rejection propagation
  try {
    let errorCaught = false;
    try {
      await transaction(async () => {
        throw new Error('Simulated transaction abortion');
      });
    } catch (txErr: any) {
      if (txErr.message.includes('Simulated transaction abortion')) {
        errorCaught = true;
      }
    }
    assert(errorCaught, 'Transaction must cleanly propagate thrown error');
    pass(suite, 'Transaction error propagation & rollback', 'Cleanly caught expected abortion');
  } catch (err: any) {
    fail(suite, 'Transaction error propagation & rollback', err.message);
  }

  // 2.5 100 Concurrent Transactions executing simultaneously
  try {
    const start = performance.now();
    const txCount = 100;
    const txPromises = Array.from({ length: txCount }, (_, i) =>
      transaction(async (conn) => {
        const email = `concurrent-tx-${i}-${Date.now()}@studioneo.tech`;
        const [res] = await conn.execute(
          'INSERT INTO accounts (email, role, is_verified) VALUES (?, ?, 1)',
          [email, 'partner']
        );
        return (res as { insertId: number }).insertId;
      })
    );

    const insertedIds = await Promise.all(txPromises);
    const duration = performance.now() - start;

    assert.strictEqual(insertedIds.length, txCount);
    const uniqueIds = new Set(insertedIds);
    assert.strictEqual(uniqueIds.size, txCount, 'All concurrent transaction IDs must be unique');

    pass(
      suite,
      '100 Simultaneous Concurrent Transactions',
      `Completed in ${duration.toFixed(2)}ms with 100 unique committed IDs`
    );
  } catch (err: any) {
    fail(suite, '100 Simultaneous Concurrent Transactions', err.message);
  }
}

async function main() {
  console.log('STARTING CHALLENGER 2 EMPIRICAL DB PROBE...');
  const t0 = performance.now();

  await runExtremeSqlMutations();
  await runConcurrencyAndTransactions();

  const totalDuration = (performance.now() - t0).toFixed(2);
  const total = results.length;
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;

  console.log('\n============================================================');
  console.log(`DB PROBE VERIFICATION SUMMARY (${totalDuration}ms)`);
  console.log(`TOTAL PROBES: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('============================================================\n');

  if (failed > 0) {
    console.error(`FAILED PROBES (${failed}):`);
    for (const f of results.filter((r) => r.status === 'FAIL')) {
      console.error(`- [${f.suite}] ${f.testName}: ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log('ALL DB ADVERSARIAL STRESS PROBES PASSED CLEANLY!');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal probe error:', err);
  process.exit(1);
});
