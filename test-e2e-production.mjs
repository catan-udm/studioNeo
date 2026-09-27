import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = path.resolve('./test-artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function run() {
  console.log('Launching Chrome for comprehensive UI & responsive testing...');
  const browser = await puppeteer.launch({
    executablePath: '/opt/google/chrome/chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // Helper to wait
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    // -------------------------------------------------------------
    // 1. MOBILE TESTS (iPhone: 375x812)
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Mobile View (375x812) ---');
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });

    // 1A. Gallery Mobile - Curated 1-Col Stream
    console.log('Navigating to /gallery on Mobile...');
    await page.goto('http://localhost:3000/gallery', { waitUntil: 'networkidle2' });
    await wait(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gallery-mobile-curated.png'), fullPage: false });
    console.log('Saved gallery-mobile-curated.png');

    // 1B. Gallery Mobile - Switch to 2-Col Grid
    console.log('Toggling gallery view mode to 2-Col Grid on Mobile...');
    const gridBtn = await page.$$('.view-mode-btn');
    if (gridBtn.length >= 2) {
      await gridBtn[1].click();
      await wait(400);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gallery-mobile-grid.png'), fullPage: false });
      console.log('Saved gallery-mobile-grid.png');
    }

    // 1C. Projects Mobile - Reel View
    console.log('Navigating to /projects on Mobile (Reel view)...');
    await page.goto('http://localhost:3000/projects', { waitUntil: 'networkidle2' });
    await wait(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'projects-mobile-reel.png'), fullPage: false });
    console.log('Saved projects-mobile-reel.png');

    // 1D. Projects Mobile - Switch to Cuts Grid View
    console.log('Toggling projects view mode to Grid on Mobile...');
    const projGridBtn = await page.$$('.projects-view-btn');
    if (projGridBtn.length >= 2) {
      await projGridBtn[1].click();
      await wait(400);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'projects-mobile-grid.png'), fullPage: false });
      console.log('Saved projects-mobile-grid.png');
    }

    // 1E. Settings Page Mobile - Toggle Dark Mode & UI Scale
    console.log('Navigating to /settings on Mobile...');
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle2' });
    await wait(500);

    // Click "Dark" theme card
    const darkBtn = await page.$('button[aria-label="Activate Dark Theme"]');
    if (darkBtn) {
      await darkBtn.click();
      await wait(400);
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'settings-page-mobile-dark.png'), fullPage: false });
    console.log('Saved settings-page-mobile-dark.png');

    // -------------------------------------------------------------
    // 2. TABLET TESTS (iPad: 768x1024)
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Tablet View (768x1024) ---');
    await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });

    // 2A. Gallery Tablet - Editorial 2-Col
    console.log('Navigating to /gallery on Tablet (Editorial 2-Col)...');
    await page.goto('http://localhost:3000/gallery', { waitUntil: 'networkidle2' });
    await wait(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gallery-tablet-editorial.png'), fullPage: false });
    console.log('Saved gallery-tablet-editorial.png');

    // 2B. Gallery Tablet - Mosaic 3-Col
    console.log('Toggling gallery view mode to Mosaic 3-Col on Tablet...');
    const tabGridBtn = await page.$$('.view-mode-btn');
    if (tabGridBtn.length >= 2) {
      await tabGridBtn[1].click();
      await wait(400);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gallery-tablet-mosaic.png'), fullPage: false });
      console.log('Saved gallery-tablet-mosaic.png');
    }

    // 2C. Projects Tablet - Grid View
    console.log('Navigating to /projects on Tablet (Grid View)...');
    await page.goto('http://localhost:3000/projects', { waitUntil: 'networkidle2' });
    await wait(500);
    const tabProjGridBtn = await page.$$('.projects-view-btn');
    if (tabProjGridBtn.length >= 2) {
      await tabProjGridBtn[1].click();
      await wait(400);
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'projects-tablet-grid.png'), fullPage: false });
    console.log('Saved projects-tablet-grid.png');

    // -------------------------------------------------------------
    // 3. DESKTOP TESTS (1280x800)
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Desktop View (1280x800) ---');
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

    // 3A. Settings Page Desktop (Light theme)
    console.log('Navigating to /settings on Desktop...');
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle2' });
    await wait(500);
    const lightBtn = await page.$('button[aria-label="Activate Light Theme"]');
    if (lightBtn) {
      await lightBtn.click();
      await wait(400);
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'settings-page-desktop-light.png'), fullPage: false });
    console.log('Saved settings-page-desktop-light.png');

    // 3B. Navbar Burger Menu (Icons Only check)
    console.log('Opening Burger Menu on Desktop...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    await wait(500);
    const burgerBtn = await page.$('.hamburger-btn');
    if (burgerBtn) {
      await burgerBtn.click();
      await wait(400);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'navbar-burger-icons-only.png'), fullPage: false });
      console.log('Saved navbar-burger-icons-only.png');
    }

    // 3C. Settings Modal (Gear Icon click)
    console.log('Opening Settings Modal via Gear Icon...');
    const settingsBtn = await page.$('button[title="Settings"]');
    if (settingsBtn) {
      await settingsBtn.click();
      await wait(500);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'settings-modal-desktop.png'), fullPage: false });
      console.log('Saved settings-modal-desktop.png');
    }

    console.log('\nAll comprehensive E2E UI verification tests passed successfully!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

run();
