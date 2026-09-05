@tool
extends EditorScript
## SPRITEFORGE — Godot 4.x importer
## Place this pack at res://sprites/spriteforge/<id>/ then run:
##   File → Run (this script)
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
