# studioNeo Content & Text Editing Guide

Welcome! This guide explains how text, headlines (`<h1>`, `<h2>`, etc.), descriptions, and data are structured in this project, and exactly where to find and edit them manually.

---

## 1. Why Text Isn't Directly Inside `page.tsx`

In this project (built with the **Next.js App Router**), files named `page.tsx` serve as **Routing & SEO wrappers**. 

Their job is:
1. Define search engine metadata (`title`, `description`, OpenGraph tags).
2. Generate structured Schema.org data for Google.
3. Import and render the actual **Client Component** (e.g., `StudioLanding`, `ArtistIndexClient`, `ProjectsClient`) where the visual layout, HTML tags, and text live.

```
src/app/page.tsx (Page Route + SEO Metadata)
      └── renders ──> src/app/LandingClient.tsx
                            └── renders ──> src/components/landing/StudioLanding.tsx
                                                  ├── <h1>bikko.studio</h1>
                                                  ├── <p>Taglines & descriptions</p>
                                                  └── <Link>Buttons & Actions</Link>
```

---

## 2. Master Route & File Map

Use this table to find the exact file you need to open to change headlines, paragraphs, or buttons:

| Page / URL | Route Wrapper (`page.tsx`) | **Actual File to Edit Content & H1** | Key Content Found There |
|---|---|---|---|
| **Home (`/`)** | `src/app/page.tsx` | [`src/components/landing/StudioLanding.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/landing/StudioLanding.tsx) | Hero headline (`bikko.studio`), tagline, action buttons, About section (`Creative Code, Kinetic Motion...`), and the 3 core tenets (`Kinetic Motion`, `Zero Passwords`, `Vector Topology`). |
| **Artists Directory (`/artist`)** | `src/app/artist/page.tsx` | [`src/app/artist/ArtistIndexClient.tsx`](file:///home/sankobite/studioNeo_ehh/src/app/artist/ArtistIndexClient.tsx) | Headline (`Artists of studioNeo`), section titles (`Enter an archive`, `The complete directory`), search bar labels. |
| **Artist Roster Data** | — | [`src/data/illustrators.ts`](file:///home/sankobite/studioNeo_ehh/src/data/illustrators.ts) | The 64 illustrators: names, handles, avatars, follower counts, and links. |
| **Artist Socials Data** | — | [`src/app/artist/artistSocials.ts`](file:///home/sankobite/studioNeo_ehh/src/app/artist/artistSocials.ts) | Pixiv IDs, X/Twitter handles, and custom archive link overrides. |
| **Projects (`/projects`)** | `src/app/projects/page.tsx` | [`src/app/projects/ProjectsClient.tsx`](file:///home/sankobite/studioNeo_ehh/src/app/projects/ProjectsClient.tsx) | Page headline (`PROJECTS`), subheading, category filters (`All`, `Animation`, `Artwork`, `Interactive`). |
| **Projects Data** | — | [`src/app/projects/projectsData.ts`](file:///home/sankobite/studioNeo_ehh/src/app/projects/projectsData.ts) | List of projects: title, subtitle, client, year, descriptions, and media links. |
| **Licensing (`/licensing`)** | [`src/app/licensing/page.tsx`](file:///home/sankobite/studioNeo_ehh/src/app/licensing/page.tsx) | Directly in `src/app/licensing/page.tsx` | Headline (`Licensing & Rights`), tier cards (`Tier A`, `Tier B`, etc.), terms, lists of rights. |
| **Membership (`/membership`)** | `src/app/membership/page.tsx` | [`src/app/membership/MembershipClient.tsx`](file:///home/sankobite/studioNeo_ehh/src/app/membership/MembershipClient.tsx) | Membership tiers, pricing, subscriber vault access descriptions, FAQ. |
| **Store / Cels (`/store`)** | `src/app/store/page.tsx` | [`src/app/gallery/GalleryClient.tsx`](file:///home/sankobite/studioNeo_ehh/src/app/gallery/GalleryClient.tsx) | Gallery and cel collection headers, filters, checkout buttons. |
| **Contact (`/contact`)** | `src/app/contact/page.tsx` | [`src/app/contact/ContactClient.tsx`](file:///home/sankobite/studioNeo_ehh/src/app/contact/ContactClient.tsx) | Contact headline, inquiries copy, form input labels and button text. |
| **Terms of Service (`/terms`)** | [`src/app/terms/page.tsx`](file:///home/sankobite/studioNeo_ehh/src/app/terms/page.tsx) | Directly in `src/app/terms/page.tsx` | Headline (`Terms of Service`), effective date, legal articles 01 to 08. |
| **Privacy Policy (`/privacy`)** | [`src/app/privacy/page.tsx`](file:///home/sankobite/studioNeo_ehh/src/app/privacy/page.tsx) | Directly in `src/app/privacy/page.tsx` | Headline (`Privacy Policy`), data protection articles. |
| **Login (`/login`)** | `src/app/login/page.tsx` | [`src/app/login/LoginClient.tsx`](file:///home/sankobite/studioNeo_ehh/src/app/login/LoginClient.tsx) | Login headline, passkey authentication prompts, OAuth buttons. |
| **Register (`/register`)** | `src/app/register/page.tsx` | [`src/app/register/RegisterClient.tsx`](file:///home/sankobite/studioNeo_ehh/src/app/register/RegisterClient.tsx) | Register headline, passkey enrollment instructions. |
| **Navigation Bar (Global)** | — | [`src/app/components/StudioNav.tsx`](file:///home/sankobite/studioNeo_ehh/src/app/components/StudioNav.tsx) | Menu items (`Studio`, `Projects`, `Artists`), popover burger menu links, settings modal copy. |

---

## 3. Resident Artist Archive Pages (`/artist/[handle]`)

When visiting an individual tribute archive (e.g. `/artist/yoneyamai`, `/artist/mikapikazo`, `/artist/rella`), the router loads components from the [`src/components/archive/`](file:///home/sankobite/studioNeo_ehh/src/components/archive/) folder:

| Resident Artist | URL | Component File to Edit | What's Inside |
|---|---|---|---|
| **Yoneyama Mai** | `/artist/yoneyamai` | [`src/components/archive/yoneyamai/YoneyamaiPage.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/archive/yoneyamai/YoneyamaiPage.tsx) | Museum room titles (`ROOM 01 // EMOTIONS`, `EYE`, etc.), quotes, chronology, exhibitions. |
| **Mika Pikazo** | `/artist/mikapikazo` | [`src/components/archive/mikapikazo/MikaPikazoPage.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/archive/mikapikazo/MikaPikazoPage.tsx) | Hero titles (`Pop at full volume`), biography, exhibition archives, character design credits. |
| **Rella** | `/artist/rella` | [`src/components/archive/RellaPage.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/archive/RellaPage.tsx) | Light tribute text, Hatsune Miku anniversary credits, timeline. |
| **LAM** | `/artist/lam` | [`src/components/archive/lam/LamPage.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/archive/lam/LamPage.tsx) | Eye motif descriptions, flipbook text, biography. |
| **tamimoon** | `/artist/tamimoon` | [`src/components/archive/tamimoon/TamimoonPage.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/archive/tamimoon/TamimoonPage.tsx) | `They are there`, 5 model agency profiles, collaboration credits. |
| **DINO** | `/artist/dinoillus` | [`src/components/archive/dinoillus/DinoillusPage.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/archive/dinoillus/DinoillusPage.tsx) | `where light ends`, artbook XXXIX copy, light studies. |
| **Dolman** | `/artist/dolman` | [`src/components/archive/dolman/DolmanPage.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/archive/dolman/DolmanPage.tsx) | Neon editorial graphics copy and portfolio text. |
| **tatamipi** | `/artist/tatamipi` | [`src/components/archive/tatamipi/TatamipiPage.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/archive/tatamipi/TatamipiPage.tsx) | Kinetic pop illustration copy. |
| **ASK** | `/artist/askziye` | [`src/components/archive/askziye/AskziyePage.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/archive/askziye/AskziyePage.tsx) | Classical digital painting tribute copy. |
| **KDA** | `/artist/kda` | [`src/components/archive/kda/KdaPage.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/archive/kda/KdaPage.tsx) | Visual narrative and tribute copy. |
| **kaduise** | `/artist/kaduise` | [`src/components/archive/kaduise/KaduisePage.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/archive/kaduise/KaduisePage.tsx) | Atmospheric character art copy. |
| **Dora** | `/artist/dora` | [`src/components/archive/dora/DoraPage.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/archive/dora/DoraPage.tsx) | Stylized character portraits copy. |
| **Other 50+ Artists** | `/artist/[handle]` | [`src/app/artist/[handle]/ArtistProfileClient.tsx`](file:///home/sankobite/studioNeo_ehh/src/app/artist/[handle]/ArtistProfileClient.tsx) | Generic profile layout for all non-resident artists in the roster. |

---

## 4. How to Edit Common Elements: Step-by-Step

### Example 1: Changing the Homepage Main Headline & Tagline
1. Open [`src/components/landing/StudioLanding.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/landing/StudioLanding.tsx).
2. Locate lines 37–40:
   ```tsx
   <div className="landing-copy">
     <h1 id="landing-title">bikko.studio</h1>
     <p>Go ahead and say just a little more about what you do.</p>
   </div>
   ```
3. Change `bikko.studio` or the `<p>` text to whatever you desire.
4. Save the file. Your dev server updates immediately with hot-reloading.

### Example 2: Changing the Second Homepage Section ("Creative Code...")
1. In the same file [`src/components/landing/StudioLanding.tsx`](file:///home/sankobite/studioNeo_ehh/src/components/landing/StudioLanding.tsx), look at lines 66–72:
   ```tsx
   <h1 className="about-title">
     Creative Code, Kinetic Motion &amp; Next-Gen Identity.
   </h1>
   <p className="about-lead">
     An experimental atelier engineering algorithmically driven visual cels...
   </p>
   ```
2. Edit the title or paragraph text.

### Example 3: Changing Page Title Shown in the Browser Tab (SEO)
1. Open the page route file (for instance, `src/app/page.tsx` or `src/app/artist/page.tsx`).
2. Locate the `metadata` export near the top:
   ```tsx
   export const metadata: Metadata = {
     title: 'Your Browser Tab Title Here',
     description: 'Your Google search description snippet here.',
   };
   ```
3. Update `title` or `description`.

### Example 4: Changing Projects List
1. Open [`src/app/projects/projectsData.ts`](file:///home/sankobite/studioNeo_ehh/src/app/projects/projectsData.ts).
2. Each item in `projectsData` is an object:
   ```ts
   {
     id: 'cel-01',
     title: 'PROJECT TITLE',
     subtitle: 'Project Subtitle',
     category: 'Animation',
     description: 'Detailed description of the project...',
     // ...
   }
   ```
3. Edit the text fields or add new projects directly to this array.

### Example 5: Editing Artist Information (Bio, Avatar, Name)
1. Open [`src/data/illustrators.ts`](file:///home/sankobite/studioNeo_ehh/src/data/illustrators.ts).
2. Find the artist in the `illustrators` array:
   ```ts
   {
     id: 1,
     name: "sankobite",
     requestedHandle: "sankobite",
     handle: "sankobite",
     displayName: "sankobite",
     followers: 3,
     image: "...",
     avatarUrl: "...",
     profile: "https://x.com/sankobite",
   }
   ```
3. Edit `displayName`, `followers`, or `profile`.

---

## 5. Pro Tip: How to Find Any Text in 3 Seconds

If you see text on your screen (for example: *"A living directory of the illustrators"*):
1. Copy a unique 3-5 word phrase from that text.
2. In VS Code / your editor, press **`Ctrl + Shift + F`** (Find in Files).
3. Search for that phrase inside the `src/` directory.
4. You will immediately jump directly to the exact file and line number containing that text!
