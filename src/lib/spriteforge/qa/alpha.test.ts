import { strict as assert } from "node:assert";
import test from "node:test";
import { listActionSheets } from "./assets.ts";
import { quarantine } from "./quarantine.ts";

// Contrato 1.0: alpha ∈ {0, 255}. Nothing in between.
//
// A partially transparent pixel is the signature of a resample: a scaler that
// blended a sprite edge against its background. It also breaks pixel-perfect
// collision and makes a sprite fringe against any background but the one it
// was composited over.

test("alpha é binário (0 ou 255) em todo sprite", () => {
  const sheets = listActionSheets();
  assert.ok(sheets.length > 0, "nenhum sprite encontrado em public/packs/");

  const failures: string[] = [];
  for (const sheet of sheets) {
    const offenders = new Map<number, number>();
    for (let i = 3; i < sheet.image.data.length; i += 4) {
      const a = sheet.image.data[i]!;
      if (a !== 0 && a !== 255) offenders.set(a, (offenders.get(a) ?? 0) + 1);
    }
    if (offenders.size > 0) {
      const sample = [...offenders.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([a, n]) => `alpha=${a} (${n}px)`)
        .join(", ");
      const reason = `${sheet.packId}/${sheet.action}: alpha intermediário — ${sample}`;
      quarantine(sheet.path, reason);
      failures.push(reason);
    }
  }

  assert.deepEqual(failures, [], `alpha fora de {0,255}:\n${failures.join("\n")}`);
});
