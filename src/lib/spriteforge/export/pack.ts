import { strToU8, zipSync } from "fflate";
import { ACTIONS, ACTION_META, CELL } from "../contract";
import { buildAtlas } from "../atlas";
import { getSheet, pixToJpgBlob, pixToPngBlob, pixToSvg, type SheetBundle } from "../sheet";
import type { EngineId } from "../contract";
import type { Character } from "../types";
import {
  buildSpriteFramesJson,
  GODOT_IMPORTER,
  GODOT_README,
  GODOT_TSCN_EXAMPLE,
} from "./godot";
import {
  buildPhaserAtlas,
  buildPhaserExample,
  buildPixiJson,
  buildUnitySlice,
  UNITY_IMPORTER,
  UNITY_IMPORT_MD,
} from "./engines";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function blobToU8(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

async function buildGif(bundle: SheetBundle): Promise<Uint8Array> {
  const mod = (await import("gifenc")) as {
    GIFEncoder: () => {
      writeFrame: (
        index: Uint8Array,
        w: number,
        h: number,
        opts: { palette: number[][]; delay?: number },
      ) => void;
      finish: () => void;
      bytes: () => Uint8Array;
    };
    quantize: (rgba: Uint8ClampedArray, max: number) => number[][];
    applyPalette: (rgba: Uint8ClampedArray, palette: number[][]) => Uint8Array;
    default?: unknown;
  };
  const GIFEncoder = mod.GIFEncoder;
  const quantize = mod.quantize;
  const applyPalette = mod.applyPalette;
  const frames = ACTION_META.walk.frames;
  const gif = GIFEncoder();
  let palette: number[][] | null = null;
  for (let f = 0; f < frames; f++) {
    const cell = new Uint8ClampedArray(CELL * CELL * 4);
    const sheet = bundle.perAction.walk;
    for (let y = 0; y < CELL; y++) {
      for (let x = 0; x < CELL; x++) {
        const si = (y * sheet.w + (f * CELL + x)) * 4;
        const di = (y * CELL + x) * 4;
        cell[di] = sheet.data[si]!;
        cell[di + 1] = sheet.data[si + 1]!;
        cell[di + 2] = sheet.data[si + 2]!;
        cell[di + 3] = sheet.data[si + 3]!;
        if (cell[di + 3] < 8) {
          cell[di] = 11;
          cell[di + 1] = 12;
          cell[di + 2] = 14;
          cell[di + 3] = 255;
        }
      }
    }
    if (!palette) palette = quantize(cell, 256);
    const index = applyPalette(cell, palette);
    gif.writeFrame(index, CELL, CELL, { palette, delay: Math.round(1000 / 8) });
  }
  gif.finish();
  return gif.bytes();
}

export async function exportPng(character: Character, kind: "master" | "icon" = "master") {
  const bundle = getSheet(character.id);
  const pix = kind === "icon" ? bundle.icon32 : bundle.master;
  downloadBlob(await pixToPngBlob(pix), `${character.id}-${kind === "icon" ? "icon32" : "sheet"}.png`);
}

export async function exportJpg(character: Character) {
  const bundle = getSheet(character.id);
  downloadBlob(await pixToJpgBlob(bundle.master), `${character.id}-sheet.jpg`);
}

export function exportSvg(character: Character) {
  const bundle = getSheet(character.id);
  const svg = pixToSvg(bundle.icon32);
  downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${character.id}-idle_32.svg`);
}

export function exportAtlasJson(character: Character) {
  const atlas = buildAtlas(character);
  const json = JSON.stringify(atlas, null, 2);
  downloadBlob(new Blob([json], { type: "application/json" }), "atlas.json");
}

export async function exportEnginePack(character: Character, engine: EngineId) {
  const files = await buildPackFiles(character, engine);
  const zipped = zipSync(files, { level: 6 });
  const name =
    engine === "generico"
      ? `${character.id}-generic.zip`
      : `${character.id}-${engine}-pack.zip`;
  downloadBlob(new Blob([zipped], { type: "application/zip" }), name);
}

export async function exportBatchZip(character: Character) {
  const files = await buildPackFiles(character, "godot");
  // include the other engine adapters in a full batch
  const extra = await buildPackFiles(character, "phaser");
  const merged: Record<string, Uint8Array> = { ...files };
  for (const [k, v] of Object.entries(extra)) {
    if (!(k in merged)) merged[k] = v;
  }
  const pixi = await buildPackFiles(character, "pixi");
  for (const [k, v] of Object.entries(pixi)) if (!(k in merged)) merged[k] = v;
  const unity = await buildPackFiles(character, "unity");
  for (const [k, v] of Object.entries(unity)) if (!(k in merged)) merged[k] = v;
  const zipped = zipSync(merged, { level: 6 });
  downloadBlob(
    new Blob([zipped], { type: "application/zip" }),
    `${character.id}-gamepack.zip`,
  );
}

async function buildPackFiles(character: Character, engine: EngineId): Promise<Record<string, Uint8Array>> {
  const bundle = getSheet(character.id);
  const atlas = buildAtlas(character);
  const root = `${character.id}/`;
  const files: Record<string, Uint8Array> = {};

  files[root + "atlas.json"] = strToU8(JSON.stringify(atlas, null, 2));
  files[root + "sheet.png"] = await blobToU8(await pixToPngBlob(bundle.master));
  files[root + "icons/idle_32.png"] = await blobToU8(await pixToPngBlob(bundle.icon32));
  files[root + "icons/idle_32.svg"] = strToU8(pixToSvg(bundle.icon32));
  files[root + "preview.gif"] = await buildGif(bundle);

  for (const action of ACTIONS) {
    files[root + `engines/_shared/${action}.png`] = await blobToU8(
      await pixToPngBlob(bundle.perAction[action]),
    );
  }

  if (engine === "godot" || engine === "generico") {
    files[root + "engines/godot/spriteforge_importer.gd"] = strToU8(GODOT_IMPORTER);
    files[root + "engines/godot/spriteframes.json"] = strToU8(
      JSON.stringify(buildSpriteFramesJson(atlas), null, 2),
    );
    files[root + "engines/godot/templar.tscn.example"] = strToU8(GODOT_TSCN_EXAMPLE);
    files[root + "engines/godot/README.md"] = strToU8(GODOT_README);
  }
  if (engine === "phaser" || engine === "generico") {
    files[root + "engines/phaser/templar-atlas.json"] = strToU8(
      JSON.stringify(buildPhaserAtlas(atlas), null, 2),
    );
    files[root + "engines/phaser/example-scene.ts"] = strToU8(buildPhaserExample(character));
  }
  if (engine === "pixi" || engine === "generico") {
    files[root + "engines/pixi/templar-pixi.json"] = strToU8(
      JSON.stringify(buildPixiJson(atlas, "walk"), null, 2),
    );
  }
  if (engine === "unity" || engine === "generico") {
    files[root + "engines/unity/slice.json"] = strToU8(JSON.stringify(buildUnitySlice(atlas), null, 2));
    files[root + "engines/unity/SpriteForgeImporter.cs.txt"] = strToU8(UNITY_IMPORTER);
    files[root + "engines/unity/AnimationImport.md"] = strToU8(UNITY_IMPORT_MD);
  }

  return files;
}
