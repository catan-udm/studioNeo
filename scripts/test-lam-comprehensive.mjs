import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = '/home/sankobite/studioNeo_ehh/test-artifacts';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function testLam() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  console.log('Navigating to /artist/lam...');
  await page.goto('http://localhost:3000/artist/lam', { waitUntil: 'networkidle2' });

  // Wait for intro loader to finish and fade out (takes ~1.2s max)
  await new Promise(r => setTimeout(r, 2000));

  console.log('1. Capturing LAM Hero...');
  await page.screenshot({ path: path.join(outDir, 'lam-01-hero.png') });

  console.log('2. Capturing LAM Works section...');
  await page.evaluate(() => {
    const el = document.getElementById('works');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'lam-02-works.png') });

  console.log('3. Capturing LAM Practice & Worlds section...');
  await page.evaluate(() => {
    const el = document.getElementById('practice');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'lam-03-practice.png') });

  console.log('4. Capturing LAM Profile section...');
  await page.evaluate(() => {
    const el = document.getElementById('profile');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'lam-04-profile.png') });

  console.log('5. Capturing LAM Exhibition section with band...');
  await page.evaluate(() => {
    const el = document.getElementById('exhibition');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'lam-05-exhibition.png') });

  console.log('6. Capturing LAM Contact & Footer...');
  await page.evaluate(() => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'lam-06-contact.png') });

  console.log('7. Testing Artwork Modal Viewer...');
  await page.evaluate(() => {
    const el = document.getElementById('works');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 500));
  const firstArtworkBtn = await page.$('.artwork__button');
  if (firstArtworkBtn) {
    await firstArtworkBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, 'lam-07-modal-viewer.png') });
  } else {
    console.warn('Could not find .artwork__button');
  }

  console.log('Console errors encountered:', errors);
  await browser.close();
  console.log('LAM comprehensive test complete!');
}

testLam().catch(e => {
  console.error(e);
  process.exit(1);
});
