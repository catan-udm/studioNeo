import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDirs = [
  path.resolve('public/docs-screenshots'),
  path.resolve('docs-screenshots'),
  '/home/sankobite/.gemini/antigravity/brain/ea475739-b6d7-4f8d-91bb-6cf5c9bdcd31/docs-screenshots'
];

outDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const diagrams = [
  {
    name: '01-problem-statement-bottlenecks.png',
    title: 'Core System Bottlenecks',
    code: `flowchart TD
    subgraph Bottlenecks["Core System Bottlenecks"]
        B1["<b>1. Password Fatigue & Account Hijacking</b><br/>Phishing, credential reuse, and cumbersome reset loops"]
        B2["<b>2. Asset Piracy & Hotlinking</b><br/>Static URLs exposed to scrapers and unauthorized distribution"]
        B3["<b>3. Heavy Raster Media Bloat</b><br/>MP4/WebM loops causing CPU throttling, high latency, & battery drain"]
        B4["<b>4. Inflexible Navigation & Inaccessibility</b><br/>Screen readers blocked; rigid, unresponsive menus"]
    end
    style Bottlenecks fill:#f8fafc,stroke:#3b82f6,stroke-width:2px;
    style B1 fill:#ffffff,stroke:#cbd5e1,stroke-width:1.5px;
    style B2 fill:#ffffff,stroke:#cbd5e1,stroke-width:1.5px;
    style B3 fill:#ffffff,stroke:#cbd5e1,stroke-width:1.5px;
    style B4 fill:#ffffff,stroke:#cbd5e1,stroke-width:1.5px;`
  },
  {
    name: '02-functional-requirements-architecture.png',
    title: 'Functional Requirements Architecture',
    code: `flowchart LR
    FR1["<b>FR1: Passkey Auth</b><br/>WebAuthn Level 3"] --> FR2["<b>FR2: Fallback OTP/TOTP</b><br/>6-Digit ACS Codes"]
    FR1 --> FR3["<b>FR3: OAuth 2.0 PKCE</b><br/>Google & Microsoft"]
    FR1 --> SESS["<b>Session Controller</b><br/>HMAC-SHA256 Token"]
    SESS --> FR4["<b>FR4: Curated Feed</b><br/>Partner & Featured Streams"]
    SESS --> FR5["<b>FR5: Profile Rail</b><br/>Cryptographic Health Desk"]
    SESS --> FR6["<b>FR6: Asset Vault</b><br/>Multi-Format Cels"]
    FR6 --> FR7["<b>FR7: SAS Cloud Token</b><br/>15-Min Azure Blob URL"]
    SESS --> FR8["<b>FR8: PWA Offline</b><br/>Service Worker Cache"]
    style SESS fill:#eff6ff,stroke:#2563eb,stroke-width:2px;`
  },
  {
    name: '03-cryptographic-defense-in-depth.png',
    title: 'Cryptographic Defense-in-Depth',
    code: `flowchart LR
    A["<b>Hardware Authenticator</b><br/>(Touch ID / Face ID / YubiKey)"] -->|WebAuthn Level 3| B["<b>Client Transport</b><br/>(TLS 1.3 / Strict HSTS)"]
    B -->|Signed Cookies| C["<b>Session Guardian</b><br/>(HMAC-SHA256 HttpOnly)"]
    C -->|Keepalive Connection Pool| D["<b>Azure MySQL Flexible Server</b><br/>(100% BCNF Architecture)"]
    D -->|HMAC-SHA256 Token| E["<b>Azure Blob Storage</b><br/>(15-Min Ephemeral SAS)"]
    style A fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px;
    style B fill:#f8fafc,stroke:#64748b,stroke-width:1.5px;
    style C fill:#fef3c7,stroke:#d97706,stroke-width:1.5px;
    style D fill:#ede9fe,stroke:#7c3aed,stroke-width:1.5px;
    style E fill:#e0f2fe,stroke:#0284c7,stroke-width:1.5px;`
  },
  {
    name: '04-database-relational-bcnf-erd.png',
    title: 'Azure MySQL Flexible Server 100% BCNF Relational Model',
    code: `erDiagram
    ACCOUNTS ||--o{ AUTH_MAGIC_TOKENS : "generates"
    ACCOUNTS ||--o| TOTP_CREDENTIALS : "secures"
    ACCOUNTS ||--o{ TOTP_BACKUP_CODES : "holds"
    ACCOUNTS ||--o{ WEBAUTHN_CREDENTIALS : "registers"
    ACCOUNTS ||--o{ ACCOUNT_OAUTH_PROVIDERS : "links"
    ACCOUNTS ||--o{ ARTWORKS : "publishes"
    ACCOUNTS ||--o{ ARTWORK_LIKES : "submits"
    ACCOUNTS ||--o{ ARTWORK_DOWNLOADS : "audits"
    ACCOUNTS ||--o{ INQUIRIES : "receives"
    ARTWORKS ||--|{ ARTWORK_ASSETS : "contains"
    ARTWORKS ||--o{ ARTWORK_LIKES : "accumulates"
    ARTWORKS ||--o{ ARTWORK_DOWNLOADS : "tracks"
    ARTWORK_ASSETS ||--o{ ARTWORK_DOWNLOADS : "serves"

    ACCOUNTS {
        bigint id PK
        varchar email UK
        varchar handle UK
        varchar display_name
        text avatar_url
        enum system_role
        enum artist_distinction
        timestamp created_at
    }

    AUTH_MAGIC_TOKENS {
        bigint id PK
        bigint account_id FK
        varchar token_hash UK
        timestamp expires_at
        timestamp consumed_at
    }

    WEBAUTHN_CREDENTIALS {
        bigint id PK
        bigint account_id FK
        varchar credential_id UK
        text public_key
        bigint counter
        varchar transports
    }

    TOTP_CREDENTIALS {
        bigint account_id PK
        varchar totp_secret
        boolean is_active
    }

    TOTP_BACKUP_CODES {
        bigint id PK
        bigint account_id FK
        varchar code_hash
        boolean is_used
    }

    ACCOUNT_OAUTH_PROVIDERS {
        bigint id PK
        bigint account_id FK
        varchar provider
        varchar provider_user_id
    }

    ARTWORKS {
        bigint id PK
        bigint account_id FK
        varchar code UK
        varchar title
        enum category
        varchar edition
        int likes_count
        boolean is_vault
    }

    ARTWORK_ASSETS {
        bigint id PK
        bigint artwork_id FK
        enum asset_type
        varchar storage_path
        text url
        varchar mime_type
        bigint file_size_bytes
    }

    ARTWORK_LIKES {
        bigint account_id PK
        bigint artwork_id PK
        timestamp created_at
    }

    ARTWORK_DOWNLOADS {
        bigint id PK
        bigint account_id FK
        bigint artwork_id FK
        bigint asset_id FK
        varchar format
        varchar ip_address
        timestamp downloaded_at
    }

    INQUIRIES {
        bigint id PK
        bigint target_account_id FK
        varchar name
        varchar email
        varchar topic
        text message
        timestamp created_at
    }`
  },
  {
    name: '05-scenario1-passkey-sequence.png',
    title: 'Scenario 1: Biometric Passkey Ceremony Sequence',
    code: `sequenceDiagram
    autonumber
    actor User as Marcus (User)
    participant Client as Browser (AuthSlider)
    participant Server as Next.js API (/api/auth)
    participant HW as Hardware Authenticator (Touch ID)
    participant DB as MySQL Flexible Server

    User->>Client: Navigates to bikko.studio, clicks "Sign In"
    Client->>Client: Displays AuthSlider dialog with Passkey selected
    User->>Client: Clicks "Sign In with Biometrics"
    Client->>Server: POST /api/auth/passkey/login-options
    Server->>Client: Returns WebAuthn Challenge + RP Options
    Client->>HW: Calls navigator.credentials.get({publicKey})
    HW-->>User: Prompts for Touch ID biometric fingerprint
    User->>HW: Places finger on sensor
    HW-->>Client: Returns cryptographic assertion signature
    Client->>Server: POST /api/auth/passkey/login-verify
    Server->>DB: Validates public key, signature & sign counter
    Server-->>Client: Sets HttpOnly secure session cookie
    Client->>Client: Morph transition to Authenticated Instagram Feed`
  },
  {
    name: '06-scenario2-mobile-feed-storyboard.png',
    title: 'Scenario 2: Mobile Feed & Story Interaction Flow',
    code: `flowchart TD
    S1["<b>Step 1: Feed Entry</b><br/>Illuminated Story ring around artist @tamimoon avatar"] --> S2["<b>Step 2: Story Open</b><br/>Fullscreen SVG modal displays with 5.0s timer bar"]
    S2 --> S3["<b>Step 3: Like Burst</b><br/>Double-tap on canvas fires CSS floating heart burst"]
    S3 --> S4["<b>Step 4: Filter Selection</b><br/>Taps 'Partners' pill to filter verified creators"]
    S4 --> S5["<b>Step 5: Profile Rail</b><br/>Left sidebar displays 2 bound passkeys and active TOTP"]
    S5 --> S6["<b>Step 6: Dock Auto-Hide</b><br/>Bottom island docks/reveals smoothly with scroll"]
    style S1 fill:#f5f3ff,stroke:#8b5cf6,stroke-width:1.5px;
    style S2 fill:#eff6ff,stroke:#3b82f6,stroke-width:1.5px;
    style S3 fill:#fdf2f8,stroke:#ec4899,stroke-width:1.5px;
    style S4 fill:#f0fdf4,stroke:#10b981,stroke-width:1.5px;
    style S5 fill:#fffbeb,stroke:#f59e0b,stroke-width:1.5px;
    style S6 fill:#f8fafc,stroke:#64748b,stroke-width:1.5px;`
  },
  {
    name: '07-scenario3-asset-discovery-storyboard.png',
    title: 'Scenario 3: Secure Asset Discovery & Time-Gated Download',
    code: `flowchart LR
    E1["<b>1. Gallery Inspect</b><br/>Erika selects Kinetic Cel 04"] --> E2["<b>2. Select Format</b><br/>Chooses 4K Transparent PNG"]
    E2 --> E3["<b>3. Entitlement Query</b><br/>Server validates active tier in MySQL"]
    E3 --> E4["<b>4. Client Rasterize</b><br/>Browser renders SVG to Canvas 2D"]
    E4 --> E5["<b>5. SAS Generation</b><br/>Azure Storage issues 15-min token"]
    E5 --> E6["<b>6. Browser Save</b><br/>Immediate direct file download"]
    style E1 fill:#f8fafc,stroke:#94a3b8,stroke-width:1.5px;
    style E2 fill:#eff6ff,stroke:#3b82f6,stroke-width:1.5px;
    style E3 fill:#fef3c7,stroke:#d97706,stroke-width:1.5px;
    style E4 fill:#f3e8ff,stroke:#a855f7,stroke-width:1.5px;
    style E5 fill:#e0f2fe,stroke:#0284c7,stroke-width:1.5px;
    style E6 fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px;`
  },
  {
    name: '08-scenario4-accessibility-oled-storyboard.png',
    title: 'Scenario 4: Keyboard Accessibility & OLED High-Contrast Journey',
    code: `flowchart LR
    G1["<b>1. Tab: Skip Link</b><br/>Hidden button appears on Tab key"] --> G2["<b>2. Settings Access</b><br/>Moves focus to Theme modal trigger"]
    G2 --> G3["<b>3. OLED Selection</b><br/>Selects 21:1 OLED pure black"]
    G3 --> G4["<b>4. Accessible Feed</b><br/>ARIA tags and high-contrast rings"]
    G4 --> G5["<b>5. Live Spoken Audio</b><br/>NVDA announces post data"]
    G5 --> G6["<b>6. Vestibular Relief</b><br/>System detects reduced motion"]
    style G1 fill:#f8fafc,stroke:#64748b,stroke-width:1.5px;
    style G2 fill:#eff6ff,stroke:#2563eb,stroke-width:1.5px;
    style G3 fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#ffffff;
    style G4 fill:#f1f5f9,stroke:#475569,stroke-width:1.5px;
    style G5 fill:#fef3c7,stroke:#d97706,stroke-width:1.5px;
    style G6 fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px;`
  },
  {
    name: '09-pwa-service-worker-caching.png',
    title: 'PWA Service Worker Runtime Caching Architecture',
    code: `flowchart TD
    Req["<b>Browser HTTP Request</b>"] --> SW{"<b>Service Worker</b><br/>Fetch Interceptor"}
    SW -->|Cache Hit| Hit["<b>Return Stored Asset</b><br/>(Fonts, SVG, CSS, Icons)"]
    SW -->|Cache Miss / Network First| Net{"<b>Cloud Origin</b><br/>(Azure CDN / API)"}
    Net -->|Network Success| Fresh["<b>Update Cache & Render Fresh Content</b>"]
    Net -->|Network Failure / Offline| Off["<b>Return Cached App Shell &</b><br/>Display Non-Blocking Offline Toast"]
    style Req fill:#eff6ff,stroke:#3b82f6,stroke-width:1.5px;
    style SW fill:#ede9fe,stroke:#7c3aed,stroke-width:2px;
    style Hit fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px;
    style Net fill:#fef3c7,stroke:#d97706,stroke-width:2px;
    style Fresh fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px;
    style Off fill:#fee2e2,stroke:#dc2626,stroke-width:1.5px;`
  }
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2800, height: 2000, deviceScaleFactor: 2.5 });

  await page.goto('file:///tmp/mermaid_runner.html', { waitUntil: 'load' });

  for (let i = 0; i < diagrams.length; i++) {
    const d = diagrams[i];
    console.log(`Rendering [${i + 1}/${diagrams.length}] ${d.name}...`);

    await page.evaluate(async (title, code) => {
      await window.renderMermaid(title, code);
    }, d.title, d.code);

    await new Promise(r => setTimeout(r, 400));

    const element = await page.$('#wrapper');
    if (!element) {
      console.error(`Could not find wrapper for ${d.name}`);
      continue;
    }

    const tempFile = path.resolve('public/docs-screenshots', d.name);
    await element.screenshot({ path: tempFile, type: 'png' });

    for (const dir of outDirs) {
      const target = path.join(dir, d.name);
      if (target !== tempFile) {
        fs.copyFileSync(tempFile, target);
      }
    }

    const size = fs.statSync(tempFile).size;
    console.log(`Saved ${d.name} (${Math.round(size / 1024)} KB)`);
  }

  await browser.close();
  console.log('All 9 Mermaid diagrams successfully rendered to high-resolution PNGs!');
}

run().catch(err => {
  console.error('Render error:', err);
  process.exit(1);
});
