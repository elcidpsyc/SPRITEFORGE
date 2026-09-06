#!/usr/bin/env python3
"""
build_templar_v4.py — SPRITEFORGE / Cavaleiro Templário v4

Fonte única de verdade: a sheet de referência (8 cols x 4 rows, células 182px).
Pipeline: keying do fundo -> redução para 64px -> paleta travada (rampas) ->
limpeza (pixels órfãos) -> outline 1px -> composição das 7 ações x 4 dirs.

Contrato 1.0: célula 64x64, pivot (32,56), 8 colunas, ações empilhadas
(walk, run, attack, guard, dash, hurt, death) x dirs (down, up, right, left).

Uso: python3 build_templar_v4.py <referencia.jpg> <pasta_saida>
"""
import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

CELL = 64
PIVOT = (32, 56)
REF_CELL = 182
COLS = 8
DIRS = ["down", "up", "right", "left"]
ACTIONS = [
    ("walk", 8, 8, True, False, None),
    ("run", 8, 12, True, False, None),
    ("attack", 8, 10, False, False, 3),
    ("guard", 6, 8, False, True, None),
    ("dash", 6, 14, False, False, None),
    ("hurt", 6, 10, False, False, None),
    ("death", 8, 8, False, True, None),
]

# Paleta travada — rampas extraídas da referência (aço / tecido / vermelho / ouro / pele)
PALETTE = [
    (18, 14, 14),      # outline
    (58, 60, 66),      # aço escuro
    (104, 108, 116),   # aço médio
    (150, 156, 164),   # aço claro
    (206, 212, 220),   # aço brilho
    (240, 236, 224),   # tecido claro
    (206, 198, 180),   # tecido sombra
    (128, 102, 74),    # couro
    (190, 44, 48),     # vermelho
    (140, 26, 34),     # vermelho médio
    (92, 16, 24),      # vermelho sombra
    (218, 172, 60),    # ouro
    (150, 110, 34),    # ouro sombra
    (118, 40, 42),     # vinho (capa/túnica em sombra)
    (28, 26, 30),      # visor
    (232, 240, 255),   # lâmina / vfx
    (160, 176, 200),   # vfx sombra
]
PAL = np.array(PALETTE, dtype=np.float32)
OUTLINE = np.array(PALETTE[0], dtype=np.uint8)
SHADOW_RGBA = (0, 0, 0, 90)


# ---------------------------------------------------------------- utilidades
def key_white(rgb: np.ndarray, thresh=228) -> np.ndarray:
    """Fundo branco -> alpha 0. Retorna RGBA float."""
    h, w, _ = rgb.shape
    mn = rgb.min(axis=2)
    alpha = np.where(mn > thresh, 0, 255).astype(np.uint8)
    # suaviza serrilhado do jpg nas bordas
    a = Image.fromarray(alpha).filter(ImageFilter.MedianFilter(3))
    alpha = np.asarray(a)
    return np.dstack([rgb, alpha])


def strip_shadow(rgba: np.ndarray) -> np.ndarray:
    """Remove a sombra cinza baked (baixa saturação, no terço inferior)."""
    out = rgba.copy()
    h = out.shape[0]
    r, g, b, a = [out[..., i].astype(int) for i in range(4)]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    sat = (mx - mn)
    light = (mx + mn) / 2
    gray = (sat < 22) & (light > 140) & (light < 225)
    ys = np.arange(h)[:, None]
    zone = ys > h * 0.72
    out[gray & zone & (a > 0), 3] = 0
    return out


def downscale(rgba: np.ndarray, size=CELL) -> np.ndarray:
    """Amostragem por bloco: para cada pixel alvo pega a MEDIANA dos pixels opacos
    do bloco fonte (evita que o outline preto da referência contamine a média).
    Alpha = cobertura do bloco."""
    h, w = rgba.shape[:2]
    fy, fx = h / size, w / size
    out = np.zeros((size, size, 4), np.float32)
    for y in range(size):
        y0, y1 = int(round(y * fy)), int(round((y + 1) * fy))
        for x in range(size):
            x0, x1 = int(round(x * fx)), int(round((x + 1) * fx))
            blk = rgba[y0:y1, x0:x1]
            a = blk[..., 3] > 0
            cov = a.mean() if a.size else 0
            if cov < 0.5:
                continue
            px = blk[a][:, :3].astype(np.float32)
            # descarta os mais escuros (outline) quando há cor de sobra
            lum = px @ np.array([0.299, 0.587, 0.114])
            keep = px[lum >= np.percentile(lum, 40)] if len(px) > 3 else px
            out[y, x, :3] = np.median(keep, axis=0)
            out[y, x, 3] = 255
    return out


def _lab(rgb):
    rgb = rgb / 255.0
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    l = (mx + mn) / 2
    s = mx - mn
    h = np.arctan2(np.sqrt(3) * (g - b), 2 * r - g - b)
    return np.stack([l * 1.6, s * np.cos(h) * 1.2, s * np.sin(h) * 1.2], -1)

PAL_LAB = None

def snap_palette(rgba: np.ndarray) -> np.ndarray:
    global PAL_LAB
    if PAL_LAB is None:
        PAL_LAB = _lab(PAL)
    rgb = rgba[..., :3].reshape(-1, 3).astype(np.float32)
    lab = _lab(rgb)
    d = ((lab[:, None, :] - PAL_LAB[None, :, :]) ** 2).sum(axis=2)
    idx = d.argmin(axis=1)
    snapped = PAL[idx].reshape(rgba.shape[0], rgba.shape[1], 3)
    out = np.dstack([snapped, rgba[..., 3]])
    out[out[..., 3] == 0, :3] = 0
    return out.astype(np.uint8)


def clean_orphans(rgba: np.ndarray) -> np.ndarray:
    """Apaga pixels opacos com <=1 vizinho opaco (ruído de quantização)."""
    a = rgba[..., 3] > 0
    p = np.pad(a, 1)
    n = (p[:-2, 1:-1].astype(int) + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:])
    out = rgba.copy()
    out[a & (n <= 1), 3] = 0
    return out


def outline(rgba: np.ndarray) -> np.ndarray:
    """Outline 1px externo com a cor de contorno da paleta."""
    a = rgba[..., 3] > 0
    p = np.pad(a, 1)
    nb = p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]
    ring = nb & ~a
    out = rgba.copy()
    out[ring, :3] = OUTLINE
    out[ring, 3] = 255
    return out


def add_shadow(rgba: np.ndarray, cx=32, cy=57, rx=9, ry=3, squash=1.0) -> np.ndarray:
    out = rgba.copy()
    rx = int(round(rx * squash))
    for y in range(-ry, ry + 1):
        for x in range(-rx, rx + 1):
            if x * x * ry * ry + y * y * rx * rx <= rx * rx * ry * ry:
                px, py = cx + x, cy + y
                if 0 <= px < CELL and 0 <= py < CELL and out[py, px, 3] == 0:
                    out[py, px] = SHADOW_RGBA
    return out


def bbox(rgba):
    ys, xs = np.where(rgba[..., 3] > 0)
    return xs.min(), xs.max(), ys.min(), ys.max()


def place(rgba: np.ndarray) -> np.ndarray:
    """Centraliza no pivot: pés em y=56, centro horizontal em x=32."""
    x0, x1, y0, y1 = bbox(rgba)
    cx = (x0 + x1) // 2
    dx = PIVOT[0] - cx
    dy = PIVOT[1] - y1
    return shift(rgba, dx, dy)


def shift(rgba: np.ndarray, dx: int, dy: int) -> np.ndarray:
    out = np.zeros_like(rgba)
    h, w = rgba.shape[:2]
    sy0, sy1 = max(0, -dy), min(h, h - dy)
    sx0, sx1 = max(0, -dx), min(w, w - dx)
    out[sy0 + dy:sy1 + dy, sx0 + dx:sx1 + dx] = rgba[sy0:sy1, sx0:sx1]
    return out


def mirror(rgba):
    return rgba[:, ::-1].copy()


def over(base, top):
    out = base.copy()
    m = top[..., 3] > 0
    out[m] = top[m]
    return out


def flash(rgba, amount):
    out = rgba.copy().astype(int)
    m = out[..., 3] > 0
    out[m, :3] = np.minimum(255, out[m, :3] + int(150 * amount))
    return out.astype(np.uint8)


def legs_cycle(body: np.ndarray, phase: float, amp: int, side: bool) -> np.ndarray:
    """Ciclo de pernas: divide a faixa das pernas em duas metades e alterna."""
    x0, x1, y0, y1 = bbox(body)
    leg_top = y1 - 11
    out = body.copy()
    out[leg_top:, :] = 0
    legs = body[leg_top:, :]
    cx = (x0 + x1) // 2
    off = int(round(math.sin(phase) * amp))
    left = legs.copy(); left[:, cx:] = 0
    right = legs.copy(); right[:, :cx] = 0
    lz = np.zeros_like(body); lz[leg_top:] = left
    rz = np.zeros_like(body); rz[leg_top:] = right
    if side:
        lz = shift(lz, off, 0); rz = shift(rz, -off, 0)
    else:
        lz = shift(lz, 0, off); rz = shift(rz, 0, -off)
    out = over(out, lz)
    out = over(out, rz)
    return out


def lean(body: np.ndarray, px: int) -> np.ndarray:
    """Shear horizontal: topo desloca px, pés ficam."""
    x0, x1, y0, y1 = bbox(body)
    out = np.zeros_like(body)
    h = y1 - y0
    for y in range(y0, y1 + 1):
        t = 1 - (y - y0) / max(h, 1)
        d = int(round(px * t))
        out[y] = np.roll(body[y], d, axis=0)
    return out


def rotate(body: np.ndarray, deg: float, drop: int) -> np.ndarray:
    im = Image.fromarray(body, "RGBA")
    r = im.rotate(deg, resample=Image.NEAREST, center=(PIVOT[0], PIVOT[1] - 4))
    arr = np.asarray(r).copy()
    arr[..., 3] = np.where(arr[..., 3] > 127, 255, 0)
    arr = snap_palette(arr)
    if arr[..., 3].any():
        arr = place(arr)
    return arr


def smear(body: np.ndarray, dx: int, alpha=70) -> np.ndarray:
    ghost = shift(body, dx, 0).copy()
    ghost[ghost[..., 3] > 0, 3] = alpha
    return over(ghost, body) if False else np.where(body[..., 3:4] > 0, body, ghost)


# ---------------------------------------------------------------- extração
def extract(ref: Image.Image, row: int, col: int) -> np.ndarray:
    cell = ref.crop((col * REF_CELL, row * REF_CELL, (col + 1) * REF_CELL, (row + 1) * REF_CELL))
    rgb = np.asarray(cell.convert("RGB"))
    rgba = key_white(rgb)
    rgba = strip_shadow(rgba)
    small = downscale(rgba)
    small = snap_palette(small)
    small = clean_orphans(small)
    small = outline(small)
    return small


def finish(body: np.ndarray, squash=1.0, shadow_dx=0) -> np.ndarray:
    return add_shadow(body, cx=32 + shadow_dx, squash=squash)


# ---------------------------------------------------------------- build
def build(ref_path: Path, out_dir: Path):
    ref = Image.open(ref_path)
    assert ref.size == (REF_CELL * COLS, REF_CELL * 4), ref.size

    base = {
        "down": place(extract(ref, 0, 0)),
        "up": place(extract(ref, 3, 0)),
        "right": place(extract(ref, 2, 0)),
    }
    base["left"] = mirror(base["right"])

    attack_src = {
        "down": [place(extract(ref, 1, c)) for c in range(COLS)],
        "right": [place(extract(ref, 2, c)) for c in range(COLS)],
        "up": [place(extract(ref, 3, c)) for c in range(COLS)],
    }
    # frames com arco de golpe (5..7 na ref) — o arco desloca o centro; reancora pelos pés
    attack_src["left"] = [mirror(f) for f in attack_src["right"]]

    frames = {}  # (action, dir) -> list[np.ndarray]

    for d in DIRS:
        b = base[d]
        side = d in ("right", "left")
        sign = -1 if d == "left" else 1

        # WALK — 8 frames, contato/passagem, bob 1px
        walk = []
        for f in range(8):
            ph = f / 8 * 2 * math.pi
            body = legs_cycle(b, ph, 2, side)
            body = shift(body, 0, -1 if f in (1, 5) else 0)
            walk.append(finish(body))
        frames[("walk", d)] = walk

        # RUN — 8 frames, amplitude 3, lean 2, bob 2, smear nas laterais
        run = []
        for f in range(8):
            ph = f / 8 * 2 * math.pi
            body = legs_cycle(b, ph, 3, side)
            body = lean(body, 2 * sign) if side else body
            body = shift(body, 0, -2 if f in (1, 5) else (1 if f in (3, 7) else 0))
            if side and f in (0, 1, 4, 5):
                body = smear(body, -3 * sign)
            run.append(finish(body))
        frames[("run", d)] = run

        # ATTACK — direto da referência (antecipação 1-3, golpe 4-6, recuperação 7)
        atk = [finish(f) for f in attack_src[d]]
        frames[("attack", d)] = atk

        # GUARD — crouch 1px + passo à frente + hold
        guard = []
        raise_seq = [0, 1, 2, 2, 2, 2]
        for f in range(6):
            body = shift(b, sign * raise_seq[f] if side else 0, 1 if f >= 2 else 0)
            body = lean(body, -1 * sign) if side else body
            guard.append(finish(body))
        frames[("guard", d)] = guard

        # DASH — lean 3 + smear + deslocamento
        dash = []
        dash_seq = [(2, 1), (3, 3), (3, 4), (2, 3), (1, 1), (0, 0)]
        for f, (ln, sm) in enumerate(dash_seq):
            body = lean(b, ln * sign) if side else shift(b, 0, -ln)
            if sm and side:
                body = smear(body, -sm * sign, alpha=60 + 15 * sm)
            elif sm:
                body = smear(shift(body, 0, 0), 0)
            dash.append(finish(body, shadow_dx=ln * sign if side else 0))
        frames[("dash", d)] = dash

        # HURT — knockback + flash
        hurt = []
        hurt_seq = [(0.8, -1), (1.0, -2), (0.5, -2), (0.2, -1), (0, 0), (0, 0)]
        for fl, kx in hurt_seq:
            body = shift(b, kx * sign if side else kx, 0)
            body = flash(body, fl) if fl else body
            hurt.append(finish(body, shadow_dx=kx * sign if side else kx))
        frames[("hurt", d)] = hurt

        # DEATH — queda progressiva, squash da sombra, hold final
        death = []
        fall_seq = [(0, 0, 0.3), (-6, 1, 0.0), (-14, 2, 0.0), (-30, 4, 0.0),
                    (-55, 6, 0.0), (-78, 8, 0.0), (-90, 9, 0.0), (-90, 9, 0.0)]
        for deg, drop, fl in fall_seq:
            body = rotate(b, deg * sign, drop)
            body = flash(body, fl) if fl else body
            sq = 1 + (abs(deg) / 90) * 0.6
            death.append(finish(body, squash=sq))
        frames[("death", d)] = death

    # ---- montagem das sheets
    master = np.zeros((CELL * 4 * len(ACTIONS), CELL * COLS, 4), np.uint8)
    per_action = {}
    for ai, (aid, n, fps, loop, hold, hit) in enumerate(ACTIONS):
        sheet = np.zeros((CELL * 4, CELL * COLS, 4), np.uint8)
        for di, d in enumerate(DIRS):
            for f in range(n):
                cell = frames[(aid, d)][f]
                sheet[di * CELL:(di + 1) * CELL, f * CELL:(f + 1) * CELL] = cell
        per_action[aid] = sheet
        master[ai * CELL * 4:(ai + 1) * CELL * 4] = sheet

    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "icons").mkdir(exist_ok=True)
    (out_dir / "thumbs").mkdir(exist_ok=True)
    Image.fromarray(master, "RGBA").save(out_dir / "sheet.png")
    for aid, sheet in per_action.items():
        Image.fromarray(sheet, "RGBA").save(out_dir / f"{aid}.png")

    idle = frames[("guard", "down")][0]
    Image.fromarray(idle, "RGBA").save(out_dir / "thumbs" / "idle_down.png")
    icon = idle[8:40, 16:48]
    Image.fromarray(np.ascontiguousarray(icon), "RGBA").save(out_dir / "icons" / "idle_32.png")

    atlas = {
        "specVersion": "1.0",
        "id": "templar",
        "name": "Cavaleiro Templário",
        "title": "Guardião das Cruzadas",
        "cell": {"w": CELL, "h": CELL},
        "pivot": {"x": PIVOT[0], "y": PIVOT[1]},
        "hitbox": {"x": 22, "y": 20, "w": 20, "h": 36},
        "directions": DIRS,
        "sheet": {
            "master": "sheet.png",
            "layout": "actionsStacked",
            "cols": COLS,
            "actionOrder": [a[0] for a in ACTIONS],
            "perAction": {a[0]: f"{a[0]}.png" for a in ACTIONS},
        },
        "animations": {
            a[0]: {"frames": a[1], "fps": a[2], "loop": a[3], "holdLast": a[4],
                   **({"hitFrame": a[5]} if a[5] is not None else {})}
            for a in ACTIONS
        },
        "icons": {"hud32": "icons/idle_32.png", "hud32svg": "icons/idle_32.svg"},
        "stats": {"hp": 610, "atk": 64, "def": 58, "spd": 3.6},
        "survivorSkill": {
            "name": "Baluarte Implacável",
            "desc": "Torna-se invulnerável por 3s e repele ataques.",
        },
        "source": {"reference": ref_path.name, "builder": "build_templar_v4.py", "palette": PALETTE},
    }
    (out_dir / "atlas.json").write_text(json.dumps(atlas, ensure_ascii=False, indent=2))

    # contact sheet 2x para revisão
    contact = Image.fromarray(master, "RGBA").resize((master.shape[1] * 2, master.shape[0] * 2), Image.NEAREST)
    bg = Image.new("RGBA", contact.size, (24, 24, 28, 255))
    bg.alpha_composite(contact)
    bg.save(out_dir / "_contact_2x.png")
    print("ok ->", out_dir)


if __name__ == "__main__":
    build(Path(sys.argv[1]), Path(sys.argv[2]))
