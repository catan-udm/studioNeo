import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/docs-screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Capturing Desktop Landing...');
  await desktopPage.goto('http://localhost:3000/?view=atelier', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await desktopPage.screenshot({ path: path.join(outDir, '01-landing-desktop.png') });

  console.log('Capturing Desktop Landing Scrolled (Dynamic Island Morph)...');
  await desktopPage.evaluate(() => window.scrollTo(0, 350));
  await new Promise(r => setTimeout(r, 600));
  await desktopPage.screenshot({ path: path.join(outDir, '02-dynamic-island-scrolled-desktop.png') });

  console.log('Capturing Mobile Landing...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://localhost:3000/?view=atelier', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await mobilePage.screenshot({ path: path.join(outDir, '03-landing-mobile.png') });

  console.log('Capturing Mobile Dock Navigation...');
  await mobilePage.evaluate(() => window.scrollTo(0, 500));
  await new Promise(r => setTimeout(r, 600));
  await mobilePage.screenshot({ path: path.join(outDir, '04-mobile-dock-scrolled.png') });

  console.log('Capturing Login / Biometric Passkey Window (Desktop)...');
  await desktopPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await desktopPage.screenshot({ path: path.join(outDir, '05-auth-modal-desktop.png') });

  console.log('Capturing Login Window (Mobile)...');
  await mobilePage.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await mobilePage.screenshot({ path: path.join(outDir, '06-auth-modal-mobile.png') });

  console.log('Capturing Digital Asset Vault / Gallery (Desktop)...');
  await desktopPage.goto('http://localhost:3000/gallery', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await desktopPage.screenshot({ path: path.join(outDir, '07-asset-vault-desktop.png') });

  console.log('Capturing Asset Vault (Mobile)...');
  await mobilePage.goto('http://localhost:3000/gallery', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await mobilePage.screenshot({ path: path.join(outDir, '08-asset-vault-mobile.png') });

  console.log('Capturing Artist Tribute Archive (Desktop - sankobite)...');
  await desktopPage.goto('http://localhost:3000/artist/sankobite', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await desktopPage.screenshot({ path: path.join(outDir, '09-artist-archive-desktop.png') });

  console.log('Capturing Artist Tribute Archive (Mobile - sankobite)...');
  await mobilePage.goto('http://localhost:3000/artist/sankobite', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await mobilePage.screenshot({ path: path.join(outDir, '10-artist-archive-mobile.png') });

  console.log('Capturing Artist LAM Interactive Experience...');
  await desktopPage.goto('http://localhost:3000/artist/lam', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await desktopPage.screenshot({ path: path.join(outDir, '11-artist-lam-desktop.png') });

  console.log('Capturing Projects Page (Desktop)...');
  await desktopPage.goto('http://localhost:3000/projects', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await desktopPage.screenshot({ path: path.join(outDir, '12-projects-desktop.png') });

  console.log('Capturing Projects Page (Mobile)...');
  await mobilePage.goto('http://localhost:3000/projects', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await mobilePage.screenshot({ path: path.join(outDir, '13-projects-mobile.png') });

  console.log('Capturing Authenticated Feed (by mocking session in browser)...');
  await desktopPage.evaluate(() => {
    localStorage.setItem('sanko_auth_cache', JSON.stringify({
      authenticated: true,
      subscriber: {
        id: 1042,
        email: 'artist@studioneo.tech',
        handle: 'catan',
        displayName: 'Carl Adrian Tan',
        role: 'partner',
        isCurator: true,
        artistDistinction: 'partner',
        passkeysCount: 2,
        totpActive: true
      }
    }));
  });
  await desktopPage.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await desktopPage.screenshot({ path: path.join(outDir, '14-authenticated-feed-desktop.png') });

  await mobilePage.evaluate(() => {
    localStorage.setItem('sanko_auth_cache', JSON.stringify({
      authenticated: true,
      subscriber: {
        id: 1042,
        email: 'artist@studioneo.tech',
        handle: 'catan',
        displayName: 'Carl Adrian Tan',
        role: 'partner',
        isCurator: true,
        artistDistinction: 'partner',
        passkeysCount: 2,
        totpActive: true
      }
    }));
  });
  await mobilePage.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await mobilePage.screenshot({ path: path.join(outDir, '15-authenticated-feed-mobile.png') });

  // Try opening an export modal or settings modal
  console.log('Capturing Settings Modal (Desktop)...');
  await desktopPage.goto('http://localhost:3000/settings', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await desktopPage.screenshot({ path: path.join(outDir, '16-settings-desktop.png') });

  await browser.close();
  console.log('All screenshots captured successfully in', outDir);
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
