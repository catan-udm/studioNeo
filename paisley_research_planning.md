# Technical Documentation and Member Assignment: Paisley Isha V. Doroja

* **Member Name**: Paisley Isha V. Doroja (Paisley)
* **Assigned Role**: Role 4: Inputting, Research, and Planning (UX Research, Content Seeding and QA Lead)
* **Project Title**: bikko.studio (System Architecture: studioNeo / sankobite-v3)
* **Institution**: Universidad de Manila, College of Computing Studies
* **Course**: Human Computer Interaction (ITE 323)

---

## 1. Role Overview and Scope of Work

Paisley serves as the UX Research, Content Seeding, and Quality Assurance (QA) Lead. Her scope of work encompasses project proposal formulation, target user group research, behavioral persona development, user pain point identification, interactive storyboard design, curated artwork and creator seeding, vector graphic optimization, universal accessibility auditing (WCAG 2.1 Level AA), and compilation of the formal HCI documentation manuscript.

Her primary objective is to align the technical architecture with genuine human-computer interaction needs, ensuring the platform is intuitive, accessible to users with disabilities, richly populated with high-quality creative content, and rigorously tested against academic and industry standards.

---

## 2. Core Technical Responsibilities

### 2.1. Project Scope, Objectives and User Research

1. **Proposal and Problem Definition (Section 1)**:
   * **Project Title (Section 1.1)**: bikko.studio (Full descriptive title: An Interactive Studio Independent Website and Secure Digital Asset Sharing Platform Using Passwordless WebAuthn Sign-in and Fast Computer Graphics).
   * **General Objective (Section 1.2.1)**: Design, build, test, and launch bikko.studio as a high-quality cloud web platform delivering interactive moving artwork and protected digital assets via passwordless security, dynamic cloud access checks, and full WCAG 2.1 Level AA accessibility.
   * **Five Specific Objectives (Section 1.2.2)**:
     1. Build a multi-step passwordless sign-in system using WebAuthn biometrics, 6-digit email OTPs, TOTP authenticators, and social logins.
     2. Create a secure cloud file sharing system with database permission checks and 15-minute temporary download links.
     3. Develop a moving image engine and file storage vault using lightweight animated SVGs under 2KB and in-browser canvas format conversion.
     4. Design an adaptive, accessible user interface featuring the morphing Dynamic Island navigation bar and multi-theme tokens.
     5. Measure system speed, performance, and security under heavy user loads.
   * **Five Target User Groups (Section 1.3)**:
     1. Digital Illustrators, Animators, and Visual Artists
     2. Creative Technologists and Web Developers
     3. Digital Asset Collectors and Subscribers
     4. Design Studio Directors and Commercial Curators
     5. Users Relying on Assistive Tools and Various Setup Conditions
   * **Four Core System Problems (Section 1.4)**:
     1. Password Fatigue and Account Hijacking (phishing, password reuse, reset loops).
     2. Asset Theft and Uncontrolled Direct Links (permanent URLs exposed to scraping and bandwidth theft).
     3. Slow Performance from Heavy Video Files (15MB MP4 loops causing lag and mobile data drain).
     4. Stiff Navigation and Accessibility Barriers (mobile screen obstruction, unannounced buttons, broken focus).

2. **User Personas and Behavioral Profiles (Section 2.1.1)**:
   * **Persona A: Erika Vance (Age: 27)**:
     * Role: Senior Illustrator and Freelance Concept Artist.
     * Tools: macOS Sonoma, 4K Display, iPad Pro with Apple Pencil, Safari and Chrome.
     * Mindset: Cares deeply about color fidelity and vector crispness. Constantly concerned about online art theft, direct link scraping, and unauthorized AI training.
     * Goals: Showcase moving artwork with zero blurriness, verify paying supporters, and distribute master vectors safely.
   * **Persona B: Aria De Leon (Age: 21)**:
     * Role: Design Student and Digital Art Collector.
     * Tools: iPhone 15 Pro, iOS 18, Mobile Safari, Campus Wi-Fi.
     * Mindset: Browses quickly on mobile, accustomed to modern touch habits (stories, double-taps, continuous scrolling).
     * Goals: Browse art feeds on mobile, enjoy 5-second animated story previews, and download wallpapers directly to cloud storage.
   * **Persona C: Gabriel Santos (Age: 32)**:
     * Role: Accessibility Consultant and Digital Curator.
     * Tools: Windows 11 with NVDA Screen Reader, High-Contrast Monitor, Keyboard-Only Navigation.
     * Mindset: Completely relies on logical HTML markup, keyboard shortcuts, and clear screen contrast. Experiences motion sickness from unconstrained animations.
     * Goals: Navigate art archives independently using clear keyboard commands and screen reader speech announcements.

3. **User Group Comparison Table (Section 2.1.2)**:
   * Systematically evaluate parameter variations across groups:
     * **Age Range**: Artists (20 to 40), Technologists (19 to 35), Assistive Users (22 to 55).
     * **Tech Skill**: Artists (Medium), Technologists (High / Expert), Assistive Users (High with Assistive Tools).
     * **Main Device**: Artists (Desktop / Tablet 65%), Technologists (Multi-Screen Desktop 80%), Assistive Users (Desktop / Laptop 85%).
     * **Sign-in Choice**: Artists (Touch ID / Social), Technologists (Hardware Key / Passkey), Assistive Users (Keyboard Passkey / Email Code).
     * **Key Need**: Artists (Asset Safety and Quality), Technologists (Vector Downloads and Clean Code), Assistive Users (Accessibility and High Contrast).

4. **Needs and Requirements Translation (Section 2.2)**:
   * Map user pain points into structured specifications covering usability (zero-password relief, easy recovery), visual presentation (crisp SVGs, subtle touch feedback), asset integrity (temporary links, verified downloads), and accessibility (focus outlines, motion comfort, OLED true-black mode).

---

### 2.2. Journey Mapping, Content Seeding and Asset Preparation

1. **Step-by-Step Interactive Storyboards (Section 3.2)**:
   * **Scenario 1: Easy Biometric Passkey Setup and Sign-in (User: Marcus Chen)**:
     * Step 1 (Start): Marcus clicks the glowing "Sign In" pill on the navigation bar.
     * Step 2 (Challenge Request): Browser requests a cryptographic challenge from the server.
     * Step 3 (Biometric Prompt): Browser triggers native Touch ID on macOS.
     * Step 4 (Hardware Scan): Marcus touches the sensor; security enclave signs the challenge.
     * Step 5 (Verification): Server verifies the digital signature against the stored public key.
     * Step 6 (Success): Within 180 milliseconds, the app transitions smoothly to the active feed.
   * **Scenario 2: Creative Exploration and Story Reel Interaction (User: Aria De Leon)**:
     * Step 1 (Story Discovery): Aria opens the feed and sees a glowing purple ring around artist @tamimoon.
     * Step 2 (Story Window): Tapping opens fullscreen story mode with an animated vector and a 5-second progress bar.
     * Step 3 (Double-Tap Like): Double-tapping triggers a floating heart burst animation and increments like counts.
     * Step 4 (Filter Tabs): Aria exits and taps "Partners"; feed updates instantly.
     * Step 5 (Smart Docking): Scrolling down hides the bottom dock for unobstructed art viewing; scrolling up restores it.
   * **Scenario 3: Secure Asset Discovery, Multi-Format Conversion and Download (User: Erika Vance)**:
     * Step 1 (Gallery Inspect): Erika selects "Vector Geometry Picture 04".
     * Step 2 (Format Choice): In the export modal, she chooses "PNG (High-Quality Transparent Image)".
     * Step 3 (Browser Conversion): Client-side canvas rasterizes native vector code at 3840 x 2160 Display P3 resolution.
     * Step 4 (Member Check): Server confirms Erika's active paid membership.
     * Step 5 (Safe Link Generation): Server returns a 15-minute temporary read-only download link.
     * Step 6 (Direct Download): Browser downloads the file directly without exposing permanent storage paths.
   * **Scenario 4: Accessibility Navigation and High-Contrast Theming (User: Gabriel Santos)**:
     * Step 1 (Skip Link): Gabriel presses Tab on load; "Skip to Main Content" button appears with high-contrast ring.
     * Step 2 (Theme Access): Tabbing brings focus to "Theme Settings", announced clearly by NVDA.
     * Step 3 (OLED Mode): Gabriel opens the menu and selects "OLED High-Contrast" (21:1 contrast ratio, true black).
     * Step 4 (Motion Protection): App detects Windows "Reduce Motion" setting and halts all background vector animations automatically.

2. **Creator Profile and Feed Content Seeding**:
   * Populate authentic artist accounts, avatars, bios, and badges:
     * `@tamimoon` (Tokyo, Japan; Partner Verified; Modern fashion and anime illustrative aesthetics).
     * `@rella` (Tokyo, Japan; Partner Verified; Symphony series, delicate light studies).
     * `@sankobite` (Lead Creator; Core architectural vectors, cyber-aesthetic studies).
     * `@yoneyamai` (Tokyo, Japan; Featured Artist; Kinetic looping posters).
     * `LAM` (Tokyo, Japan; Featured Artist; High-contrast street fashion graphics).
   * Key files populated: `src/tamimoonData.ts`, `src/rellaData.ts`, `src/yoneyamaiData.ts`, `src/assets/*`.

3. **Vector Asset Preparation and Vault Seeding**:
   * Author and optimize sub-2KB SVG animation files using clean math curves.
   * Prepare master 3840 x 2160 vectors with Display P3 color definitions.
   * Tag artwork with precise categories (Vector Stems, Color Studies, Typography) and embed detailed screen-reader descriptions into `<title>` and `<desc>` elements.

---

### 2.3. Accessibility Auditing, QA and Manuscript Compilation

1. **WCAG 2.1 Level AA Compliance Testing**:
   * Perform hands-on accessibility evaluations using the NVDA screen reader on Windows 11.
   * Test complete keyboard-only navigation workflows using Tab, Shift+Tab, Enter, Space, and Escape keys.
   * Verify color contrast ratios using digital color analyzers:
     * Light Theme: 14.2:1 (exceeds 4.5:1 requirement).
     * Dark Theme: 15.8:1 (exceeds 4.5:1 requirement).
     * OLED Theme: 21:1 (maximum digital contrast).
   * Verify that animations freeze when `prefers-reduced-motion` is active.

2. **HCI Final Documentation Manuscript Management**:
   * Compile, format, and organize the complete 60-page Human Computer Interaction (ITE 323) manuscript following Universidad de Manila College of Computing Studies standards.
   * Ensure consistent document headings, page numbers, ASCII wireframe diagrams, and member role matrices.

3. **Academic and Industry Reference Citations (Section 4)**:
   * Manage official citations:
     1. FIDO Alliance & World Wide Web Consortium (W3C). (2025). Web Authentication: An API for accessing Public Key Credentials Level 3 (WebAuthn Level 3). W3C Candidate Recommendation.
     2. World Wide Web Consortium (W3C). (2018). Web Content Accessibility Guidelines (WCAG) 2.1. W3C Recommendation.
     3. International Organization for Standardization (ISO). (2012). ISO/IEC 40500:2012 Information technology - W3C Web Content Accessibility Guidelines (WCAG) 2.0. Geneva: ISO.
     4. Internet Engineering Task Force (IETF). (2011). TOTP: Time-Based One-Time Password Algorithm (RFC 6238). Request for Comments.
     5. Open Web Application Security Project (OWASP). (2023). OWASP Application Security Verification Standard (ASVS) 4.0.3. OWASP Foundation.
     6. Owens, K., et al. (2021). User Perceptions of the Usability and Security of Smartphones as FIDO2 Roaming Authenticators. SOUPS 2021.
     7. Ali, M., et al. (2024). FIDO2 Password-less Authentication: Security-Usability Continuum. IEEE Access.
     8. Microsoft Corporation. (2026). Azure Database for MySQL Flexible Server & Azure Blob Storage Documentation. Microsoft Learn.
     9. Meta Open Source & Vercel. (2026). React 19 Server Components and Next.js 16 App Router Architecture. Vercel Documentation.

---

## 3. Documentation Sections Owned

Paisley is directly responsible for drafting, updating, and maintaining the following formal sections in the project report:

1. **Section 1: Project Proposal**:
   * 1.1 Project Title (System names and identifiers).
   * 1.2 Objectives (1.2.1 General Objective and 1.2.2 Specific Objectives 1 through 5).
   * 1.3 Target Users (Five designated user groups).
   * 1.4 Problem Statement (Four core system problems).

2. **Section 2.1 and 2.2: User Research and User Needs**:
   * 2.1.1 User Personas and Behavioral Profiles (Personas A, B, and C).
   * 2.1.2 Demographic and Technological Literacy Segmentation (Comparison Table).
   * 2.2 User Needs (Usability, visual presentation, asset integrity, and assistive device support).

3. **Section 3.2: Storyboards**:
   * 3.2.1 Scenario 1: Easy Biometric Passkey Setup and Sign-in (Marcus Chen).
   * 3.2.2 Scenario 2: Creative Exploration and Story Reel Interaction (Aria De Leon).
   * 3.2.4 Scenario 4: Accessibility Navigation and High-Contrast Theming (Gabriel Santos).

4. **Section 4: References**:
   * Compile and verify all 9 formal citations across W3C, ISO, IETF, OWASP, academic journals, and cloud documentation.

---

## 4. Cross-Role Integration and Development Handoffs

* **Handoff to Role 1 (Jaz - Frontend UI)**:
  * Paisley provides optimized SVG files, artist descriptions, and color values for Jaz's responsive feed and story reels.
  * Paisley conducts NVDA screen reader audits and keyboard Tab sequence tests on Jaz's wireframe views and Liquid Glass components.

* **Handoff to Role 2 (Adrian - System Framework)**:
  * Paisley tests Adrian's biometric passkey registration, email OTP generation, and fallback flows against user experience benchmarks.
  * Paisley verifies that offline Service Worker alerts match user expectations during network dropouts.

* **Handoff to Role 3 (Gwyneth - Database and Queries)**:
  * Paisley delivers structured artist profile information and artwork metadata for Gwyneth to seed into the `accounts` and `artworks` database tables.
  * Paisley conducts test downloads to confirm that 15-minute SAS links expire accurately and protect creator assets.
