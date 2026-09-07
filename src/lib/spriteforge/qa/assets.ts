import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ACTIONS, CELL, MASTER_COLS, type ActionId } from "../contract.ts";
import { decodePng, type Rgba } from "./png.ts";

// Locates the sprite assets the Contract 1.0 tests run against.
//
// Every asset the pipeline produces is checked, wherever it came from. The
// tests do not care whether a sheet was drawn by the paper-doll exporter or
// returned by PixelLab -- the contract is the contract.

export const PACKS_DIR = join(process.cwd(), "public", "packs");
export const QUARANTINE_DIR = join(process.cwd(), "assets", "quarantine");

export type ActionSheet = {
  packId: string;
  action: ActionId;
  path: string;
  image: Rgba;
};

/** One 64x64 cell of an action sheet: row = direction, column = frame. */
export function cellOf(direction: number, frame: number) {
  return { x: frame * CELL, y: direction * CELL, w: CELL, h: CELL };
}

export function listPacks(): string[] {
  if (!existsSync(PACKS_DIR)) return [];
  return readdirSync(PACKS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/**
 * Every per-action sheet of every pack. A missing sheet is skipped rather than
 * failed: a pack mid-generation is a normal state, and the contract tests are
 * about the assets that exist, not about completeness.
 */
export function listActionSheets(): ActionSheet[] {
  const sheets: ActionSheet[] = [];
  for (const packId of listPacks()) {
    for (const action of ACTIONS) {
      const path = join(PACKS_DIR, packId, `${action}.png`);
      if (!existsSync(path)) continue;
      sheets.push({
        packId,
        action,
        path,
        image: decodePng(new Uint8Array(readFileSync(path))),
      });
    }
  }
  return sheets;
}

export const EXPECTED_SHEET_WIDTH = MASTER_COLS * CELL;
