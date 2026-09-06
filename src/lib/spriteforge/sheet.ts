import {
  ACTION_META,
  ACTION_SHEET_HEIGHT,
  ACTION_SHEET_WIDTH,
  ACTIONS,
  CELL,
  DIRECTIONS,
  MASTER_COLS,
  MASTER_HEIGHT,
  MASTER_WIDTH,
  type ActionId,
  type Direction,
} from "./contract";
import { composeFrame, type PartAnchors, type PartLayerId, type PartSet } from "./compose";
import { poseForCompose } from "./poses";
import { blit, Pix, renderFrame } from "./render";
import { getCharacter } from "./roster";
import type { Character, PartsManifest } from "./types";

export type SheetBundle = {
  id: string;
  master: Pix;
  perAction: Record<ActionId, Pix>;
  icon32: Pix;
};

function crop(src: Pix, sx: number, sy: number, w: number, h: number): Pix {
  const out = new Pix(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = ((sy + y) * src.w + (sx + x)) * 4;
      if (i < 0 || i >= src.data.length) continue;
      out.set(x, y, [src.data[i]!, src.data[i + 1]!, src.data[i + 2]!, src.data[i + 3]!]);
    }
  }
  return out;
}

function nearestScale(src: Pix, scale: number): Pix {
  const out = new Pix(src.w * scale, src.h * scale);
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const i = (y * src.w + x) * 4;
      const c: [number, number, number, number] = [
        src.data[i]!,
        src.data[i + 1]!,
        src.data[i + 2]!,
        src.data[i + 3]!,
      ];
      out.rect(x * scale, y * scale, scale, scale, c);
    }
  }
  return out;
}

export function buildSheet(character: Character): SheetBundle {
  const master = new Pix(MASTER_WIDTH, MASTER_HEIGHT);
  const perAction = {} as Record<ActionId, Pix>;

  ACTIONS.forEach((action, actionIndex) => {
    const actionSheet = new Pix(ACTION_SHEET_WIDTH, ACTION_SHEET_HEIGHT);
    const frames = ACTION_META[action].frames;
    DIRECTIONS.forEach((dir, dirIndex) => {
      for (let f = 0; f < MASTER_COLS; f++) {
        if (f >= frames) continue;
        const cell = renderFrame(character, action, dir, f);
        const dx = f * CELL;
        const dyAction = dirIndex * CELL;
        const dyMaster = (actionIndex * 4 + dirIndex) * CELL;
        blit(actionSheet, cell, dx, dyAction);
        blit(master, cell, dx, dyMaster);
      }
    });
    perAction[action] = actionSheet;
  });

  // HUD icon: crop 32×32 around torso/helm of guard (or walk) down frame 0.
  const idle = renderFrame(character, "guard", "down", 0);
  const iconSrc = crop(idle, 16, 8, 32, 32);
  // If mostly empty, fall back to a centered 32 crop
  let filled = 0;
  for (let i = 3; i < iconSrc.data.length; i += 4) if (iconSrc.data[i]! > 20) filled++;
  const icon32 = filled > 40 ? iconSrc : crop(idle, 16, 12, 32, 32);

  return { id: character.id, master, perAction, icon32 };
}

export function pixToImageData(pix: Pix): ImageData {
  return new ImageData(new Uint8ClampedArray(pix.data), pix.w, pix.h);
}

export function pixToCanvas(pix: Pix): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = pix.w;
  c.height = pix.h;
  const ctx = c.getContext("2d")!;
  ctx.putImageData(pixToImageData(pix), 0, 0);
  return c;
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), type, quality);
  });
}

export async function pixToPngBlob(pix: Pix): Promise<Blob> {
  return canvasToBlob(pixToCanvas(pix), "image/png");
}

export async function pixToJpgBlob(pix: Pix, bg = "#14161A"): Promise<Blob> {
  const c = document.createElement("canvas");
  c.width = pix.w;
  c.height = pix.h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.putImageData(pixToImageData(pix), 0, 0);
  return canvasToBlob(c, "image/jpeg", 0.92);
}

export function pixToSvg(pix: Pix): string {
  const rects: string[] = [];
  for (let y = 0; y < pix.h; y++) {
    let x = 0;
    while (x < pix.w) {
      const i = (y * pix.w + x) * 4;
      const a = pix.data[i + 3]!;
      if (a < 8) {
        x++;
        continue;
      }
      const r = pix.data[i]!;
      const g = pix.data[i + 1]!;
      const b = pix.data[i + 2]!;
      let w = 1;
      while (x + w < pix.w) {
        const j = (y * pix.w + x + w) * 4;
        if (
          pix.data[j]! !== r ||
          pix.data[j + 1]! !== g ||
          pix.data[j + 2]! !== b ||
          pix.data[j + 3]! !== a
        )
          break;
        w++;
      }
      const fill =
        a === 255
          ? `rgb(${r},${g},${b})`
          : `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
      rects.push(`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${fill}"/>`);
      x += w;
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${pix.w}" height="${pix.h}" shape-rendering="crispEdges" viewBox="0 0 ${pix.w} ${pix.h}">${rects.join("")}</svg>`;
}

export function getCell(
  master: Pix,
  action: ActionId,
  dir: Direction,
  frame: number,
): Pix {
  const actionIndex = ACTIONS.indexOf(action);
  const dirIndex = DIRECTIONS.indexOf(dir);
  const sx = frame * CELL;
  const sy = (actionIndex * 4 + dirIndex) * CELL;
  return crop(master, sx, sy, CELL, CELL);
}

export { nearestScale, crop };

const cache = new Map<string, SheetBundle>();

/** Characters that ship a real PNG pack under /packs/<folder>/. */
export const PACKED_IDS = new Set(["templar"]);
/** v4 lives beside v1/v2/v3. Don't overwrite /packs/templar/ until the owner signs off. */
const PACK_FOLDER: Record<string, string> = { templar: "templar-v4" };

function packUrl(id: string, file: string): string {
  const folder = PACK_FOLDER[id] ?? id;
  return `/packs/${folder}/${file}?v=5`;
}
const packed = new Map<string, SheetBundle>();
const packListeners = new Set<() => void>();

export function subscribePack(listener: () => void): () => void {
  packListeners.add(listener);
  return () => packListeners.delete(listener);
}

function notifyPack() {
  packListeners.forEach((fn) => fn());
}

async function pixFromUrl(url: string): Promise<Pix> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`failed to load ${url}`);
  const blob = await res.blob();
  const bmp = await createImageBitmap(blob);
  const c = document.createElement("canvas");
  c.width = bmp.width;
  c.height = bmp.height;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d context");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bmp, 0, 0);
  const data = ctx.getImageData(0, 0, bmp.width, bmp.height);
  return new Pix(bmp.width, bmp.height, data.data);
}

export async function loadPackedCharacter(id: string): Promise<SheetBundle | null> {
  if (!PACKED_IDS.has(id)) return null;
  const hit = packed.get(id);
  if (hit) return hit;
  const master = await pixFromUrl(packUrl(id, "sheet.png"));
  const perAction = {} as Record<ActionId, Pix>;
  await Promise.all(
    ACTIONS.map(async (action) => {
      perAction[action] = await pixFromUrl(packUrl(id, `${action}.png`));
    }),
  );
  let icon32: Pix;
  try {
    icon32 = await pixFromUrl(packUrl(id, "icons/idle_32.png"));
  } catch {
    icon32 = crop(getCell(master, "walk", "down", 0), 16, 8, 32, 32);
  }
  const bundle: SheetBundle = { id, master, perAction, icon32 };
  packed.set(id, bundle);
  cache.delete(id);
  notifyPack();
  return bundle;
}

/**
 * Ids whose pack ships paper-doll parts (parts/manifest.json) instead of, or
 * ahead of, flat PNG frames — buildSheet composes these with composeFrame().
 * templar-v5's tests (templar-v5.test.ts) all pass, so templar is wired here
 * ahead of the templar-v4 PNG pack (still kept as the fallback below).
 */
const PARTS_FOLDER: Record<string, string> = { templar: "templar-v5" };

const manifestCache = new Map<string, PartsManifest>();
const partsCache = new Map<string, Record<Direction, { parts: PartSet; anchors: PartAnchors }>>();

export function getCachedPartsManifest(id: string): PartsManifest | null {
  return manifestCache.get(id) ?? null;
}

/** Raw parts + anchors per direction, for UIs that want to recompose a live
 * preview (e.g. toggling weapon/shield) without moving the pivot. */
export function getCachedParts(
  id: string,
): Record<Direction, { parts: PartSet; anchors: PartAnchors }> | null {
  return partsCache.get(id) ?? null;
}

async function fetchPartsManifest(folder: string): Promise<PartsManifest | null> {
  try {
    const res = await fetch(`/packs/${folder}/parts/manifest.json?v=5`);
    if (!res.ok) return null;
    return (await res.json()) as PartsManifest;
  } catch {
    return null;
  }
}

async function loadPartSet(
  folder: string,
  manifest: PartsManifest,
  direction: Direction,
): Promise<{ parts: PartSet; anchors: PartAnchors }> {
  const dirEntry = manifest.directions[direction];
  const parts: PartSet = {};
  const anchors: PartAnchors = {};
  await Promise.all(
    (Object.keys(dirEntry) as PartLayerId[]).map(async (layer) => {
      const entry = dirEntry[layer];
      if (!entry.bbox) return; // e.g. templar's down.cape: no geometry to load
      parts[layer] = await pixFromUrl(`/packs/${folder}/${entry.file}?v=5`);
      anchors[layer] = entry.anchor;
    }),
  );
  const vfxEntries = manifest.vfx[direction] ?? [];
  if (vfxEntries.length > 0) {
    const vfx: Record<number, Pix> = {};
    await Promise.all(
      vfxEntries.map(async (e) => {
        vfx[e.frame] = await pixFromUrl(`/packs/${folder}/${e.file}?v=5`);
      }),
    );
    parts.vfx = vfx;
  }
  return { parts, anchors };
}

export async function loadComposedCharacter(id: string): Promise<SheetBundle | null> {
  const folder = PARTS_FOLDER[id];
  if (!folder) return null;
  const hit = packed.get(id);
  if (hit) return hit;
  const manifest = await fetchPartsManifest(folder);
  if (!manifest) return null;
  manifestCache.set(id, manifest);

  const byDirection = {} as Record<Direction, { parts: PartSet; anchors: PartAnchors }>;
  await Promise.all(
    DIRECTIONS.map(async (d) => {
      byDirection[d] = await loadPartSet(folder, manifest, d);
    }),
  );
  partsCache.set(id, byDirection);

  const master = new Pix(MASTER_WIDTH, MASTER_HEIGHT);
  const perAction = {} as Record<ActionId, Pix>;
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
  for (let i = 3; i < iconSrc.data.length; i += 4) if (iconSrc.data[i]! > 20) filled++;
  const icon32 = filled > 40 ? iconSrc : crop(idle, 16, 12, 32, 32);

  const bundle: SheetBundle = { id, master, perAction, icon32 };
  packed.set(id, bundle);
  cache.delete(id);
  notifyPack();
  return bundle;
}

export function clearSheetCache() {
  cache.clear();
}

export function getSheet(id: string): SheetBundle {
  const fromPack = packed.get(id);
  if (fromPack) return fromPack;
  if (PACKED_IDS.has(id)) {
    // Geometric fallback while the PNG pack decodes — do not cache it.
    return buildSheet(getCharacter(id));
  }
  const hit = cache.get(id);
  if (hit) return hit;
  const built = buildSheet(getCharacter(id));
  cache.set(id, built);
  return built;
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    cache.clear();
    packed.clear();
  });
}

if (typeof window !== "undefined") {
  void (async () => {
    const viaParts = await loadComposedCharacter("templar");
    if (!viaParts) await loadPackedCharacter("templar");
  })();
}
