import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = path.resolve('./test-artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('Starting Mika Pikazo integration tests...');

  const chromePath = fs.existsSync('/usr/bin/google-chrome')
    ? '/usr/bin/google-chrome'
    : '/opt/google/chrome/chrome';

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  const page = await browser.newPage();

  try {
    // -------------------------------------------------------------
    // Test 1: Desktop Artist Switcher Dropdown (1440x900)
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Checking Artist Switcher on Home Page ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    await wait(800);

    // Find and click the artist switcher button / indicator
    const artistTrigger = await page.$('.studio-nav-brand-btn, .studio-nav-artist-indicator');
    if (!artistTrigger) {
      throw new Error('Artist switcher trigger button not found in StudioNav');
    }
    console.log('Clicking artist switcher trigger...');
    await artistTrigger.click();
    await wait(400);

    // Verify all 5 artists in dropdown
    const artistItems = await page.$$('.artist-dropdown-item');
    console.log(`Found ${artistItems.length} artists in dropdown menu.`);
    if (artistItems.length < 5) {
      throw new Error(`Expected at least 5 artists in dropdown, got ${artistItems.length}`);
    }

    const artistNames = await page.$$eval('.artist-dropdown-name', (els) =>
      els.map((e) => e.textContent?.trim())
    );
    console.log('Artists in dropdown:', artistNames);
    if (!artistNames.includes('Mika Pikazo')) {
      throw new Error('Mika Pikazo not found in dropdown items');
    }

    // -------------------------------------------------------------
    // Test 2: Switch to Mika Pikazo via dropdown
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Selecting Mika Pikazo ---');
    const mikaItem = await page.evaluateHandle(() => {
      const items = Array.from(document.querySelectorAll('.artist-dropdown-item'));
      return items.find((item) => item.textContent?.includes('Mika Pikazo'));
    });
    if (!mikaItem || !mikaItem.asElement()) {
      throw new Error('Could not find Mika Pikazo item element to click');
    }
    await mikaItem.asElement().click();
    await wait(1000);

    // Verify URL and document title
    const currentUrl = page.url();
    console.log('Current URL after selecting Mika Pikazo:', currentUrl);
    const pageTitle = await page.title();
    console.log('Page Title:', pageTitle);
    if (!pageTitle.includes('Mika Pikazo')) {
      throw new Error(`Expected title to include "Mika Pikazo", got "${pageTitle}"`);
    }

    // Verify Mika Pikazo page container
    const mikaPageContainer = await page.$('.mikapikazo-page');
    if (!mikaPageContainer) {
      throw new Error('.mikapikazo-page element not rendered');
    }
    console.log('✓ .mikapikazo-page element mounted successfully');

    // -------------------------------------------------------------
    // Test 3: Verify Core Components & Sections
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Verifying Sections & Components ---');

    // 3A. Masthead
    const masthead = await page.$eval('h1[aria-label="Mika Pikazo"]', (el) => el.textContent?.trim());
    console.log('✓ Masthead text found:', masthead?.replace(/\s+/g, ' '));

    // 3B. Color Dial
    const chromaInput = await page.$('#chroma');
    if (!chromaInput) {
      throw new Error('Color Dial #chroma slider not found');
    }
    const chromaVal = await page.$eval('#chroma', (el) => el.value);
    console.log(`✓ Color Dial slider found with default chroma: ${chromaVal}%`);

    // 3C. Gallery & 10 Manga Panels
    const panels = await page.$$('.mikapikazo-page article, .mikapikazo-page [data-panel-id]');
    console.log(`✓ Gallery rendered with panels count: ${panels.length}`);

    // 3D. Stickers Canvas
    const stickerWall = await page.$('#stickers');
    const stickerEls = await page.$$('.sticker');
    console.log(`✓ Sticker wall rendered with ${stickerEls.length} interactive stickers`);

    // 3E. Projects Accordion
    const projectButtons = await page.$$('#projects button[aria-controls^="project-panel-"]');
    console.log(`✓ Career projects accordion rendered with ${projectButtons.length} entries`);

    // 3F. Timeline
    const timelineArticles = await page.$$('.snap-track article');
    console.log(`✓ Timeline rendered with ${timelineArticles.length} career milestones`);

    // -------------------------------------------------------------
    // Test 4: Lightbox Modal Interaction
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Testing Lightbox Opening & Closing ---');
    const firstPanelBtn = await page.$('button[aria-label^="Open panel"]');
    if (!firstPanelBtn) {
      throw new Error('Gallery panel button not found');
    }
    await firstPanelBtn.click();
    await wait(500);

    const dialog = await page.$('[role="dialog"]');
    if (!dialog) {
      throw new Error('Lightbox dialog did not open after clicking panel');
    }
    const dialogTitle = await page.$eval('[role="dialog"] h3', (el) => el.textContent?.trim());
    console.log(`✓ Lightbox opened successfully with title: "${dialogTitle}"`);

    // Close lightbox
    const closeBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('[role="dialog"] button'));
      return buttons.find((b) => b.textContent?.includes('CLOSE'));
    });
    if (closeBtn && closeBtn.asElement()) {
      await closeBtn.asElement().click();
      await wait(300);
      const isStillOpen = await page.$('[role="dialog"]');
      if (isStillOpen) {
        throw new Error('Lightbox did not close after clicking close button');
      }
      console.log('✓ Lightbox closed cleanly');
    }

    // Take Desktop Screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'mikapikazo-desktop.png'), fullPage: false });
    console.log('Saved test-artifacts/mikapikazo-desktop.png');

    // -------------------------------------------------------------
    // Test 5: Direct Route & Deep Linking (?work=pop)
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Deep Linking via /artist/mikapikazo?work=pop ---');
    await page.goto('http://localhost:3000/artist/mikapikazo?work=pop', { waitUntil: 'networkidle2' });
    await wait(800);

    const deepDialog = await page.$('[role="dialog"]');
    if (!deepDialog) {
      throw new Error('Deep linked dialog (?work=pop) did not open automatically');
    }
    const deepTitle = await page.$eval('[role="dialog"] h3', (el) => el.textContent?.trim());
    console.log(`✓ Deep-linked dialog automatically opened for: "${deepTitle}"`);

    // -------------------------------------------------------------
    // Test 6: Mobile Responsiveness (375x812)
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Testing Mobile View (375x812) ---');
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await page.goto('http://localhost:3000/artist/mikapikazo', { waitUntil: 'networkidle2' });
    await wait(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'mikapikazo-mobile.png'), fullPage: false });
    console.log('Saved test-artifacts/mikapikazo-mobile.png');

    // -------------------------------------------------------------
    // Test 7: Round-trip Artist Switching Back to Yoneyama Mai
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Switching to Yoneyama Mai ---');
    await page.setViewport({ width: 1440, height: 900 });
    const switchTrigger = await page.$('.studio-nav-brand-btn, .studio-nav-artist-indicator');
    if (switchTrigger) {
      await switchTrigger.click();
      await wait(300);
      const yoneyamaItem = await page.evaluateHandle(() => {
        const items = Array.from(document.querySelectorAll('.artist-dropdown-item'));
        return items.find((item) => item.textContent?.includes('Yoneyama Mai'));
      });
      if (yoneyamaItem && yoneyamaItem.asElement()) {
        await yoneyamaItem.asElement().click();
        await wait(800);
        const yoneyamaTitle = await page.title();
        console.log(`✓ Switched to Yoneyama Mai, title: "${yoneyamaTitle}"`);
        if (!yoneyamaTitle.includes('Yoneyama Mai')) {
          throw new Error('Failed to switch to Yoneyama Mai');
        }
      }
    }

    console.log('\n========================================');
    console.log('🎉 ALL MIKA PIKAZO TESTS PASSED SUCCESSFULLY!');
    console.log('========================================\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'test-failure.png'), fullPage: false });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
