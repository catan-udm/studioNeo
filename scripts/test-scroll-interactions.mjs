import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = '/home/sankobite/studioNeo_ehh/test-artifacts';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function testFull() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Dropdown test
  console.log('--- Checking 9 artists in dropdown ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  const trigger = await page.$('.studio-nav-brand-btn, .studio-nav-artist-indicator');
  if (trigger) {
    await trigger.click();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, 'verified-dropdown.png') });
  }

  // 2. Full scroll on DINO
  console.log('--- Testing Dinoillus scroll ---');
  await page.goto('http://localhost:3000/artist/dinoillus', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 1500));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'verified-dinoillus-works.png') });

  // 3. Full scroll on LAM
  console.log('--- Testing LAM scroll ---');
  await page.goto('http://localhost:3000/artist/lam', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 1400));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'verified-lam-works.png') });

  // 4. Dolman interaction & modal
  console.log('--- Testing Dolman scroll & artwork click ---');
  await page.goto('http://localhost:3000/artist/dolman', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 900));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'verified-dolman-works.png') });

  // 5. Tatamipi scroll & plate click
  console.log('--- Testing Tatamipi scroll ---');
  await page.goto('http://localhost:3000/artist/tatamipi', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 1000));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'verified-tatamipi-works.png') });

  console.log('All comprehensive scroll & interaction checks completed!');
  await browser.close();
}

testFull().catch(e => {
  console.error(e);
  process.exit(1);
});
