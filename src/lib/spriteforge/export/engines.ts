import { ACTION_META, ACTIONS, CELL, DIRECTIONS } from "../contract";
import type { Atlas, Character } from "../types";

export function buildPhaserAtlas(atlas: Atlas) {
  const frames: Record<string, { frame: { x: number; y: number; w: number; h: number } }> =
    {};
  const animations: Record<string, string[]> = {};
  for (const action of ACTIONS) {
    const n = ACTION_META[action].frames;
    DIRECTIONS.forEach((dir, dirIndex) => {
      const keys: string[] = [];
      for (let f = 0; f < n; f++) {
        const key = `${action}_${dir}_${f}`;
        keys.push(key);
        frames[key] = {
          frame: { x: f * CELL, y: dirIndex * CELL, w: CELL, h: CELL },
        };
      }
      animations[`${atlas.id}-${action}-${dir}`] = keys;
    });
  }
  return {
    frames,
    meta: {
      image: "walk.png",
      size: { w: 512, h: 256 },
      scale: "1",
      app: "SPRITEFORGE",
    },
    animations,
  };
}

export function buildPhaserExample(character: Character): string {
  const loads = ACTIONS.map(
    (a) =>
      `    this.load.spritesheet("${character.id}_${a}", "engines/_shared/${a}.png", { frameWidth: 64, frameHeight: 64 });`,
  ).join("\n");
  const anims = ACTIONS.map((a) => {
    const m = ACTION_META[a];
    return `    dirs.forEach((dir, row) => {
      this.anims.create({
        key: "${character.id}-${a}-" + dir,
        frames: this.anims.generateFrameNumbers("${character.id}_${a}", { start: row * 8, end: row * 8 + ${m.frames - 1} }),
        frameRate: ${m.fps},
        repeat: ${m.loop ? -1 : 0},
      });
    });`;
  }).join("\n");
  const cls = pascal(character.id);
  return `// SPRITEFORGE — Phaser 3 example scene
import Phaser from "phaser";

export class ${cls}Scene extends Phaser.Scene {
  constructor() { super("${character.id}"); }
  preload() {
${loads}
  }
  create() {
    const dirs = ["down", "up", "right", "left"] as const;
${anims}
    const sprite = this.add.sprite(160, 120, "${character.id}_walk", 0);
    sprite.setScale(2);
    sprite.play("${character.id}-walk-down");
    sprite.setData("hitFrame", 3);
  }
}
`;
}

export function buildPixiJson(atlas: Atlas, action: (typeof ACTIONS)[number]) {
  const n = ACTION_META[action].frames;
  const frames: Record<string, object> = {};
  const animations: Record<string, string[]> = {};
  DIRECTIONS.forEach((dir, dirIndex) => {
    const keys: string[] = [];
    for (let f = 0; f < n; f++) {
      const key = `${action}_${dir}_${f}`;
      keys.push(key);
      frames[key] = {
        frame: { x: f * CELL, y: dirIndex * CELL, w: CELL, h: CELL },
        sourceSize: { w: CELL, h: CELL },
        spriteSourceSize: { x: 0, y: 0, w: CELL, h: CELL },
        rotated: false,
        trimmed: false,
      };
    }
    animations[`${action}_${dir}`] = keys;
  });
  return {
    frames,
    animations,
    meta: {
      image: `${action}.png`,
      size: { w: 512, h: 256 },
      scale: "1",
      app: "SPRITEFORGE",
      format: "RGBA8888",
    },
  };
}

export function buildUnitySlice(atlas: Atlas) {
  const sprites: Array<{
    name: string;
    rect: { x: number; y: number; w: number; h: number };
    pivot: { x: number; y: number };
  }> = [];
  for (const action of ACTIONS) {
    const n = ACTION_META[action].frames;
    DIRECTIONS.forEach((dir, dirIndex) => {
      for (let f = 0; f < n; f++) {
        sprites.push({
          name: `${action}_${dir}_${f}`,
          rect: { x: f * CELL, y: dirIndex * CELL, w: CELL, h: CELL },
          pivot: { x: 32 / 64, y: 1 - 56 / 64 },
        });
      }
    });
  }
  return {
    texture: "walk.png",
    pixelsPerUnit: 64,
    filter: "Point",
    compression: "None",
    spriteMode: "Multiple",
    sprites,
    atlasId: atlas.id,
  };
}

export const UNITY_IMPORTER = `// SPRITEFORGE Unity 2D importer
// Place this file in Assets/Editor/SpriteForgeImporter.cs (rename from .cs.txt)
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

public class SpriteForgeImporter : EditorWindow
{
    [MenuItem("SPRITEFORGE/Import Selected Folder")]
    static void Import()
    {
        var path = EditorUtility.OpenFolderPanel("SPRITEFORGE pack", "Assets", "");
        if (string.IsNullOrEmpty(path)) return;
        Debug.Log("SPRITEFORGE: import " + path + " — use slice.json for grid 8x4, PPU=64, Filter=Point.");
    }
}
#endif
`;

export const UNITY_IMPORT_MD = `# SPRITEFORGE → Unity 2D

1. Importe os PNG de \`engines/_shared/\` (um por ação, 512×256, 8×4 células 64×64).
2. Texture Type = Sprite (2D and UI), Sprite Mode = **Multiple**, Pixels Per Unit = **64**,
   Filter Mode = **Point**, Compression = **None**.
3. Sprite Editor → Slice Grid By Cell Size 64×64.
4. Nomes: \`walk_down_0\` … (row 0 = down, row 1 = up, row 2 = right, row 3 = left).
5. Copie \`SpriteForgeImporter.cs.txt\` para \`Assets/Editor/SpriteForgeImporter.cs\`.
`;

function pascal(id: string) {
  return id
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}
