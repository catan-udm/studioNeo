# studioNeo

An enterprise-grade, high-performance Next.js (App Router) creative studio platform featuring dynamic liquid glass navigation, an expansive digital illustrator tribute archive, creator upload studio, store with simulated monetization, and a passwordless/multi-factor authentication stack (Passkeys/WebAuthn, Email OTP, TOTP 2FA, Google & Microsoft OAuth).

> **Academic & Demonstration Project.** All products, memberships, and payments are **mock**. Stripe runs in simulated mode only; no real payments are processed.

---

## ✨ Features

### 💧 Liquid Glass Dynamic Island Navigation (1:1 Warp Fix)
- **Mathematical SDF Refraction:** Per-island local Signed Distance Function (SDF) generating 8-bit sRGB displacement normal maps with smoothstep lens meniscuses.
- **Isolated Floating Islands:** Refraction warps apply strictly to individual floating bubbles (`.studio-nav-left`, `.studio-nav-slider`, `.nav-burger-bubble`, and `.nav-burger-popover`) rather than warping the full header.
- **Dual-Engine Glass Pipeline:**
  - **Blink/WebKit:** Hardware-accelerated `backdrop-filter: url(#id)` displacement.
  - **Gecko/Firefox:** Real-time `-moz-element(#main-content)` lens tracking scroll position and route transitions.
- **SSR & React 19 Hydration Safe:** Neutral initial refraction specification eliminating hydration mismatch warnings between server HTML and client virtual DOM.
- **Smart Responsive Layout:** Sliding navigation indicator pill, desktop action bar, and floating mobile drawer menu.

### 🎨 Illustrator Tribute Archive & Studio Showcase
- **64 Curated Artists:** Comprehensive directory of digital illustrators with biographies, art styles, tag filters, external portfolio links, and tribute features (including Rella, Dinoillus, Sankobite, KDA Comeback).
- **Interactive Gallery & Filtering:** Instant search and category-based filtering across illustration, concept art, character design, and 3D modeling.
- **Project Spotlights:** Rich visual case studies and artist collaboration highlights.

### 🛍️ Creator Store & Membership
- **Digital Asset Store (`/store`):** Digital print collections, brush packs, and design assets.
- **Membership Tiers (`/membership`):** Tiered subscription models with automated mock fulfillment.
- **Zero-Friction Checkout:** Safe simulated checkout environment without third-party payment risk.

### 🛡️ Authentication & Security Stack
- **Passkeys / WebAuthn:** FIDO2 biometric and hardware security key authentication powered by `@simplewebauthn`.
- **Passwordless Email OTP:** One-Time Password login delivered via Azure Communication Services (with server console fallback for local development).
- **Time-Based One-Time Passwords (TOTP):** Dual-factor authenticator app enrollment and verification.
- **OAuth 2.0 Providers:** Direct social sign-in integration with Google and Microsoft identity platforms.
- **Form Abuse Protection:** Client-less protection on `/api/contact` featuring hidden honeypots, minimum time-to-submit verification (3s), and per-IP rate limiting (5 submissions per 10 minutes).

### 🚀 Creator Upload Studio & Storage
- **Media Upload Studio (`/studio/upload`):** Creative submission pipeline with tag management, title/description authoring, and licensing options.
- **Azure Blob Storage Integration:** Direct secure file uploads with Shared Access Signature (SAS) token generation and simulated development mode.

---

## 🏗️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Prerendered Static Hybrid)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & Modern CSS Glassmorphic Filters
- **Database & ORM:** [Drizzle ORM](https://orm.drizzle.team/) with MySQL / Azure Database for MySQL
- **Cloud Infrastructure:** Azure Static Web Apps, Azure Blob Storage, Azure Communication Services
- **Authentication:** SimpleWebAuthn, OAuth 2.0 (Google, Microsoft), TOTP
- **Icons & UI:** Lucide React, SVG Micro-animations

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- npm or pnpm
- MySQL instance (optional in development; falls back to mock memory store)

### 2. Installation

```bash
git clone https://github.com/catan-udm/studioNeo.git
cd studioNeo
npm install
```

### 3. Environment Setup

```bash
cp .env.example .env.local
```

Configure your local environment variables in `.env.local` (see [.env.example](.env.example)).

### 4. Database Schema Setup

Initialize your database schema using the provided SQL script:

```bash
# Using mysql client
mysql -u <username> -p <database_name> < scripts/schema.sql
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚙️ Environment Configuration

Use [.env.example](.env.example) as the variable reference. Key configuration blocks:

| Environment Variable | Description | Local Fallback |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL database connection credentials | Falls back to in-memory store in dev |
| `AZURE_STORAGE_ACCOUNT_NAME`, `AZURE_STORAGE_ACCOUNT_KEY`, `AZURE_STORAGE_CONTAINER_NAME` | Azure Blob Storage for art uploads | Returns simulated SAS download URLs (`mock_sas=true`) |
| `AUTH_SESSION_SECRET`, `AUTH_SESSION_COOKIE_NAME`, `AUTH_SESSION_TTL_SECONDS` | Encrypted session cookies | Required for persistent sessions |
| `AZURE_COMMUNICATION_CONNECTION_STRING`, `ACS_SENDER_EMAIL` | ACS email delivery for OTP & notifications | Prints OTP directly to server console |
| `CONTACT_NOTIFY_EMAIL` | Destination mailbox for contact inquiries | Skipped if unset |
| `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME` | Relying Party domain for Passkeys | Set to `localhost` in local dev |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth credentials | Optional |
| `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` | Microsoft Azure AD OAuth credentials | Optional |
| `APP_URL`, `NEXT_PUBLIC_APP_URL` | Canonical application URL | `http://localhost:3000` |

### OAuth Callback Endpoints
```text
https://<your-domain>/api/auth/oauth/google/callback
https://<your-domain>/api/auth/oauth/microsoft/callback
```

---

## 🧪 Diagnostics & Testing

```bash
# Run local environment and database diagnostic audit
npm run diagnose

# Run automated cryptographic security, WebAuthn & SAS token test suite
npm test

# Type-check and production build
npm run build
```

---

## 🚢 Deployment

### Vercel Deployment
The repository is optimized for zero-config Vercel deployment:
- App Router hybrid static generation prerenders all 38 static and dynamic routes.
- Connect your GitHub repository to Vercel and supply the production environment variables in the Vercel Dashboard.

### Azure Static Web Apps
Configured via `.github/workflows/azure-static-web-apps-orange-glacier-0274e2e00.yml` with manual dispatch or automated CI triggers. Store production settings under **Static Web App -> Configuration -> Application settings**.

---

## 📄 License & Credits

Created by catan-udm / sankobite as a tribute and university creative engineering project. Artworks referenced and showcased belong to their respective creators and artists credited throughout the directory.
