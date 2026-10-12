import crypto from 'crypto';
import { hashToken } from './auth';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generates a cryptographically secure Base32 TOTP secret (RFC 4648).
 * 20 random bytes (160 bits) encoded as 32 Base32 characters.
 */
export function generateBase32Secret(byteLength = 20): string {
  const randomBytes = crypto.randomBytes(byteLength);
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < randomBytes.length; i++) {
    value = (value << 8) | randomBytes[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Formats a Base32 secret string into 4-character spaced groups for legibility.
 * Example: 'JBSWY3DPEHPK3PXP' -> 'JBSW Y3DP EHPK 3PXP'
 */
export function formatSecretForDisplay(secret: string): string {
  return secret.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Generates an RFC 6238 Key URI Format (`otpauth://` URI)
 * for standard authenticator apps (Google Authenticator, Apple Passwords, 1Password, etc.)
 */
export function generateOtpauthUri(
  secret: string,
  email: string,
  issuer = 'bikko.studio'
): string {
  const cleanEmail = email.trim();
  const cleanIssuer = issuer.trim();
  const label = `${encodeURIComponent(cleanIssuer)}:${encodeURIComponent(cleanEmail)}`;
  const params = new URLSearchParams({
    secret: secret.trim().toUpperCase(),
    issuer: cleanIssuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });

  return `otpauth://totp/${label}?${params.toString()}`;
}

/**
 * Normalizes an emergency backup recovery code by removing hyphens/whitespace
 * and restoring canonical XXXX-XXXX uppercase format.
 */
export function normalizeBackupCode(code: string): string {
  const clean = code.trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (clean.length === 8) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }
  return code.trim().toUpperCase();
}

/**
 * Generates single-use emergency backup recovery codes.
 * Returns both plaintext codes (to display once) and SHA-256 hashes (to store in DB).
 */
export function generateBackupCodes(count = 8): { codes: string[]; hashedCodes: string[] } {
  const codes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const part1 = crypto.randomBytes(2).toString('hex');
    const part2 = crypto.randomBytes(2).toString('hex');
    const code = `${part1}-${part2}`.toUpperCase();
    codes.push(code);
    hashedCodes.push(hashToken(normalizeBackupCode(code)));
  }

  return { codes, hashedCodes };
}

// ========================================================================
// Pure TypeScript Self-Contained QR Code Generator (ISO/IEC 18004)
// Zero external runtime dependencies, 100% vector SVG output.
// ========================================================================

// Galois Field GF(256) tables for QR Reed-Solomon polynomial math
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

export function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const nextPoly = new Uint8Array(poly.length + 1);
    const alpha_i = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= poly[j];
      nextPoly[j + 1] ^= gfMul(poly[j], alpha_i);
    }
    poly = nextPoly;
  }
  return poly;
}

export function rsComputeECC(data: Uint8Array, ecLength: number): Uint8Array {
  const gen = rsGeneratorPoly(ecLength);
  const ecc = new Uint8Array(ecLength);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ ecc[0];
    for (let j = 0; j < ecLength - 1; j++) {
      ecc[j] = ecc[j + 1] ^ gfMul(gen[j + 1], factor);
    }
    ecc[ecLength - 1] = gfMul(gen[ecLength], factor);
  }
  return ecc;
}

// Capacities and parameters for Versions 1 through 10 (ECC Level M)
interface VersionSpec {
  version: number;
  totalCodewords: number;
  ecCodewordsPerBlock: number;
  numBlocksGroup1: number;
  dataCodewordsBlock1: number;
  numBlocksGroup2: number;
  dataCodewordsBlock2: number;
  alignmentPatterns: number[];
}

const QR_SPECS: VersionSpec[] = [
  { version: 1, totalCodewords: 26, ecCodewordsPerBlock: 10, numBlocksGroup1: 1, dataCodewordsBlock1: 16, numBlocksGroup2: 0, dataCodewordsBlock2: 0, alignmentPatterns: [] },
  { version: 2, totalCodewords: 44, ecCodewordsPerBlock: 16, numBlocksGroup1: 1, dataCodewordsBlock1: 28, numBlocksGroup2: 0, dataCodewordsBlock2: 0, alignmentPatterns: [6, 18] },
  { version: 3, totalCodewords: 70, ecCodewordsPerBlock: 26, numBlocksGroup1: 1, dataCodewordsBlock1: 44, numBlocksGroup2: 0, dataCodewordsBlock2: 0, alignmentPatterns: [6, 22] },
  { version: 4, totalCodewords: 100, ecCodewordsPerBlock: 18, numBlocksGroup1: 2, dataCodewordsBlock1: 32, numBlocksGroup2: 0, dataCodewordsBlock2: 0, alignmentPatterns: [6, 26] },
  { version: 5, totalCodewords: 134, ecCodewordsPerBlock: 24, numBlocksGroup1: 2, dataCodewordsBlock1: 43, numBlocksGroup2: 0, dataCodewordsBlock2: 0, alignmentPatterns: [6, 30] },
  { version: 6, totalCodewords: 172, ecCodewordsPerBlock: 16, numBlocksGroup1: 4, dataCodewordsBlock1: 27, numBlocksGroup2: 0, dataCodewordsBlock2: 0, alignmentPatterns: [6, 34] },
  { version: 7, totalCodewords: 196, ecCodewordsPerBlock: 18, numBlocksGroup1: 4, dataCodewordsBlock1: 31, numBlocksGroup2: 0, dataCodewordsBlock2: 0, alignmentPatterns: [6, 22, 38] },
  { version: 8, totalCodewords: 242, ecCodewordsPerBlock: 22, numBlocksGroup1: 4, dataCodewordsBlock1: 38, numBlocksGroup2: 2, dataCodewordsBlock2: 39, alignmentPatterns: [6, 24, 42] },
  { version: 9, totalCodewords: 292, ecCodewordsPerBlock: 22, numBlocksGroup1: 3, dataCodewordsBlock1: 36, numBlocksGroup2: 2, dataCodewordsBlock2: 37, alignmentPatterns: [6, 26, 46] },
  { version: 10, totalCodewords: 346, ecCodewordsPerBlock: 26, numBlocksGroup1: 4, dataCodewordsBlock1: 43, numBlocksGroup2: 1, dataCodewordsBlock2: 44, alignmentPatterns: [6, 28, 50] },
];

class BitBuffer {
  private buffer: number[] = [];
  private length = 0;

  put(num: number, length: number) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }

  getLength() {
    return this.length;
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

function buildQRMatrix(text: string): boolean[][] {
  const utf8Bytes = Buffer.from(text, 'utf8');

  // Find minimum Version supporting utf8 length with 8-bit byte mode in Level M
  let spec: VersionSpec | null = null;
  for (const s of QR_SPECS) {
    const totalDataCapacity =
      s.numBlocksGroup1 * s.dataCodewordsBlock1 + s.numBlocksGroup2 * s.dataCodewordsBlock2;
    // 4 bits mode + 8/16 bits char count + data
    const charCountBits = s.version >= 10 ? 16 : 8;
    const requiredBits = 4 + charCountBits + utf8Bytes.length * 8;
    if (requiredBits <= totalDataCapacity * 8) {
      spec = s;
      break;
    }
  }

  if (!spec) {
    spec = QR_SPECS[QR_SPECS.length - 1];
  }

  const charCountBits = spec.version >= 10 ? 16 : 8;
  const totalDataBytes =
    spec.numBlocksGroup1 * spec.dataCodewordsBlock1 + spec.numBlocksGroup2 * spec.dataCodewordsBlock2;

  // 1. Bit Stream Encoding (Byte Mode = 0100)
  const bitBuf = new BitBuffer();
  bitBuf.put(0b0100, 4);
  bitBuf.put(utf8Bytes.length, charCountBits);
  for (let i = 0; i < utf8Bytes.length; i++) {
    bitBuf.put(utf8Bytes[i], 8);
  }

  // Terminator (up to 4 zeroes)
  const totalDataBits = totalDataBytes * 8;
  const terminatorLen = Math.min(4, totalDataBits - bitBuf.getLength());
  if (terminatorLen > 0) bitBuf.put(0, terminatorLen);

  // Byte alignment
  while (bitBuf.getLength() % 8 !== 0) {
    bitBuf.putBit(false);
  }

  // Pad bytes 0xEC, 0x11
  let padByte = 0xec;
  while (bitBuf.getLength() < totalDataBits) {
    bitBuf.put(padByte, 8);
    padByte = padByte === 0xec ? 0x11 : 0xec;
  }

  const rawData = bitBuf.getBytes();

  // 2. Block division and Reed-Solomon Error Correction
  const blocks: Uint8Array[] = [];
  const eccBlocks: Uint8Array[] = [];
  let offset = 0;

  for (let b = 0; b < spec.numBlocksGroup1; b++) {
    const blockData = rawData.slice(offset, offset + spec.dataCodewordsBlock1);
    offset += spec.dataCodewordsBlock1;
    blocks.push(blockData);
    eccBlocks.push(rsComputeECC(blockData, spec.ecCodewordsPerBlock));
  }

  for (let b = 0; b < spec.numBlocksGroup2; b++) {
    const blockData = rawData.slice(offset, offset + spec.dataCodewordsBlock2);
    offset += spec.dataCodewordsBlock2;
    blocks.push(blockData);
    eccBlocks.push(rsComputeECC(blockData, spec.ecCodewordsPerBlock));
  }

  // 3. Interleave Data and ECC Codewords
  const finalCodewords: number[] = [];
  const maxDataLen = Math.max(spec.dataCodewordsBlock1, spec.dataCodewordsBlock2 || 0);

  for (let i = 0; i < maxDataLen; i++) {
    for (let b = 0; b < blocks.length; b++) {
      if (i < blocks[b].length) {
        finalCodewords.push(blocks[b][i]);
      }
    }
  }

  for (let i = 0; i < spec.ecCodewordsPerBlock; i++) {
    for (let b = 0; b < eccBlocks.length; b++) {
      finalCodewords.push(eccBlocks[b][i]);
    }
  }

  // 4. Matrix Population
  const size = spec.version * 4 + 17;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));

  // Function patterns
  const setFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        const isCore = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        if (!isCore) {
          matrix[nr][nc] = false; // separator
        } else {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[nr][nc] = isBorder || isCenter;
        }
      }
    }
  };

  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // Alignment patterns
  const alignCoords = spec.alignmentPatterns;
  if (alignCoords.length > 0) {
    for (const r of alignCoords) {
      for (const c of alignCoords) {
        // Skip finder collision
        if (matrix[r][c] !== null) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isCenter = dr === 0 && dc === 0;
            matrix[r + dr][c + dc] = isBorder || isCenter;
          }
        }
      }
    }
  }

  // Dark module
  matrix[4 * spec.version + 9][8] = true;

  // Format info placeholders
  const topLeftCoords: [number, number][] = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  for (const [r, c] of topLeftCoords) {
    matrix[r][c] = false;
  }
  for (let i = 0; i < 7; i++) {
    matrix[size - 1 - i][8] = false;
  }
  for (let i = 7; i < 15; i++) {
    matrix[8][size - 15 + i] = false;
  }

  // Version info placeholders for Version >= 7 (Table D.1)
  const VERSION_INFO: Record<number, number> = {
    7: 0x07c94,
    8: 0x085bc,
    9: 0x09a99,
    10: 0x0a4d3,
  };
  if (spec.version >= 7) {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 3; c++) {
        matrix[r][size - 11 + c] = false; // top-right
        matrix[size - 11 + c][r] = false; // bottom-left
      }
    }
  }

  // Interleaved Codeword bit placement
  const bitArray: boolean[] = [];
  for (const byte of finalCodewords) {
    for (let bit = 7; bit >= 0; bit--) {
      bitArray.push(((byte >>> bit) & 1) === 1);
    }
  }

  let bitIdx = 0;
  let upward = true;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // skip vertical timing line
    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const c of [right, right - 1]) {
        if (matrix[r][c] === null) {
          const bitVal = bitIdx < bitArray.length ? bitArray[bitIdx++] : false;
          // Apply standard Mask 0: (row + col) % 2 == 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = mask ? !bitVal : bitVal;
        }
      }
    }
    upward = !upward;
  }

  // Format Information for ECC M and Mask 0 (0b00 + 0b000 = 0 -> BCH encoded with mask: 0x5412)
  const formatBits = 0x5412; // 15 bits: b14...b0
  for (let k = 0; k < 15; k++) {
    const bit = ((formatBits >>> (14 - k)) & 1) === 1;
    const [r, c] = topLeftCoords[k];
    matrix[r][c] = bit;
  }

  // Bottom-left / Top-right (i=0..6 in bottom-left, i=7..14 in top-right)
  for (let i = 0; i < 15; i++) {
    const bit = ((formatBits >>> i) & 1) === 1;
    if (i < 7) {
      matrix[size - 1 - i][8] = bit;
    } else {
      matrix[8][size - 15 + i] = bit;
    }
  }

  // Version Information for Version >= 7 (18-bit BCH code from Table D.1)
  if (spec.version >= 7 && VERSION_INFO[spec.version]) {
    const vInfo = VERSION_INFO[spec.version];
    for (let i = 0; i < 18; i++) {
      const bit = ((vInfo >>> i) & 1) === 1;
      const r = Math.floor(i / 3);
      const c = i % 3;
      matrix[r][size - 11 + c] = bit; // top-right
      matrix[size - 11 + c][r] = bit; // bottom-left
    }
  }

  return matrix.map((row) => row.map((cell) => cell === true));
}

/**
 * Generates an accessible, clean SVG string representation of the QR code.
 */
export function generateQrCodeSvg(
  text: string,
  options: { size?: number; margin?: number } = {}
): string {
  const margin = options.margin ?? 3;
  const matrix = buildQRMatrix(text);
  const rawSize = matrix.length;
  const totalSize = rawSize + margin * 2;
  const displaySize = options.size ?? 256;

  let pathData = '';
  for (let r = 0; r < rawSize; r++) {
    for (let c = 0; c < rawSize; c++) {
      if (matrix[r][c]) {
        pathData += `M${c + margin},${r + margin}h1v1h-1z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${displaySize}" height="${displaySize}" shape-rendering="crispEdges" role="img" aria-label="TOTP Two-Factor Authentication Setup QR Code">
  <rect width="${totalSize}" height="${totalSize}" fill="#ffffff" rx="1" />
  <path d="${pathData.trim()}" fill="#000000" />
</svg>`;
}

/**
 * Generates a base64 Data URL for use directly in `<img src="...">` tags.
 */
export function generateQrCodeDataUrl(text: string): string {
  const svg = generateQrCodeSvg(text);
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

const totpUtils = {
  generateBase32Secret,
  formatSecretForDisplay,
  generateOtpauthUri,
  generateBackupCodes,
  generateQrCodeSvg,
  generateQrCodeDataUrl,
};

export default totpUtils;
