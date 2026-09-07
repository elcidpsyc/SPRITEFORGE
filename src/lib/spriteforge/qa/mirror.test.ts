import { strict as assert } from "node:assert";
import test from "node:test";
import { ACTION_META, DIRECTIONS } from "../contract.ts";
import { cellOf, listActionSheets } from "./assets.ts";
import { pixelAt } from "./png.ts";

// MUDANÇA DE CONTRATO — Contrato 1.0 → 1.1, registrada explicitamente.
//
// ANTES: `left` era obrigatoriamente o espelho horizontal de `right`, e este
// teste comparava os dois pixel a pixel.
//
// AGORA: `left` e `right` são independentes, e forçar espelhamento é PROIBIDO.
//
// Por quê: o PixelLab entrega `east` e `west` como rotações geradas
// separadamente, não como reflexo uma da outra (docs/pixellab_api.md §1). Isso
// é melhor, não pior: um cavaleiro espelhado troca a espada de mão, inverte a
// cruz no escudo e espelha qualquer assimetria de desenho. Espelhar seria jogar
// fora informação que já pagamos para gerar.
//
// O que este teste garante agora é o oposto do que garantia: que as duas
// direções são REALMENTE distintas. Duas direções pixel-idênticas significam
// que alguém reintroduziu o espelhamento em algum ponto do pipeline.

const RIGHT = DIRECTIONS.indexOf("right");
const LEFT = DIRECTIONS.indexOf("left");

test("left e right são direções independentes, não espelhos forçados", () => {
  const sheets = listActionSheets();
  assert.ok(sheets.length > 0, "nenhum sprite encontrado em public/packs/");

  const mirrored: string[] = [];

  for (const sheet of sheets) {
    const frames = ACTION_META[sheet.action].frames;
    for (let frame = 0; frame < frames; frame += 1) {
      const right = cellOf(RIGHT, frame);
      const left = cellOf(LEFT, frame);

      let compared = 0;
      let identicalWhenFlipped = 0;
      for (let y = 0; y < right.h; y += 1) {
        for (let x = 0; x < right.w; x += 1) {
          const a = pixelAt(sheet.image, right.x + x, right.y + y);
          // O espelho horizontal: coluna x de `right` vira (w-1-x) de `left`.
          const b = pixelAt(sheet.image, left.x + (left.w - 1 - x), left.y + y);
          compared += 1;
          if (a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]) {
            identicalWhenFlipped += 1;
          }
        }
      }

      // Um frame totalmente vazio dos dois lados é idêntico por vacuidade —
      // não é espelhamento, é ausência de arte. Não conta.
      const empty =
        pixelAt(sheet.image, right.x, right.y)[3] === 0 && identicalWhenFlipped === compared;
      if (!empty && identicalWhenFlipped === compared) {
        mirrored.push(`${sheet.packId}/${sheet.action} frame ${frame}`);
      }
    }
  }

  assert.deepEqual(
    mirrored,
    [],
    "left é espelho pixel-perfeito de right nestes frames — o espelhamento forçado foi " +
      `reintroduzido e descarta as rotações independentes do PixelLab:\n${mirrored.join("\n")}`,
  );
});
