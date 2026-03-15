/**
 * Generates static/favicon.ico (32x32, 32-bit ARGB) from the Open-AIRSS logo.
 * Pure Node.js — no dependencies.
 *
 * Logo elements (24x24 viewBox, scaled to 32x32):
 *   - Filled circle at (4, 20) r=2.5
 *   - Inner arc: M4 13.5 C8.14 13.5 11.5 16.86 11.5 21  stroke-width=2.5
 *   - Outer arc: M4 7.5 C10.5 5.5 18 9.5 20.5 17        stroke-width=2
 *
 * Color: #7c3aed (vivid violet — legible on both light and dark tab bars)
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SIZE = 32;
const VIEWBOX = 24;
const SCALE = SIZE / VIEWBOX;

// Color: #7c3aed → rgb(124, 58, 237)
const CR = 124,
  CG = 58,
  CB = 237;

// ── Pixel buffer (RGBA) ──────────────────────────────────────────────────────

const pixels = new Uint8Array(SIZE * SIZE * 4); // all transparent

function setPixel(x, y, alpha) {
  const xi = Math.round(x),
    yi = Math.round(y);
  if (xi < 0 || xi >= SIZE || yi < 0 || yi >= SIZE) return;
  const i = (yi * SIZE + xi) * 4;
  if (alpha <= pixels[i + 3]) return; // keep strongest alpha
  pixels[i] = CR;
  pixels[i + 1] = CG;
  pixels[i + 2] = CB;
  pixels[i + 3] = alpha;
}

// Anti-aliased filled circle
function drawCircle(cx, cy, r) {
  for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r + 1); y++) {
    for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
      const d = Math.hypot(x - cx, y - cy);
      const a = Math.round(Math.max(0, Math.min(1, r - d + 0.5)) * 255);
      if (a > 0) setPixel(x, y, a);
    }
  }
}

// Anti-aliased stroke along a cubic Bézier
function strokeBezier(x0, y0, x1, y1, x2, y2, x3, y3, strokeWidth) {
  const half = strokeWidth / 2;
  const steps = 300; // enough samples to keep line continuous at this scale
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const bx =
      mt * mt * mt * x0 +
      3 * mt * mt * t * x1 +
      3 * mt * t * t * x2 +
      t * t * t * x3;
    const by =
      mt * mt * mt * y0 +
      3 * mt * mt * t * y1 +
      3 * mt * t * t * y2 +
      t * t * t * y3;
    drawCircle(bx, by, half);
  }
}

// ── Draw the logo (scale all coordinates from 24→32) ────────────────────────

const s = (v) => v * SCALE;

// Filled circle
drawCircle(s(4), s(20), s(2.5));

// Inner arc: M4 13.5 C8.14 13.5 11.5 16.86 11.5 21
strokeBezier(
  s(4),
  s(13.5),
  s(8.14),
  s(13.5),
  s(11.5),
  s(16.86),
  s(11.5),
  s(21),
  s(2.5),
);

// Outer arc: M4 7.5 C10.5 5.5 18 9.5 20.5 17
strokeBezier(
  s(4),
  s(7.5),
  s(10.5),
  s(5.5),
  s(18),
  s(9.5),
  s(20.5),
  s(17),
  s(2),
);

// ── ICO file encoding (32x32, 32-bit ARGB BMP) ──────────────────────────────
//
// Layout:
//   6  bytes  ICONDIR header
//   16 bytes  ICONDIRENTRY
//   40 bytes  BITMAPINFOHEADER
//   4096 bytes pixel data (32×32×4, bottom-up BGRA)
//   128 bytes  AND mask (32×4 bytes, all zero → use alpha channel)

const pixelBytes = SIZE * SIZE * 4;
const andMaskRows = SIZE;
const andMaskRowBytes = Math.ceil(SIZE / 8 / 4) * 4; // padded to DWORD = 4 bytes
const andMaskBytes = andMaskRows * andMaskRowBytes;
const bmpBytes = 40 + pixelBytes + andMaskBytes;
const totalBytes = 6 + 16 + bmpBytes;

const buf = Buffer.alloc(totalBytes, 0);
let off = 0;

// ICONDIR
buf.writeUInt16LE(0, off);
off += 2; // reserved
buf.writeUInt16LE(1, off);
off += 2; // type = 1 (ICO)
buf.writeUInt16LE(1, off);
off += 2; // image count

// ICONDIRENTRY
buf.writeUInt8(SIZE, off++); // width
buf.writeUInt8(SIZE, off++); // height
buf.writeUInt8(0, off++); // color count (0 = truecolor)
buf.writeUInt8(0, off++); // reserved
buf.writeUInt16LE(1, off);
off += 2; // planes
buf.writeUInt16LE(32, off);
off += 2; // bit depth
buf.writeUInt32LE(bmpBytes, off);
off += 4; // size of BMP block
buf.writeUInt32LE(22, off);
off += 4; // offset to BMP block (6+16=22)

// BITMAPINFOHEADER
buf.writeUInt32LE(40, off);
off += 4; // biSize
buf.writeInt32LE(SIZE, off);
off += 4; // biWidth
buf.writeInt32LE(SIZE * 2, off);
off += 4; // biHeight (×2 includes AND mask)
buf.writeUInt16LE(1, off);
off += 2; // biPlanes
buf.writeUInt16LE(32, off);
off += 2; // biBitCount
buf.writeUInt32LE(0, off);
off += 4; // biCompression (BI_RGB)
buf.writeUInt32LE(pixelBytes, off);
off += 4; // biSizeImage
buf.writeInt32LE(0, off);
off += 4; // biXPelsPerMeter
buf.writeInt32LE(0, off);
off += 4; // biYPelsPerMeter
buf.writeUInt32LE(0, off);
off += 4; // biClrUsed
buf.writeUInt32LE(0, off);
off += 4; // biClrImportant

// Pixel data — BMP is bottom-up, channels are BGRA
for (let y = SIZE - 1; y >= 0; y--) {
  for (let x = 0; x < SIZE; x++) {
    const src = (y * SIZE + x) * 4;
    buf[off++] = pixels[src + 2]; // B
    buf[off++] = pixels[src + 1]; // G
    buf[off++] = pixels[src]; // R
    buf[off++] = pixels[src + 3]; // A
  }
}

// AND mask — all 0x00 → rely on alpha channel for transparency
// (already zeroed by Buffer.alloc)
off += andMaskBytes;

// ── Write output ─────────────────────────────────────────────────────────────

const outPath = resolve(__dirname, "../static/favicon.ico");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, buf);
console.log(`favicon.ico written → ${outPath} (${buf.length} bytes)`);
