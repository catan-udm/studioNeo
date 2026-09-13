import { NextResponse } from 'next/server';
import net from 'net';
import dns from 'dns';
import mysql from 'mysql2/promise';

export async function GET() {
  const host = process.env.DB_HOST || '';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || '';
  const database = process.env.DB_NAME || '';
  const password = process.env.DB_PASSWORD || '';
  const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    config: {
      DB_HOST: host || '(NOT SET)',
      DB_PORT: port,
      DB_USER: user || '(NOT SET)',
      DB_NAME: database || '(NOT SET)',
      DB_PASSWORD_SET: Boolean(password),
      DB_PASSWORD_LENGTH: password.length,
      DB_SSL_REJECT_UNAUTHORIZED: rejectUnauthorized,
      AZURE_STORAGE_ACCOUNT: process.env.AZURE_STORAGE_ACCOUNT_NAME || '(NOT SET)',
    },
    dns: { status: 'PENDING' },
    tcp: { status: 'PENDING' },
    mysqlAuth: { status: 'PENDING' },
    schema: { status: 'PENDING', missingTables: [] as string[] },
    actionableAdvice: [] as string[],
  };

  if (!host || !user || !password) {
    diagnostics.actionableAdvice = [
      'Missing required database credentials in .env.local (DB_HOST, DB_USER, DB_PASSWORD).',
    ];
    return NextResponse.json(diagnostics, { status: 500 });
  }

  // 1. DNS Check
  try {
    const ip = await new Promise<string>((resolve, reject) => {
      dns.lookup(host, (err, address) => {
        if (err) reject(err);
        else resolve(address);
      });
    });
    diagnostics.dns = { status: 'OK', resolvedIp: ip };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    diagnostics.dns = { status: 'FAILED', error: message };
    (diagnostics.actionableAdvice as string[]).push(
      `DNS lookup failed for ${host}. Verify the DB_HOST value.`
    );
    return NextResponse.json(diagnostics, { status: 500 });
  }

  // 2. TCP Check
  const tcpResult = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.on('connect', () => {
      socket.destroy();
      resolve({ ok: true });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        ok: false,
        error: `TCP timeout after 5000ms. Azure Firewall is blocking connection or host is unreachable.`,
      });
    });

    socket.on('error', (err) => {
      resolve({ ok: false, error: err.message });
    });

    socket.connect(port, host);
  });

  if (!tcpResult.ok) {
    diagnostics.tcp = { status: 'FAILED', error: tcpResult.error };
    (diagnostics.actionableAdvice as string[]).push(
      'In Azure Portal -> Azure Database for MySQL Flexible Server -> Networking: Ensure your current IP is added to the Firewall Rules and "Allow public access from any Azure service within Azure" is checked.'
    );
    return NextResponse.json(diagnostics, { status: 500 });
  }
  diagnostics.tcp = { status: 'OK' };

  // 3. MySQL Authentication Handshake
  let conn: mysql.Connection | null = null;
  try {
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      connectTimeout: 7000,
      ssl: { rejectUnauthorized },
    });
    diagnostics.mysqlAuth = { status: 'OK' };
  } catch (authErr: unknown) {
    const message = authErr instanceof Error ? authErr.message : String(authErr);
    const code = (authErr as { code?: string })?.code;
    diagnostics.mysqlAuth = { status: 'FAILED', code, error: message };

    if (code === 'ER_ACCESS_DENIED_ERROR') {
      (diagnostics.actionableAdvice as string[]).push(
        `Access denied for user '${user}'. The password or username in .env.local is incorrect.`
      );
      (diagnostics.actionableAdvice as string[]).push(
        'Go to Azure Portal -> your MySQL server `code-web-azuredb` -> "Reset password" to set a new known password and update DB_PASSWORD in .env.local.'
      );
    } else if (code === 'ER_BAD_DB_ERROR') {
      (diagnostics.actionableAdvice as string[]).push(
        `Database '${database}' does not exist on this server. Create it via: CREATE DATABASE experimental_studio_db;`
      );
    }
    return NextResponse.json(diagnostics, { status: 500 });
  }

  // 4. Inspect Tables
  try {
    const [tableRows] = await conn.query('SHOW TABLES');
    const tableNames = (tableRows as Array<Record<string, string>>).map(
      (row) => Object.values(row)[0]
    );

    const requiredTables = [
      'subscribers',
      'auth_magic_tokens',
      'totp_credentials',
      'totp_backup_codes',
      'perks',
      'perk_unlocks',
    ];

    const missing = requiredTables.filter((t) => !tableNames.includes(t));
    if (missing.length > 0) {
      diagnostics.schema = {
        status: 'INCOMPLETE',
        existingTables: tableNames,
        missingTables: missing,
      };
      (diagnostics.actionableAdvice as string[]).push(
        `Missing tables: ${missing.join(', ')}. Execute the SQL in scripts/schema.sql to create them.`
      );
    } else {
      diagnostics.schema = {
        status: 'OK',
        existingTables: tableNames,
      };
    }
  } catch (schemaErr: unknown) {
    const message = schemaErr instanceof Error ? schemaErr.message : String(schemaErr);
    diagnostics.schema = { status: 'ERROR', error: message };
  } finally {
    if (conn) await conn.end();
  }

  const isHealthy =
    diagnostics.tcp.status === 'OK' &&
    diagnostics.mysqlAuth.status === 'OK' &&
    diagnostics.schema.status === 'OK';

  return NextResponse.json(
    {
      healthy: isHealthy,
      ...diagnostics,
    },
    { status: isHealthy ? 200 : 500 }
  );
}
