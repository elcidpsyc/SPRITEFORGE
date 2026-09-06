#!/usr/bin/env node
// tools/build_templar_v5.mjs — renders public/packs/templar-v5/{sheet,*.png,icons,thumbs,atlas.json}
// from the paper-doll parts (parts/manifest.json, produced by extract_parts.py)
// through the real compositor, src/lib/spriteforge/compose.ts — the exact
// same code path the app uses live. There is no separate rendering path here,
// only PNG encoding: source of truth stays the parts + poses.ts.
//
// Usage: node --experimental-strip-types tools/build_templar_v5.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

import {
  ACTIONS,
  ACTION_META,
  ACTION_SHEET_HEIGHT,
  ACTION_SHEET_WIDTH,
  CELL,
  DIRECTIONS,
  HITBOX,
  MASTER_COLS,
  MASTER_HEIGHT,
  MASTER_WIDTH,
  PIVOT,
  SPEC_VERSION,
} from "../src/lib/spriteforge/contract.ts";
import { composeFrame } from "../src/lib/spriteforge/compose.ts";
import { poseForCompose } from "../src/lib/spriteforge/poses.ts";
import { blit, Pix } from "../src/lib/spriteforge/render.ts";
import { decodePng } from "../src/lib/spriteforge/testing/png.ts";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PACK_DIR = path.join(ROOT, "..", "public", "packs", "templar-v5");
const manifest = JSON.parse(readFileSync(path.join(PACK_DIR, "parts/manifest.json"), "utf8"));

function pixFromFile(rel) {
  const decoded = decodePng(readFileSync(path.join(PACK_DIR, rel)));
  return new Pix(decoded.width, decoded.height, new Uint8ClampedArray(decoded.data));
}

function loadPartSet(direction) {
  const dirEntry = manifest.directions[direction];
  const parts = {};
  const anchors = {};
  for (const layer of Object.keys(dirEntry)) {
    const entry = dirEntry[layer];
    if (!entry.bbox) continue; // e.g. down.cape: no geometry to load
    parts[layer] = pixFromFile(entry.file);
    anchors[layer] = entry.anchor;
  }
  const vfxEntries = manifest.vfx[direction] ?? [];
  if (vfxEntries.length > 0) {
    const vfx = {};
    for (const e of vfxEntries) vfx[e.frame] = pixFromFile(e.file);
    parts.vfx = vfx;
  }
  return { parts, anchors };
}

function crop(src, sx, sy, w, h) {
  const out = new Pix(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = ((sy + y) * src.w + (sx + x)) * 4;
      if (i < 0 || i + 4 > src.data.length) continue;
      out.data.set(src.data.subarray(i, i + 4), (y * w + x) * 4);
    }
  }
  return out;
}

const byDirection = Object.fromEntries(DIRECTIONS.map((d) => [d, loadPartSet(d)]));

const master = new Pix(MASTER_WIDTH, MASTER_HEIGHT);
const perAction = {};
ACTIONS.forEach((action, actionIndex) => {
  const actionSheet = new Pix(ACTION_SHEET_WIDTH, ACTION_SHEET_HEIGHT);
  const frames = ACTION_META[action].frames;
  DIRECTIONS.forEach((dir, dirIndex) => {
    const { parts, anchors } = byDirection[dir];
    for (let f = 0; f < MASTER_COLS; f++) {
      if (f >= frames) continue;
      const pose = poseForCompose(action, f);
      const cell = composeFrame(parts, dir, pose, anchors);
      const dx = f * CELL;
      const dyAction = dirIndex * CELL;
      const dyMaster = (actionIndex * 4 + dirIndex) * CELL;
      blit(actionSheet, cell, dx, dyAction);
      blit(master, cell, dx, dyMaster);
    }
  });
  perAction[action] = actionSheet;
});

const idle = composeFrame(
  byDirection.down.parts,
  "down",
  poseForCompose("guard", 0),
  byDirection.down.anchors,
);
const iconSrc = crop(idle, 16, 8, 32, 32);
let filled = 0;
for (let i = 3; i < iconSrc.data.length; i += 4) if (iconSrc.data[i] > 20) filled++;
const icon32 = filled > 40 ? iconSrc : crop(idle, 16, 12, 32, 32);

// --- minimal PNG encoder: 8-bit RGBA, filter type 0 (None), one IDAT ---
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(pix) {
  const { w, h, data } = pix;
  const stride = w * 4;
  const raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter type 0 (None)
    Buffer.from(data.buffer, data.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

function save(pix, ...relParts) {
  const p = path.join(PACK_DIR, ...relParts);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, encodePng(pix));
  console.log("wrote", p);
}

save(master, "sheet.png");
for (const action of ACTIONS) save(perAction[action], `${action}.png`);
save(idle, "thumbs", "idle_down.png");
save(icon32, "icons", "idle_32.png");

const atlas = {
  specVersion: SPEC_VERSION,
  id: "templar",
  name: "Cavaleiro Templário",
  title: "Guardião das Cruzadas",
  cell: { w: CELL, h: CELL },
  pivot: { ...PIVOT },
  hitbox: { ...HITBOX },
  directions: [...DIRECTIONS],
  sheet: {
    master: "sheet.png",
    layout: "actionsStacked",
    cols: MASTER_COLS,
    actionOrder: [...ACTIONS],
    perAction: Object.fromEntries(ACTIONS.map((a) => [a, `${a}.png`])),
  },
  animations: Object.fromEntries(
    ACTIONS.map((id) => {
      const m = ACTION_META[id];
      return [
        id,
        {
          frames: m.frames,
          fps: m.fps,
          loop: m.loop,
          holdLast: m.holdLast,
          ...(m.hitFrame !== undefined ? { hitFrame: m.hitFrame } : {}),
        },
      ];
    }),
  ),
  icons: { hud32: "icons/idle_32.png", hud32svg: "icons/idle_32.svg" },
  stats: { hp: 610, atk: 64, def: 58, spd: 3.6 },
  survivorSkill: {
    name: "Baluarte Implacável",
    desc: "Torna-se invulnerável por 3s e repele ataques.",
  },
  source: {
    reference: "tools/reference/templar-ref-sheet.jpg",
    builder: "tools/extract_parts.py + src/lib/spriteforge/compose.ts",
    paperDoll: true,
  },
};
writeFileSync(path.join(PACK_DIR, "atlas.json"), JSON.stringify(atlas, null, 2));
console.log("wrote", path.join(PACK_DIR, "atlas.json"));
