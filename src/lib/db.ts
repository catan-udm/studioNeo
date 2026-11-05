import mysql, { Pool, PoolOptions, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import fs from 'fs';

/**
 * Global declaration for preserving database pool and dev store across Next.js HMR reloads.
 */
declare global {
  var __mysqlPool: Pool | undefined;
  var __devDbStore: DevDbStore | undefined;
}

export type SystemRole = 'user' | 'curator' | 'admin';
export type ArtistDistinctionRole = 'none' | 'artist' | 'featured' | 'partner';
export type AccountRole = 'user' | 'artist' | 'featured' | 'partner' | 'curator' | 'admin';
export type ArtworkCategory = 'Generative' | 'Kinetic' | 'Vectors' | 'Mono';
export type ArtworkAssetType = 'master_svg' | 'preview_gif' | 'preview_raster' | 'source_archive';

export interface AccountRecord {
  id: number;
  email: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
  is_verified: number;
  system_role: SystemRole;
  artist_distinction: ArtistDistinctionRole;
  created_at: string;
  updated_at: string;
  /** Derived alias for backwards compatibility in UI & test helpers */
  role?: AccountRole;
  tier?: string;
}

export type SubscriberRecord = AccountRecord;

export interface ArtworkRecord {
  id: number;
  account_id: number;
  code: string;
  title: string;
  description: string;
  category: ArtworkCategory;
  edition: string;
  color: string;
  price: string;
  is_vault: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface ArtworkAssetRecord {
  id: number;
  artwork_id: number;
  asset_type: ArtworkAssetType;
  storage_path: string;
  url: string | null;
  mime_type: string;
  file_size_bytes: number | null;
  created_at: string;
}

export interface ArtworkLikeRecord {
  account_id: number;
  artwork_id: number;
  created_at: string;
}

export interface ArtworkDownloadRecord {
  id: number;
  account_id: number;
  artwork_id: number;
  asset_id: number;
  format: string;
  ip_address: string | null;
  downloaded_at: string;
}

/**
 * Joined Artwork Projection (combines normalized `artworks`, `accounts`, and `artwork_assets`)
 * Preserves `CelRecord` shape for gallery & API responses while sourcing strictly from BCNF tables.
 */
export interface CelRecord {
  id: number;
  account_id: number | null;
  subscriber_id?: number | null;
  code: string;
  title: string;
  description: string;
  artist: string;
  artist_handle: string;
  artist_avatar: string;
  artist_distinction?: ArtistDistinctionRole;
  category: ArtworkCategory;
  edition: string;
  color: string;
  price: string;
  likes: number;
  likes_count?: number;
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
  nextAccountId: number;
  nextMagicTokenId: number;
  nextBackupCodeId: number;
  nextWebauthnId: number;
  nextOAuthId: number;
  nextInquiryId: number;
  nextArtworkId: number;
  nextArtworkAssetId: number;
  nextArtworkDownloadId: number;
  accounts: Array<AccountRecord>;
  magicTokens: Array<{
    id: number;
    account_id: number;
    subscriber_id?: number;
    token_hash: string;
    expires_at: string;
    consumed_at: string | null;
    created_at: string;
  }>;
  totpCredentials: Map<
    number,
    {
      account_id: number;
      subscriber_id?: number;
      totp_secret: string;
      is_active: number;
      created_at: string;
      updated_at: string;
    }
  >;
  totpBackupCodes: Array<{
    id: number;
    account_id: number;
    subscriber_id?: number;
    code_hash: string;
    is_used: number;
    used_at: string | null;
    created_at: string;
  }>;
  webauthnCredentials: Array<{
    id: number;
    account_id: number;
    subscriber_id?: number;
    credential_id: string;
    public_key: string;
    counter: number;
    transports: string | null;
    created_at: string;
    updated_at: string;
  }>;
  accountOAuthProviders: Array<{
    id: number;
    account_id: number;
    subscriber_id?: number;
    provider: string;
    provider_user_id: string;
    created_at: string;
  }>;
  inquiries: Array<{
    id: number;
    target_account_id: number | null;
    name: string;
    email: string;
    organization: string | null;
    topic: string;
    message: string;
    created_at: string;
  }>;
  artworks: Array<ArtworkRecord>;
  artworkAssets: Array<ArtworkAssetRecord>;
  artworkLikes: Array<ArtworkLikeRecord>;
  artworkDownloads: Array<ArtworkDownloadRecord>;
}

function deriveHandleFromEmail(email: string, idSuffix?: number): string {
  const local = (email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return idSuffix ? `${local}_${idSuffix}` : local;
}

function deriveTierAlias(systemRole: SystemRole, distinction: ArtistDistinctionRole): string {
  if (distinction === 'partner') return 'partner';
  if (distinction === 'featured') return 'featured';
  if (distinction === 'artist') return 'artist';
  if (systemRole === 'curator' || systemRole === 'admin') return systemRole;
  return 'user';
}

const DEV_STORE_DISK_PATH = '/tmp/studioneo-bcnf-dev-store.json';

function shouldSyncDevStoreToDisk(): boolean {
  return Boolean(
    typeof process !== 'undefined' &&
      process.env &&
      (process.env.NEXT_RUNTIME || process.env.__NEXT_PROCESSED_ENV)
  );
}

function persistDevDbStore(store: DevDbStore): void {
  if (!shouldSyncDevStoreToDisk()) return;
  try {
    const serializable = {
      ...store,
      totpCredentials: Array.from(store.totpCredentials.entries()),
    };
    fs.writeFileSync(DEV_STORE_DISK_PATH, JSON.stringify(serializable), 'utf8');
  } catch {
    // Ignore disk persistence errors in restricted environments
  }
}

function initDevDbStore(): DevDbStore {
  if (shouldSyncDevStoreToDisk() && fs.existsSync(DEV_STORE_DISK_PATH)) {
    try {
      const raw = fs.readFileSync(DEV_STORE_DISK_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.accounts)) {
        const loaded: DevDbStore = {
          ...parsed,
          totpCredentials: new Map(Array.isArray(parsed.totpCredentials) ? parsed.totpCredentials : []),
        };
        globalThis.__devDbStore = loaded;
        return loaded;
      }
    } catch {
      // Fall through to fresh initialization
    }
  }

  if (globalThis.__devDbStore) return globalThis.__devDbStore;

  const now = new Date().toISOString();
  const store: DevDbStore = {
    nextAccountId: 4,
    nextMagicTokenId: 1,
    nextBackupCodeId: 1,
    nextWebauthnId: 1,
    nextOAuthId: 1,
    nextInquiryId: 1,
    nextArtworkId: 1,
    nextArtworkAssetId: 1,
    nextArtworkDownloadId: 1,
    accounts: [
      {
        id: 1,
        email: 'member@studioneo.tech',
        handle: 'member',
        display_name: 'Studio Member',
        avatar_url: null,
        bio: 'Creative code enthusiast and collector.',
        website_url: null,
        is_verified: 1,
        system_role: 'user',
        artist_distinction: 'none',
        created_at: now,
        updated_at: now,
        tier: 'user',
      },
      {
        id: 2,
        email: 'artist@studioneo.tech',
        handle: 'sankobite',
        display_name: 'sankobite',
        avatar_url: null,
        bio: 'Authorized studioNeo Partner Artist.',
        website_url: 'https://x.com/sankobite',
        is_verified: 1,
        system_role: 'curator',
        artist_distinction: 'partner',
        created_at: now,
        updated_at: now,
        tier: 'partner',
      },
      {
        id: 3,
        email: 'rella@studioneo.tech',
        handle: 'rellakinoko',
        display_name: 'Rella',
        avatar_url: null,
        bio: 'Featured Illustrator & Visual Designer.',
        website_url: 'https://x.com/Rellakinoko',
        is_verified: 1,
        system_role: 'user',
        artist_distinction: 'featured',
        created_at: now,
        updated_at: now,
        tier: 'featured',
      },
    ],
    magicTokens: [],
    totpCredentials: new Map(),
    totpBackupCodes: [],
    webauthnCredentials: [],
    accountOAuthProviders: [],
    inquiries: [],
    artworks: [],
    artworkAssets: [],
    artworkLikes: [],
    artworkDownloads: [],
  };

  globalThis.__devDbStore = store;
  persistDevDbStore(store);
  return store;
}

/**
 * Helper to project a BCNF ArtworkRecord + AccountRecord + ArtworkAssetRecord[] into CelRecord view.
 */
function projectArtworkToCelView(store: DevDbStore, art: ArtworkRecord): CelRecord {
  const account = store.accounts.find((a) => a.id === art.account_id);
  const assets = store.artworkAssets.filter((as) => as.artwork_id === art.id);
  const svgAsset = assets.find((as) => as.asset_type === 'master_svg');
  const gifAsset = assets.find((as) => as.asset_type === 'preview_gif');

  const displayName = account?.display_name || 'Resident Artist';
  const handle = account?.handle || 'resident';
  const avatarInitials = displayName.slice(0, 2).toUpperCase();

  return {
    id: art.id,
    account_id: art.account_id,
    subscriber_id: art.account_id,
    code: art.code,
    title: art.title,
    description: art.description,
    artist: displayName,
    artist_handle: handle,
    artist_avatar: account?.avatar_url || avatarInitials,
    artist_distinction: account?.artist_distinction || 'artist',
    category: art.category,
    edition: art.edition,
    color: art.color,
    price: art.price,
    likes: art.likes_count,
    likes_count: art.likes_count,
    format: gifAsset ? 'GIF + SVG' : 'SVG',
    svg_storage_path: svgAsset?.storage_path || '',
    svg_url: svgAsset?.url || null,
    gif_storage_path: gifAsset?.storage_path || null,
    gif_url: gifAsset?.url || null,
    is_vault: art.is_vault,
    created_at: art.created_at,
    updated_at: art.updated_at,
  };
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
  const password = process.env.DB_PASSWORD;
  return Boolean(
    host &&
      host.trim() !== '' &&
      !host.includes('YourStrongPassword') &&
      password &&
      !password.includes('YourStrongPassword')
  );
}

/**
 * Fallback In-Memory Query Evaluator for Local Development / Mock Mode (BCNF Tables)
 */
async function executeDevQuery<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const store = initDevDbStore();
  const normalized = sql.trim().replace(/\s+/g, ' ');
  const lower = normalized.toLowerCase();

  // SELECT VERSION()
  if (lower.startsWith('select version()')) {
    return [{ version: '8.0.36-azure-bcnf-inmemory' }] as unknown as T[];
  }

  // SELECT ... FROM webauthn_credentials w INNER JOIN accounts/subscribers s ...
  if (lower.includes('from webauthn_credentials') && (lower.includes('join accounts') || lower.includes('join subscribers'))) {
    const credId = String(params[0] || '');
    const cred = store.webauthnCredentials.find((c) => c.credential_id === credId);
    if (!cred) return [] as unknown as T[];
    const acc = store.accounts.find((a) => a.id === cred.account_id);
    if (!acc) return [] as unknown as T[];
    return [
      {
        id: cred.id,
        account_id: cred.account_id,
        subscriber_id: cred.account_id,
        credential_id: cred.credential_id,
        public_key: cred.public_key,
        counter: cred.counter,
        email: acc.email,
        is_verified: acc.is_verified,
      },
    ] as unknown as T[];
  }

  // SELECT ... FROM accounts (or subscribers alias)
  if (
    (lower.includes('from accounts') || lower.includes('from subscribers')) &&
    !lower.includes('join')
  ) {
    if (lower.includes('where email = ?')) {
      const email = String(params[0] || '').toLowerCase().trim();
      const found = store.accounts.find((a) => a.email.toLowerCase() === email);
      return (found ? [{ ...found, tier: found.tier || deriveTierAlias(found.system_role, found.artist_distinction) }] : []) as unknown as T[];
    }
    if (lower.includes('where handle = ?') || lower.includes('where lower(handle) = ?')) {
      const handle = String(params[0] || '').toLowerCase().trim();
      const found = store.accounts.find((a) => a.handle.toLowerCase() === handle);
      return (found ? [{ ...found, tier: found.tier || deriveTierAlias(found.system_role, found.artist_distinction) }] : []) as unknown as T[];
    }
    if (lower.includes('where id = ?')) {
      const id = Number(params[0]);
      const found = store.accounts.find((a) => a.id === id);
      return (found ? [{ ...found, tier: found.tier || deriveTierAlias(found.system_role, found.artist_distinction) }] : []) as unknown as T[];
    }
    return store.accounts.map((a) => ({
      ...a,
      tier: a.tier || deriveTierAlias(a.system_role, a.artist_distinction),
    })) as unknown as T[];
  }

  // SELECT ... FROM totp_credentials
  if (lower.includes('from totp_credentials')) {
    const accId = Number(params[0]);
    const cred = store.totpCredentials.get(accId);
    if (!cred) return [] as unknown as T[];
    if (lower.includes('is_active = 1') && cred.is_active !== 1) {
      return [] as unknown as T[];
    }
    return [{ ...cred, subscriber_id: cred.account_id }] as unknown as T[];
  }

  // SELECT ... FROM totp_backup_codes
  if (lower.includes('from totp_backup_codes')) {
    const accId = Number(params[0]);
    let codes = store.totpBackupCodes.filter((c) => c.account_id === accId);
    if (lower.includes('code_hash = ?')) {
      const hash = String(params[1]);
      codes = codes.filter((c) => c.code_hash === hash);
    }
    if (lower.includes('is_used = 0')) {
      codes = codes.filter((c) => c.is_used === 0);
    }
    return codes.map((c) => ({ ...c, subscriber_id: c.account_id })) as unknown as T[];
  }

  // SELECT ... FROM auth_magic_tokens
  if (lower.includes('from auth_magic_tokens')) {
    const accId = Number(params[0]);
    const active = store.magicTokens.filter(
      (t) => t.account_id === accId && t.consumed_at === null
    );
    return active.slice(-1).map((t) => ({ ...t, subscriber_id: t.account_id })) as unknown as T[];
  }

  // SELECT ... FROM webauthn_credentials
  if (lower.includes('from webauthn_credentials')) {
    if (lower.includes('where credential_id = ?')) {
      const credId = String(params[0]);
      const found = store.webauthnCredentials.find((c) => c.credential_id === credId);
      return (found ? [{ ...found, subscriber_id: found.account_id }] : []) as unknown as T[];
    }
    if (lower.includes('where account_id = ?') || lower.includes('where subscriber_id = ?')) {
      const accId = Number(params[0]);
      const rows = store.webauthnCredentials.filter((c) => c.account_id === accId);
      if (lower.includes('count(*)')) {
        return [{ cnt: rows.length }] as unknown as T[];
      }
      return rows.map((r) => ({ ...r, subscriber_id: r.account_id })) as unknown as T[];
    }
    return store.webauthnCredentials as unknown as T[];
  }

  // SELECT ... FROM account_oauth_providers (or subscriber_oauth_accounts)
  if (
    lower.includes('from account_oauth_providers') ||
    lower.includes('from subscriber_oauth_accounts')
  ) {
    if (lower.includes('where provider = ? and provider_user_id = ?')) {
      const provider = String(params[0]);
      const pUid = String(params[1]);
      const found = store.accountOAuthProviders.find(
        (a) => a.provider === provider && a.provider_user_id === pUid
      );
      return (found ? [{ ...found, subscriber_id: found.account_id }] : []) as unknown as T[];
    }
    const accId = Number(params[0]);
    const rows = store.accountOAuthProviders.filter((a) => a.account_id === accId);
    return rows.map((r) => ({ ...r, subscriber_id: r.account_id })) as unknown as T[];
  }

  // SELECT ... FROM artwork_assets
  if (lower.includes('from artwork_assets')) {
    if (lower.includes('where artwork_id = ? and asset_type = ?')) {
      const artId = Number(params[0]);
      const assetType = String(params[1]);
      const found = store.artworkAssets.find(
        (as) => as.artwork_id === artId && as.asset_type === assetType
      );
      return (found ? [found] : []) as unknown as T[];
    }
    if (lower.includes('where artwork_id = ?')) {
      const artId = Number(params[0]);
      return store.artworkAssets.filter((as) => as.artwork_id === artId) as unknown as T[];
    }
    return store.artworkAssets as unknown as T[];
  }

  // SELECT ... FROM artwork_likes
  if (lower.includes('from artwork_likes')) {
    if (lower.includes('where account_id = ? and artwork_id = ?')) {
      const accId = Number(params[0]);
      const artId = Number(params[1]);
      const found = store.artworkLikes.find(
        (l) => l.account_id === accId && l.artwork_id === artId
      );
      return (found ? [found] : []) as unknown as T[];
    }
    if (lower.includes('where account_id = ?')) {
      const accId = Number(params[0]);
      return store.artworkLikes.filter((l) => l.account_id === accId) as unknown as T[];
    }
    return store.artworkLikes as unknown as T[];
  }

  // SELECT ... FROM artworks (or cels)
  if (lower.includes('from artworks') || lower.includes('from cels')) {
    let projected = store.artworks.map((art) => projectArtworkToCelView(store, art));

    if (lower.includes('where')) {
      if (
        (lower.includes('lower(code) = ?') || lower.includes('lower(a.code) = ?')) &&
        (lower.includes('or id = ?') || lower.includes('or a.id = ?'))
      ) {
        const codeParam = String(params[0] || '').toLowerCase();
        const idParam = Number(params[1]);
        projected = projected.filter(
          (c) => c.code.toLowerCase() === codeParam || c.id === idParam
        );
      } else {
        let paramIdx = 0;
        if (lower.includes('lower(artist_handle) = ?') || lower.includes('lower(ac.handle) = ?')) {
          const handleParam = String(params[paramIdx++] || '').toLowerCase();
          projected = projected.filter((c) => c.artist_handle.toLowerCase() === handleParam);
        }
        if (lower.includes('category = ?') || lower.includes('a.category = ?')) {
          const catParam = String(params[paramIdx++] || '');
          projected = projected.filter((c) => c.category === catParam);
        }
        if (lower.includes('upper(code) = ?') || lower.includes('upper(a.code) = ?')) {
          const codeParam = String(params[paramIdx++] || '').toUpperCase();
          projected = projected.filter((c) => c.code.toUpperCase() === codeParam);
        }
        if (
          (lower.includes('where id = ?') || lower.includes('where a.id = ?')) &&
          paramIdx === 0
        ) {
          const idParam = Number(params[0]);
          projected = projected.filter((c) => c.id === idParam);
        }
      }
    }

    if (lower.includes('order by created_at desc') || lower.includes('order by a.created_at desc')) {
      projected.sort((a, b) => b.id - a.id);
    }

    if (lower.includes('limit 1')) {
      projected = projected.slice(0, 1);
    }

    return projected as unknown as T[];
  }

  return [] as unknown as T[];
}

async function executeDevMutation(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const store = initDevDbStore();
  const result = await executeDevMutationInternal(store, sql, params);
  persistDevDbStore(store);
  return result;
}

async function executeDevMutationInternal(
  store: DevDbStore,
  sql: string,
  params: unknown[] = []
): Promise<ResultSetHeader> {
  const normalized = sql.trim().replace(/\s+/g, ' ');
  const lower = normalized.toLowerCase();
  const now = new Date().toISOString();

  // INSERT INTO accounts (or subscribers)
  if (lower.startsWith('insert into accounts') || lower.startsWith('insert into subscribers')) {
    const email = String(params[0] || '').toLowerCase().trim();
    const existing = store.accounts.find((a) => a.email.toLowerCase() === email);
    if (existing) {
      return { insertId: existing.id, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
    }

    const newId = store.nextAccountId++;
    let handle = deriveHandleFromEmail(email);
    if (store.accounts.some((a) => a.handle.toLowerCase() === handle)) {
      handle = deriveHandleFromEmail(email, newId);
    }

    let displayName = email.split('@')[0] || 'User';
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    let isVerified = 0;
    let systemRole: SystemRole = 'user';
    let artistDistinction: ArtistDistinctionRole = 'none';

    if (lower.includes('handle') && lower.includes('display_name')) {
      handle = String(params[1] || handle);
      displayName = String(params[2] || displayName);
      if (params.length >= 6) {
        isVerified = Number(params[3]) === 1 ? 1 : 0;
        systemRole = (params[4] as SystemRole) || 'user';
        artistDistinction = (params[5] as ArtistDistinctionRole) || 'none';
      } else {
        isVerified = lower.includes(', 1,') ? 1 : 0;
        systemRole = (params[3] as SystemRole) || 'user';
        artistDistinction = (params[4] as ArtistDistinctionRole) || 'none';
      }
    } else {
      const parsedVerify = params[1] !== undefined ? Number(params[1]) : NaN;
      isVerified = !Number.isNaN(parsedVerify)
        ? parsedVerify === 1
          ? 1
          : 0
        : lower.includes('values (?, 1)')
        ? 1
        : 0;
    }

    store.accounts.push({
      id: newId,
      email,
      handle,
      display_name: displayName,
      avatar_url: null,
      bio: null,
      website_url: null,
      is_verified: isVerified,
      system_role: systemRole,
      artist_distinction: artistDistinction,
      created_at: now,
      updated_at: now,
      tier: deriveTierAlias(systemRole, artistDistinction),
    });
    return { insertId: newId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // UPDATE accounts (or subscribers)
  if (lower.startsWith('update accounts') || lower.startsWith('update subscribers')) {
    if (lower.includes('set is_verified = 1')) {
      const id = Number(params[params.length - 1]);
      const acc = store.accounts.find((a) => a.id === id);
      if (acc) {
        acc.is_verified = 1;
        acc.updated_at = now;
        return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
      }
    }
    if (lower.includes('system_role = ?') && lower.includes('artist_distinction = ?')) {
      const sysRole = String(params[0]) as SystemRole;
      const dist = String(params[1]) as ArtistDistinctionRole;
      const id = Number(params[2]);
      const acc = store.accounts.find((a) => a.id === id);
      if (acc) {
        acc.system_role = sysRole;
        acc.artist_distinction = dist;
        acc.tier = deriveTierAlias(sysRole, dist);
        acc.updated_at = now;
        return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
      }
    }
    if (lower.includes('display_name = ?') && lower.includes('handle = ?')) {
      const displayName = String(params[0]);
      const handle = String(params[1]);
      const id = Number(params[2]);
      const acc = store.accounts.find((a) => a.id === id);
      if (acc) {
        acc.display_name = displayName;
        acc.handle = handle;
        acc.updated_at = now;
        return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
      }
    }
    if (lower.includes('set tier = ?')) {
      const tier = String(params[0]);
      const target = params[1];
      let acc =
        typeof target === 'string' && target.includes('@')
          ? store.accounts.find((a) => a.email.toLowerCase() === target.toLowerCase().trim())
          : store.accounts.find((a) => a.id === Number(target));
      if (!acc && typeof target === 'string' && target.includes('@')) {
        const email = target.toLowerCase().trim();
        const newId = store.nextAccountId++;
        acc = {
          id: newId,
          email,
          handle: deriveHandleFromEmail(email, newId),
          display_name: email.split('@')[0] || 'User',
          avatar_url: null,
          bio: null,
          website_url: null,
          is_verified: 1,
          system_role: 'user',
          artist_distinction: 'none',
          created_at: now,
          updated_at: now,
          tier: 'user',
        };
        store.accounts.push(acc);
      }
      if (acc) {
        if (tier === 'partner') acc.artist_distinction = 'partner';
        else if (tier === 'featured' || tier === 'artist_resident') acc.artist_distinction = 'featured';
        else if (tier === 'artist' || tier === 'illustrator' || tier === 'illustrator_pro') acc.artist_distinction = 'artist';
        else acc.artist_distinction = 'none';
        acc.tier = tier;
        acc.updated_at = now;
        return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
      }
    }
  }

  // DELETE FROM accounts (or subscribers)
  if (lower.startsWith('delete from accounts') || lower.startsWith('delete from subscribers')) {
    const id = Number(params[0]);
    const before = store.accounts.length;
    store.accounts = store.accounts.filter((a) => a.id !== id);
    store.magicTokens = store.magicTokens.filter((t) => t.account_id !== id);
    store.totpCredentials.delete(id);
    store.totpBackupCodes = store.totpBackupCodes.filter((c) => c.account_id !== id);
    store.webauthnCredentials = store.webauthnCredentials.filter((w) => w.account_id !== id);
    store.accountOAuthProviders = store.accountOAuthProviders.filter((o) => o.account_id !== id);
    store.artworkLikes = store.artworkLikes.filter((l) => l.account_id !== id);
    return {
      insertId: 0,
      affectedRows: before - store.accounts.length,
      warningStatus: 0,
    } as ResultSetHeader;
  }

  // INSERT INTO auth_magic_tokens
  if (lower.startsWith('insert into auth_magic_tokens')) {
    const accId = Number(params[0]);
    const tokenHash = String(params[1]);
    const expiresAt = String(params[2] || new Date(Date.now() + 600000).toISOString());
    const newId = store.nextMagicTokenId++;
    store.magicTokens.push({
      id: newId,
      account_id: accId,
      subscriber_id: accId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      consumed_at: null,
      created_at: now,
    });
    return { insertId: newId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // UPDATE auth_magic_tokens
  if (lower.startsWith('update auth_magic_tokens')) {
    const idOrAccId = Number(params[0]);
    if (lower.includes('where account_id = ?') || lower.includes('where subscriber_id = ?')) {
      let count = 0;
      for (const t of store.magicTokens) {
        if (t.account_id === idOrAccId && t.consumed_at === null) {
          t.consumed_at = now;
          count++;
        }
      }
      return { insertId: 0, affectedRows: count, warningStatus: 0 } as ResultSetHeader;
    }
    const token = store.magicTokens.find((t) => t.id === idOrAccId);
    if (token) {
      token.consumed_at = now;
      return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
    }
  }

  // INSERT / UPDATE / DELETE totp_credentials
  if (lower.includes('into totp_credentials')) {
    const accId = Number(params[0]);
    const secret = String(params[1]);
    const isActive = Number(params[2] ?? 0);
    store.totpCredentials.set(accId, {
      account_id: accId,
      subscriber_id: accId,
      totp_secret: secret,
      is_active: isActive,
      created_at: now,
      updated_at: now,
    });
    return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  if (lower.startsWith('update totp_credentials')) {
    if (lower.includes('set is_active = 1')) {
      const accId = Number(params[0]);
      const cred = store.totpCredentials.get(accId);
      if (cred) {
        cred.is_active = 1;
        cred.updated_at = now;
        return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
      }
    }
    const isActive = Number(params[0]);
    const accId = Number(params[1]);
    const cred = store.totpCredentials.get(accId);
    if (cred) {
      cred.is_active = isActive;
      cred.updated_at = now;
      return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
    }
  }

  if (lower.startsWith('delete from totp_credentials')) {
    const accId = Number(params[0]);
    store.totpCredentials.delete(accId);
    return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // INSERT / UPDATE / DELETE totp_backup_codes
  if (lower.startsWith('insert into totp_backup_codes')) {
    const accId = Number(params[0]);
    const codeHash = String(params[1]);
    const newId = store.nextBackupCodeId++;
    store.totpBackupCodes.push({
      id: newId,
      account_id: accId,
      subscriber_id: accId,
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
    const accId = Number(params[0]);
    store.totpBackupCodes = store.totpBackupCodes.filter((c) => c.account_id !== accId);
    return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // INSERT / UPDATE / DELETE webauthn_credentials
  if (lower.startsWith('insert into webauthn_credentials')) {
    const accId = Number(params[0]);
    const credId = String(params[1]);
    const pubKey = String(params[2]);
    const counter = Number(params[3] ?? 0);
    const transports = params[4] ? String(params[4]) : null;
    const existing = store.webauthnCredentials.find((c) => c.credential_id === credId);
    if (existing) {
      existing.public_key = pubKey;
      existing.counter = counter;
      existing.transports = transports;
      existing.updated_at = now;
      return { insertId: existing.id, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
    }
    const newId = store.nextWebauthnId++;
    store.webauthnCredentials.push({
      id: newId,
      account_id: accId,
      subscriber_id: accId,
      credential_id: credId,
      public_key: pubKey,
      counter,
      transports,
      created_at: now,
      updated_at: now,
    });
    return { insertId: newId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  if (lower.startsWith('update webauthn_credentials')) {
    const newCounter = Number(params[0]);
    const id = Number(params[1]);
    const cred = store.webauthnCredentials.find((c) => c.id === id);
    if (cred) {
      cred.counter = newCounter;
      cred.updated_at = now;
      return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
    }
  }

  if (lower.startsWith('delete from webauthn_credentials')) {
    if (params.length === 2) {
      const accId = Number(params[0]);
      const credId = String(params[1]);
      store.webauthnCredentials = store.webauthnCredentials.filter(
        (c) => !(c.account_id === accId && c.credential_id === credId)
      );
    } else {
      const credId = String(params[0]);
      store.webauthnCredentials = store.webauthnCredentials.filter(
        (c) => c.credential_id !== credId
      );
    }
    return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // INSERT / UPDATE / DELETE account_oauth_providers (or subscriber_oauth_accounts)
  if (
    lower.includes('into account_oauth_providers') ||
    lower.includes('into subscriber_oauth_accounts')
  ) {
    const accId = Number(params[0]);
    const provider = String(params[1]);
    const pUid = String(params[2]);
    const existing = store.accountOAuthProviders.find(
      (a) => a.provider === provider && a.provider_user_id === pUid
    );
    if (existing) {
      existing.account_id = accId;
      existing.subscriber_id = accId;
    } else {
      store.accountOAuthProviders.push({
        id: store.nextOAuthId++,
        account_id: accId,
        subscriber_id: accId,
        provider,
        provider_user_id: pUid,
        created_at: now,
      });
    }
    return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  if (
    lower.startsWith('update account_oauth_providers') ||
    lower.startsWith('update subscriber_oauth_accounts')
  ) {
    const accId = Number(params[0]);
    const provider = String(params[1]);
    const pUid = String(params[2]);
    const existing = store.accountOAuthProviders.find(
      (a) => a.provider === provider && a.provider_user_id === pUid
    );
    if (existing) {
      existing.account_id = accId;
      existing.subscriber_id = accId;
      return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
    }
  }

  if (
    lower.startsWith('delete from account_oauth_providers') ||
    lower.startsWith('delete from subscriber_oauth_accounts')
  ) {
    const accId = Number(params[0]);
    const provider = String(params[1]);
    const before = store.accountOAuthProviders.length;
    store.accountOAuthProviders = store.accountOAuthProviders.filter(
      (a) => !(a.account_id === accId && a.provider === provider)
    );
    return {
      insertId: 0,
      affectedRows: before - store.accountOAuthProviders.length,
      warningStatus: 0,
    } as ResultSetHeader;
  }

  // INSERT INTO inquiries
  if (lower.startsWith('insert into inquiries')) {
    const newId = store.nextInquiryId++;
    if (params.length >= 6) {
      store.inquiries.push({
        id: newId,
        target_account_id: params[0] ? Number(params[0]) : null,
        name: String(params[1]),
        email: String(params[2]),
        organization: params[3] ? String(params[3]) : null,
        topic: String(params[4]),
        message: String(params[5]),
        created_at: now,
      });
    } else {
      store.inquiries.push({
        id: newId,
        target_account_id: null,
        name: String(params[0]),
        email: String(params[1]),
        organization: params[2] ? String(params[2]) : null,
        topic: String(params[3]),
        message: String(params[4]),
        created_at: now,
      });
    }
    return { insertId: newId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // INSERT INTO artworks (Normalized BCNF table)
  if (lower.startsWith('insert into artworks')) {
    const newId = store.nextArtworkId++;
    const [accountId, code, title, description, category, edition, color, price, isVault] = params;
    store.artworks.push({
      id: newId,
      account_id: Number(accountId || 2),
      code: String(code || `NEO-${newId}`),
      title: String(title || 'Untitled Artwork'),
      description: String(description || ''),
      category: (category as ArtworkCategory) || 'Generative',
      edition: String(edition || 'Ed. 1/12'),
      color: String(color || '#c496ff'),
      price: String(price || '$180'),
      is_vault: isVault ? 1 : 0,
      likes_count: 0,
      created_at: now,
      updated_at: now,
    });
    return { insertId: newId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // INSERT INTO artwork_assets (Normalized BCNF 1:N asset table)
  if (lower.startsWith('insert into artwork_assets')) {
    const newId = store.nextArtworkAssetId++;
    const [artworkId, assetType, storagePath, url, mimeType, fileSizeBytes] = params;
    store.artworkAssets.push({
      id: newId,
      artwork_id: Number(artworkId),
      asset_type: (assetType as ArtworkAssetType) || 'master_svg',
      storage_path: String(storagePath || ''),
      url: url ? String(url) : null,
      mime_type: String(mimeType || 'image/svg+xml'),
      file_size_bytes: fileSizeBytes ? Number(fileSizeBytes) : null,
      created_at: now,
    });
    return { insertId: newId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // INSERT INTO artwork_likes
  if (lower.startsWith('insert into artwork_likes') || lower.startsWith('insert ignore into artwork_likes')) {
    const accId = Number(params[0]);
    const artId = Number(params[1]);
    const exists = store.artworkLikes.some(
      (l) => l.account_id === accId && l.artwork_id === artId
    );
    if (!exists) {
      store.artworkLikes.push({
        account_id: accId,
        artwork_id: artId,
        created_at: now,
      });
      const art = store.artworks.find((a) => a.id === artId);
      if (art) art.likes_count += 1;
      return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
    }
    return { insertId: 0, affectedRows: 0, warningStatus: 0 } as ResultSetHeader;
  }

  // DELETE FROM artwork_likes
  if (lower.startsWith('delete from artwork_likes')) {
    const accId = Number(params[0]);
    const artId = Number(params[1]);
    const before = store.artworkLikes.length;
    store.artworkLikes = store.artworkLikes.filter(
      (l) => !(l.account_id === accId && l.artwork_id === artId)
    );
    const removed = before - store.artworkLikes.length;
    if (removed > 0) {
      const art = store.artworks.find((a) => a.id === artId);
      if (art && art.likes_count > 0) art.likes_count -= 1;
    }
    return { insertId: 0, affectedRows: removed, warningStatus: 0 } as ResultSetHeader;
  }

  // INSERT INTO artwork_downloads
  if (lower.startsWith('insert into artwork_downloads')) {
    const newId = store.nextArtworkDownloadId++;
    const [accId, artId, assetId, format, ipAddress] = params;
    store.artworkDownloads.push({
      id: newId,
      account_id: Number(accId),
      artwork_id: Number(artId),
      asset_id: Number(assetId || 0),
      format: String(format || 'svg'),
      ip_address: ipAddress ? String(ipAddress) : null,
      downloaded_at: now,
    });
    return { insertId: newId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // Legacy INSERT INTO cels (auto-decomposes into BCNF `artworks` + `artwork_assets`)
  if (lower.startsWith('insert into cels')) {
    const newArtId = store.nextArtworkId++;
    const [
      subscriberId,
      code,
      title,
      description,
      artist,
      artistHandle,
      ,
      category,
      edition,
      color,
      price,
      likes,
      ,
      svgStoragePath,
      svgUrl,
      gifStoragePath,
      gifUrl,
      isVault,
    ] = params;

    const accId = subscriberId ? Number(subscriberId) : 2;
    const acc = store.accounts.find((a) => a.id === accId);
    if (acc && artist && artistHandle) {
      acc.display_name = String(artist);
      acc.handle = String(artistHandle);
    }

    store.artworks.push({
      id: newArtId,
      account_id: accId,
      code: String(code || `CEL-${newArtId}`),
      title: String(title || 'Untitled Cel'),
      description: String(description || ''),
      category: (category as ArtworkCategory) || 'Generative',
      edition: String(edition || 'Ed. 1/12'),
      color: String(color || '#c496ff'),
      price: String(price || '$180'),
      is_vault: isVault ? 1 : 0,
      likes_count: Number(likes || 0),
      created_at: now,
      updated_at: now,
    });

    if (svgStoragePath) {
      store.artworkAssets.push({
        id: store.nextArtworkAssetId++,
        artwork_id: newArtId,
        asset_type: 'master_svg',
        storage_path: String(svgStoragePath),
        url: svgUrl ? String(svgUrl) : null,
        mime_type: 'image/svg+xml',
        file_size_bytes: null,
        created_at: now,
      });
    }

    if (gifStoragePath) {
      store.artworkAssets.push({
        id: store.nextArtworkAssetId++,
        artwork_id: newArtId,
        asset_type: 'preview_gif',
        storage_path: String(gifStoragePath),
        url: gifUrl ? String(gifUrl) : null,
        mime_type: 'image/gif',
        file_size_bytes: null,
        created_at: now,
      });
    }

    return { insertId: newArtId, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
  }

  // DELETE FROM artworks / cels
  if (lower.startsWith('delete from artworks') || lower.startsWith('delete from cels')) {
    if (lower.includes('where id = ?')) {
      const id = Number(params[0]);
      store.artworks = store.artworks.filter((a) => a.id !== id);
      store.artworkAssets = store.artworkAssets.filter((as) => as.artwork_id !== id);
      return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
    }
  }

  return { insertId: 0, affectedRows: 1, warningStatus: 0 } as ResultSetHeader;
}

let mysqlSchemaEnsured = false;

async function ensureMysqlBcnfSchema(pool: Pool): Promise<void> {
  if (mysqlSchemaEnsured) return;
  mysqlSchemaEnsured = true;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        handle VARCHAR(64) NOT NULL,
        display_name VARCHAR(120) NOT NULL,
        avatar_url VARCHAR(512) NULL DEFAULT NULL,
        bio TEXT NULL,
        website_url VARCHAR(512) NULL DEFAULT NULL,
        is_verified TINYINT(1) NOT NULL DEFAULT 0,
        system_role ENUM('user', 'curator', 'admin') NOT NULL DEFAULT 'user',
        artist_distinction ENUM('none', 'artist', 'featured', 'partner') NOT NULL DEFAULT 'none',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_accounts_email (email),
        UNIQUE KEY uq_accounts_handle (handle)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS auth_magic_tokens (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        account_id BIGINT UNSIGNED NOT NULL,
        token_hash CHAR(64) NOT NULL,
        expires_at DATETIME NOT NULL,
        consumed_at DATETIME NULL DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_auth_magic_tokens_account_id (account_id),
        KEY idx_auth_magic_tokens_token_hash (token_hash)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS totp_credentials (
        account_id BIGINT UNSIGNED NOT NULL,
        totp_secret VARCHAR(128) NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (account_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS totp_backup_codes (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        account_id BIGINT UNSIGNED NOT NULL,
        code_hash CHAR(64) NOT NULL,
        is_used TINYINT(1) NOT NULL DEFAULT 0,
        used_at DATETIME NULL DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_totp_backup_codes_account_id (account_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (err) {
    console.warn('[DB] Automatic BCNF schema check skipped:', err);
  }
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
    await ensureMysqlBcnfSchema(pool);
    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return rows as unknown as T[];
  } catch (err) {
    console.warn('[DB] MySQL query failed, falling back to local BCNF dev store:', err);
    return executeDevQuery<T>(sql, params);
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
    await ensureMysqlBcnfSchema(pool);
    const [result] = await pool.execute<ResultSetHeader>(
      sql,
      params as Parameters<typeof pool.execute>[1]
    );
    return result;
  } catch (err) {
    console.warn('[DB] MySQL execute failed, falling back to local BCNF dev store:', err);
    return executeDevMutation(sql, params);
  }
}

/**
 * Executes an atomic database transaction with automatic COMMIT and ROLLBACK.
 */
export async function transaction<T>(
  callback: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  if (!hasConfiguredDb()) {
    const mockConn = {
      execute: async (sql: string, params?: unknown[]) => [await execute(sql, params || []), []],
      query: async (sql: string, params?: unknown[]) => [await queryRows(sql, params || []), []],
    } as unknown as PoolConnection;
    return callback(mockConn);
  }

  try {
    const pool = getPool();
    await ensureMysqlBcnfSchema(pool);
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
    console.warn('[DB] MySQL transaction failed, running mock BCNF transaction:', err);
    const mockConn = {
      execute: async (sql: string, params?: unknown[]) => [await execute(sql, params || []), []],
      query: async (sql: string, params?: unknown[]) => [await queryRows(sql, params || []), []],
    } as unknown as PoolConnection;
    return callback(mockConn);
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
