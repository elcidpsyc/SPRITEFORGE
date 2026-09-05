import { a as pixToSvg, c as ACTION_META, d as PIVOT, i as pixToPngBlob, l as DIRECTIONS, n as getSheet, o as buildAtlas, r as pixToJpgBlob, s as ACTIONS, u as HITBOX } from "./routes-DQzTRk9p.mjs";
import { n as zipSync, t as strToU8 } from "../_libs/fflate.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pack-BKzxnTQM.js
function buildSpriteFramesJson(atlas) {
	const animations = [];
	const hitFrames = {};
	for (const action of ACTIONS) {
		const meta = ACTION_META[action];
		DIRECTIONS.forEach((dir, dirIndex) => {
			const name = `${action}_${dir}`;
			const frames = [];
			for (let f = 0; f < meta.frames; f++) frames.push({
				texture: `${action}.png`,
				x: f * 64,
				y: dirIndex * 64,
				w: 64,
				h: 64
			});
			animations.push({
				name,
				speed: meta.fps,
				loop: meta.loop,
				frames
			});
			if (meta.hitFrame !== void 0) hitFrames[name] = meta.hitFrame;
		});
	}
	return {
		resource: "SpriteFrames",
		animations,
		meta: {
			hitFrames,
			pivot: { ...PIVOT },
			hitbox: { ...HITBOX }
		}
	};
}
var GODOT_IMPORTER = `@tool
extends EditorScript
## SPRITEFORGE — Godot 4.x importer
## Place this pack at res://sprites/spriteforge/<id>/ then run:
##   File → Run (this script)  or  attach as a tool and click Run
## Reads atlas.json (source of truth). Never hardcodes frame counts.

const CELL := 64

func _run() -> void:
	var godot_dir := get_script().resource_path.get_base_dir()
	var engines_dir := godot_dir.get_base_dir()
	var pack_dir := engines_dir.get_base_dir()
	var atlas_path := pack_dir.path_join("atlas.json")
	if not FileAccess.file_exists(atlas_path):
		push_error("SPRITEFORGE: atlas.json not found at %s" % atlas_path)
		return
	var atlas := JSON.parse_string(FileAccess.get_file_as_string(atlas_path))
	if typeof(atlas) != TYPE_DICTIONARY:
		push_error("SPRITEFORGE: invalid atlas.json")
		return

	var frames := SpriteFrames.new()
	var cell_w: int = int(atlas.get("cell", {}).get("w", CELL))
	var cell_h: int = int(atlas.get("cell", {}).get("h", CELL))
	var dirs: Array = atlas.get("directions", ["down", "up", "right", "left"])
	var anims: Dictionary = atlas.get("animations", {})
	var per_action: Dictionary = atlas.get("sheet", {}).get("perAction", {})
	var shared_dir := engines_dir.path_join("_shared")

	for action in anims.keys():
		var spec: Dictionary = anims[action]
		var png_rel: String = String(per_action.get(action, "engines/_shared/%s.png" % action))
		var png_path := pack_dir.path_join(png_rel)
		if not FileAccess.file_exists(png_path):
			png_path = shared_dir.path_join("%s.png" % action)
		if not FileAccess.file_exists(png_path):
			push_warning("SPRITEFORGE: missing %s.png" % action)
			continue
		var tex := load(png_path) as Texture2D
		if tex == null:
			push_warning("SPRITEFORGE: could not load %s" % png_path)
			continue
		var nframes: int = int(spec.get("frames", 8))
		var fps: float = float(spec.get("fps", 8))
		var loop: bool = bool(spec.get("loop", true))
		var dir_i := 0
		for dir in dirs:
			var anim_name := "%s_%s" % [action, dir]
			if frames.has_animation(anim_name):
				frames.remove_animation(anim_name)
			frames.add_animation(anim_name)
			frames.set_animation_speed(anim_name, fps)
			frames.set_animation_loop(anim_name, loop)
			for f in nframes:
				var at := AtlasTexture.new()
				at.atlas = tex
				at.region = Rect2(f * cell_w, dir_i * cell_h, cell_w, cell_h)
				at.filter_clip = true
				frames.add_frame(anim_name, at)
			dir_i += 1

	var out_path := pack_dir.path_join("%s_frames.tres" % String(atlas.get("id", "hero")))
	var err := ResourceSaver.save(frames, out_path)
	if err != OK:
		push_error("SPRITEFORGE: failed to save %s (%s)" % [out_path, err])
		return
	print("SPRITEFORGE: wrote ", out_path)

	_make_scene(atlas, frames, pack_dir)

func _make_scene(atlas: Dictionary, frames: SpriteFrames, pack_dir: String) -> void:
	var id := String(atlas.get("id", "hero"))
	var root := Node2D.new()
	root.name = id.capitalize()
	var sprite := AnimatedSprite2D.new()
	sprite.name = "AnimatedSprite2D"
	sprite.sprite_frames = frames
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	var pivot: Dictionary = atlas.get("pivot", {"x": 32, "y": 56})
	# Cell origin is top-left; put feet (pivot) on the Node2D origin.
	sprite.offset = Vector2(-float(pivot.get("x", 32)), -float(pivot.get("y", 56)))
	sprite.centered = false
	if frames.has_animation("walk_down"):
		sprite.animation = "walk_down"
		sprite.play("walk_down")
	var hit := atlas.get("animations", {}).get("attack", {}).get("hitFrame", 3)
	sprite.set_meta("hit_frame", int(hit))
	root.add_child(sprite)
	sprite.owner = root

	var body := CharacterBody2D.new()
	body.name = "Hitbox"
	var col := CollisionShape2D.new()
	col.name = "CollisionShape2D"
	var hb: Dictionary = atlas.get("hitbox", {"x": 22, "y": 20, "w": 20, "h": 36})
	var shape := RectangleShape2D.new()
	shape.size = Vector2(float(hb.get("w", 20)), float(hb.get("h", 36)))
	col.shape = shape
	# Hitbox is defined in cell space; offset relative to pivot (feet).
	col.position = Vector2(
		float(hb.get("x", 22)) + float(hb.get("w", 20)) / 2.0 - float(pivot.get("x", 32)),
		float(hb.get("y", 20)) + float(hb.get("h", 36)) / 2.0 - float(pivot.get("y", 56))
	)
	body.add_child(col)
	root.add_child(body)
	body.owner = root
	col.owner = root

	var scene := PackedScene.new()
	scene.pack(root)
	var scene_path := pack_dir.path_join("%s.tscn" % id)
	ResourceSaver.save(scene, scene_path)
	print("SPRITEFORGE: wrote ", scene_path)
`;
var GODOT_README = `# SPRITEFORGE → Godot 4.x

Drop-in do pack \`<id>/\` para um projeto Godot **4.x** (Godot 3 está fora do MVP).

## Importar

1. Copie a pasta do personagem para \`res://sprites/spriteforge/<id>/\`.
2. Abra o Godot 4. Confirme que os PNG em \`engines/_shared/\` importaram com
   **Filter = Nearest** (Point) e **Mipmaps off**.
3. Abra \`engines/godot/spriteforge_importer.gd\` e rode **File → Run**.
4. O script lê \`atlas.json\` (source of truth), fatiar cada PNG 64×64,
   grava \`<id>_frames.tres\` e uma cena \`<id>.tscn\` com:
   - \`AnimatedSprite2D\` (animações \`{action}_{direction}\`)
   - \`CollisionShape2D\` do hitbox, offset relativo ao pivot (32, 56)
   - meta \`hit_frame\` no sprite (ataque = 3, 0-index)

## API sugerida

\`\`\`gdscript
func play_action(action: String, dir: String) -> void:
    $AnimatedSprite2D.play("%s_%s" % [action, dir])

func is_hit_frame() -> bool:
    var anim := $AnimatedSprite2D.animation
    if not anim.begins_with("attack"):
        return false
    return $AnimatedSprite2D.frame == int($AnimatedSprite2D.get_meta("hit_frame", 3))
\`\`\`

Filtro: **Nearest / Point**. Nunca bilinear — derrete o pixel.
`;
var GODOT_TSCN_EXAMPLE = `; SPRITEFORGE example scene (generated by spriteforge_importer.gd)
; Godot 4.x — AnimatedSprite2D + hitbox
; Animations: walk_down, walk_up, walk_right, walk_left, run_*, attack_*, ...
`;
function buildPhaserAtlas(atlas) {
	const frames = {};
	const animations = {};
	for (const action of ACTIONS) {
		const n = ACTION_META[action].frames;
		DIRECTIONS.forEach((dir, dirIndex) => {
			const keys = [];
			for (let f = 0; f < n; f++) {
				const key = `${action}_${dir}_${f}`;
				keys.push(key);
				frames[key] = { frame: {
					x: f * 64,
					y: dirIndex * 64,
					w: 64,
					h: 64
				} };
			}
			animations[`${atlas.id}-${action}-${dir}`] = keys;
		});
	}
	return {
		frames,
		meta: {
			image: "walk.png",
			size: {
				w: 512,
				h: 256
			},
			scale: "1",
			app: "SPRITEFORGE"
		},
		animations
	};
}
function buildPhaserExample(character) {
	const loads = ACTIONS.map((a) => `    this.load.spritesheet("${character.id}_${a}", "engines/_shared/${a}.png", { frameWidth: 64, frameHeight: 64 });`).join("\n");
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
	return `// SPRITEFORGE — Phaser 3 example scene
import Phaser from "phaser";

export class ${pascal(character.id)}Scene extends Phaser.Scene {
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
function buildPixiJson(atlas, action) {
	const n = ACTION_META[action].frames;
	const frames = {};
	const animations = {};
	DIRECTIONS.forEach((dir, dirIndex) => {
		const keys = [];
		for (let f = 0; f < n; f++) {
			const key = `${action}_${dir}_${f}`;
			keys.push(key);
			frames[key] = {
				frame: {
					x: f * 64,
					y: dirIndex * 64,
					w: 64,
					h: 64
				},
				sourceSize: {
					w: 64,
					h: 64
				},
				spriteSourceSize: {
					x: 0,
					y: 0,
					w: 64,
					h: 64
				},
				rotated: false,
				trimmed: false
			};
		}
		animations[`${action}_${dir}`] = keys;
	});
	return {
		frames,
		animations,
		meta: {
			image: `${action}.png`,
			size: {
				w: 512,
				h: 256
			},
			scale: "1",
			app: "SPRITEFORGE",
			format: "RGBA8888"
		}
	};
}
function buildUnitySlice(atlas) {
	const sprites = [];
	for (const action of ACTIONS) {
		const n = ACTION_META[action].frames;
		DIRECTIONS.forEach((dir, dirIndex) => {
			for (let f = 0; f < n; f++) sprites.push({
				name: `${action}_${dir}_${f}`,
				rect: {
					x: f * 64,
					y: dirIndex * 64,
					w: 64,
					h: 64
				},
				pivot: {
					x: 32 / 64,
					y: 1 - 56 / 64
				}
			});
		});
	}
	return {
		texture: "walk.png",
		pixelsPerUnit: 64,
		filter: "Point",
		compression: "None",
		spriteMode: "Multiple",
		sprites,
		atlasId: atlas.id
	};
}
var UNITY_IMPORTER = `// SPRITEFORGE Unity 2D importer
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
var UNITY_IMPORT_MD = `# SPRITEFORGE → Unity 2D

1. Importe os PNG de \`engines/_shared/\` (um por ação, 512×256, 8×4 células 64×64).
2. Texture Type = Sprite (2D and UI), Sprite Mode = **Multiple**, Pixels Per Unit = **64**,
   Filter Mode = **Point**, Compression = **None**.
3. Sprite Editor → Slice Grid By Cell Size 64×64.
4. Nomes: \`walk_down_0\` … (row 0 = down, row 1 = up, row 2 = right, row 3 = left).
5. Copie \`SpriteForgeImporter.cs.txt\` para \`Assets/Editor/SpriteForgeImporter.cs\`.
`;
function pascal(id) {
	return id.split(/[-_]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}
function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1500);
}
async function blobToU8(blob) {
	return new Uint8Array(await blob.arrayBuffer());
}
async function buildGif(bundle) {
	const mod = await import("../_libs/gifenc.mjs").then((n) => n.t);
	const GIFEncoder = mod.GIFEncoder;
	const quantize = mod.quantize;
	const applyPalette = mod.applyPalette;
	const frames = ACTION_META.walk.frames;
	const gif = GIFEncoder();
	let palette = null;
	for (let f = 0; f < frames; f++) {
		const cell = /* @__PURE__ */ new Uint8ClampedArray(16384);
		const sheet = bundle.perAction.walk;
		for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
			const si = (y * sheet.w + (f * 64 + x)) * 4;
			const di = (y * 64 + x) * 4;
			cell[di] = sheet.data[si];
			cell[di + 1] = sheet.data[si + 1];
			cell[di + 2] = sheet.data[si + 2];
			cell[di + 3] = sheet.data[si + 3];
			if (cell[di + 3] < 8) {
				cell[di] = 11;
				cell[di + 1] = 12;
				cell[di + 2] = 14;
				cell[di + 3] = 255;
			}
		}
		if (!palette) palette = quantize(cell, 256);
		const index = applyPalette(cell, palette);
		gif.writeFrame(index, 64, 64, {
			palette,
			delay: Math.round(125)
		});
	}
	gif.finish();
	return gif.bytes();
}
async function exportPng(character, kind = "master") {
	const bundle = getSheet(character.id);
	const pix = kind === "icon" ? bundle.icon32 : bundle.master;
	downloadBlob(await pixToPngBlob(pix), `${character.id}-${kind === "icon" ? "icon32" : "sheet"}.png`);
}
async function exportJpg(character) {
	const bundle = getSheet(character.id);
	downloadBlob(await pixToJpgBlob(bundle.master), `${character.id}-sheet.jpg`);
}
function exportSvg(character) {
	const bundle = getSheet(character.id);
	const svg = pixToSvg(bundle.icon32);
	downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${character.id}-idle_32.svg`);
}
function exportAtlasJson(character) {
	const atlas = buildAtlas(character);
	const json = JSON.stringify(atlas, null, 2);
	downloadBlob(new Blob([json], { type: "application/json" }), "atlas.json");
}
async function exportEnginePack(character, engine) {
	const files = await buildPackFiles(character, engine);
	const zipped = zipSync(files, { level: 6 });
	const name = engine === "generico" ? `${character.id}-generic.zip` : `${character.id}-${engine}-pack.zip`;
	downloadBlob(new Blob([zipped], { type: "application/zip" }), name);
}
async function exportBatchZip(character) {
	const files = await buildPackFiles(character, "godot");
	const extra = await buildPackFiles(character, "phaser");
	const merged = { ...files };
	for (const [k, v] of Object.entries(extra)) if (!(k in merged)) merged[k] = v;
	const pixi = await buildPackFiles(character, "pixi");
	for (const [k, v] of Object.entries(pixi)) if (!(k in merged)) merged[k] = v;
	const unity = await buildPackFiles(character, "unity");
	for (const [k, v] of Object.entries(unity)) if (!(k in merged)) merged[k] = v;
	const zipped = zipSync(merged, { level: 6 });
	downloadBlob(new Blob([zipped], { type: "application/zip" }), `${character.id}-gamepack.zip`);
}
async function buildPackFiles(character, engine) {
	const bundle = getSheet(character.id);
	const atlas = buildAtlas(character);
	const root = `${character.id}/`;
	const files = {};
	files[root + "atlas.json"] = strToU8(JSON.stringify(atlas, null, 2));
	files[root + "sheet.png"] = await blobToU8(await pixToPngBlob(bundle.master));
	files[root + "icons/idle_32.png"] = await blobToU8(await pixToPngBlob(bundle.icon32));
	files[root + "icons/idle_32.svg"] = strToU8(pixToSvg(bundle.icon32));
	files[root + "preview.gif"] = await buildGif(bundle);
	for (const action of ACTIONS) files[root + `engines/_shared/${action}.png`] = await blobToU8(await pixToPngBlob(bundle.perAction[action]));
	if (engine === "godot" || engine === "generico") {
		files[root + "engines/godot/spriteforge_importer.gd"] = strToU8(GODOT_IMPORTER);
		files[root + "engines/godot/spriteframes.json"] = strToU8(JSON.stringify(buildSpriteFramesJson(atlas), null, 2));
		files[root + "engines/godot/templar.tscn.example"] = strToU8(GODOT_TSCN_EXAMPLE);
		files[root + "engines/godot/README.md"] = strToU8(GODOT_README);
	}
	if (engine === "phaser" || engine === "generico") {
		files[root + "engines/phaser/templar-atlas.json"] = strToU8(JSON.stringify(buildPhaserAtlas(atlas), null, 2));
		files[root + "engines/phaser/example-scene.ts"] = strToU8(buildPhaserExample(character));
	}
	if (engine === "pixi" || engine === "generico") files[root + "engines/pixi/templar-pixi.json"] = strToU8(JSON.stringify(buildPixiJson(atlas, "walk"), null, 2));
	if (engine === "unity" || engine === "generico") {
		files[root + "engines/unity/slice.json"] = strToU8(JSON.stringify(buildUnitySlice(atlas), null, 2));
		files[root + "engines/unity/SpriteForgeImporter.cs.txt"] = strToU8(UNITY_IMPORTER);
		files[root + "engines/unity/AnimationImport.md"] = strToU8(UNITY_IMPORT_MD);
	}
	return files;
}
//#endregion
export { exportAtlasJson, exportBatchZip, exportEnginePack, exportJpg, exportPng, exportSvg };
