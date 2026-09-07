#!/usr/bin/env node
/**
 * Silhouette contact sheet for QA (docs/qa/silhouettes/).
 *
 * One SVG per pack: every frame reduced to its opaque mask, laid out
 * action-by-direction. Silhouettes rather than the art itself because the
 * failures worth catching by eye -- a frame that jumps, a limb that leaves the
 * cell, a pivot that drifts -- are shape failures, and colour hides them.
 *
 * SVG, not PNG: it needs no encoder, diffs as text in review, and scales.
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { unzlibSync } from "fflate";

const ROOT = process.cwd();
const PACKS = join(ROOT, "public", "packs");
const OUT = join(ROOT, "docs", "qa", "silhouettes");
const CELL = 64;
const PIVOT = { x: 32, y: 56 };
const ACTIONS = ["walk", "run", "attack", "guard", "dash", "hurt", "death"];
const DIRECTIONS = ["down", "up", "right", "left"];

function paeth(a, b, c) {
  const p = a + b - c,
    pa = Math.abs(p - a),
    pb = Math.abs(p - b),
    pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function decodePng(buffer) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let off = 8,
    width = 0,
    height = 0,
    colorType = 0;
  let trns = null; // only tRNS matters: a silhouette needs alpha, not colour
  const idat = [];
  while (off < buffer.length) {
    const len = view.getUint32(off);
    const type = String.fromCharCode(...buffer.subarray(off + 4, off + 8));
    const body = buffer.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      width = view.getUint32(off + 8);
      height = view.getUint32(off + 12);
      colorType = buffer[off + 17];
      // No PLTE branch: a silhouette needs alpha only, and tRNS carries it.
    } else if (type === "tRNS") trns = body.slice();
    else if (type === "IDAT") idat.push(body.slice());
    else if (type === "IEND") break;
    off += 12 + len;
  }
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  const merged = new Uint8Array(idat.reduce((n, c) => n + c.length, 0));
  let cur = 0;
  for (const c of idat) {
    merged.set(c, cur);
    cur += c.length;
  }
  const raw = unzlibSync(merged);

  const stride = width * channels;
  const px = new Uint8Array(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const f = raw[pos++],
      rs = y * stride,
      ps = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const v = raw[pos + x];
      const a = x >= channels ? px[rs + x - channels] : 0;
      const b = y > 0 ? px[ps + x] : 0;
      const c = x >= channels && y > 0 ? px[ps + x - channels] : 0;
      px[rs + x] =
        (f === 0
          ? v
          : f === 1
            ? v + a
            : f === 2
              ? v + b
              : f === 3
                ? v + ((a + b) >> 1)
                : v + paeth(a, b, c)) & 0xff;
    }
    pos += stride;
  }

  // Only the alpha channel matters for a silhouette.
  const alpha = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const s = i * channels;
    alpha[i] =
      colorType === 6
        ? px[s + 3]
        : colorType === 4
          ? px[s + 1]
          : colorType === 3
            ? (trns?.[px[s]] ?? 255)
            : 255;
  }
  return { width, height, alpha };
}

/** Merge each opaque run into one <rect>, so the SVG stays small. */
function runs(img, cx, cy) {
  const out = [];
  for (let y = 0; y < CELL; y++) {
    let start = -1;
    for (let x = 0; x <= CELL; x++) {
      const solid = x < CELL && img.alpha[(cy + y) * img.width + cx + x] > 0;
      if (solid && start < 0) start = x;
      else if (!solid && start >= 0) {
        out.push([start, y, x - start]);
        start = -1;
      }
    }
  }
  return out;
}

function sheetFor(packId) {
  const parts = [];
  let row = 0;
  for (const action of ACTIONS) {
    const file = join(PACKS, packId, `${action}.png`);
    if (!existsSync(file)) continue;
    const img = decodePng(new Uint8Array(readFileSync(file)));
    const cols = Math.floor(img.width / CELL);

    for (let d = 0; d < DIRECTIONS.length; d++) {
      const oy = row * (CELL + 14) + 14;
      parts.push(`<text x="0" y="${oy - 3}" class="lbl">${action} · ${DIRECTIONS[d]}</text>`);
      for (let f = 0; f < cols; f++) {
        const ox = f * (CELL + 4);
        parts.push(`<g transform="translate(${ox},${oy})">`);
        parts.push(`<rect class="cell" width="${CELL}" height="${CELL}"/>`);
        for (const [x, y, w] of runs(img, f * CELL, d * CELL)) {
          parts.push(`<rect class="sil" x="${x}" y="${y}" width="${w}" height="1"/>`);
        }
        // The pivot cross: a drifting anchor is obvious against a fixed mark.
        parts.push(
          `<path class="piv" d="M${PIVOT.x - 3} ${PIVOT.y}h6M${PIVOT.x} ${PIVOT.y - 3}v6"/></g>`,
        );
      }
      row += 1;
    }
  }
  const width = 8 * (CELL + 4);
  const height = row * (CELL + 14) + 14;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<style>
  :root{color-scheme:light dark}
  .cell{fill:#f4f1ea;stroke:#d9d2c4;stroke-width:.5}
  .sil{fill:#1d1b16}
  .piv{stroke:#c0392b;stroke-width:.75;opacity:.85}
  .lbl{font:6px ui-monospace,monospace;fill:#6b6459}
  @media (prefers-color-scheme:dark){
    .cell{fill:#1a1a1a;stroke:#333}.sil{fill:#ece7dc}.lbl{fill:#8a8578}
  }
</style>
<title>${packId} — silhuetas</title>
${parts.join("\n")}
</svg>`;
}

mkdirSync(OUT, { recursive: true });
const packs = existsSync(PACKS)
  ? readdirSync(PACKS, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
  : [];
for (const packId of packs) {
  writeFileSync(join(OUT, `${packId}.svg`), sheetFor(packId));
  console.log(`[silhouettes] ${packId}.svg`);
}
console.log(`[silhouettes] ${packs.length} pack(s) em docs/qa/silhouettes/`);
