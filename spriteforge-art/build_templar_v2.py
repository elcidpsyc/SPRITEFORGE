#!/usr/bin/env python3
"""Templar v2 — recut 472 as mixed walk/slash, same puppet, ≤24 colors.

Source: /tmp/sf-extract/all32_transparent.png  (1440×720 = 8×4 of 180)

PIXEL classification (32 cells). Owner brief labeled row1 as front-slash and
row3 as back; the cells themselves disagree, so facing follows the silhouette:

  Row 0 DOWN  — chest cross + visor. All 8 = walk/idle. No sword arc.
  Row 1 UP    — full cape, back of helm. Walk: c0,c1,c2,c7. Slash: c3,c4,c5 HIT,c6.
  Row 2 RIGHT — profile, cape left, sword right. Walk: c0,c1,c2. Slash: c3,c4,c5 HIT.
                c6,c7 leak 3/4-front — unused for right.
  Row 3 LEFT  — native left (shield leading, cape right). NOT a flip of right.
                Walk: c0,c1,c2,c7. Slash: c3,c4,c5 HIT,c6.

Attack down has no native slash in row 0: painted on the idle-down puppet
(sword + gold arc on the RIGHT). Never stamp a side/back VFX over the torso.
"""
from __future__ import annotations

import json
import shutil
from pathlib import Path

import numpy as np
from PIL import Image

CELL_SRC = 180
CELL = 64
PIVOT = (32, 56)
SRC = Path("/tmp/sf-extract/all32_transparent.png")
OUT = Path("/workspace/spriteforge-art/templar-v2")
PACK = Path("/workspace/public/packs/templar-v2")
HOME = Path("/home/workdir/artifacts/spriteforge-art/templar-v2")
V1_ATLAS = Path("/workspace/public/packs/templar/atlas.json")

DIRS = ["down", "up", "right", "left"]
ACTIONS = ["walk", "run", "attack", "guard", "dash", "hurt", "death"]
ACTION_FRAMES = {
    "walk": 8, "run": 8, "attack": 8, "guard": 6, "dash": 6, "hurt": 6, "death": 8,
}

# Only no-arc cells in walk. Ping-pong fillers listed as repeats.
WALK = {
    "down":  [(0, 0), (0, 1), (0, 2), (0, 3), (0, 4), (0, 5), (0, 6), (0, 7)],
    "up":    [(1, 0), (1, 1), (1, 2), (1, 1), (1, 0), (1, 7), (1, 2), (1, 1)],
    "right": [(2, 0), (2, 1), (2, 2), (2, 1), (2, 0), (2, 2), (2, 1), (2, 0)],
    "left":  [(3, 1), (3, 2), (3, 0), (3, 2), (3, 1), (3, 7), (3, 0), (3, 2)],
}
# hit at index 3. First/last = idle (no arc).
ATTACK = {
    "up":    [(1, 0), (1, 3), (1, 4), (1, 5), (1, 5), (1, 6), (1, 7), (1, 0)],
    "right": [(2, 0), (2, 3), (2, 4), (2, 5), (2, 5), (2, 3), (2, 1), (2, 0)],
    "left":  [(3, 1), (3, 3), (3, 4), (3, 5), (3, 5), (3, 6), (3, 7), (3, 1)],
}

# Pinned palette anchors (not moved by k-means).
PINNED = np.array(
    [
        [17, 13, 11],      # outline
        [196, 36, 42],     # tunic
        [154, 22, 28],     # tunic dark
        [201, 162, 39],    # gold cross / trim
        [240, 214, 72],    # slash yellow
        [252, 236, 160],   # slash highlight
        [211, 210, 202],   # cape
        [49, 31, 20],      # boot
    ],
    dtype=np.float64,
)

SEED_REST = np.array(
    [
        [29, 26, 24],
        [179, 182, 179],
        [140, 150, 150],
        [117, 121, 118],
        [61, 61, 59],
        [138, 120, 92],
        [197, 178, 144],
        [162, 144, 119],
        [70, 32, 29],
        [84, 73, 58],
        [7, 4, 2],
        [46, 42, 39],
        [111, 97, 78],
        [89, 86, 78],
        [32, 17, 4],
        [69, 53, 36],
    ],
    dtype=np.float64,
)

OUTLINE = (17, 13, 11)
BOOT = (49, 31, 20)
BOOT_HI = (84, 73, 58)
TUNIC = (154, 22, 28)
TUNIC_HI = (196, 36, 42)
STEEL = (140, 150, 150)
STEEL_HI = (179, 182, 179)
GOLD = (201, 162, 39)
SLASH = (240, 214, 72)
SLASH_HI = (252, 236, 160)
CAPE = (211, 210, 202)


def save_png(arr: np.ndarray, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(arr.astype(np.uint8)).save(path)


def nearest_scale(img: np.ndarray, s: int) -> np.ndarray:
    return np.repeat(np.repeat(img, s, axis=0), s, axis=1)


def blit(dst: np.ndarray, src: np.ndarray, x: int, y: int) -> None:
    h, w = src.shape[:2]
    dst[y : y + h, x : x + w] = src


def kmeans_palette(pixels: np.ndarray, k: int, pinned: np.ndarray, rest: np.ndarray, iters: int = 12) -> np.ndarray:
    rng = np.random.default_rng(3)
    k = min(k, max(len(pinned) + 2, min(24, len(pixels))))
    centers = np.zeros((k, 3), dtype=np.float64)
    npin = min(len(pinned), k)
    centers[:npin] = pinned[:npin]
    nrest = min(len(rest), k - npin)
    centers[npin : npin + nrest] = rest[:nrest]
    filled = npin + nrest
    if filled < k:
        centers[filled:] = pixels[rng.choice(len(pixels), k - filled, replace=False)]
    pix = pixels.astype(np.float64)
    for _ in range(iters):
        d = ((pix[:, None, :] - centers[None, :, :]) ** 2).sum(axis=2)
        labels = d.argmin(axis=1)
        for i in range(npin, k):
            m = labels == i
            if m.any():
                centers[i] = pix[m].mean(axis=0)
    return np.clip(centers, 0, 255).astype(np.uint8)


def apply_palette(rgba: np.ndarray, palette: np.ndarray) -> np.ndarray:
    out = rgba.copy()
    a = out[..., 3] >= 160
    if not a.any():
        return out
    pix = out[..., :3][a].astype(np.int16)
    pal = palette.astype(np.int16)
    d = ((pix[:, None, :] - pal[None, :, :]) ** 2).sum(axis=2)
    out[..., :3][a] = palette[d.argmin(axis=1)]
    return out


def punch_bg(rgba: np.ndarray) -> np.ndarray:
    """Drop leftover white, JPEG gray halo oval under the feet, specks."""
    out = rgba.copy()
    rgb = out[..., :3].astype(np.int16)
    a = out[..., 3] > 0
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    mean = rgb.mean(axis=2)
    chroma = mx - mn
    white = a & (mn >= 200) & (chroma <= 28)
    out[white, 3] = 0
    a = out[..., 3] > 0
    if not a.any():
        return out
    ys = np.where(a)[0]
    bot = int(ys.max())
    halo = (
        a
        & (chroma <= 22)
        & (mean >= 55)
        & (mean <= 185)
        & (np.arange(out.shape[0])[:, None] >= bot - 34)
        & (rgb[..., 0] < 160)
    )
    # don't punch saturated red tunic / gold
    keep = (rgb[..., 0] > rgb[..., 1] + 25) | (rgb[..., 0] > rgb[..., 2] + 30)
    out[halo & ~keep, 3] = 0
    a = out[..., 3] > 0
    mx, mn = out[..., :3].max(axis=2), out[..., :3].min(axis=2)
    out[(out[..., 3] > 0) & (mn >= 205) & ((mx - mn) <= 26), 3] = 0
    # drop tiny specks
    a = out[..., 3] > 0
    seen = np.zeros(a.shape, dtype=bool)
    h, w = a.shape
    for y in range(h):
        for x in range(w):
            if not a[y, x] or seen[y, x]:
                continue
            stack = [(y, x)]
            comp = []
            seen[y, x] = True
            while stack:
                cy, cx = stack.pop()
                comp.append((cy, cx))
                for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < h and 0 <= nx < w and a[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
            if len(comp) < 10:
                for cy, cx in comp:
                    out[cy, cx, 3] = 0
    return out


def chroma_down3(rgba: np.ndarray) -> np.ndarray:
    """180→60. Keep the most chromatic opaque pixel (gold cross, tunic, sword)
    unless it's a cyan/green JPEG fringe — then pick darkest (outline/boot)."""
    assert rgba.shape[0] == 180 and rgba.shape[1] == 180
    out = np.zeros((60, 60, 4), dtype=np.uint8)
    for y in range(60):
        for x in range(60):
            block = rgba[y * 3 : y * 3 + 3, x * 3 : x * 3 + 3]
            a = block[..., 3] >= 128
            if not np.any(a):
                continue
            pix = block[a]
            rgb = pix[:, :3].astype(np.int16)
            chroma = rgb.max(axis=1) - rgb.min(axis=1)
            order = np.argsort(-chroma)
            picked = None
            for i in order:
                if chroma[i] < 8:
                    break
                r, g, b = int(rgb[i, 0]), int(rgb[i, 1]), int(rgb[i, 2])
                # cyan / green / blue fringe — skip
                if (g > r + 18 and b > r + 8) or (b > r + 28 and b > g + 8):
                    continue
                picked = pix[i]
                break
            if picked is None:
                lum = rgb.mean(axis=1)
                picked = pix[int(lum.argmin())]
            out[y, x] = picked
            out[y, x, 3] = 255
    return out


def punch_feet_halo60(small: np.ndarray) -> np.ndarray:
    """After downsample, kill leftover gray under the boots."""
    out = small.copy()
    a = out[..., 3] >= 160
    if not a.any():
        return out
    rgb = out[..., :3].astype(np.int16)
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    mean = rgb.mean(axis=2)
    ys = np.where(a)[0]
    bot = int(ys.max())
    halo = (
        a
        & (np.arange(60)[:, None] >= bot - 8)
        & (chroma <= 18)
        & (mean >= 60)
        & (mean <= 170)
        & (rgb[..., 0] < rgb[..., 1] + 20)
    )
    out[halo, 3] = 0
    return out


def drop_specks(rgba: np.ndarray, min_size: int = 3) -> np.ndarray:
    a = rgba[..., 3] >= 160
    seen = np.zeros(a.shape, dtype=bool)
    h, w = a.shape
    out = rgba.copy()
    for y in range(h):
        for x in range(w):
            if not a[y, x] or seen[y, x]:
                continue
            stack = [(y, x)]
            comp = []
            seen[y, x] = True
            while stack:
                cy, cx = stack.pop()
                comp.append((cy, cx))
                for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < h and 0 <= nx < w and a[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
            if len(comp) < min_size:
                for cy, cx in comp:
                    out[cy, cx, 3] = 0
    return out


def outline_body(rgba: np.ndarray, color=OUTLINE) -> np.ndarray:
    a = rgba[..., 3] >= 160
    h, w = a.shape
    out = rgba.copy()
    for y in range(h):
        for x in range(w):
            if a[y, x] or out[y, x, 3] > 0:
                continue
            if (
                (x and a[y, x - 1])
                or (x + 1 < w and a[y, x + 1])
                or (y and a[y - 1, x])
                or (y + 1 < h and a[y + 1, x])
            ):
                out[y, x] = (color[0], color[1], color[2], 255)
    return out


def draw_shadow(dest: np.ndarray, cx=32, cy=57) -> None:
    for y in range(-3, 4):
        for x in range(-10, 11):
            n = (x * x) / 100.0 + (y * y) / 9.0
            if n > 1:
                continue
            px, py = cx + x, cy + y
            if not (0 <= px < 64 and 0 <= py < 64):
                continue
            if dest[py, px, 3] >= 160:
                continue
            alpha = 96 if n < 0.45 else 64
            dest[py, px] = (16, 12, 10, alpha)


def place60(src60: np.ndarray, foot_y: int = 55) -> np.ndarray:
    dest = np.zeros((64, 64, 4), dtype=np.uint8)
    a = src60[..., 3] >= 160
    if not a.any():
        return dest
    ys, xs = np.where(a)
    fy = int(ys.max())
    fx = int(np.round(xs[ys >= fy - 1].mean()))
    dx, dy = PIVOT[0] - fx, foot_y - fy
    for y in range(60):
        for x in range(60):
            if src60[y, x, 3] < 160:
                continue
            tx, ty = x + dx, y + dy
            if 0 <= tx < 64 and 0 <= ty < 64:
                dest[ty, tx] = src60[y, x]
                dest[ty, tx, 3] = 255
    return dest


def suggest_boots(cell: np.ndarray, facing: str, phase: int) -> np.ndarray:
    """Don't redraw legs. Darken the existing foot sack and split a 1px crotch
    so two boots read at 4x. Contact on frames 1 and 5 (both planted)."""
    out = cell.copy()
    a = out[..., 3] >= 160
    if not a.any():
        return out
    ys, xs = np.where(a)
    fy = int(ys.max())
    foot_xs = xs[ys >= fy - 1]
    if not len(foot_xs):
        return out
    cx = int(np.round(foot_xs.mean()))
    # 1px crotch at the very bottom, skip contact emphasis by leaving it
    for y in range(fy - 1, fy + 1):
        if 0 <= cx < 64 and out[y, cx, 3] >= 160:
            rgb = out[y, cx, :3].astype(np.int16)
            chroma = int(rgb.max() - rgb.min())
            if chroma < 40:  # don't punch gold / cape
                out[y, cx] = (0, 0, 0, 0)
    # darken lowest 4px of the central mass toward boot brown
    lift_l = 1 if phase in (2, 6) else 0
    lift_r = 1 if phase in (3, 7) else 0
    boot = np.array(BOOT, dtype=np.float64)
    boot_hi = np.array(BOOT_HI, dtype=np.float64)
    for y in range(max(0, fy - 3), fy + 1):
        for x in range(max(0, cx - 6), min(64, cx + 7)):
            if out[y, x, 3] < 160:
                continue
            rgb = out[y, x, :3].astype(np.int16)
            if int(rgb[0] - rgb[2]) > 40:  # gold / red tunic — leave
                continue
            if int(rgb.max() - rgb.min()) < 18 and int(rgb.mean()) > 160:
                continue  # cape white
            tgt = boot_hi if y <= fy - 3 else boot
            blend = 0.55 if y >= fy - 1 else 0.35
            out[y, x, :3] = np.clip(rgb.astype(np.float64) * (1 - blend) + tgt * blend, 0, 255).astype(np.uint8)
    # plant: extra dark pixel on contact frames
    if phase in (1, 5):
        for dx in (-3, 3):
            x = cx + dx
            if 0 <= x < 64 and out[fy, x, 3] >= 160:
                out[fy, x, :3] = BOOT
    elif lift_l:
        x = cx - 3
        if 0 <= x < 64 and 0 <= fy - 1 < 64 and out[fy, x, 3] >= 160:
            out[fy - 1, x] = out[fy, x]
            out[fy, x] = (0, 0, 0, 0)
    elif lift_r:
        x = cx + 3
        if 0 <= x < 64 and 0 <= fy - 1 < 64 and out[fy, x, 3] >= 160:
            out[fy - 1, x] = out[fy, x]
            out[fy, x] = (0, 0, 0, 0)
    return out


def sword_mask_down(cell: np.ndarray) -> np.ndarray:
    """Steel/gold on the RIGHT of a down-facing body, below the helm."""
    rgb = cell[..., :3].astype(np.int16)
    a = cell[..., 3] >= 160
    steel = (
        a
        & (np.abs(rgb[..., 0] - rgb[..., 1]) < 35)
        & (rgb[..., 1] > 85)
        & (rgb[..., 0] < 215)
        & (rgb[..., 2] > 70)
    )
    gold = a & (rgb[..., 0] > 150) & (rgb[..., 1] > 100) & (rgb[..., 0] > rgb[..., 2] + 18)
    xs = np.arange(64)[None, :]
    ys = np.arange(64)[:, None]
    return (steel | gold) & (xs >= 44) & (ys >= 26)


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


def extract_slash_vfx(hit180: np.ndarray) -> np.ndarray:
    rgb = hit180[..., :3].astype(np.int16)
    a = hit180[..., 3] > 16
    yellow = (
        a
        & (rgb[..., 0] > 170)
        & (rgb[..., 1] > 130)
        & (rgb[..., 0] > rgb[..., 2] + 20)
        & (rgb[..., 1] > rgb[..., 2] + 8)
    )
    vfx = np.zeros_like(hit180)
    vfx[yellow] = hit180[yellow]
    vfx[yellow, 3] = 255
    return chroma_down3(vfx)


def stamp_vfx_empty(body: np.ndarray, vfx60: np.ndarray, ox: int, oy: int) -> np.ndarray:
    """Stamp slash VFX only onto empty/shadow pixels. Never covers helm/torso."""
    out = body.copy()
    a = vfx60[..., 3] >= 160
    if not a.any():
        return out
    ys, xs = np.where(a)
    for y, x in zip(ys, xs):
        tx, ty = x + ox, y + oy
        if not (0 <= tx < 64 and 0 <= ty < 64):
            continue
        if ty < 18:
            continue
        if tx < 40 and ty < 42:
            continue
        if out[ty, tx, 3] >= 160:
            continue
        out[ty, tx] = vfx60[y, x]
        out[ty, tx, 3] = 255
    return out


def paint_attack_down(idle: np.ndarray, stride: np.ndarray, vfx: np.ndarray) -> list[np.ndarray]:
    """Same idle puppet. Shift the EXISTING right-hand sword; stamp 472 VFX
    only on empty pixels. Hit at index 3."""
    m_idle = sword_mask_down(idle)
    m_str = sword_mask_down(stride)
    raise_f = shift_mask(idle.copy(), m_idle, dx=-1, dy=-7)
    hit = shift_mask(stride.copy(), m_str, dx=3, dy=1)
    hit = stamp_vfx_empty(hit, vfx, ox=2, oy=0)
    hit2 = shift_mask(stride.copy(), m_str, dx=4, dy=3)
    hit2 = stamp_vfx_empty(hit2, vfx, ox=3, oy=2)
    follow = shift_mask(stride.copy(), m_str, dx=1, dy=2)
    return [
        idle.copy(),
        stride.copy(),
        raise_f,
        hit,
        hit2,
        follow,
        stride.copy(),
        idle.copy(),
    ]


def lock_pivot(cell: np.ndarray, foot_y: int = 56) -> np.ndarray:
    a = cell[..., 3] >= 160
    if not a.any():
        return cell
    ys, xs = np.where(a)
    fy = int(ys.max())
    dy = foot_y - fy
    if dy == 0:
        return cell
    out = np.zeros_like(cell)
    h, w = cell.shape[:2]
    for y in range(h):
        for x in range(w):
            if cell[y, x, 3] == 0:
                continue
            ny = y + dy
            if 0 <= ny < h:
                out[ny, x] = cell[y, x]
    return out


def finish(cell: np.ndarray, palette: np.ndarray, facing: str, phase: int) -> np.ndarray:
    body = suggest_boots(cell, facing, phase)
    body = drop_specks(body, 3)
    body = outline_body(body)
    body = apply_palette(body, palette)
    body = lock_pivot(body, 56)
    draw_shadow(body, cx=32, cy=57)
    return body


def lean(cell: np.ndarray, dx: int) -> np.ndarray:
    out = np.zeros_like(cell)
    body = cell[..., 3] >= 160
    shadow = (cell[..., 3] > 0) & (cell[..., 3] < 160)
    out[shadow] = cell[shadow]
    ys, xs = np.where(body)
    for y, x in zip(ys, xs):
        nx = x + dx
        if 0 <= nx < 64:
            out[y, nx] = cell[y, x]
    if dx != 0:
        draw_shadow(out)
    return out


def flash(cell: np.ndarray, amount: float, palette: np.ndarray) -> np.ndarray:
    out = cell.copy()
    a = out[..., 3] >= 160
    add = int(90 * amount)
    out[..., :3][a] = np.clip(out[..., :3][a].astype(np.int16) + add, 0, 255).astype(np.uint8)
    return apply_palette(out, palette)


def collapse(cell: np.ndarray, t: float, palette: np.ndarray) -> np.ndarray:
    out = np.zeros_like(cell)
    if t <= 0:
        return cell
    a = cell[..., 3] >= 160
    ys, xs = np.where(a)
    if not len(ys):
        return cell
    cx, cy = 32.0, 40.0
    sx, sy, sink = 1.0 + 0.35 * t, 1.0 - 0.55 * t, int(8 * t)
    for y, x in zip(ys, xs):
        nx = int(cx + (x - cx) * sx)
        ny = int(cy + (y - cy) * sy) + sink
        if 0 <= nx < 64 and 0 <= ny < 64:
            out[ny, nx] = cell[y, x]
    out = apply_palette(out, palette)
    out = outline_body(out)
    out = apply_palette(out, palette)
    out = lock_pivot(out, 56)
    draw_shadow(out, cy=57, cx=32)
    return out


def qc_row(name: str, row: list[np.ndarray]) -> None:
    foots, helms = [], []
    for i, fr in enumerate(row):
        a = fr[..., 3] >= 160
        if not a.any():
            print(f"  {name} f{i} EMPTY")
            continue
        ys, xs = np.where(a)
        fy, hy = int(ys.max()), int(ys.min())
        foots.append(fy)
        helms.append(hy)
        print(f"  {name} f{i} foot={fy} helm={hy} h={fy - hy + 1} fx={int(xs[ys >= fy - 1].mean())}")
    if foots:
        print(
            f"  >> foot {min(foots)}-{max(foots)} d{max(foots) - min(foots)} "
            f"helm {min(helms)}-{max(helms)} d{max(helms) - min(helms)}"
        )


def unique_opaque(img: np.ndarray) -> int:
    a = img[..., 3] >= 160
    if not a.any():
        return 0
    return len({tuple(p) for p in img[a][:, :3]})


def cell180(grid: np.ndarray, r: int, c: int) -> np.ndarray:
    return grid[r * 180 : (r + 1) * 180, c * 180 : (c + 1) * 180].copy()


def process_raw(raw: np.ndarray, palette: np.ndarray) -> np.ndarray:
    cleaned = punch_bg(raw)
    small = chroma_down3(cleaned)
    small = punch_feet_halo60(small)
    small = drop_specks(small, 2)
    # palette AFTER place+boots+outline in finish(), so gold/red survive the 3:1
    return place60(small, foot_y=55)


def sheet_from_frames(rows: list[list[np.ndarray]]) -> np.ndarray:
    sheet = np.zeros((4 * CELL, 8 * CELL, 4), dtype=np.uint8)
    for r, row in enumerate(rows):
        for c, fr in enumerate(row):
            blit(sheet, fr, c * CELL, r * CELL)
    return sheet


def write_classify(path: Path) -> None:
    path.write_text(
        """# 472 classification (32 cells)

Source is a JPEG photo of a sprite sheet, 8×4 of 180px. Facing follows the
silhouette (chest cross = down, full cape/back-of-helm = up, profile = side).
Owner brief called row1 'front slash' and row3 'back'; pixels show the opposite.

| cell | facing | kind | notes |
|------|--------|------|-------|
| r0c0 | down | WALK idle | chest cross, visor, cape L, sword R |
| r0c1 | down | WALK | |
| r0c2 | down | WALK | |
| r0c3 | down | WALK stride | |
| r0c4 | down | WALK | |
| r0c5 | down | WALK | |
| r0c6 | down | WALK | |
| r0c7 | down | WALK | |
| r1c0 | up | WALK idle | full cape, no chest cross |
| r1c1 | up | WALK | |
| r1c2 | up | WALK | |
| r1c3 | up | SLASH anticipation | sword raised |
| r1c4 | up | SLASH swing | |
| r1c5 | up | SLASH HIT | yellow arc |
| r1c6 | up | SLASH recovery | |
| r1c7 | up | WALK | |
| r2c0 | right | WALK idle | cape L, sword R |
| r2c1 | right | WALK | |
| r2c2 | right | WALK | |
| r2c3 | right | SLASH anticipation | |
| r2c4 | right | SLASH swing | |
| r2c5 | right | SLASH HIT | yellow arc on the right |
| r2c6 | (leak) | unused | 3/4-front, not profile |
| r2c7 | (leak) | unused | 3/4-front, not profile |
| r3c0 | left | WALK | native left, shield leading |
| r3c1 | left | WALK idle | |
| r3c2 | left | WALK | |
| r3c3 | left | SLASH anticipation | |
| r3c4 | left | SLASH swing | |
| r3c5 | left | SLASH HIT | yellow arc on the left |
| r3c6 | left | SLASH recovery | |
| r3c7 | left | WALK | |

Attack down has no slash in row 0 — painted on the idle-down puppet.
Left is native row 3, not a horizontal flip of right (shield stays world-left).
"""
    )


def main() -> None:
    for p in (OUT, PACK, HOME):
        p.mkdir(parents=True, exist_ok=True)
    grid = np.array(Image.open(SRC).convert("RGBA"))

    idle180 = punch_bg(cell180(grid, 0, 0))
    slash180 = punch_bg(cell180(grid, 1, 5))
    slash180b = punch_bg(cell180(grid, 2, 5))
    pix_i = idle180[..., :3][idle180[..., 3] >= 160]
    pix_s = slash180[..., :3][slash180[..., 3] >= 160]
    pix_b = slash180b[..., :3][slash180b[..., 3] >= 160]
    rng = np.random.default_rng(1)

    def samp(p, n):
        if len(p) > n:
            return p[rng.choice(len(p), n, replace=False)]
        return p

    pix = np.concatenate([samp(pix_i, 6000), samp(pix_s, 1500), samp(pix_b, 1500)], axis=0)
    palette = kmeans_palette(pix, 24, PINNED, SEED_REST, iters=12)
    save_png(
        np.repeat(np.repeat(palette.reshape(1, -1, 3), 12, 0), 12, 1),
        OUT / "preview" / "palette.png",
    )
    np.save(OUT / "palette.npy", palette)
    print("palette", len(palette), palette.tolist())

    raw_cache: dict[tuple[int, int], np.ndarray] = {}

    def raw_placed(rc: tuple[int, int]) -> np.ndarray:
        if rc not in raw_cache:
            raw_cache[rc] = process_raw(cell180(grid, rc[0], rc[1]), palette)
            save_png(raw_cache[rc], OUT / "frames" / f"r{rc[0]}c{rc[1]}_raw.png")
        return raw_cache[rc]

    def finished(rc: tuple[int, int], facing: str, phase: int) -> np.ndarray:
        return finish(raw_placed(rc).copy(), palette, facing, phase)

    # Walk
    walk_rows: list[list[np.ndarray]] = []
    for d in DIRS:
        row = [finished(rc, d, i) for i, rc in enumerate(WALK[d])]
        walk_rows.append(row)
        qc_row(f"walk_{d}", row)
        for i, fr in enumerate(row):
            save_png(fr, OUT / "frames" / f"walk_{d}_{i:02d}.png")

    # Attack up/right/left from real 472 slashes
    attack_rows: list[list[np.ndarray]] = [[] for _ in DIRS]
    for d in ("up", "right", "left"):
        row = [finished(rc, d, 0) for rc in ATTACK[d]]
        attack_rows[DIRS.index(d)] = row
        qc_row(f"attack_{d}", row)

    # Attack down: same idle puppet, painted slash
    idle_raw = raw_placed((0, 0))
    stride_raw = raw_placed((0, 3))
    vfx = extract_slash_vfx(cell180(grid, 2, 5))
    vfx2 = extract_slash_vfx(cell180(grid, 1, 5))
    a2 = vfx2[..., 3] >= 160
    vfx[a2] = vfx2[a2]
    painted = paint_attack_down(idle_raw, stride_raw, vfx)
    down_atk = [finish(fr, palette, "down", 0) for fr in painted]
    attack_rows[0] = down_atk
    qc_row("attack_down", down_atk)

    # Run from clean walk
    run_rows = []
    for di, d in enumerate(DIRS):
        w = walk_rows[di]
        lean_dx = 1 if d == "right" else (-1 if d == "left" else 0)
        row = []
        for i, fr in enumerate(w):
            cell = lean(fr, lean_dx) if lean_dx else fr.copy()
            cell = apply_palette(cell, palette)
            cell = lock_pivot(cell, 56)
            draw_shadow(cell)
            row.append(cell)
        run_rows.append(row)
        qc_row(f"run_{d}", row)

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
                    dx = -2 if d == "left" else (2 if d in ("right", "down") else 0)
                    cell = lean(idle, dx) if dx else idle.copy()
                    cell = apply_palette(cell, palette)
                    cell = lock_pivot(cell, 56)
                    draw_shadow(cell)
                    row.append(cell)
                elif kind == "dash":
                    seq = [0, 2, 4, 5, 6, 0]
                    src = w[seq[f]]
                    dx = 2 if d == "right" else (-2 if d == "left" else 0)
                    cell = lean(src, dx) if dx else src.copy()
                    cell = apply_palette(cell, palette)
                    cell = lock_pivot(cell, 56)
                    draw_shadow(cell)
                    row.append(cell)
                elif kind == "hurt":
                    knock = [0, 2, 3, 2, 1, 0][f]
                    sign = -1 if d == "right" else (1 if d == "left" else 0)
                    cell = lean(idle, sign * knock)
                    if f in (1, 2):
                        cell = flash(cell, 0.55 if f == 1 else 0.25, palette)
                    cell = lock_pivot(cell, 56)
                    draw_shadow(cell)
                    row.append(cell)
                elif kind == "death":
                    row.append(collapse(idle, f / 7.0, palette))
                else:
                    row.append(idle)
            rows.append(row)
        return rows

    guard_rows = derived("guard")
    dash_rows = derived("dash")
    hurt_rows = derived("hurt")
    death_rows = derived("death")

    bank = {
        "walk": walk_rows,
        "run": run_rows,
        "attack": attack_rows,
        "guard": guard_rows,
        "dash": dash_rows,
        "hurt": hurt_rows,
        "death": death_rows,
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

    for name, row in (("walk", walk_rows[0]), ("attack", attack_rows[0])):
        strip = np.zeros((64 * 4, 64 * 8 * 4, 4), np.uint8)
        for c, fr in enumerate(row):
            blit(strip, nearest_scale(fr, 4), c * 256, 0)
        save_png(strip, OUT / "preview" / f"{name}_4x.png")

    hit = nearest_scale(attack_rows[0][3], 4)
    save_png(hit, OUT / "preview" / "attack_hit_4x.png")

    dirs = np.zeros((64 * 4, 64 * 4 * 4, 4), np.uint8)
    for i, d in enumerate(DIRS):
        blit(dirs, nearest_scale(walk_rows[i][0], 4), i * 256, 0)
    save_png(dirs, OUT / "preview" / "dirs_idle_4x.png")

    w4 = np.zeros((256 * 4, 512 * 4, 4), np.uint8)
    for r, row in enumerate(walk_rows):
        for c, fr in enumerate(row):
            blit(w4, nearest_scale(fr, 4), c * 256, r * 256)
    save_png(w4, OUT / "preview" / "walk_sheet_4x.png")

    a4 = np.zeros((256 * 4, 512 * 4, 4), np.uint8)
    for r, row in enumerate(attack_rows):
        for c, fr in enumerate(row):
            blit(a4, nearest_scale(fr, 4), c * 256, r * 256)
    save_png(a4, OUT / "preview" / "attack_sheet_4x.png")

    atlas = json.loads(V1_ATLAS.read_text())
    atlas_txt = json.dumps(atlas, indent=2, ensure_ascii=False) + "\n"
    (PACK / "atlas.json").write_text(atlas_txt)
    (OUT / "atlas.json").write_text(atlas_txt)
    write_classify(OUT / "CLASSIFY.md")

    # left ≠ flip(right)
    left = walk_rows[3][0]
    right = walk_rows[2][0]
    flipped = right[:, ::-1]
    la = left[..., 3] >= 160
    fa = flipped[..., 3] >= 160
    overlap = int((la & fa).sum())
    same = 0
    if overlap:
        same = int(np.all(left[la & fa][:, :3] == flipped[la & fa][:, :3], axis=1).sum())
    print(f"left vs flip(right) pixel-equal {same}/{max(1, overlap)} ({100 * same / max(1, overlap):.1f}%)")

    ncol = unique_opaque(master)
    print("master", master.shape, "unique colors", ncol)
    print("idle unique", unique_opaque(idle), "idle foot", int(np.where(idle[..., 3] >= 160)[0].max()))
    print("hit unique", unique_opaque(attack_rows[0][3]))

    # copy pack + previews to home artifacts (owner path)
    for act in ACTIONS:
        shutil.copy2(PACK / f"{act}.png", HOME / f"{act}.png")
    shutil.copy2(PACK / "sheet.png", HOME / "sheet.png")
    shutil.copy2(PACK / "atlas.json", HOME / "atlas.json")
    (HOME / "preview").mkdir(parents=True, exist_ok=True)
    (HOME / "thumbs").mkdir(parents=True, exist_ok=True)
    (HOME / "icons").mkdir(parents=True, exist_ok=True)
    shutil.copy2(PACK / "thumbs" / "idle_down.png", HOME / "thumbs" / "idle_down.png")
    shutil.copy2(PACK / "icons" / "idle_32.png", HOME / "icons" / "idle_32.png")
    for name in (
        "idle_down_4x.png",
        "walk_4x.png",
        "attack_4x.png",
        "attack_hit_4x.png",
        "dirs_idle_4x.png",
        "walk_sheet_4x.png",
        "attack_sheet_4x.png",
        "palette.png",
        "walk_2x.png",
        "attack_2x.png",
    ):
        srcp = OUT / "preview" / name
        if srcp.exists():
            shutil.copy2(srcp, HOME / "preview" / name)
    shutil.copy2(OUT / "CLASSIFY.md", HOME / "CLASSIFY.md")
    print("done ->", OUT, PACK, HOME)


if __name__ == "__main__":
    main()
