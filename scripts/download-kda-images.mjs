import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const outDir = '/home/sankobite/studioNeo_ehh/public/images/kda';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const assets = [
  { name: 'riot-splash.jpg', url: 'https://pbs.twimg.com/media/HVC6ohbWwAAH9vX?format=jpg&name=4096x4096' },
  { name: 'hero.jpg', url: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/5dfc8d38402e1da4e1d970287948ef6b2189b686-3072x1294.jpg?accountingTag=LoL' },
  { name: 'video.jpg', url: 'https://img.youtube.com/vi/Mmw-PpWhKFg/maxresdefault.jpg' },
  { name: 'watchme-riot.jpg', url: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/18a8d8e522499301529886019b57a34af05477a4-1920x1080.jpg?accountingTag=LoL' },
  { name: 'never-riot.jpg', url: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/01d34b649e45e0f2d75eb29a2113fca159258d3d-1920x1080.jpg?accountingTag=LoL' },
  { name: 'choreo.jpg', url: 'https://img.youtube.com/vi/Ko9VF6dDnAk/maxresdefault.jpg' },
  { name: 'more-video.jpg', url: 'https://img.youtube.com/vi/3VTkBuxU4yk/maxresdefault.jpg' },
  { name: 'popstars-video.jpg', url: 'https://img.youtube.com/vi/UOxkGD8qRB4/maxresdefault.jpg' },
  { name: 'cover.jpg', url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/9b/7a/b4/9b7ab480-ae42-e28b-0253-b0d6caef607a/823375358978_Cover.jpg/1000x1000bb.jpg' },
  { name: 'single.jpg', url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/93/14/66/9314660a-8ec2-2e26-652b-62c82b14fb80/823375358930_Cover.jpg/1000x1000bb.jpg' },
  { name: 'allout.jpg', url: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/67/11/24/671124b5-7b83-672c-46fc-92245524db3d/00198704643033_Cover.jpg/1000x1000bb.jpg' },
  { name: 'popstars.jpg', url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/93/f8/8a/93f88a32-342c-b650-ef1c-ebc1c9f804c3/00198704643309_Cover.jpg/1000x1000bb.jpg' },
  { name: 'baddest.jpg', url: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/83/d3/23/83d323c8-758f-b3f7-b28e-e00fb35f797e/00198704643255_Cover.jpg/1000x1000bb.jpg' },
  { name: 'more.jpg', url: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f8/cf/d7/f8cfd7ec-2b3d-0dd8-3a6e-4d04d3a8e2ae/00198704643330_Cover.jpg/1000x1000bb.jpg' },
  { name: 'sona.jpg', url: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Sona_6.jpg' },
  { name: 'merch.jpg', url: 'https://cdn.sanity.io/images/dsfx7636/consumer_products_live/1ec734cd3e0bb78f3e82a42b13ee5370be45db96-1550x1150.jpg' }
];

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
      stream.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log(`Downloading ${assets.length} K/DA assets to ${outDir}...`);
  for (const asset of assets) {
    const dest = path.join(outDir, asset.name);
    try {
      await downloadFile(asset.url, dest);
      const size = fs.statSync(dest).size;
      console.log(`✓ ${asset.name} (${(size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`✗ ${asset.name}: ${err.message}`);
    }
  }

  // Create avatar.jpg by copying cover.jpg
  const coverPath = path.join(outDir, 'cover.jpg');
  const avatarPath = path.join(outDir, 'avatar.jpg');
  if (fs.existsSync(coverPath)) {
    fs.copyFileSync(coverPath, avatarPath);
    console.log(`✓ avatar.jpg created from cover.jpg`);
  }
}

main().catch(console.error);
