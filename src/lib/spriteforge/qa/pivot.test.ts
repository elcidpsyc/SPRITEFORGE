import { strict as assert } from "node:assert";
import test from "node:test";
import { ACTION_META, CELL, DIRECTIONS, PIVOT } from "../contract.ts";
import { cellOf, listActionSheets } from "./assets.ts";
import { quarantine } from "./quarantine.ts";

// Contrato 1.0: ground anchor at PIVOT, deviation 0.
//
// PIVOT is (32, 56), from contract.ts. The FASE 3 brief quoted (32, 58); the
// code, public/packs/templar/atlas.json AND the shipped pixels all say 56 --
// every frame of every pack lands its ground line on y=56 exactly. 56 is
// therefore what this test enforces. Change contract.ts if 58 was the real
// intent and this test follows.
//
// TWO DELIBERATE DEFINITIONS, both of which cost a wrong result if got wrong:
//
// 1. The anchor is measured on FULLY OPAQUE pixels only. The renderer draws a
//    motion smear at alpha 90 that trails below the feet; including it would
//    measure the smear instead of the character.
//
// 2. Y is exact, X is a containment check. The ground line is a fixed contract
//    point and is enforced at deviation 0. The feet's horizontal midpoint is
//    NOT fixed -- a walk cycle steps left and right by design, so demanding an
//    exact X would fail every correct animation. What X must guarantee is that
//    the sprite still straddles the pivot column, i.e. has not drifted off its
//    anchor inside the cell.

/** Bottom-most fully-opaque row, and that row's horizontal extent. */
function groundLine(
  img: { width: number; data: Uint8Array },
  cell: { x: number; y: number; w: number; h: number },
): { y: number; minX: number; maxX: number } | null {
  for (let y = cell.y + cell.h - 1; y >= cell.y; y -= 1) {
    let minX = Infinity;
    let maxX = -Infinity;
    for (let x = cell.x; x < cell.x + cell.w; x += 1) {
      if (img.data[(y * img.width + x) * 4 + 3] !== 255) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
    if (maxX >= 0) return { y: y - cell.y, minX: minX - cell.x, maxX: maxX - cell.x };
  }
  return null;
}

test("a linha de solo cai exatamente em PIVOT.y", () => {
  const sheets = listActionSheets();
  assert.ok(sheets.length > 0, "nenhum sprite encontrado em public/packs/");

  const failures: string[] = [];
  for (const sheet of sheets) {
    const frames = ACTION_META[sheet.action].frames;
    for (let dir = 0; dir < DIRECTIONS.length; dir += 1) {
      for (let frame = 0; frame < frames; frame += 1) {
        const line = groundLine(sheet.image, cellOf(dir, frame));
        if (!line) continue; // célula vazia é válida

        if (line.y !== PIVOT.y) {
          const reason =
            `${sheet.packId}/${sheet.action} ${DIRECTIONS[dir]} frame ${frame}: ` +
            `linha de solo em y=${line.y}, esperado y=${PIVOT.y} (desvio ${line.y - PIVOT.y})`;
          quarantine(sheet.path, reason);
          failures.push(reason);
        }
      }
    }
  }

  assert.deepEqual(
    failures,
    [],
    `linha de solo fora do pivô (${failures.length} frames):\n${failures.slice(0, 20).join("\n")}`,
  );
});

test("o sprite continua ancorado na coluna do pivô", () => {
  const failures: string[] = [];

  for (const sheet of listActionSheets()) {
    const frames = ACTION_META[sheet.action].frames;
    for (let dir = 0; dir < DIRECTIONS.length; dir += 1) {
      for (let frame = 0; frame < frames; frame += 1) {
        const line = groundLine(sheet.image, cellOf(dir, frame));
        if (!line) continue;

        if (line.minX > PIVOT.x || line.maxX < PIVOT.x) {
          const reason =
            `${sheet.packId}/${sheet.action} ${DIRECTIONS[dir]} frame ${frame}: ` +
            `pés ocupam x=${line.minX}..${line.maxX}, que não contém PIVOT.x=${PIVOT.x} — ` +
            "o sprite saiu da âncora dentro da célula";
          quarantine(sheet.path, reason);
          failures.push(reason);
        }
        if (line.minX < 0 || line.maxX >= CELL) {
          failures.push(
            `${sheet.packId}/${sheet.action} ${DIRECTIONS[dir]} frame ${frame}: pés fora da célula`,
          );
        }
      }
    }
  }

  assert.deepEqual(
    failures,
    [],
    `sprite fora da coluna do pivô (${failures.length} frames):\n${failures.slice(0, 20).join("\n")}`,
  );
});
