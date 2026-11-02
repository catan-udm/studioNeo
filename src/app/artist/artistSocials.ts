/**
 * Direct links to verified social media profiles (X/Twitter and Pixiv) for each illustrator.
 */

export const PIXIV_USER_MAP: Record<string, string> = {
  sankobite: 'https://www.pixiv.net/users/92602222',
  rellakinoko: 'https://www.pixiv.net/users/163536',
  rella: 'https://www.pixiv.net/users/163536',
  tami_moon02: 'https://www.pixiv.net/users/58269931',
  tamimoon: 'https://www.pixiv.net/users/58269931',
  yoneyamai: 'https://www.pixiv.net/users/1554775',
  yoneyama_mai: 'https://www.pixiv.net/users/1554775',
  mikapikazo: 'https://www.pixiv.net/users/1039353',
  mika_pikazo: 'https://www.pixiv.net/users/1039353',
  dino_illus: 'https://www.pixiv.net/users/66807813',
  dinoillus: 'https://www.pixiv.net/users/66807813',
  ramdayo1122: 'https://www.pixiv.net/users/17429',
  ramdayo: 'https://www.pixiv.net/users/17429',
  lam: 'https://www.pixiv.net/users/17429',
  dolman4878: 'https://www.pixiv.net/users/5956449',
  dolman: 'https://www.pixiv.net/users/5956449',
  tatamipi: 'https://www.pixiv.net/users/42371995',
  askziye: 'https://www.pixiv.net/users/1980643',
  ask: 'https://www.pixiv.net/users/1980643',
  dora_xxi: 'https://www.pixiv.net/users/6002101',
  dora: 'https://www.pixiv.net/users/6002101',
  kaduise: 'https://www.pixiv.net/users/1031168',
  trcoot: 'https://www.pixiv.net/users/2764844',
  berryverrine: 'https://www.pixiv.net/users/13167207',
  aki001208: 'https://www.pixiv.net/users/7778526',
  ewkkyorhr: 'https://www.pixiv.net/users/40378411',
  nounoknown: 'https://www.pixiv.net/users/2460057',
  akakura1341: 'https://www.pixiv.net/users/882569',
  ekureea: 'https://www.pixiv.net/users/299299',
  superciderx: 'https://www.pixiv.net/users/11985474',
  palow_: 'https://www.pixiv.net/users/5954358',
  palow: 'https://www.pixiv.net/users/5954358',
  hamukukka: 'https://www.pixiv.net/users/6148565',
  mar_takagi: 'https://www.pixiv.net/users/12028670',
  bunbun922: 'https://www.pixiv.net/users/8142',
  taiki99: 'https://www.pixiv.net/users/16353',
  sevnzel: 'https://www.pixiv.net/users/176503',
  reoenl: 'https://www.pixiv.net/users/3927625',
  pokimari02: 'https://www.pixiv.net/users/63950',
  fuzichoco: 'https://www.pixiv.net/users/145944',
  anmi_: 'https://www.pixiv.net/users/212801',
  anmi: 'https://www.pixiv.net/users/212801',
  nardack: 'https://www.pixiv.net/users/341433',
  lalalalack: 'https://www.pixiv.net/users/83739',
  lack: 'https://www.pixiv.net/users/83739',
  kuroboshi: 'https://www.pixiv.net/users/178217',
  demizuposuka: 'https://www.pixiv.net/users/33333',
  hitenkei: 'https://www.pixiv.net/users/490219',
  hiten: 'https://www.pixiv.net/users/490219',
  kaisen_tobiuo: 'https://www.pixiv.net/users/18362',
  kuvshinov_ilya: 'https://www.pixiv.net/users/789222',
  daisukerichard: 'https://www.pixiv.net/users/17301535',
  wataboku_: 'https://www.pixiv.net/users/1602899',
  littlethunderr: 'https://www.pixiv.net/users/2561917',
  omrice4869: 'https://www.pixiv.net/users/1499614',
  ug0nba: 'https://www.pixiv.net/users/6005232',
  gojio_: 'https://www.pixiv.net/users/7533633',
  murata_range: 'https://www.pixiv.net/users/4215',
  key_999: 'https://www.pixiv.net/users/1029272',
  avogado6: 'https://www.pixiv.net/users/883091',
  coalowl: 'https://www.pixiv.net/users/35928172',
  waboku2015: 'https://www.pixiv.net/users/10940384',
  maruti_bitamin: 'https://www.pixiv.net/users/18025211',
  meyoco_: 'https://www.pixiv.net/users/15873215',
  manuhamu: 'https://www.pixiv.net/users/228408',
  hc_feee: 'https://www.pixiv.net/users/4751430',
  __lm7__: 'https://www.pixiv.net/users/420928',
  lm7: 'https://www.pixiv.net/users/420928',
  alchehehe: 'https://www.pixiv.net/users/3639896',
  infukun: 'https://www.pixiv.net/users/5065896',
  kuroimori_twee: 'https://www.pixiv.net/users/137452',
  ohg_m3: 'https://www.pixiv.net/users/3218521',
  yogisya: 'https://www.pixiv.net/users/186716',
  tamak0: 'https://www.pixiv.net/users/46194',
  lowro_: 'https://www.pixiv.net/users/3380078',
  miv4t_: 'https://www.pixiv.net/users/11246082',
  jeonghee1414: 'https://www.pixiv.net/users/1878082',
  lidukelaya: 'https://www.pixiv.net/users/38088',
  _swav_: 'https://www.pixiv.net/users/5130774',
};

export function getArtistPixiv(artist: {
  handle: string;
  requestedHandle?: string;
  name?: string;
  displayName?: string;
}): string {
  const h = (artist.handle || '').toLowerCase();
  const req = (artist.requestedHandle || '').toLowerCase();
  if (PIXIV_USER_MAP[h]) return PIXIV_USER_MAP[h];
  if (PIXIV_USER_MAP[req]) return PIXIV_USER_MAP[req];
  return `https://www.pixiv.net/en/tags/${encodeURIComponent(artist.displayName || artist.name || artist.handle)}`;
}

export function getArtistTwitter(artist: {
  handle: string;
  profile?: string;
}): string {
  if (artist.profile && artist.profile.startsWith('http')) {
    return artist.profile;
  }
  return `https://x.com/${artist.handle}`;
}
