import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ASK_DIR = path.join(ROOT, 'public/images/askziye');
const DORA_DIR = path.join(ROOT, 'public/images/dora');
const KADUISE_DIR = path.join(ROOT, 'public/images/kaduise');

fs.mkdirSync(ASK_DIR, { recursive: true });
fs.mkdirSync(DORA_DIR, { recursive: true });
fs.mkdirSync(KADUISE_DIR, { recursive: true });

async function downloadFile(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log(`[EXISTS] ${path.basename(dest)}`);
    return true;
  }
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': url.includes('pixiv') ? 'https://www.pixiv.net/' : 'https://twitter.com/'
      }
    });
    if (!res.ok) {
      console.warn(`[FAIL ${res.status}] ${url}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 500) {
      console.warn(`[TOO SMALL] ${url} (${buffer.length}b)`);
      return false;
    }
    fs.writeFileSync(dest, buffer);
    console.log(`[DOWNLOADED] ${path.basename(dest)} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return true;
  } catch (err) {
    console.warn(`[ERROR] ${url}: ${err.message}`);
    return false;
  }
}

// 1. ASK
const ASK_WORKS = [
  { id: "shaohua", pixiv: "84026087" },
  { id: "meihua", pixiv: "142029374" },
  { id: "sleeping-beauty", pixiv: "90831251" },
  { id: "sophon", pixiv: "52520072" },
  { id: "sophon-meeting", pixiv: "124457097" },
  { id: "dusk-to-dawn", pixiv: "95252574" },
  { id: "dusk-to-dawn-2", pixiv: "95252574" },
  { id: "kanon", pixiv: "71169136" },
  { id: "saber-lily", pixiv: "51711470" },
  { id: "bride", pixiv: "99328441" },
  { id: "flower-language", pixiv: "106524316" },
  { id: "luminosite", pixiv: "79386917" },
  { id: "glimmer", pixiv: "114287760" },
  { id: "oberon", pixiv: "113680947" },
  { id: "always", pixiv: "94219701" },
  { id: "secret", pixiv: "98322260" },
  { id: "davinci", pixiv: "82028470" },
  { id: "sunset", pixiv: "60224597" },
  { id: "persona5", pixiv: "71982822" },
  { id: "entelechia", pixiv: "103681534" },
  { id: "entelechia-2", pixiv: "103681534" },
  { id: "eva", pixiv: "89882673" },
  { id: "azur-lane", pixiv: "72124594" }
];

const SURTR_URLS = [
  { id: "surtr-e2", url: "https://raw.githubusercontent.com/Aceship/Arknight-Images/main/characters/char_350_surtr_2.png" },
  { id: "surtr-base", url: "https://raw.githubusercontent.com/Aceship/Arknight-Images/main/characters/char_350_surtr_1.png" },
  { id: "surtr-liberte", url: "https://raw.githubusercontent.com/Aceship/Arknight-Images/main/characters/char_350_surtr_skin1.png" }
];

// 2. DORA
const DORA_WORKS = [
  { id: "01", pixiv: "136109601" },
  { id: "02", pixiv: "130978364" },
  { id: "03", pixiv: "129993264" },
  { id: "04", pixiv: "127721109" },
  { id: "05", pixiv: "139354097" },
  { id: "06", pixiv: "141231543" },
  { id: "07", pixiv: "118638772" },
  { id: "08", pixiv: "150765491" },
  { id: "09", pixiv: "146325001" },
  { id: "10", pixiv: "144673031" },
  { id: "11", pixiv: "139644267" },
  { id: "12", pixiv: "127123227" },
  { id: "13", pixiv: "125463378" },
  { id: "14", pixiv: "90600639" },
  { id: "15", pixiv: "91902839" },
  { id: "16", pixiv: "87648179" },
  { id: "17", pixiv: "88213931" },
  { id: "18", pixiv: "83835856" },
  { id: "19", pixiv: "121855872" },
  { id: "20", pixiv: "142139028" },
  { id: "21", pixiv: "124500472" },
  { id: "22", pixiv: "133882960" }
];

// 3. KADUISE
const KADUISE_DAILY = [
  "151457717", "151422265", "151385249", "151348421", "151311318",
  "151272593", "151226645", "151187518", "151145455", "151080036",
  "151043578", "151005018", "150960708", "150920598", "150884183",
  "150848597", "150819863", "150774558", "150095278"
];

async function main() {
  console.log('=== 1. Downloading ASK Actual Images ===');
  await downloadFile("https://pbs.twimg.com/profile_images/1232862373209231361/XqqCEzXQ_400x400.jpg", path.join(ASK_DIR, "avatar.jpg"));
  for (const w of ASK_WORKS) {
    const urls = [
      `https://pixiv.re/${w.pixiv}.jpg`,
      `https://pixiv.cat/${w.pixiv}.jpg`,
      `https://embed.pixiv.net/artwork.php?illust_id=${w.pixiv}`
    ];
    let ok = false;
    for (const u of urls) {
      ok = await downloadFile(u, path.join(ASK_DIR, `${w.id}.jpg`));
      if (ok) break;
    }
    // Also create thumb if not exists
    const full = path.join(ASK_DIR, `${w.id}.jpg`);
    const thumb = path.join(ASK_DIR, `${w.id}_thumb.jpg`);
    if (fs.existsSync(full) && !fs.existsSync(thumb)) {
      fs.copyFileSync(full, thumb);
    }
  }
  for (const s of SURTR_URLS) {
    await downloadFile(s.url, path.join(ASK_DIR, `${s.id}.png`));
    const full = path.join(ASK_DIR, `${s.id}.png`);
    const thumb = path.join(ASK_DIR, `${s.id}_thumb.png`);
    if (fs.existsSync(full) && !fs.existsSync(thumb)) {
      fs.copyFileSync(full, thumb);
    }
  }

  console.log('\n=== 2. Downloading DORA Actual Images ===');
  await downloadFile("https://pbs.twimg.com/profile_images/1427287385629286402/wrykwNQH_400x400.jpg", path.join(DORA_DIR, "avatar.jpg"));
  for (const w of DORA_WORKS) {
    const urls = [
      `https://pixiv.re/${w.pixiv}.jpg`,
      `https://pixiv.cat/${w.pixiv}.jpg`,
      `https://embed.pixiv.net/artwork.php?illust_id=${w.pixiv}`
    ];
    let ok = false;
    for (const u of urls) {
      ok = await downloadFile(u, path.join(DORA_DIR, `${w.id}.jpg`));
      if (ok) break;
    }
    const full = path.join(DORA_DIR, `${w.id}.jpg`);
    const thumb = path.join(DORA_DIR, `${w.id}_thumb.jpg`);
    if (fs.existsSync(full) && !fs.existsSync(thumb)) {
      fs.copyFileSync(full, thumb);
    }
  }

  console.log('\n=== 3. Downloading KADUISE Daily Artworks ===');
  await downloadFile("https://pbs.twimg.com/profile_images/1712156621387026432/nmyTZeq3_400x400.jpg", path.join(KADUISE_DIR, "avatar.jpg"));
  for (const id of KADUISE_DAILY) {
    const urls = [
      `https://pixiv.re/${id}.jpg`,
      `https://pixiv.cat/${id}.jpg`,
      `https://embed.pixiv.net/artwork.php?illust_id=${id}`
    ];
    let ok = false;
    for (const u of urls) {
      ok = await downloadFile(u, path.join(KADUISE_DIR, `${id}.jpg`));
      if (ok) break;
    }
  }

  console.log('\n=== 4. Downloading KADUISE Twitter Artworks ===');
  // Read WORKS from works.ts
  const worksTs = fs.readFileSync(path.join(ROOT, 'src/components/archive/kaduise/data/works.ts'), 'utf8');
  const tweetRegex = /k:\s*["']([^"']+)["'],[\s\S]*?id:\s*["'](\d+)["']/g;
  let m;
  const tweetWorks = [];
  while ((m = tweetRegex.exec(worksTs)) !== null) {
    tweetWorks.push({ k: m[1], id: m[2] });
  }

  console.log(`Found ${tweetWorks.length} kaduise tweet works to fetch...`);
  for (const tw of tweetWorks) {
    const dest = path.join(KADUISE_DIR, `${tw.k}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`[EXISTS] ${tw.k}.jpg`);
      continue;
    }
    try {
      const apiRes = await fetch(`https://api.fxtwitter.com/kaduise/status/${tw.id}`);
      if (apiRes.ok) {
        const json = await apiRes.json();
        const photoUrl = json.tweet?.media?.photos?.[0]?.url || json.tweet?.media?.all?.[0]?.url;
        if (photoUrl) {
          await downloadFile(photoUrl, dest);
        } else {
          console.warn(`[NO MEDIA IN TWEET] ${tw.k} (${tw.id})`);
        }
      } else {
        console.warn(`[FXTWITTER FAIL ${apiRes.status}] ${tw.id}`);
      }
    } catch (e) {
      console.warn(`[TWEET ERR] ${tw.k}: ${e.message}`);
    }
    // slight delay to be polite to fxtwitter
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n=== DOWNLOAD COMPLETE ===');
}

main().catch(console.error);
