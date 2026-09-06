import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { ACTIONS, ACTION_META, CELL, DIRECTIONS } from "./contract.ts";
import { alphaAt, decodePng } from "./testing/png.ts";

const PACK_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../public/packs/templar-v4",
);

describe("templar-v4 pack: cell borders", () => {
  for (const action of ACTIONS) {
    it(`${action}.png — every 64x64 cell has a fully transparent 1px border`, () => {
      const img = decodePng(readFileSync(path.join(PACK_DIR, `${action}.png`)));
      const meta = ACTION_META[action];
      assert.equal(img.width, CELL * 8, `${action}.png width`);
      assert.equal(img.height, CELL * DIRECTIONS.length, `${action}.png height`);

      const violations: string[] = [];
      DIRECTIONS.forEach((dir, dirIndex) => {
        for (let f = 0; f < meta.frames; f++) {
          const ox = f * CELL;
          const oy = dirIndex * CELL;
          for (let x = 0; x < CELL; x++) {
            if (alphaAt(img, ox + x, oy) !== 0) violations.push(`${dir} f${f} top x=${x}`);
            if (alphaAt(img, ox + x, oy + CELL - 1) !== 0)
              violations.push(`${dir} f${f} bottom x=${x}`);
          }
          for (let y = 0; y < CELL; y++) {
            if (alphaAt(img, ox, oy + y) !== 0) violations.push(`${dir} f${f} left y=${y}`);
            if (alphaAt(img, ox + CELL - 1, oy + y) !== 0)
              violations.push(`${dir} f${f} right y=${y}`);
          }
        }
      });

      assert.deepEqual(violations, [], `opaque pixels bleeding into cell border: ${violations.slice(0, 10).join(", ")}`);
    });
  }
});
