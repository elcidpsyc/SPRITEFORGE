#!/usr/bin/env python3
"""Templar v3 — visual rollback to v1, recut walk vs slash, no requantize, no glow.

Source of pixels: v1 walk.png (512x256, 4x8 of 64). Already the approved look
(luminance ~93, muted gold, dirty cream cape, dark red-brown tunic).

Do NOT: k-means, chroma-max from JPEG, slash-yellow pins, white flash, gold dust.

v1 walk rows (visual):
  row 0 = DOWN walk, all 8 clean
  row 1 = UP mixed (back)
  row 2 = LEFT mixed  (v1 stored left in the 'right' slot)
  row 3 = RIGHT mixed (v1 stored right in the 'left' slot)
"""
from __future__ import annotations

import json
import shutil
from pathlib import Path

import numpy as np
from PIL import Image

CELL = 64
V1_WALK = Path("/workspace/public/packs/templar/walk.png")
V1_ATLAS = Path("/workspace/public/packs/templar/atlas.json")
OUT = Path("/workspace/spriteforge-art/templar-v3")
PACK = Path("/workspace/public/packs/templar-v3")
ART = Path("/home/workdir/artifacts/spriteforge-art/templar-v3")

DIRS = ["down", "up", "right", "left"]
ACTIONS = ["walk", "run", "attack", "guard", "dash", "hurt", "death"]
ACTION_FRAMES = {
    "walk": 8, "run": 8, "attack": 8, "guard": 6, "dash": 6, "hurt": 6, "death": 8,
}

# Indices into v1 walk.png. Row 2 = LEFT, row 3 = RIGHT (swap vs contract).
WALK = {
    "down":  [(0, 0), (0, 1), (0, 2), (0, 3), (0, 4), (0, 5), (0, 6), (0, 7)],
    "up":    [(1, 0), (1, 1), (1, 2), (1, 1), (1, 0), (1, 7), (1, 2), (1, 1)],
    "right": [(3, 0), (3, 1), (3, 2), (3, 1), (3, 0), (3, 1), (3, 2), (3, 0)],
    "left":  [(2, 0), (2, 1), (2, 2), (2, 1), (2, 0), (2, 1), (2, 2), (2, 0)],
}
ATTACK = {
    "up":    [(1, 1), (1, 3), (1, 4), (1, 5), (1, 5), (1, 6), (1, 7), (1, 1)],
    "right": [(3, 0), (3, 3), (3, 4), (3, 5), (3, 5), (3, 3), (3, 1), (3, 0)],
    "left":  [(2, 0), (2, 3), (2, 4), (2, 5), (2, 5), (2, 3), (2, 1), (2, 0)],
}

# Look-target luminance from v1 idle. Brighter than this * 1.15 → discard.
LOOK_LUM = 93.24


def save_png(arr: np.ndarray, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(arr.astype(np.uint8)).save(path)


def nearest_scale(img: np.ndarray, s: int) -> np.ndarray:
    return np.repeat(np.repeat(img, s, axis=0), s, axis=1)


def blit(dst: np.ndarray, src: np.ndarray, x: int, y: int) -> None:
    h, w = src.shape[:2]
    dst[y : y + h, x : x + w] = src


def cell_at(sheet: np.ndarray, r: int, c: int) -> np.ndarray:
    return sheet[r * CELL : (r + 1) * CELL, c * CELL : (c + 1) * CELL].copy()


def lum(img: np.ndarray) -> float:
    a = img[..., 3] >= 160
    if not a.any():
        return 0.0
    rgb = img[..., :3][a].astype(np.float32)
    return float((0.2126 * rgb[:, 0] + 0.7152 * rgb[:, 1] + 0.0722 * rgb[:, 2]).mean())


def bloom_pixels(img: np.ndarray) -> int:
    """v2 slash-yellow (240,214,72 / 252,236,160). Cape cream (217,212,206) is NOT bloom."""
    a = img[..., 3] >= 160
    rgb = img[..., :3].astype(np.int16)
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    return int(
        (
            a
            & (rgb[..., 0] > 220)
            & (rgb[..., 1] > 170)
            & (chroma > 50)
            & (rgb[..., 0] > rgb[..., 2] + 40)
        ).sum()
    )


def unique_opaque(img: np.ndarray) -> int:
    a = img[..., 3] >= 160
    if not a.any():
        return 0
    return len({tuple(p) for p in img[a][:, :3]})


def sheet_from_frames(rows: list[list[np.ndarray]]) -> np.ndarray:
    sheet = np.zeros((4 * CELL, 8 * CELL, 4), dtype=np.uint8)
    for r, row in enumerate(rows):
        for c, fr in enumerate(row):
            blit(sheet, fr, c * CELL, r * CELL)
    return sheet


def shift_body(cell: np.ndarray, dx: int, dy: int = 0) -> np.ndarray:
    """Move opaque body; leave baked shadow (alpha < 160) in place."""
    out = np.zeros_like(cell)
    shadow = (cell[..., 3] > 0) & (cell[..., 3] < 160)
    out[shadow] = cell[shadow]
    body = cell[..., 3] >= 160
    ys, xs = np.where(body)
    for y, x in zip(ys, xs):
        nx, ny = x + dx, y + dy
        if 0 <= nx < 64 and 0 <= ny < 64:
            out[ny, nx] = cell[y, x]
    return out


def sword_mask_down(cell: np.ndarray) -> np.ndarray:
    """Steel/gold on the RIGHT of a down-facing body, below the helm."""
    rgb = cell[..., :3].astype(np.int16)
    a = cell[..., 3] >= 160
    steel = a & (np.abs(rgb[..., 0] - rgb[..., 1]) < 30) & (rgb[..., 1] > 80) & (rgb[..., 0] < 190)
    gold = a & (rgb[..., 0] > 140) & (rgb[..., 1] > 90) & (rgb[..., 0] > rgb[..., 2] + 20)
    xx = np.arange(64)[None, :]
    yy = np.arange(64)[:, None]
    return (steel | gold) & (xx >= 44) & (yy >= 26) & (yy <= 54)


def shift_mask(cell: np.ndarray, mask: np.ndarray, dx: int, dy: int) -> np.ndarray:
    out = cell.copy()
    ys, xs = np.where(mask)
    if not len(ys):
        return out
    pix = [out[y, x].copy() for y, x in zip(ys, xs)]
    for y, x in zip(ys, xs):
        out[y, x] = (0, 0, 0, 0)
    for (y, x), p in zip(zip(ys, xs), pix):
        ny, nx = y + dy, x + dx
        if 0 <= ny < 64 and 0 <= nx < 64:
            out[ny, nx] = p
    return out


def paint_attack_down(idle: np.ndarray, stride: np.ndarray) -> list[np.ndarray]:
    """Same v1 idle puppet. Sword shift only — no VFX stamp, no new yellow."""
    m_idle = sword_mask_down(idle)
    m_str = sword_mask_down(stride)
    raise_f = shift_mask(idle, m_idle, dx=0, dy=-6)
    hit = shift_mask(stride, m_str, dx=3, dy=1)
    follow = shift_mask(stride, m_str, dx=1, dy=3)
    return [idle, stride, raise_f, hit, hit, follow, stride, idle]


def collapse(cell: np.ndarray, t: float) -> np.ndarray:
    """Death: squash idle pixels toward the feet. Same colors, no gold dust."""
    out = np.zeros_like(cell)
    shadow = (cell[..., 3] > 0) & (cell[..., 3] < 160)
    out[shadow] = cell[shadow]
    if t <= 0:
        return cell.copy()
    a = cell[..., 3] >= 160
    ys, xs = np.where(a)
    if not len(ys):
        return cell.copy()
    cx, cy = 32.0, 40.0
    sx, sy, sink = 1.0 + 0.28 * t, 1.0 - 0.50 * t, int(7 * t)
    for y, x in zip(ys, xs):
        nx = int(cx + (x - cx) * sx)
        ny = int(cy + (y - cy) * sy) + sink
        if 0 <= nx < 64 and 0 <= ny < 64:
            out[ny, nx] = cell[y, x]
    return out


def qc_row(name: str, row: list[np.ndarray], idle_lum: float) -> None:
    for i, fr in enumerate(row):
        a = fr[..., 3] >= 160
        if not a.any():
            print(f"  {name} f{i} EMPTY")
            continue
        ys, xs = np.where(a)
        L = lum(fr)
        b = bloom_pixels(fr)
        flag = ""
        if L > idle_lum * 1.15:
            flag += " BRIGHT"
        if b:
            flag += f" BLOOM{b}"
        print(
            f"  {name} f{i} foot={int(ys.max())} helm={int(ys.min())} "
            f"L={L:.1f} bloom={b} ncol={unique_opaque(fr)}{flag}"
        )


def gate_replace(fr: np.ndarray, fallback: np.ndarray, idle_lum: float) -> np.ndarray:
    if lum(fr) > idle_lum * 1.15 or bloom_pixels(fr) > 0:
        return fallback.copy()
    return fr


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    PACK.mkdir(parents=True, exist_ok=True)
    src = np.array(Image.open(V1_WALK).convert("RGBA"))
    idle0 = cell_at(src, 0, 0)
    idle_lum = lum(idle0)
    print("v1 idle lum", round(idle_lum, 2), "unique", unique_opaque(idle0), "bloom", bloom_pixels(idle0))

    cache: dict[tuple[int, int], np.ndarray] = {}

    def get(rc: tuple[int, int]) -> np.ndarray:
        if rc not in cache:
            cache[rc] = cell_at(src, rc[0], rc[1])
            save_png(cache[rc], OUT / "frames" / f"r{rc[0]}c{rc[1]}.png")
        return cache[rc].copy()

    walk_rows: list[list[np.ndarray]] = []
    for d in DIRS:
        row = [gate_replace(get(rc), get(WALK[d][0]), idle_lum) for rc in WALK[d]]
        walk_rows.append(row)
        qc_row(f"walk_{d}", row, idle_lum)
        for i, fr in enumerate(row):
            save_png(fr, OUT / "frames" / f"walk_{d}_{i:02d}.png")

    attack_rows: list[list[np.ndarray]] = [[] for _ in DIRS]
    for d in ("up", "right", "left"):
        fb = get(WALK[d][0])
        row = [gate_replace(get(rc), fb, idle_lum) for rc in ATTACK[d]]
        attack_rows[DIRS.index(d)] = row
        qc_row(f"attack_{d}", row, idle_lum)

    down_atk = paint_attack_down(get((0, 0)), get((0, 3)))
    down_atk = [gate_replace(fr, idle0, idle_lum) for fr in down_atk]
    attack_rows[0] = down_atk
    qc_row("attack_down", down_atk, idle_lum)

    run_rows = []
    for di, d in enumerate(DIRS):
        lean_dx = 1 if d == "right" else (-1 if d == "left" else 0)
        row = [shift_body(fr, lean_dx) if lean_dx else fr.copy() for fr in walk_rows[di]]
        run_rows.append(row)
        qc_row(f"run_{d}", row, idle_lum)

    def derived(kind: str) -> list[list[np.ndarray]]:
        rows = []
        for di, d in enumerate(DIRS):
            idle = walk_rows[di][0]
            w = walk_rows[di]
            row = []
            n = ACTION_FRAMES[kind]
            for f in range(8):
                if f >= n:
                    row.append(np.zeros((64, 64, 4), np.uint8))
                    continue
                if kind == "guard":
                    row.append(idle.copy())
                elif kind == "dash":
                    seq = [0, 2, 4, 5, 6, 0]
                    srcf = w[seq[f]]
                    dx = 2 if d == "right" else (-2 if d == "left" else 0)
                    row.append(shift_body(srcf, dx) if dx else srcf.copy())
                elif kind == "hurt":
                    # Knockback only. No flash. No new colors.
                    knock = [0, 2, 3, 2, 1, 0][f]
                    sign = -1 if d == "right" else (1 if d == "left" else 0)
                    row.append(shift_body(idle, sign * knock) if knock else idle.copy())
                elif kind == "death":
                    row.append(collapse(idle, f / 7.0))
                else:
                    row.append(idle.copy())
            rows.append(row)
        return rows

    bank = {
        "walk": walk_rows,
        "run": run_rows,
        "attack": attack_rows,
        "guard": derived("guard"),
        "dash": derived("dash"),
        "hurt": derived("hurt"),
        "death": derived("death"),
    }

    per = {}
    for act in ACTIONS:
        sh = sheet_from_frames(bank[act])
        per[act] = sh
        save_png(sh, OUT / f"{act}.png")
        save_png(sh, PACK / f"{act}.png")
        prev = np.zeros((256 * 2, 512 * 2, 4), np.uint8)
        for r, row in enumerate(bank[act]):
            for c, fr in enumerate(row):
                blit(prev, nearest_scale(fr, 2), c * 128, r * 128)
        save_png(prev, OUT / "preview" / f"{act}_2x.png")

    master = np.zeros((7 * 256, 512, 4), dtype=np.uint8)
    for i, act in enumerate(ACTIONS):
        blit(master, per[act], 0, i * 256)
    save_png(master, OUT / "sheet.png")
    save_png(master, PACK / "sheet.png")

    idle = walk_rows[0][0]
    save_png(idle, PACK / "thumbs" / "idle_down.png")
    save_png(idle, OUT / "frames" / "idle_down.png")
    save_png(nearest_scale(idle, 4), OUT / "preview" / "idle_down_4x.png")
    save_png(idle[8:40, 16:48], PACK / "icons" / "idle_32.png")

    # palette strip from actual idle pixels (documentation only — not applied)
    cols = []
    seen = set()
    a = idle[..., 3] >= 160
    for p in idle[a][:, :3]:
        t = tuple(int(x) for x in p)
        if t not in seen:
            seen.add(t)
            cols.append(t)
    pal = np.zeros((10, 10 * max(1, len(cols)), 3), np.uint8)
    for i, c in enumerate(cols):
        pal[:, i * 10 : (i + 1) * 10] = c
    save_png(np.dstack([pal, np.full(pal.shape[:2], 255, np.uint8)]), OUT / "preview" / "palette.png")

    for name, row in (("walk", walk_rows[0]), ("attack", attack_rows[0])):
        strip = np.zeros((64 * 4, 64 * 8 * 4, 4), np.uint8)
        for c, fr in enumerate(row):
            blit(strip, nearest_scale(fr, 4), c * 256, 0)
        save_png(strip, OUT / "preview" / f"{name}_4x.png")
    hit = nearest_scale(attack_rows[0][3], 4)
    save_png(hit, OUT / "preview" / "attack_hit_4x.png")

    dirs = np.zeros((64 * 4, 64 * 4 * 4, 4), np.uint8)
    for i, row in enumerate(walk_rows):
        blit(dirs, nearest_scale(row[0], 4), i * 256, 0)
    save_png(dirs, OUT / "preview" / "dirs_idle_4x.png")

    w4 = np.zeros((256 * 4, 512 * 4, 4), np.uint8)
    for r, row in enumerate(walk_rows):
        for c, fr in enumerate(row):
            blit(w4, nearest_scale(fr, 4), c * 256, r * 256)
    save_png(w4, OUT / "preview" / "walk_sheet_4x.png")

    atlas = json.loads(V1_ATLAS.read_text())
    (PACK / "atlas.json").write_text(json.dumps(atlas, indent=2, ensure_ascii=False) + "\n")
    (OUT / "atlas.json").write_text(json.dumps(atlas, indent=2, ensure_ascii=False) + "\n")

    (OUT / "CLASSIFY.md").write_text(
        """# Templar v3

Pixels: v1 walk.png (look alvo). Sem requantizar, sem glow.

Walk: só células sem arco. Attack up/right/left: slashes já no v1.
Attack down: mesmo idle, espada deslocada, zero VFX.
Hurt: knockback, sem flash. Death: collapse do idle, sem poeira dourada.
Left = row 2 nativa do v1 (escudo na frente). Right = row 3.
"""
    )

    # copy to artifacts + compare idle vs look
    if ART.parent.exists():
        if ART.exists():
            shutil.rmtree(ART)
        shutil.copytree(OUT, ART, dirs_exist_ok=True)

    left = walk_rows[3][0]
    right = walk_rows[2][0]
    flipped = right[:, ::-1]
    lb = left[..., 3] >= 160
    eq = int(np.all(left == flipped, axis=2)[lb].sum()) if lb.any() else 0
    print(f"left vs flip(right) equal {eq}/{int(lb.sum())} ({100*eq/max(1,int(lb.sum())):.1f}%)")
    print("master unique", unique_opaque(master), "idle L", round(lum(idle), 2),
          "idle bloom", bloom_pixels(idle), "hit L", round(lum(attack_rows[0][3]), 2),
          "hit bloom", bloom_pixels(attack_rows[0][3]))
    print("LOOK", LOOK_LUM, "idle vs look", round(lum(idle) - LOOK_LUM, 2))
    print("done", OUT, PACK)


if __name__ == "__main__":
    main()
