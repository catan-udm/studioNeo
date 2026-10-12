import mysql, { Pool, PoolOptions, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import fs from 'fs';

/**
 * Global declaration for preserving database pool and dev store across Next.js HMR reloads.
 */
declare global {
  var __mysqlPool: Pool | undefined;
  var __devDbStore: DevDbStore | undefined;
}

export interface CelRecord {
  id: number;
  subscriber_id: number | null;
  code: string;
  title: string;
  description: string;
  artist: string;
  artist_handle: string;
  artist_avatar: string;
  category: 'Generative' | 'Kinetic' | 'Vectors' | 'Mono';
  edition: string;
  color: string;
  price: string;
  likes: number;
  format: string;
  svg_storage_path: string;
  svg_url: string | null;
  gif_storage_path: string | null;
  gif_url: string | null;
  is_vault: number;
  created_at: string;
  updated_at: string;
}

interface DevDbStore {
  nextSubscriberId: number;
  nextMagicTokenId: number;
  nextBackupCodeId: number;
  nextPerkUnlockId: number;
  nextWebauthnId: number;
  nextOAuthId: number;
  nextInquiryId: number;
  nextCelId: number;
  subscribers: Array<{
    id: number;
    email: string;
    is_verified: number;
    tier: string;
    subscription_status: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    created_at: string;
    updated_at: string;
  }>;
  magicTokens: Array<{
    id: number;
    subscriber_id: number;
    token_hash: string;
    expires_at: string;
    consumed_at: string | null;
    created_at: string;
  }>;
  totpCredentials: Map<number, {
    subscriber_id: number;
    totp_secret: string;
    is_active: number;
    created_at: string;
    updated_at: string;
  }>;
  totpBackupCodes: Array<{
    id: number;
    subscriber_id: number;
    code_hash: string;
    is_used: number;
    used_at: string | null;
    created_at: string;
  }>;
  perks: Array<{
    id: number;
    slug: string;
    title: string;
    description: string;
    storage_file_path: string;
    created_at: string;
  }>;
  perkUnlocks: Array<{
    id: number;
    subscriber_id: number;
    perk_id: number;
    unlocked_at: string;
  }>;
  webauthnCredentials: Array<{
    id: number;
    subscriber_id: number;
    credential_id: string;
    public_key: string;
    counter: number;
    transports: string | null;
    created_at: string;
    updated_at: string;
  }>;
  subscriberOAuthAccounts: Array<{
    id: number;
    subscriber_id: number;
    provider: string;
    provider_user_id: string;
    created_at: string;
  }>;
  inquiries: Array<{
    id: number;
    name: string;
    email: string;
    organization: string | null;
    topic: string;
    message: string;
    created_at: string;
  }>;
  cels: Array<CelRecord>;
}

function initDevDbStore(): DevDbStore {
  if (globalThis.__devDbStore) return globalThis.__devDbStore;

  const now = new Date().toISOString();
  const store: DevDbStore = {
    nextSubscriberId: 3,
    nextMagicTokenId: 1,
    nextBackupCodeId: 1,
    nextPerkUnlockId: 4,
    nextWebauthnId: 1,
    nextOAuthId: 1,
    nextInquiryId: 1,
    nextCelId: 1,
    subscribers: [
      {
        id: 1,
        email: 'subscriber@bikko.studio',
        is_verified: 1,
        tier: 'collector',
        subscription_status: 'active',
        stripe_customer_id: 'mock_cus_1',
        stripe_subscription_id: 'mock_sub_1',
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        email: 'artist@bikko.studio',
        is_verified: 1,
        tier: 'artist_resident',
        subscription_status: 'active',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        created_at: now,
        updated_at: now,
      },
    ],
    magicTokens: [],
    totpCredentials: new Map(),
    totpBackupCodes: [],
    perks: [
      {
        id: 1,
        slug: 'alpha-access-guide',
        title: 'Studio Alpha Access Guide',
        description: 'Exclusive architecture and deployment walkthrough PDF',
        storage_file_path: 'assets/guides/alpha-access-guide.pdf',
        created_at: now,
      },
      {
        id: 2,
        slug: 'starter-kit-v1',
        title: 'Azure Cloud Starter Kit',
        description: 'Starter templates and ARM/Bicep configurations',
        storage_file_path: 'assets/kits/starter-kit-v1.zip',
        created_at: now,
      },
      {
        id: 3,
        slug: 'pro-audio-pack',
        title: 'Studio Sound FX & Audio Assets Pack',
        description: 'Curated lossless audio stems for game/app creators',
        storage_file_path: 'assets/media/pro-audio-pack.tar.gz',
        created_at: now,
      },
    ],
    perkUnlocks: [
      { id: 1, subscriber_id: 1, perk_id: 1, unlocked_at: now },
      { id: 2, subscriber_id: 1, perk_id: 2, unlocked_at: now },
      { id: 3, subscriber_id: 1, perk_id: 3, unlocked_at: now },
    ],
    webauthnCredentials: [],
    subscriberOAuthAccounts: [],
    inquiries: [],
    cels: [],
  };

  globalThis.__devDbStore = store;
  return store;
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
  const database = process.env.DB_NAME || 'experimental_studio_db';
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
    enableKeepAlive: true,
    keepAliveInitialDelay,
    waitForConnections,
    connectionLimit,
    queueLimit,
    charset: 'utf8mb4',
    timezone: 'Z',
    dateStrings: true,
  };

  return mysql.createPool(poolOptions);
}

export function getPool(): Pool {
  if (!globalThis.__mysqlPool) {
    globalThis.__mysqlPool = createConnectionPool();
  }
  return globalThis.__mysqlPool;
}

function hasConfiguredDb(): boolean {
  const host = process.env.DB_HOST;
  return Boolean(host && host.trim() !== '' && !host.includes('YourStrongPassword'));
}

/**
 * Fallback In-Memory Query Evaluator for Local Development / Mock Mode
 */
async function executeDevQuery<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const store = initDevDbStore();
  const normalized = sql.trim().replace(/\s+/g, ' ');
  const lower = normalized.toLowerCase();

  // SELECT VERSION()
  if (lower.startsWith('select version()')) {
    return [{ version: '8.0.36-azure-mock-inmemory' }] as unknown as T[];
  }

  // SELECT ... FROM subscribers WHERE email = ?
  if (lower.includes('from subscribers') && lower.includes('where email = ?')) {
    const email = String(params[0] || '').toLowerCase().trim();
    const found = store.subscribers.find((s) => s.email.toLowerCase() === email);
    return (found ? [found] : []) as unknown as T[];
  }

  // SELECT ... FROM subscribers WHERE id = ?
  if (lower.includes('from subscribers') && lower.includes('where id = ?')) {
    const id = Number(params[0]);
    const found = store.subscribers.find((s) => s.id === id);
    return (found ? [found] : []) as unknown as T[];
  }

  // SELECT totp_secret, is_active FROM totp_credentials WHERE subscriber_id = ?
  if (lower.includes('from totp_credentials') && lower.includes('where subscriber_id = ?')) {
    const subId = Number(params[0]);
    const cred = store.totpCredentials.get(subId);
    if (!cred) return [] as unknown as T[];
    if (lower.includes('is_active = 1') && cred.is_active !== 1) {
      return [] as unknown as T[];
    }
    return [cred] as unknown as T[];
  }

  // SELECT ... FROM totp_backup_codes WHERE subscriber_id = ?
  if (lower.includes('from totp_backup_codes') && lower.includes('where subscriber_id = ?')) {
    const subId = Number(params[0]);
    let codes = store.totpBackupCodes.filter((c) => c.subscriber_id === subId);
    if (lower.includes('code_hash = ?')) {
      const hash = String(params[1]);
      codes = codes.filter((c) => c.code_hash === hash);
    }
    if (lower.includes('is_used = 0')) {
      codes = codes.filter((c) => c.is_used === 0);
    }
    return codes as unknown as T[];
  }

  // SELECT ... FROM perks p INNER JOIN perk_unlocks pu ...
  if (lower.includes('from perks p') && lower.includes('perk_unlocks pu')) {
    const subId = Number(params[0]);
    const unlocks = store.perkUnlocks.filter((u) => u.subscriber_id === subId);
    const perkSlugParam = params.length > 1 ? String(params[1]) : null;

    const matched: Array<Record<string, unknown>> = [];
    for (const u of unlocks) {
      const perk = store.perks.find((p) => p.id === u.perk_id);
      if (perk) {
        if (!perkSlugParam || perk.slug === perkSlugParam) {
          matched.push({
            id: perk.id,
            slug: perk.slug,
            title: perk.title,
            description: perk.description,
            storage_file_path: perk.storage_file_path,
            unlocked_at: u.unlocked_at,
          });
        }
      }
    }
    return matched as unknown as T[];
  }

  // SELECT ... FROM perks WHERE ...
  if (lower.includes('from perks')) {
    if (lower.includes('where slug = ?')) {
      const slug = String(params[0]);
      const found = store.perks.find((p) => p.slug === slug);
      return (found ? [found] : []) as unknown as T[];
    }
    return store.perks as unknown as T[];
  }

  // SELECT ... FROM auth_magic_tokens WHERE ...
  if (lower.includes('from auth_magic_tokens')) {
    const subId = Number(params[0]);
    const active = store.magicTokens.filter((t) => t.subscriber_id === subId && t.consumed_at === null);
    return active.slice(-1) as unknown as T[];
  }

  // SELECT ... FROM webauthn_credentials WHERE subscriber_id = ?
  if (lower.includes('from webauthn_credentials')) {
    if (lower.includes('where credential_id = ?')) {
      const credId = String(params[0]);
      const found = store.webauthnCredentials.find((c) => c.credential_id === credId);
      return (found ? [found] : []) as unknown as T[];
    }
    if (lower.includes('where subscriber_id = ?')) {
      const subId = Number(params[0]);
      const rows = store.webauthnCredentials.filter((c) => c.subscriber_id === subId);
      if (lower.includes('count(*)')) {
        return [{ cnt: rows.length }] as unknown as T[];
      }
      return rows as unknown as T[];
    }
    return store.webauthnCredentials as unknown as T[];
  }

  // SELECT ... FROM subscriber_oauth_accounts WHERE subscriber_id = ?
  if (lower.includes('from subscriber_oauth_accounts')) {
    const subId = Number(params[0]);
    const rows = store.subscriberOAuthAccounts.filter((a) => a.subscriber_id === subId);
    return rows as unknown as T[];
  }

  // SELECT ... FROM cels
  if (lower.includes('from cels')) {
    let results = [...store.cels];

    // Handle WHERE conditions
    if (lower.includes('where')) {
      // 1. Check for compound code OR id: WHERE LOWER(code) = ? OR id = ?
      if (
        (lower.includes('code) = ? or id = ?') || lower.includes('code = ? or id = ?')) &&
        params.length >= 2
      ) {
        const codeVal = String(params[0] ?? '').toLowerCase().trim();
        const idVal = Number(params[1] ?? -1);
        results = results.filter((c) => c.code.toLowerCase() === codeVal || c.id === idVal);
      } else {
        // Sequentially match conditions against params in SQL order
        let paramIdx = 0;

        if (lower.includes('artist_handle) = ?') || lower.includes('artist_handle = ?')) {
          if (paramIdx < params.length) {
            const handle = String(params[paramIdx++] ?? '').toLowerCase().trim();
            results = results.filter((c) => c.artist_handle.toLowerCase() === handle);
          }
        }

        if (lower.includes('category = ?')) {
          if (paramIdx < params.length) {
            const cat = String(params[paramIdx++] ?? '').toLowerCase().trim();
            if (cat !== 'all') {
              results = results.filter((c) => c.category.toLowerCase() === cat);
            }
          }
        }

        if (lower.includes('code) = ?') || lower.includes('code = ?')) {
          if (paramIdx < params.length) {
            const codeVal = String(params[paramIdx++] ?? '').toLowerCase().trim();
            results = results.filter((c) => c.code.toLowerCase() === codeVal);
          }
        }

        if (lower.includes('id = ?') && !lower.includes('or id = ?')) {
          if (paramIdx < params.length) {
            const idVal = Number(params[paramIdx++] ?? -1);
            results = results.filter((c) => c.id === idVal);
          }
        }

        if (lower.includes('subscriber_id = ?')) {
          if (paramIdx < params.length) {
            const subId = Number(params[paramIdx++] ?? -1);
            results = results.filter((c) => c.subscriber_id === subId);
          }
        }
      }
    }

    if (lower.includes('count(*)')) {
      return [{ cnt: results.length }] as unknown as T[];
    }

    if (lower.includes('order by created_at desc') || lower.includes('order by id desc')) {
      results.sort((a, b) => b.id - a.id);
    }

    if (lower.includes('limit 1')) {
      results = results.slice(0, 1);
    }

    return results as unknown as T[];
  }

  return [] as unknown as T[];
}

async function executeDevMutation(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const store = initDevDbStore();
  const normalized = sql.trim().replace(/\s+/g, ' ');
  const lower = normalized.toLowerCase();
  const now = new Date().toISOString();

  // INSERT INTO subscribers
  if (lower.startsWith('insert into subscribers')) {
    const email = String(params[0]).toLowerCase().trim();
    const isVerified = Number(params[1] ?? 0);
    const newId = store.nextSubscriberId++;
    store.subscribers.push({
      id: newId,
      email,
      is_verified: isVerified,
      tier: 'free',
      subscription_status: 'active',
      stripe_customer_id: null,
      stripe_subscription_id: null,
      created_at: now,
      updated_at: now,
    });
    return { insertId: newId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // UPDATE subscribers
  if (lower.startsWith('update subscribers')) {
    if (lower.includes('is_verified = 1') && lower.includes('where id = ?')) {
      const id = Number(params[0]);
      const sub = store.subscribers.find((s) => s.id === id);
      if (sub) {
        sub.is_verified = 1;
        sub.updated_at = now;
        return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
      }
    }
    if (lower.includes('set tier = ?')) {
      const tier = String(params[0]);
      if (lower.includes('where email = ?')) {
        const email = String(params[params.length - 1] || '').toLowerCase().trim();
        let sub = store.subscribers.find((s) => s.email.toLowerCase() === email);
        if (!sub) {
          const newId = store.nextSubscriberId++;
          sub = {
            id: newId,
            email,
            is_verified: 1,
            tier,
            subscription_status: 'active',
            stripe_customer_id: null,
            stripe_subscription_id: null,
            created_at: now,
            updated_at: now,
          };
          store.subscribers.push(sub);
          return { insertId: newId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
        }
        sub.tier = tier;
        sub.updated_at = now;
        return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
      }
      const subId = Number(params[params.length - 1]);
      const sub = store.subscribers.find((s) => s.id === subId);
      if (sub) {
        sub.tier = tier;
        if (params.length > 3 && params[1]) sub.stripe_customer_id = String(params[1]);
        if (params.length > 3 && params[2]) sub.stripe_subscription_id = String(params[2]);
        sub.updated_at = now;
        return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
      }
    }
  }

  // INSERT INTO auth_magic_tokens
  if (lower.startsWith('insert into auth_magic_tokens')) {
    const subId = Number(params[0]);
    const tokenHash = String(params[1]);
    const expiresAt = String(params[2]);
    const newId = store.nextMagicTokenId++;
    store.magicTokens.push({
      id: newId,
      subscriber_id: subId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      consumed_at: null,
      created_at: now,
    });
    return { insertId: newId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // UPDATE auth_magic_tokens SET consumed_at
  if (lower.startsWith('update auth_magic_tokens')) {
    const id = Number(params[0]);
    const token = store.magicTokens.find((t) => t.id === id);
    if (token) {
      token.consumed_at = now;
      return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
    }
  }

  // INSERT / REPLACE / UPDATE totp_credentials
  if (lower.includes('into totp_credentials')) {
    const subId = Number(params[0]);
    const secret = String(params[1]);
    const isActive = Number(params[2] ?? 0);
    store.totpCredentials.set(subId, {
      subscriber_id: subId,
      totp_secret: secret,
      is_active: isActive,
      created_at: now,
      updated_at: now,
    });
    return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  if (lower.startsWith('update totp_credentials')) {
    const isActive = Number(params[0]);
    const subId = Number(params[1]);
    const cred = store.totpCredentials.get(subId);
    if (cred) {
      cred.is_active = isActive;
      cred.updated_at = now;
      return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
    }
  }

  if (lower.startsWith('delete from totp_credentials')) {
    const subId = Number(params[0]);
    store.totpCredentials.delete(subId);
    return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // INSERT INTO totp_backup_codes
  if (lower.startsWith('insert into totp_backup_codes')) {
    const subId = Number(params[0]);
    const codeHash = String(params[1]);
    const newId = store.nextBackupCodeId++;
    store.totpBackupCodes.push({
      id: newId,
      subscriber_id: subId,
      code_hash: codeHash,
      is_used: 0,
      used_at: null,
      created_at: now,
    });
    return { insertId: newId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  if (lower.startsWith('update totp_backup_codes')) {
    const id = Number(params[0]);
    const code = store.totpBackupCodes.find((c) => c.id === id);
    if (code) {
      code.is_used = 1;
      code.used_at = now;
      return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
    }
  }

  if (lower.startsWith('delete from totp_backup_codes')) {
    const subId = Number(params[0]);
    store.totpBackupCodes = store.totpBackupCodes.filter((c) => c.subscriber_id !== subId);
    return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // INSERT / UPDATE webauthn_credentials
  if (lower.startsWith('insert into webauthn_credentials')) {
    const subId = Number(params[0]);
    const credId = String(params[1]);
    const pubKey = String(params[2]);
    const counter = Number(params[3] ?? 0);
    const transports = params[4] ? String(params[4]) : null;
    const newId = store.nextWebauthnId++;
    store.webauthnCredentials.push({
      id: newId,
      subscriber_id: subId,
      credential_id: credId,
      public_key: pubKey,
      counter,
      transports,
      created_at: now,
      updated_at: now,
    });
    return { insertId: newId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  if (lower.startsWith('delete from webauthn_credentials')) {
    const credId = String(params[0]);
    store.webauthnCredentials = store.webauthnCredentials.filter((c) => c.credential_id !== credId);
    return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // INSERT INTO perk_unlocks
  if (lower.includes('into perk_unlocks')) {
    const subId = Number(params[0]);
    const perkId = Number(params[1]);
    const existing = store.perkUnlocks.find((u) => u.subscriber_id === subId && u.perk_id === perkId);
    if (!existing) {
      const newId = store.nextPerkUnlockId++;
      store.perkUnlocks.push({
        id: newId,
        subscriber_id: subId,
        perk_id: perkId,
        unlocked_at: now,
      });
    }
    return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // INSERT INTO subscriber_oauth_accounts
  if (lower.includes('into subscriber_oauth_accounts')) {
    const subId = Number(params[0]);
    const provider = String(params[1]);
    const pUid = String(params[2]);
    const existing = store.subscriberOAuthAccounts.find((a) => a.provider === provider && a.provider_user_id === pUid);
    if (!existing) {
      store.subscriberOAuthAccounts.push({
        id: store.nextOAuthId++,
        subscriber_id: subId,
        provider,
        provider_user_id: pUid,
        created_at: now,
      });
    }
    return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  if (lower.startsWith('delete from subscriber_oauth_accounts')) {
    const subId = Number(params[0]);
    const provider = String(params[1]);
    store.subscriberOAuthAccounts = store.subscriberOAuthAccounts.filter(
      (a) => !(a.subscriber_id === subId && a.provider === provider)
    );
    return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // INSERT INTO inquiries
  if (lower.startsWith('insert into inquiries')) {
    const name = String(params[0]);
    const email = String(params[1]);
    const organization = params[2] ? String(params[2]) : null;
    const topic = String(params[3]);
    const message = String(params[4]);
    const newId = store.nextInquiryId++;
    store.inquiries.push({
      id: newId,
      name,
      email,
      organization,
      topic,
      message,
      created_at: now,
    });
    return { insertId: newId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // INSERT INTO cels
  if (lower.startsWith('insert into cels')) {
    const newId = store.nextCelId++;
    const [
      subscriberId,
      code,
      title,
      description,
      artist,
      artistHandle,
      artistAvatar,
      category,
      edition,
      color,
      price,
      likes,
      format,
      svgStoragePath,
      svgUrl,
      gifStoragePath,
      gifUrl,
      isVault,
    ] = params;

    const newCel: CelRecord = {
      id: newId,
      subscriber_id: subscriberId !== undefined && subscriberId !== null ? Number(subscriberId) : null,
      code: String(code || `CEL-${newId}`),
      title: String(title || 'Untitled Cel'),
      description: String(description || ''),
      artist: String(artist || 'Resident Artist'),
      artist_handle: String(artistHandle || 'resident'),
      artist_avatar: String(artistAvatar || 'AT'),
      category: (category as 'Generative' | 'Kinetic' | 'Vectors' | 'Mono') || 'Generative',
      edition: String(edition || 'Ed. 1/12'),
      color: String(color || '#c496ff'),
      price: String(price || '$180'),
      likes: Number(likes || 0),
      format: String(format || 'SVG'),
      svg_storage_path: String(svgStoragePath || ''),
      svg_url: svgUrl ? String(svgUrl) : null,
      gif_storage_path: gifStoragePath ? String(gifStoragePath) : null,
      gif_url: gifUrl ? String(gifUrl) : null,
      is_vault: isVault ? 1 : 0,
      created_at: now,
      updated_at: now,
    };
    store.cels.push(newCel);
    return { insertId: newId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // DELETE FROM cels
  if (lower.startsWith('delete from cels')) {
    if (lower.includes('where id = ?')) {
      const id = Number(params[0]);
      store.cels = store.cels.filter((c) => c.id !== id);
      return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
    }
  }

  return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
}

/**
 * Executes a parameterized SQL query returning rows typed as T[].
 */
export async function queryRows<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  if (!hasConfiguredDb()) {
    return executeDevQuery<T>(sql, params);
  }

  try {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return rows as unknown as T[];
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[DB] MySQL query failed, falling back to local dev store:', err);
      return executeDevQuery<T>(sql, params);
    }
    throw err;
  }
}

/**
 * Executes a parameterized SQL query returning the first matching row or null.
 */
export async function queryRow<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await queryRows<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Executes a modifying statement (INSERT, UPDATE, DELETE) and returns ResultSetHeader.
 */
export async function execute(
  sql: string,
  params: unknown[] = []
): Promise<ResultSetHeader> {
  if (!hasConfiguredDb()) {
    return executeDevMutation(sql, params);
  }

  try {
    const pool = getPool();
    const [result] = await pool.execute<ResultSetHeader>(
      sql,
      params as Parameters<typeof pool.execute>[1]
    );
    return result;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[DB] MySQL execute failed, falling back to local dev store:', err);
      return executeDevMutation(sql, params);
    }
    throw err;
  }
}

/**
 * Executes an atomic database transaction with automatic COMMIT and ROLLBACK.
 */
export async function transaction<T>(
  callback: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  if (!hasConfiguredDb()) {
    // In dev store, execute directly
    const mockConn = {
      execute: async (sql: string, params?: unknown[]) => execute(sql, params || []),
      query: async (sql: string, params?: unknown[]) => queryRows(sql, params || []),
    } as unknown as PoolConnection;
    return callback(mockConn);
  }

  try {
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
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[DB] MySQL transaction failed, running mock transaction:', err);
      const mockConn = {
        execute: async (sql: string, params?: unknown[]) => execute(sql, params || []),
        query: async (sql: string, params?: unknown[]) => queryRows(sql, params || []),
      } as unknown as PoolConnection;
      return callback(mockConn);
    }
    throw err;
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

const db = {
  getPool,
  queryRows,
  queryRow,
  execute,
  transaction,
  testDbConnection,
};

export default db;
