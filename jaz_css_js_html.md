# Technical Documentation and Member Assignment: Jazmin Eunice C. Latoja

* **Member Name**: Jazmin Eunice C. Latoja (Jaz)
* **Assigned Role**: Role 1: CSS, JS, and HTML (Frontend UI, Vector Graphics and Accessibility Developer)
* **Project Title**: bikko.studio (System Architecture: studioNeo / sankobite-v3)
* **Institution**: Universidad de Manila, College of Computing Studies
* **Course**: Human Computer Interaction (ITE 323)

---

## 1. Role Overview and Scope of Work

Jaz serves as the Frontend UI, Vector Graphics, and Accessibility Developer. Her scope of work focuses on the client-side presentation layer, accessible HTML5 structure, responsive CSS layout systems, interactive vector graphics animations, and multi-format client asset exports.

Her primary goal is to deliver a smooth, visually appealing, and highly accessible user interface that runs efficiently across mobile phones, tablets, and desktop computers while maintaining full compliance with Web Content Accessibility Guidelines (WCAG 2.1 Level AA).

---

## 2. Core Technical Responsibilities

### 2.1. HTML5 Structure and Assistive Markup

1. **Semantic Page Layout (WCAG 2.1 Rule 4.1.2 - Name, Role, Value)**:
   * Build all page views using native HTML5 landmark elements: `<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`, and `<footer>`.
   * Apply explicit accessibility roles (`role="navigation"`, `role="region"`, `role="feed"`, `role="dialog"`) and descriptive labels (`aria-label`, `aria-labelledby`) so assistive technologies can identify the purpose of every layout section.
   * Key files: `src/app/layout.tsx`, `src/components/feed/InstagramFeed.tsx`, `src/app/gallery/GalleryClient.tsx`.

2. **Skip Navigation Implementation (WCAG 2.1 Rule 2.4.1 - Bypass Blocks)**:
   * Implement a hidden "Skip to Main Content" button at the very beginning of the page body.
   * The button remains invisible to mouse users during regular browsing. When a keyboard user presses the Tab key for the first time on page load, the button becomes visible at the top left of the screen with a distinct focus ring.
   * Pressing Enter immediately shifts keyboard focus past repeated navigation links directly to `<main id="main-content">`.
   * Styling:
     ```css
     .sn-skip-link {
       position: absolute;
       top: -100px;
       left: 1rem;
       background: #6366f1;
       color: #ffffff;
       padding: 0.75rem 1.25rem;
       border-radius: 9999px;
       font-weight: 600;
       z-index: 9999;
       transition: top 0.2s ease;
     }
     .sn-skip-link:focus {
       top: 1rem;
       outline: 3px solid #ffffff;
       outline-offset: 2px;
     }
     ```

3. **Logical Focus and Tab Order (WCAG 2.1 Rules 2.1.1 and 2.4.7 - Keyboard Navigable and Focus Visible)**:
   * Enforce a predictable, top-to-bottom and left-to-right keyboard Tab sequence across the navigation island, story reels, feed cards, and popup dialogs.
   * Provide high-contrast focus outlines across all interactive elements (`outline: 2px solid #a855f7; outline-offset: 3px;`).
   * Implement focus trapping in popup windows (Sign-in Gateway, Asset Export Modal, Fullscreen Story Viewer) so keyboard navigation stays inside the open dialog until dismissed.

4. **Non-Text Alternatives (WCAG 2.1 Rule 1.1.1 - Non-text Content)**:
   * Provide descriptive text alternatives for all graphical elements.
   * Add meaningful `alt` attributes to raster images (such as artist profile avatars and story thumbnails).
   * Embed `<title>` and `<desc>` elements within native SVG vectors.
   * Provide hidden screen reader labels (`aria-label` or `<span className="sr-only">`) on icon-only buttons like the close icon, heart like button, bookmark button, and theme switcher.

---

### 2.2. CSS Styling, Design Tokens and Responsive Layouts

1. **Liquid Glass Dynamic Island (`.sn-nav-island`)**:
   * Build the floating navigation bar with modern glass styling:
     ```css
     .sn-nav-island {
       position: fixed;
       top: 1rem;
       left: 50%;
       transform: translateX(-50%);
       backdrop-filter: blur(28px) saturate(190%) contrast(110%);
       -webkit-backdrop-filter: blur(28px) saturate(190%) contrast(110%);
       background: var(--sn-glass-surface, rgba(18, 18, 22, 0.65));
       border: 1px solid var(--sn-glass-border, rgba(255, 255, 255, 0.12));
       box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
       border-radius: 9999px;
       transition: all 0.4s ease;
       z-index: 900;
     }
     ```
   * Key files: `src/app/nav.css`, `src/app/components/StudioNav.tsx`.

2. **Four-State Adaptive Navigation System**:
   * **State A (Expanded Desktop Top Bar)**: Idle state at the top of the page with full horizontal navigation links, brand logo, dashboard link, and theme controls.
   * **State B (Detached Split Pills)**: Triggers when the user scrolls down past 40 pixels. The navigation bar shrinks padding and splits into two separate floating pills (brand and main links on the left, passkey and theme controls on the right), keeping 92% of the vertical screen height completely clear for viewing artwork.
   * **State C (Compact Mobile Bottom 4-Tab Dock)**: On mobile viewports under 768px, anchors a clean 4-tab bar to the bottom of the screen (Feed, Projects, Vault, Profile/Login) for easy thumb navigation.
   * **State D (Full-Screen Overlay Menu)**: Triggers when the hamburger menu button is pressed, expanding a full-screen blurred glass backdrop with accessible navigation links and signed-in user status.

3. **Multi-Theme Design Tokens**:
   * Define CSS custom variables across three complete color modes:
     * **Light Theme**: Contrast ratio of 14.2:1 (exceeds WCAG 4.5:1 standard).
       ```css
       :root {
         --sn-bg-primary: #f8f9fa;
         --sn-text-primary: #121316;
         --sn-glass-surface: rgba(255, 255, 255, 0.75);
         --sn-glass-border: rgba(0, 0, 0, 0.08);
       }
       ```
     * **Dark Theme**: Contrast ratio of 15.8:1 (exceeds WCAG 4.5:1 standard).
       ```css
       [data-theme='dark'] {
         --sn-bg-primary: #0d0e12;
         --sn-text-primary: #f1f3f9;
         --sn-glass-surface: rgba(18, 20, 26, 0.70);
         --sn-glass-border: rgba(255, 255, 255, 0.12);
       }
       ```
     * **OLED High-Contrast Theme**: Contrast ratio of 21:1 (maximum digital display contrast).
       ```css
       [data-theme='oled'] {
         --sn-bg-primary: #000000;
         --sn-text-primary: #ffffff;
         --sn-glass-surface: rgba(0, 0, 0, 0.95);
         --sn-glass-border: rgba(255, 255, 255, 0.35);
       }
       ```
   * Key file: `src/app/globals.css`.

4. **Cross-Device Responsive Breakpoints**:
   * **Mobile Viewports (<768px)**: Single-column feed layout with full-width post cards, horizontal swipeable Story avatar carousel, and fixed bottom 4-tab dock.
   * **Tablet Viewports (768px to 1023px)**: Centered 640px post feed stream with floating Dynamic Island navigation bar.
   * **Desktop Viewports (>=1024px)**: Asymmetric two-column grid layout consisting of a fixed 320px left profile sidebar and a centered 640px feed stream.

5. **Core Wireframe Views Constructed**:
   * Wireframe 3.1.1: Studio Landing Workshop and Main Moving Stage
   * Wireframe 3.1.2: Dual-Mode Adaptive Dynamic Island Navigation System
   * Wireframe 3.1.3: Authenticated Instagram-Style Feed and Desktop Profile Sidebar
   * Wireframe 3.1.4: Interactive Asset Vault and Multi-Format Export Popup Modal
   * Wireframe 3.1.5: Passwordless WebAuthn / Biometric Sign-in Window

---

### 2.3. Client-Side JavaScript and Moving Vector Engine

1. **Code-Driven SVG Animation Engine**:
   * Implement GPU-accelerated mathematical vector animations running smoothly at 60 frames per second using under 2KB of file data per graphic.
   * Uses SVG bezier curve paths, CSS hardware layer acceleration (`transform: translate3d(0,0,0)`, `will-change: transform`), and `requestAnimationFrame` loops.
   * Completely replaces heavy 15MB MP4/WebM video loops to save mobile data and system memory.
   * Key files: `src/app/LandingClient.tsx`, `src/app/gallery/GalleryClient.tsx`, `src/app/components/BikkoMark.tsx`.

2. **CPU Saver and Motion Comfort Controls**:
   * **Page Visibility API**: Detects when the user switches browser tabs or minimizes the window (`document.hidden`), immediately halting animation loops and lowering background CPU usage to 0%.
     ```typescript
     // Check if tab is inactive to preserve CPU and battery
     if (typeof document !== 'undefined' && document.hidden) {
       return;
     }
     ```
   * **Motion Comfort Detection (WCAG 2.1 Rule 2.2.2)**: Automatically inspects the operating system setting `prefers-reduced-motion: reduce`. When active, moving animations stop automatically and display a crisp static vector fallback.

3. **Feed Micro-Interactions**:
   * Fullscreen Story progress bar that fills over 5.0 seconds with smooth linear progression and pauses on press-and-hold.
   * Glowing purple gradient avatar rings indicating unviewed artist stories.
   * Double-tap floating heart burst animation with dynamic particle expansion and smooth fade-out.
   * Fast touch feedback under 100 milliseconds for all clicks, tabs, and filter selections.
   * Key files: `src/components/feed/InstagramFeed.tsx`, `src/components/feed/StoryViewer.tsx`.

4. **In-Browser Multi-Format Exporter**:
   * Build client-side canvas rasterization engine (`HTMLCanvasElement`, `canvas.getContext('2d')`).
   * Reads raw mathematical SVG code from browser memory at 3840 x 2160 resolution in the Display P3 wide color gamut.
   * Converts the artwork directly on the client machine into downloadable SVG, PNG, JPEG, and animated GIF formats without requiring expensive server image rendering.
   * Key files: `src/app/gallery/GalleryClient.tsx`, `src/app/collection/CollectionClient.tsx`.

---

## 3. Documentation Sections Owned

Jaz is directly responsible for drafting, updating, and maintaining the following formal sections in the project report:

1. **Section 2.3.3: Universal Accessibility Standards Compliance (WCAG 2.1 AA)**:
   * Rule 1.1.1: Non-text Content (Image alt text, SVG title and description tags, hidden icon labels).
   * Rule 1.4.3: Contrast Minimum (Light mode 14.2:1, Dark mode 15.8:1, OLED mode 21:1).
   * Rule 2.1.1: Keyboard Navigable (All functions operable via keyboard).
   * Rule 2.2.2: Pause, Stop, Hide (Reduced motion detection and pause controls).
   * Rule 2.4.1: Bypass Blocks (Skip to Main Content button).
   * Rule 2.4.7: Focus Visible (High-contrast focus outlines on all interactive elements).
   * Rule 4.1.2: Name, Role, Value (Semantic HTML5 landmarks and ARIA roles).

2. **Section 3.1: Wireframes (3.1.1 to 3.1.5)**:
   * 3.1.1 Studio Landing Workshop and Main Moving Stage (Desktop and Mobile wireframe layouts).
   * 3.1.2 Dual-Mode Adaptive Dynamic Island Navigation System (States A, B, C, and D).
   * 3.1.3 Authenticated Instagram-Style Feed and Desktop Profile Sidebar (Two-column desktop grid and single-column mobile stream).
   * 3.1.4 Interactive Asset Vault and Multi-Format Export Window (Grid layout and export popup modal).
   * 3.1.5 Passwordless WebAuthn / Biometric Sign-in Window (Modal dialog with biometric and fallback options).

3. **Sections 3.3.1 to 3.3.4: System Prototypes**:
   * 3.3.1 Custom Liquid Glass Visual Engine (CSS backdrop filters, specular highlights, border radius).
   * 3.3.2 Responsive Feed Interface and Frosted Glass Style (Card layouts, story avatar rows, double-tap hearts).
   * 3.3.3 Moving Vector Animation and Multi-Format Pipeline (Mathematical SVG rendering, canvas export pipeline).
   * 3.3.4 Flexible Design System (Light, Dark, and OLED High-Contrast themes and CSS variables).

---

## 4. Cross-Role Integration and Development Handoffs

* **Handoff to Role 2 (Adrian - System Framework)**:
  * Jaz builds the Sign-in Gateway modal dialog UI with accessible focus trapping. Adrian connects the WebAuthn challenge generation, passkey verification, and secure cookie endpoints.
  * Jaz creates the offline user interface notification banner. Adrian connects the background Service Worker and network status listeners.

* **Handoff to Role 3 (Gwyneth - Database and Queries)**:
  * Jaz designs the multi-format export popup dialog. Gwyneth validates user membership status in MySQL and creates the 15-minute temporary Azure Blob download URL.
  * Jaz renders the continuous feed cards and category filter tabs. Gwyneth writes the paginated SQL queries and category indexes.

* **Handoff to Role 4 (Paisley - Research and QA)**:
  * Paisley provides curated artist vector assets, color palettes, and descriptive alt text. Jaz integrates them into the responsive feed and asset vault components.
  * Jaz submits completed UI views to Paisley for formal WCAG 2.1 Level AA testing using the NVDA screen reader, keyboard-only Tab sequences, and contrast analyzers.
