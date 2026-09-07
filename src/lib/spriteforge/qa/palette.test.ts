import { strict as assert } from "node:assert";
import test from "node:test";
import { listActionSheets } from "./assets.ts";
import { palette } from "./png.ts";
import { quarantine } from "./quarantine.ts";

// Contrato 1.0: ≤ 32 colours, and a palette consistent across the frames of
// one class.
//
// Consistency is the harder half and the reason it matters: a generator that
// re-picks its colours per action produces a character that shifts hue as it
// walks. PixelLab's lever for this is `color_image` + `force_colors: true`,
// applied to creation AND to every animation (docs/pixellab_api.md §3).

const MAX_COLORS = 32;

test("cada folha usa no máximo 32 cores", () => {
  const sheets = listActionSheets();
  assert.ok(sheets.length > 0, "nenhum sprite encontrado em public/packs/");

  const failures: string[] = [];
  for (const sheet of sheets) {
    const colors = palette(sheet.image);
    if (colors.size > MAX_COLORS) {
      const reason = `${sheet.packId}/${sheet.action}: ${colors.size} cores (máx ${MAX_COLORS})`;
      quarantine(sheet.path, reason);
      failures.push(reason);
    }
  }

  assert.deepEqual(failures, [], `paleta acima do limite:\n${failures.join("\n")}`);
});

test("a paleta é consistente entre as ações de uma mesma classe", () => {
  const sheets = listActionSheets();
  const byPack = new Map<string, typeof sheets>();
  for (const sheet of sheets) {
    const list = byPack.get(sheet.packId) ?? [];
    list.push(sheet);
    byPack.set(sheet.packId, list);
  }

  const failures: string[] = [];
  for (const [packId, packSheets] of byPack) {
    // The union across every action of one class is the palette that class
    // actually ships. If each action stays under the cap but the union blows
    // past it, the actions are not sharing a palette.
    const union = new Set<string>();
    for (const sheet of packSheets) for (const c of palette(sheet.image)) union.add(c);

    if (union.size > MAX_COLORS) {
      const perAction = packSheets.map((s) => `${s.action}=${palette(s.image).size}`).join(" ");
      const reason =
        `${packId}: união das ações tem ${union.size} cores (máx ${MAX_COLORS}) — ` +
        `por ação: ${perAction}. As ações não compartilham paleta.`;
      for (const sheet of packSheets) quarantine(sheet.path, reason);
      failures.push(reason);
    }
  }

  assert.deepEqual(failures, [], `paleta inconsistente entre ações:\n${failures.join("\n")}`);
});
