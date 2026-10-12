# Research Study Context Dossier: bikko.studio (studioNeo)
> **Target Audience / AI Persona**: Google Gemini (Academic Researcher & Technical Writer)  
> **Purpose**: This document provides the authoritative system specifications, institutional context, technical architecture, and chapter breakdown for generating and formatting **Chapter 1: The Problem and Its Background** (including Introduction, Background of the Study, Objectives, Scope and Delimitations, and Significance of the Study).

---

## 1. System Metadata & Project Profile

| Attribute | Specification |
| :--- | :--- |
| **System / Platform Name** | **bikko.studio** (Repository / Project Identifier: `studioNeo` / `sankobite-v3`) |
| **Platform Type** | Creative Studio Website, Cloud Asset Distribution Platform |
| **Core Domain** | Creative Technology, Human-Computer Interaction (HCI), Passwordless Cryptographic Authentication, Cloud Security |
| **Production Target & Host** | Azure Static Web Apps (Hybrid Serverless), Azure Database for MySQL Flexible Server, Azure Blob Storage |
| **Primary Technologies** | Next.js 16 (App Router), React 19, TypeScript, MySQL 8 (`mysql2`), `@simplewebauthn` (WebAuthn/FIDO2 Level 3), Azure Communication Services, Stripe API |
| **Standards & Compliance** | ISO/IEC 40500:2012 / WCAG 2.1 AA (Web Accessibility), FIDO Alliance WebAuthn Level 3, RFC 6238 (TOTP MFA), OWASP ASVS Level 2 |

---

## 2. Chapter 1: Structured Section Breakdown

### 2.1. Introduction
* **Core Premise**: The rapid expansion of web-based creative computing and digital distribution has exposed significant friction points between high-fidelity artistic presentation, accessibility, and zero-trust user authentication.
* **The Paradigm Shift**:
  - Creative media platforms traditionally rely on heavy raster formats, proprietary third-party digital rights management (DRM), or invasive cookie tracking that degrade performance and privacy.
  - Concurrently, credential stuffing, password reuse, and phishing remain the primary attack vectors against consumer and creator accounts.
* **The Solution Presented**: *bikko.studio* introduces a unified, zero-password creative atelier that merges algorithmic kinetic motion art and lossless SVG vector asset generation with hardware-bound cryptographic security (FIDO2/WebAuthn Level 3 passkeys, passwordless magic OTPs, and RFC 6238 TOTP fallback), backed by an Azure cloud-native microservices architecture.
* **Key Themes for Gemini to Emphasize**:
  - The transition from passwords to asymmetric public-key cryptography.
  - The fusion of mathematical computational aesthetics with strict accessibility (WCAG 2.1 AA).
  - High-performance web rendering without client fatigue or bloated third-party dependencies.

---

### 2.2. Background of the Study
* **Historical & Technical Context**:
  1. **Vulnerability of Password-Centric Architectures**: Traditional creator portals depend on shared secrets (passwords). Despite hashing (bcrypt/Argon2), user behavior leads to weak credentials vulnerable to social engineering, credential stuffing, and phishing.
  2. **Asset Piracy vs. Direct Download Risks**: Exposing static public URLs to downloadable intellectual property (creative stems, audio packs, design templates) leads to unauthorized hotlinking and bypass of licensing checks.
  3. **Visual & Performance Inefficiencies**: Many portfolio and creative showcases depend on video loops (MP4/WebM) or massive bitmap sprites that incur significant bandwidth overhead, lack responsiveness across varying screen pixel densities, and alienate accessibility tools like screen readers.
  4. **The Modern Web Standard Evolution**:
     - Introduction of **W3C WebAuthn Level 3** and FIDO2, providing biometrically authenticated, origin-bound, hardware-isolated public/private key pairs.
     - **Azure Blob Storage Shared Access Signatures (SAS)** providing time-gated, cryptographic read delegation without opening bucket permissions.
     - **Next.js 16 App Router & React 19 Server Components**, enabling zero-bundle server-side data fetching and streaming responses.
* **Problem Statement Addressed**: How can an independent creative atelier deliver interactive algorithmic kinetic art and gated vector assets while ensuring near-zero authentication latency, complete immunity to phishing, and full WCAG 2.1 AA accessibility compliance?

---

### 2.3. Objectives of the Study

#### General Objective
To design, develop, test, and deploy **bikko.studio**, an enterprise-grade, cloud-native web platform that delivers algorithmic kinetic motion artwork and gated digital assets through a zero-password, FIDO2/WebAuthn-driven security architecture with dynamic cloud authorization and ISO/IEC 40500:2012 accessibility compliance.

#### Specific Objectives (Technical & Research Milestones)
1. **Passwordless Cryptographic Authentication**:
   - Architect and deploy a multi-tiered passwordless identity pipeline utilizing **FIDO2 / WebAuthn Level 3** passkeys via `@simplewebauthn/server` and `@simplewebauthn/browser`.
   - Provide zero-knowledge fallback mechanisms including **6-digit cryptographic Email Magic OTPs** (via Azure Communication Services) and **RFC 6238 Time-Based One-Time Passwords (TOTP)** with SHA-256 hashed one-time backup codes.
   - Implement OAuth 2.0 federated identity (Google Identity Services and Microsoft Entra ID).
2. **Secure Gated Cloud Delivery Pipeline**:
   - Build a subscriber entitlement verification engine querying an Azure Database for MySQL Flexible Server with connection pooling and TLS enforcement.
   - Implement dynamic generation of time-bounded (15-minute expiration) **Azure Blob Storage Shared Access Signature (SAS)** URLs for authorized asset downloads, preventing hotlinking and unauthorized asset scraping.
3. **Algorithmic Kinetic Engine & Vector Asset Architecture**:
   - Develop an algorithmic motion showcase delivering mathematically generated, lossless SVG vector stems and responsive motion cels with minimal runtime memory footprint.
   - Create an interactive digital vault allowing subscribers to preview and retrieve production-ready creative assets.
4. **Adaptive UI/UX & Universal Accessibility Compliance**:
   - Build an ultra-responsive, dual-mode **Dynamic Island Navigation System** supporting fluid view transitions, auto-minimization on scroll, and light/dark theme toggles.
   - Achieve full compliance with **WCAG 2.1 Level AA / ISO/IEC 40500:2012**, including programmatic color contrast validation, semantic DOM hierarchies, ARIA landmarks, and keyboard navigability.
   - Implement Progressive Web Application (PWA) offline support using Web App Manifests and caching service workers.
5. **Empirical Benchmarking & Performance Optimization**:
   - Measure and validate API response times, WebAuthn challenge-response verification latency (<250ms), and database connection pool behavior under simulated concurrent traffic.
   - Verify zero-compromise security posture against timing attacks using constant-time buffer comparisons (`crypto.timingSafeEqual`) and anti-tamper JWT session handling.

---

### 2.4. Scope and Delimitations of the Study

#### Scope (What the Study Encompasses)
* **Frontend Architecture**:
  - Developed using **Next.js 16** with React 19 and TypeScript.
  - Custom UI/UX design system powered by vanilla CSS3 custom properties, CSS Grid/Flexbox, dynamic viewport scaling, and fluid micro-interactions.
  - Dedicated modules: Landing Showcase, Curated Projects Reel (`/projects`), Interactive Asset Vault (`/gallery`), Curatorial & Technical Philosophy (`/about`), Encrypted Inquiries (`/contact`), and Account Dashboard (`/dashboard`).
* **Backend & API Systems**:
  - Next.js Route Handlers deploying as hybrid serverless functions on Azure Static Web Apps.
  - Connection pooling with keepalive initial delay (10,000ms) and utf8mb4 encoding over TLS to Azure Database for MySQL Flexible Server.
  - Email notification pipeline leveraging Azure Communication Services REST API.
* **Security & Cryptography**:
  - FIDO2 / WebAuthn Passkey registration and authentication against RP ID and origin checking.
  - HMAC-SHA256 authenticated session tokens delivered in `HttpOnly`, `SameSite=Lax/Strict`, `Secure` cookies.
  - Constant-time validation of tokens and hashed storage of TOTP backup codes.
* **Asset Distribution**:
  - Azure Storage Blob SDK integration generating read-only, user-specific SAS tokens with strict TTL.

#### Delimitations (Boundaries and Deliberate Exclusions)
* **Native Mobile Applications**: The study is strictly delimited to modern web standards and Progressive Web Application (PWA) technologies; native iOS (Swift) or Android (Kotlin) binary applications are out of scope.
* **Blockchain / NFT Smart Contracts**: The system focuses on web-native cryptographic authentication and cloud storage gating; decentralized ledger/NFT minting systems are intentionally excluded in favor of lower latency and zero gas fees.
* **Payment Gateways Beyond Stripe**: Billing and subscriber tier processing are delegated to Stripe; integration with alternative gateways (e.g., PayPal, cryptocurrency wallets) is outside the primary implementation scope.
* **Legacy Browser Compatibility**: Devices lacking WebAuthn API support (e.g., Internet Explorer, outdated mobile browsers prior to iOS 14 / Android 9) are delimited to fallback authentication (Email OTP or OAuth 2.0).

---

### 2.5. Significance of the Study

#### 1. To Creative Technologists & Digital Artists
* Provides a blueprint for direct-to-audience digital art distribution without relying on exploitative commercial marketplaces or lossy rasterization.
* Demonstrates how algorithmic, code-based artwork can be packaged and protected with enterprise security standards.

#### 2. To Software Engineers & Web Developers
* Serves as an open reference implementation for full-stack **Next.js 16 App Router** applications deploying to Azure Static Web Apps with external MySQL connection pooling.
* Illustrates practical implementation of **SimpleWebAuthn** passkey authentication, replacing complex third-party identity providers (IdPs) with self-hosted cryptographic validation.

#### 3. To Cybersecurity Researchers & Industry Practitioners
* Contributes empirical data on the elimination of credential-stuffing vulnerabilities through passwordless adoption.
* Validates the defense-in-depth model combining hardware-bound FIDO2 credentials, short-lived HMAC sessions, and time-expiring cloud SAS tokens.

#### 4. To Academic Institutions & Future Researchers
* Provides an empirical foundation for modern human-computer interaction studies examining user friction in passkey adoption versus legacy passwords.
* Establishes a verifiable benchmark for accessible web design (ISO/IEC 40500:2012) in visually intensive, motion-heavy digital media applications.

---

## 3. Detailed Technical Specifications for Gemini Context

### 3.1. Database Schema (`experimental_studio_db`)
```sql
-- Subscribers: Core identity entity
CREATE TABLE `subscribers` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `is_verified` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WebAuthn Credentials: Hardware-bound biometric passkeys
CREATE TABLE `webauthn_credentials` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `subscriber_id` BIGINT UNSIGNED NOT NULL,
  `credential_id` VARCHAR(255) NOT NULL UNIQUE,
  `public_key` TEXT NOT NULL,
  `counter` BIGINT UNSIGNED DEFAULT 0,
  `transports` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers`(`id`) ON DELETE CASCADE
);

-- Auth Magic Tokens: Passwordless OTP verification
CREATE TABLE `auth_magic_tokens` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `subscriber_id` BIGINT UNSIGNED NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `consumed_at` TIMESTAMP NULL,
  FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers`(`id`) ON DELETE CASCADE
);

-- TOTP Credentials & Backup Codes: Secondary MFA
CREATE TABLE `totp_credentials` (
  `subscriber_id` BIGINT UNSIGNED PRIMARY KEY,
  `totp_secret` VARCHAR(128) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 0
);
CREATE TABLE `totp_backup_codes` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `subscriber_id` BIGINT UNSIGNED NOT NULL,
  `code_hash` VARCHAR(64) NOT NULL,
  `is_used` TINYINT(1) DEFAULT 0
);

-- Perks & Asset Entitlements: Digital asset vault
CREATE TABLE `perks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) UNIQUE NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `storage_file_path` VARCHAR(512) NOT NULL
);
CREATE TABLE `perk_unlocks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `subscriber_id` BIGINT UNSIGNED NOT NULL,
  `perk_id` BIGINT UNSIGNED NOT NULL,
  UNIQUE (`subscriber_id`, `perk_id`)
);
```

### 3.2. Security Mechanisms
* **Cryptographic Hash**: `SHA-256` for OTP tokens and backup codes (`crypto.createHash('sha256')`).
* **Timing-Safe Protection**: `crypto.timingSafeEqual` prevents side-channel timing attacks on authentication validation.
* **WebAuthn Verification**: Dynamic RP ID resolution, user verification requirement negotiation, origin filtering (`APP_URL` and Azure SWA host validation).
* **Storage Protection**: Azure Blob Storage Private Containers with Read-Only SAS tokens constrained to `BlobSASPermissions.parse("r")` and `15-minute` time-to-live.

---

## 4. Prompt Instructions for Google Gemini

When prompting Google Gemini to format, write, or elaborate on Chapter 1 using this document, you can feed the following prompt block:

```markdown
SYSTEM INSTRUCTION:
You are an expert academic scholar, computer science professor, and technical thesis advisor. 
Using the provided Research Study Context Dossier for "bikko.studio", write a complete, rigorous, and beautifully articulated Chapter 1 of the research manuscript titled:
"THE PROBLEM AND ITS BACKGROUND: bikko.studio — An Algorithmic Kinetic Motion Atelier and Gated Digital Distribution Platform Utilizing FIDO2/WebAuthn Level 3 Cryptographic Architecture"

Please adhere strictly to the following guidelines:
1. Format according to formal academic standards (e.g., APA 7th Edition styling with clear section headers and formal academic prose).
2. Use precise computer science, software engineering, and cybersecurity terminology (e.g., public-key cryptography, WebAuthn Level 3, RP ID, FIDO2, SHA-256 digests, constant-time comparison, SAS token gating, Next.js 16 App Router, WCAG 2.1 AA).
3. Ensure the five requested sections are thoroughly developed:
   - 1.1 Introduction
   - 1.2 Background of the Study
   - 1.3 Objectives of the Study (General Objective & Specific Objectives utilizing Bloom's Taxonomy action verbs)
   - 1.4 Scope and Delimitations of the Study
   - 1.5 Significance of the Study (Categorized by target beneficiary groups)
4. Do not use colloquial language or vague placeholders. Rely on the exact technical models, database tables, and cloud infrastructure described in this dossier.
```
