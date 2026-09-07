import { strict as assert } from "node:assert";
import test from "node:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// Contrato 1.0: no interpolated resampling anywhere in the pipeline.
//
// A static check, not a pixel one. Any smooth scale or free rotation destroys
// the pixel grid, and the damage is easier to prevent than to detect after the
// fact — by then it is baked into the asset. Every transform has to be an
// integer translation or a nearest-neighbour scale.

const FORBIDDEN = /\b(bilinear|bicubic|LANCZOS|rotate\()/;
const ROOTS = ["src", "scripts"];
const EXTENSIONS = [".ts", ".tsx", ".mjs", ".js"];

// Files exempt wholesale: this one names every pattern it bans.
const ALLOWLIST = new Set(["src/lib/spriteforge/qa/nointerp.test.ts"]);

// Individual lines exempt, matched by EXACT trimmed content rather than by
// line number, so an edit to the line re-flags it. Prose that forbids
// interpolation trips the same grep as code that performs it; the allowlist is
// the honest way to tell them apart without a heuristic that could wave a real
// usage through.
const ALLOWED_LINES = new Set([
  // Godot import instructions telling the user NOT to use bilinear filtering.
  "Filtro: **Nearest / Point**. Nunca bilinear \u2014 derrete o pixel.",
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      walk(full, out);
    } else if (EXTENSIONS.some((e) => entry.name.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

test("nenhuma interpolação no código do pipeline", () => {
  const root = process.cwd();
  const hits: string[] = [];

  for (const dirName of ROOTS) {
    const dir = join(root, dirName);
    try {
      if (!statSync(dir).isDirectory()) continue;
    } catch {
      continue;
    }

    for (const file of walk(dir)) {
      const rel = relative(root, file).split("\\").join("/");
      if (ALLOWLIST.has(rel)) continue;
      const source = readFileSync(file, "utf8");
      source.split("\n").forEach((line, i) => {
        const match = FORBIDDEN.exec(line);
        if (!match) return;
        if (ALLOWED_LINES.has(line.trim())) return;
        hits.push(`${rel}:${i + 1}: ${match[0]} — ${line.trim().slice(0, 100)}`);
      });
    }
  }

  assert.deepEqual(
    hits,
    [],
    `interpolação proibida encontrada (use translação inteira ou nearest-neighbour):\n${hits.join("\n")}`,
  );
});
