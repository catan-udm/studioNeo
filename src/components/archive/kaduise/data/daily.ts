/**
 * Daily output, taken from the artist's pixiv account (user 1031168).
 * 671 illustrations published between 2023-06-01 and 2026-10-30.
 */

export type Daily = { id: string; d: string; ar: number; t: string; en: string };

export const PIXIV_USER = "https://www.pixiv.net/users/1031168";
export const PX = (id: string) => `https://www.pixiv.net/artworks/${id}`;

/** The 18 most recent drawings + the VISIONS 2027 announcement piece. */
export const DAILY: Daily[] = [
  { id: "151457717", d: "2026-10-30", ar: 1.474, t: "", en: "" },
  { id: "151422265", d: "2026-10-29", ar: 1.476, t: "", en: "" },
  { id: "151385249", d: "2026-10-28", ar: 1.478, t: "", en: "" },
  { id: "151348421", d: "2026-10-27", ar: 1.479, t: "", en: "" },
  { id: "151311318", d: "2026-10-26", ar: 1.479, t: "", en: "" },
  { id: "151272593", d: "2026-10-25", ar: 1.474, t: "", en: "" },
  { id: "151226645", d: "2026-10-24", ar: 1.479, t: "", en: "" },
  { id: "151187518", d: "2026-10-23", ar: 1.483, t: "", en: "" },
  { id: "151145455", d: "2026-10-22", ar: 1.478, t: "", en: "" },
  { id: "151080036", d: "2026-10-20", ar: 1.478, t: "", en: "" },
  { id: "151043578", d: "2026-10-19", ar: 1.474, t: "", en: "" },
  { id: "151005018", d: "2026-10-18", ar: 1.481, t: "", en: "" },
  { id: "150960708", d: "2026-10-17", ar: 1.483, t: "", en: "" },
  { id: "150920598", d: "2026-10-16", ar: 1.481, t: "", en: "" },
  { id: "150884183", d: "2026-10-15", ar: 1.481, t: "", en: "" },
  { id: "150848597", d: "2026-10-14", ar: 1.49, t: "", en: "" },
  { id: "150819863", d: "2026-10-13", ar: 1.474, t: "", en: "" },
  { id: "150774558", d: "2026-10-12", ar: 1.481, t: "", en: "" },
  { id: "150095278", d: "2026-09-25", ar: 1.468, t: "VISIONS 2027", en: "VISIONS 2027" },
];

/** Per-day upload counts, 2025-10-27 (Mon) → 2026-10-30. One digit per day. */
export const CAL_START = "2025-10-27";
export const CAL_BITS =
  "101010100001011010101010001001111111101110111111110111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111101111111111";

export const CAL_STATS = {
  window: 344, // drawings in the last 52 weeks
  total: 671, // all pixiv uploads, 2023-06 → 2026-10
  year2026: 298,
  longestStreak: 178,
  eveningShare: 85, // % posted in the 20:00 hour, JST
  since: "June 2023",
  latest: "2026-10-30",
  latestLabel: "30 October 2026",
};

export const MONTHS_12: { m: string; label: string; n: number }[] = [
  { m: "11", label: "Nov", n: 15 },
  { m: "12", label: "Dec", n: 28 },
  { m: "01", label: "Jan", n: 30 },
  { m: "02", label: "Feb", n: 27 },
  { m: "03", label: "Mar", n: 31 },
  { m: "04", label: "Apr", n: 30 },
  { m: "05", label: "May", n: 31 },
  { m: "06", label: "Jun", n: 30 },
  { m: "07", label: "Jul", n: 31 },
  { m: "08", label: "Aug", n: 30 },
  { m: "09", label: "Sep", n: 29 },
  { m: "10", label: "Oct", n: 29 },
];
