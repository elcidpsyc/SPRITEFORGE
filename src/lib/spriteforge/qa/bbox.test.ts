import { strict as assert } from "node:assert";
import test from "node:test";
import { ACTION_META, CELL, DIRECTIONS } from "../contract.ts";
import { cellOf, listActionSheets, EXPECTED_SHEET_WIDTH } from "./assets.ts";
import { opaqueBounds } from "./png.ts";
import { quarantine } from "./quarantine.ts";

// Contrato 1.0: nothing overflows the 64×64 cell.
//
// This is the test PixelLab output is most likely to trip: the API grows its
// canvas ~40% beyond the requested size, so a character asked for at 64 comes
// back on roughly 90×90 and has to be cropped back by integer translation
// before it can be a contract asset. See docs/pixellab_api.md §1.

test("as folhas têm a geometria da grade do contrato", () => {
  const sheets = listActionSheets();
  assert.ok(sheets.length > 0, "nenhum sprite encontrado em public/packs/");

  for (const sheet of sheets) {
    assert.equal(
      sheet.image.width,
      EXPECTED_SHEET_WIDTH,
      `${sheet.packId}/${sheet.action}: largura ${sheet.image.width}, esperado ${EXPECTED_SHEET_WIDTH}`,
    );
    assert.equal(
      sheet.image.height,
      DIRECTIONS.length * CELL,
      `${sheet.packId}/${sheet.action}: altura ${sheet.image.height}, esperado ${DIRECTIONS.length * CELL}`,
    );
  }
});

test("nenhum pixel estoura a célula 64×64", () => {
  const failures: string[] = [];

  for (const sheet of listActionSheets()) {
    const frames = ACTION_META[sheet.action].frames;
    for (let dir = 0; dir < DIRECTIONS.length; dir += 1) {
      for (let frame = 0; frame < frames; frame += 1) {
        const bounds = opaqueBounds(sheet.image, cellOf(dir, frame));
        if (!bounds) continue; // célula vazia é válida
        if (
          bounds.x < 0 ||
          bounds.y < 0 ||
          bounds.x + bounds.w > CELL ||
          bounds.y + bounds.h > CELL
        ) {
          const reason =
            `${sheet.packId}/${sheet.action} ${DIRECTIONS[dir]} frame ${frame}: ` +
            `bbox ${bounds.x},${bounds.y} ${bounds.w}×${bounds.h} estoura ${CELL}×${CELL}`;
          quarantine(sheet.path, reason);
          failures.push(reason);
        }
      }
    }
  }

  assert.deepEqual(failures, [], `bbox fora da célula:\n${failures.join("\n")}`);
});
