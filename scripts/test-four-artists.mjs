import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = path.resolve('./test-artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('Starting 4 Artists Integration E2E Tests...');

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

    // Verify all 9 artists in dropdown
    const artistItems = await page.$$('.artist-dropdown-item');
    console.log(`Found ${artistItems.length} artists in dropdown menu.`);
    if (artistItems.length < 9) {
      throw new Error(`Expected at least 9 artists in dropdown, got ${artistItems.length}`);
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'nav-dropdown-9-artists.png') });
    console.log('Captured nav-dropdown-9-artists.png');

    // -------------------------------------------------------------
    // Test 2: Switch to DINO
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Switch to DINO via Dropdown ---');
    // Find item with DINO text
    const dinoItem = await page.evaluateHandle(() => {
      const items = Array.from(document.querySelectorAll('.artist-dropdown-item'));
      return items.find((el) => el.textContent && el.textContent.includes('DINO'));
    });
    if (!dinoItem) throw new Error('DINO item not found in dropdown');
    await dinoItem.click();
    await wait(1000);

    const dinoPage = await page.$('.dinoillus-page');
    if (!dinoPage) throw new Error('.dinoillus-page not rendered');
    console.log('DINO page rendered successfully.');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'artist-dinoillus.png') });

    // -------------------------------------------------------------
    // Test 3: Direct route /artist/lam
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Direct route /artist/lam ---');
    await page.goto('http://localhost:3000/artist/lam', { waitUntil: 'networkidle2' });
    await wait(1200);

    const lamPage = await page.$('.lam-page');
    if (!lamPage) throw new Error('.lam-page not rendered');
    const studioNavOnLam = await page.$('.studio-nav-header');
    if (!studioNavOnLam) throw new Error('StudioNav not found on LAM page');
    console.log('LAM page rendered with StudioNav.');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'artist-lam.png') });

    // -------------------------------------------------------------
    // Test 4: Direct route /artist/dolman
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Direct route /artist/dolman ---');
    await page.goto('http://localhost:3000/artist/dolman', { waitUntil: 'networkidle2' });
    await wait(1000);

    const dolmanPage = await page.$('.dolman-page');
    if (!dolmanPage) throw new Error('.dolman-page not rendered');
    const studioNavOnDolman = await page.$('.studio-nav-header');
    if (!studioNavOnDolman) throw new Error('StudioNav not found on Dolman page');
    console.log('Dolman page rendered with StudioNav.');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'artist-dolman.png') });

    // -------------------------------------------------------------
    // Test 5: Direct route /artist/tatamipi
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Direct route /artist/tatamipi ---');
    await page.goto('http://localhost:3000/artist/tatamipi', { waitUntil: 'networkidle2' });
    await wait(1000);

    const tatamipiPage = await page.$('.tatamipi-page');
    if (!tatamipiPage) throw new Error('.tatamipi-page not rendered');
    const studioNavOnTatamipi = await page.$('.studio-nav-header');
    if (!studioNavOnTatamipi) throw new Error('StudioNav not found on tatamipi page');
    console.log('Tatamipi page rendered with StudioNav.');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'artist-tatamipi.png') });

    // -------------------------------------------------------------
    // Test 6: Verify Alias /artist/dinuillus
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Alias /artist/dinuillus ---');
    await page.goto('http://localhost:3000/artist/dinuillus', { waitUntil: 'networkidle2' });
    await wait(800);
    const dinuPage = await page.$('.dinoillus-page');
    if (!dinuPage) throw new Error('.dinoillus-page not rendered on /artist/dinuillus');
    console.log('Alias /artist/dinuillus resolved to DinoillusPage successfully.');

    console.log('\nALL 6 VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
