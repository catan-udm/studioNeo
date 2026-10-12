#!/usr/bin/env node
/**
 * ========================================================================
 * CLI Diagnostic Tool: bikko.studio (studioNeo)
 * ========================================================================
 * Verifies local environment variables, DNS resolution, TCP ports,
 * Azure Database for MySQL Flexible Server handshake, and table schemas.
 *
 * Usage:
 *   npm run diagnose
 *   node scripts/diagnose.js
 * ========================================================================
 */

const fs = require('fs');
const path = require('path');
const net = require('net');
const dns = require('dns');

// ANSI Color Helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function pass(msg) {
  console.log(`  ${colors.green}✓ PASS:${colors.reset} ${msg}`);
}
function warn(msg) {
  console.log(`  ${colors.yellow}⚠ WARN:${colors.reset} ${msg}`);
}
function fail(msg) {
  console.log(`  ${colors.red}✗ FAIL:${colors.reset} ${msg}`);
}
function header(title) {
  console.log(`\n${colors.bold}${colors.cyan}=== ${title} ===${colors.reset}`);
}

// ------------------------------------------------------------------------
// 1. Load Environment Configuration
// ------------------------------------------------------------------------
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

const rootDir = path.resolve(__dirname, '..');
const envLocal = loadEnvFile(path.join(rootDir, '.env.local'));
const envDefault = loadEnvFile(path.join(rootDir, '.env'));

// Merge into process.env without overwriting existing environment vars
const mergedEnv = { ...envDefault, ...envLocal, ...process.env };
for (const [k, v] of Object.entries(mergedEnv)) {
  if (process.env[k] === undefined) {
    process.env[k] = v;
  }
}

console.log(`${colors.bold}========================================================================${colors.reset}`);
console.log(`${colors.bold}       bikko.studio (studioNeo) System Environment & Health Diagnostic   ${colors.reset}`);
console.log(`${colors.bold}========================================================================${colors.reset}`);

// ------------------------------------------------------------------------
// 2. Validate Environment Variables Checklist
// ------------------------------------------------------------------------
header('1. Configuration & Secrets Checklist');

const hasEnvLocal = fs.existsSync(path.join(rootDir, '.env.local'));
if (hasEnvLocal) {
  pass('.env.local file detected in project root.');
} else {
  warn('.env.local file not found. Copy .env.example to .env.local to configure local credentials.');
}

const requiredKeys = [
  { key: 'DB_HOST', label: 'MySQL Hostname' },
  { key: 'DB_PORT', label: 'MySQL Port', default: '3306' },
  { key: 'DB_USER', label: 'MySQL Username' },
  { key: 'DB_PASSWORD', label: 'MySQL Password' },
  { key: 'DB_NAME', label: 'MySQL Database Name', default: 'experimental_studio_db' },
  { key: 'AUTH_SESSION_SECRET', label: 'HMAC Session Secret' },
  { key: 'WEBAUTHN_RP_ID', label: 'WebAuthn Relying Party ID' },
];

const optionalKeys = [
  { key: 'AZURE_STORAGE_ACCOUNT_NAME', label: 'Azure Storage Account Name' },
  { key: 'AZURE_STORAGE_ACCOUNT_KEY', label: 'Azure Storage Key' },
  { key: 'AZURE_COMMUNICATION_CONNECTION_STRING', label: 'Azure Communication Services String' },
  { key: 'GOOGLE_CLIENT_ID', label: 'Google OAuth Client ID' },
  { key: 'MICROSOFT_CLIENT_ID', label: 'Microsoft OAuth Client ID' },
];

let criticalConfigMissing = false;
for (const item of requiredKeys) {
  const val = process.env[item.key] || item.default;
  if (!val || val.includes('YourStrongPassword') || val.includes('dev_secret_key_sankobite')) {
    warn(`${item.label} (${item.key}) is missing or using default/placeholder value.`);
    if (item.key.startsWith('DB_')) criticalConfigMissing = true;
  } else {
    pass(`${item.label} (${item.key}) configured.`);
  }
}

for (const item of optionalKeys) {
  const val = process.env[item.key];
  if (!val || val.includes('sample') || val.includes('dGVzdGFjY291bnRrZXk')) {
    console.log(`  ${colors.dim}○ INFO:${colors.reset} ${item.label} (${item.key}) not set (dev mock mode enabled).`);
  } else {
    pass(`${item.label} (${item.key}) configured.`);
  }
}

// ------------------------------------------------------------------------
// 3. Database DNS & TCP Connectivity
// ------------------------------------------------------------------------
header('2. Network Connectivity & Database Handshake');

async function runNetworkDiagnostics() {
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME || 'experimental_studio_db';

  if (!host || !user || !password) {
    warn('Skipping live database connection tests: Database credentials not specified in .env.local.');
    return;
  }

  // A. DNS Lookup
  try {
    const ip = await new Promise((resolve, reject) => {
      dns.lookup(host, (err, address) => {
        if (err) reject(err);
        else resolve(address);
      });
    });
    pass(`DNS Resolution: ${host} -> ${ip}`);
  } catch (err) {
    fail(`DNS Resolution failed for ${host}: ${err.message}`);
    return;
  }

  // B. TCP Socket Check
  const tcpResult = await new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(5000);
    socket.on('connect', () => {
      socket.destroy();
      resolve({ ok: true });
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ ok: false, error: 'Connection timed out after 5000ms. Check Azure Firewall rules.' });
    });
    socket.on('error', (err) => {
      resolve({ ok: false, error: err.message });
    });
    socket.connect(port, host);
  });

  if (!tcpResult.ok) {
    fail(`TCP Connection to ${host}:${port} failed: ${tcpResult.error}`);
    return;
  }
  pass(`TCP Socket Connection established to ${host}:${port}.`);

  // C. MySQL Authentication & TLS Handshake
  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch {
    fail('mysql2 package is not installed.');
    return;
  }

  let conn;
  try {
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      connectTimeout: 7000,
      ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' },
    });
    pass(`MySQL Authentication & TLS Handshake succeeded for user '${user}'.`);
  } catch (authErr) {
    fail(`MySQL Connection failed: ${authErr.message}`);
    return;
  }

  // D. Verify Required Schema Tables
  try {
    const [tableRows] = await conn.query('SHOW TABLES');
    const tableNames = tableRows.map((r) => Object.values(r)[0]);

    const requiredTables = [
      'subscribers',
      'auth_magic_tokens',
      'totp_credentials',
      'totp_backup_codes',
      'perks',
      'perk_unlocks',
      'webauthn_credentials',
      'subscriber_oauth_accounts',
    ];

    const missing = requiredTables.filter((t) => !tableNames.includes(t));
    if (missing.length === 0) {
      pass(`All 8 required tables present in database '${database}':`);
      console.log(`    ${colors.dim}${requiredTables.join(', ')}${colors.reset}`);
    } else {
      fail(`Missing required tables: ${missing.join(', ')}`);
      console.log(`    ${colors.yellow}Action: Run scripts/schema.sql against database '${database}' to create missing tables.${colors.reset}`);
    }
  } catch (schemaErr) {
    fail(`Failed to inspect tables in database '${database}': ${schemaErr.message}`);
  } finally {
    if (conn) await conn.end();
  }
}

// ------------------------------------------------------------------------
// 4. Execution
// ------------------------------------------------------------------------
runNetworkDiagnostics().then(() => {
  console.log(`\n${colors.bold}========================================================================${colors.reset}`);
  console.log(`Diagnostic audit complete. Run ${colors.cyan}npm run test${colors.reset} to verify crypto and auth flows.`);
  console.log(`${colors.bold}========================================================================${colors.reset}\n`);
}).catch((err) => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});
