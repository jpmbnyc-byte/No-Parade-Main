/**
 * Brand assets, derived from assets-src/np-mark-source.jpg (the supplied app
 * icon: a cream NP monogram on a dark rounded tile, on black).
 *
 * Luminance separates the three cleanly — mark 230-249, tile 20-29, surround
 * 0-9 — so the mark's alpha comes straight off luminance and the shape can
 * then be filled with any colour. That is the reason two colourways ship
 * rather than one "transparent logo": the hub and the shop are both white
 * now, and the cream original is invisible on them.
 *
 * The tile is redrawn rather than cut out. It runs off the bottom edge of the
 * source frame, and a generated rounded rect gives a crisp icon at every size
 * instead of a resampled JPEG.
 *
 * Run: SHARP=<path to sharp> node tools/make-brand-assets.cjs
 */
const sharp = require(process.env.SHARP || "sharp");
const path = require("path");

const SRC = path.join(__dirname, "..", "assets-src", "np-mark-source.jpg");
const OUT = path.join(__dirname, "..");

// Measured bounding box of the cream mark in the source frame.
const CROP = { left: 202, top: 380, width: 730, height: 335 };
const TILE = "#141e20";   // sampled from the supplied icon
const CREAM = "#f5f0e6";  // sampled from the mark
const INK = "#0b0b0b";    // the hub/shop foreground

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

async function markLayer(hex, width) {
  const { data, info } = await sharp(SRC).extract(CROP).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const out = Buffer.alloc(W * H * 4);
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  for (let i = 0; i < W * H; i++) {
    const j = i * 4;
    const lum = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
    // Ramp across the empty band between tile and mark, so edges stay soft.
    const a = clamp((lum - 95) / (215 - 95), 0, 1);
    out[j] = r; out[j + 1] = g; out[j + 2] = b; out[j + 3] = Math.round(a * 255);
  }
  let pipe = sharp(out, { raw: { width: W, height: H, channels: 4 } });
  if (width) pipe = pipe.resize({ width, kernel: "lanczos3" });
  return pipe.png().toBuffer();
}

function roundedTile(size, radiusPct = 0.225) {
  const r = Math.round(size * radiusPct);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="${TILE}"/></svg>`);
}

async function icon(size, name, { rounded = true } = {}) {
  const markW = Math.round(size * 0.66);
  const mark = await markLayer(CREAM, markW);
  const m = await sharp(mark).metadata();
  const base = rounded
    ? sharp(roundedTile(size)).png()
    : sharp({ create: { width: size, height: size, channels: 4, background: TILE } });
  await base.composite([{
    input: mark,
    left: Math.round((size - markW) / 2),
    top: Math.round((size - m.height) / 2),
  }]).png().toFile(path.join(OUT, name));
  console.log("icon", name.padEnd(22), size + "px");
}

(async () => {
  await sharp(await markLayer(INK, 1460)).toFile(path.join(OUT, "logo-mark.png"));
  await sharp(await markLayer(CREAM, 1460)).toFile(path.join(OUT, "logo-mark-light.png"));
  console.log("mark logo-mark.png / logo-mark-light.png — 1460px, transparent");

  await icon(512, "icon-512.png");
  await icon(180, "apple-touch-icon.png");
  await icon(64, "favicon.png");
  // Un-rounded, for platforms that apply their own mask.
  await icon(512, "icon-maskable.png", { rounded: false });
})();

/* ---------------------------------------------------------------
   Human Weather tiles.

   The supplied cards are 941x1672 social-format artwork: device mockup on a
   cream ground, under the card's own headline set in its own typefaces. Only
   the device is used — running the whole card would put a second type system
   on the page, saying the same thing the hub's own caption says.
   --------------------------------------------------------------- */
const HW = [
  // Phone, 3:4, cropped tight enough to clear the card's URL line above it
  // and its "Enter the field station" line below.
  { src: "hw-social-card.png", out: "hw-social", crop: { left: 108, top: 668, width: 693, height: 924 } },
  // Browser window, near square, full card width.
  { src: "hw-press-card.png", out: "hw-press", crop: { left: 55, top: 740, width: 830, height: 775 } },
];

(async () => {
  const fs = require("fs");
  for (const { src, out, crop } of HW) {
    const from = path.join(__dirname, "..", "assets-src", src);
    if (!fs.existsSync(from)) continue;
    for (const [ext, opt] of [["webp", { quality: 86 }], ["jpg", { quality: 86, mozjpeg: true }]]) {
      const pipe = sharp(from).extract(crop).resize({ width: 1100 });
      await (ext === "webp" ? pipe.webp(opt) : pipe.jpeg(opt)).toFile(path.join(OUT, `${out}.${ext}`));
    }
    console.log("tile", out.padEnd(12), crop.width + "x" + crop.height, "->", "1100w");
  }
})();
