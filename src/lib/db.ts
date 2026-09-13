import mysql, { Pool, PoolOptions, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import fs from 'fs';

/**
 * Global declaration for preserving database pool across Next.js HMR reloads.
 */
declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: Pool | undefined;
}

/**
 * Builds MySQL SSL configuration tailored for Azure Database for MySQL Flexible Server.
 */
function getSSLConfig(): PoolOptions['ssl'] {
  const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';
  const caPath = process.env.DB_SSL_CA_PATH;
  const caInline = process.env.DB_SSL_CA;

  if (caPath && fs.existsSync(caPath)) {
    try {
      const caCert = fs.readFileSync(caPath, 'utf8');
      return {
        ca: caCert,
        rejectUnauthorized,
      };
    } catch (err) {
      console.warn('[DB] Warning: Failed to read SSL CA file at DB_SSL_CA_PATH, falling back to default root CA:', err);
    }
  }

  if (caInline) {
    return {
      ca: caInline,
      rejectUnauthorized,
    };
  }

  // Default for Azure Flexible Server: Enforce SSL using system/Node trust store
  return {
    rejectUnauthorized,
  };
}

/**
 * Initializes and configures the connection pool for Azure MySQL Flexible Server.
 */
function createConnectionPool(): Pool {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = Number(process.env.DB_PORT) || 3306;
  const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT) || 10;
  const queueLimit = Number(process.env.DB_QUEUE_LIMIT) || 0;
  const waitForConnections = process.env.DB_WAIT_FOR_CONNECTIONS !== 'false';
  const keepAliveInitialDelay = Number(process.env.DB_KEEPALIVE_DELAY_MS) || 10000;

  const poolOptions: PoolOptions = {
    host,
    user,
    password,
    database,
    port,
    ssl: getSSLConfig(),
    // Azure network security groups / load balancers drop idle connections after 4-5 mins.
    // TCP Keepalive ensures connection validity across idle periods.
    enableKeepAlive: true,
    keepAliveInitialDelay,
    waitForConnections,
    connectionLimit,
    queueLimit,
    // Ensure the connection pool communicates using utf8mb4 encoding,
    // neutralizing issues with legacy armscii8 character sets on legacy tables.
    charset: 'utf8mb4',
    // Always work in UTC to prevent timezone misalignment in token expiration
    timezone: 'Z',
    // Date strings are returned as ISO strings for consistent JSON serialization
    dateStrings: true,
  };

  const pool = mysql.createPool(poolOptions);

  return pool;
}

/**
 * Get or initialize the database connection pool (Singleton).
 */
export function getPool(): Pool {
  if (process.env.NODE_ENV === 'production') {
    if (!globalThis.__mysqlPool) {
      globalThis.__mysqlPool = createConnectionPool();
    }
    return globalThis.__mysqlPool;
  }

  // In development, preserve pool across hot reloads
  if (!globalThis.__mysqlPool) {
    globalThis.__mysqlPool = createConnectionPool();
  }
  return globalThis.__mysqlPool;
}

/**
 * Executes a parameterized SQL query returning rows typed as T[].
 */
export async function queryRows<T = Record<string, unknown>>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows as unknown as T[];
}

/**
 * Executes a parameterized SQL query returning the first matching row or null.
 */
export async function queryRow<T = Record<string, unknown>>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await queryRows<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Executes a modifying statement (INSERT, UPDATE, DELETE) and returns ResultSetHeader.
 */
export async function execute(
  sql: string,
  params: any[] = []
): Promise<ResultSetHeader> {
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result;
}

/**
 * Executes an atomic database transaction with automatic COMMIT and ROLLBACK.
 */
export async function transaction<T>(
  callback: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Diagnostic helper to verify connectivity and Azure Flexible Server version.
 */
export async function testDbConnection(): Promise<{
  connected: boolean;
  version?: string;
  error?: string;
}> {
  try {
    const rows = await queryRows<{ version: string }>('SELECT VERSION() AS version');
    return {
      connected: true,
      version: rows[0]?.version,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      error,
    };
  }
}

export default {
  getPool,
  queryRows,
  queryRow,
  execute,
  transaction,
  testDbConnection,
};
