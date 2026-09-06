#!/usr/bin/env python3
"""
extract_parts.py — SPRITEFORGE / Cavaleiro Templário v5 (paper-doll)

Reextrai o frame-base de cada direção diretamente da referência (mesmas
funções de build_templar_v4.py: keying, downscale por mediana, paleta
travada, limpeza de órfãos, outline) e segmenta o resultado em partes
(shadow é procedural, não é extraída) por MÁSCARA DE COR + REGIÃO:

  - head:   pixels de aço/visor (paleta 1,2,3,4,14) acima de y=36 (y0+13,
            y0=23 é o topo do torso usado em todo o contrato).
  - shield/weapon: caixas retangulares fixas por direção (ver SHIELD_BOX /
            WEAPON_BOX) — a mão que segura cada peça tem a MESMA cor de aço
            da armadura, então uma máscara por cor sozinha mistura shield
            com braço/torso (verificado visualmente: ver docs/templar-v5-*
            contact sheets). A caixa reta, sem filtro de cor, foi a única
            forma de manter cada peça como um blob único e limpo — é a
            "máscara à mão como lista de retângulos" que o brief permite
            quando a segmentação automática por cor não fica limpa.
  - cape:   pixels vinho/vermelho (paleta 8,9,10,13) fora da caixa da cabeça/
            pernas — só existe (>0 px) em up/right/left, nunca em down.
  - legs:   as 11 linhas inferiores do que sobrar depois de shield/weapon/
            cape/head, dividido em legs_l/legs_r pela coluna central x=32.
  - torso:  o que sobrar.

`left` nunca é extraído da referência: é sempre o espelho horizontal exato
de cada parte de `right` (garante left == mirror(right) por construção).

vfx: o "arco de golpe" vem das cores dedicadas da paleta (15 lâmina/vfx, 16
vfx sombra) nos frames de ataque 4..6 (extraídos direto da referência, sem
transformação procedural, igual ao attack.png do v4).

Uso: python3 extract_parts.py <referencia.jpg> <pasta_saida_templar-v5>
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_templar_v4 as b  # noqa: E402

CELL = 64
PIVOT = b.PIVOT
STEEL = {1, 2, 3, 4, 14}
CAPE_COLORS = {8, 9, 10, 13}
VFX_COLORS = {15, 16}
HEAD_Y_CUTOFF = 35  # y0(23) + 13, inclusive
LEGS_ROWS = 11
VFX_FRAMES = [4, 5, 6]

# Hand-picked boxes (x0, y0, x1, y1) inclusive, in 64x64 cell space. Chosen by
# visually inspecting an overlay of the color-only segmentation attempt: pure
# color masking interleaved shield/weapon pixels with the torso/arm because
# they share the same steel tone in the photographed reference, so these
# boxes are the manual fallback the brief calls for. Not used for 'down'
# cape — that direction has no cape geometry in the reference (matches
# render.ts's own near-invisible down-facing cape flaps).
SHIELD_BOX = {
    "down": (36, 24, 52, 53),
    "up": (5, 22, 16, 52),
    "right": (36, 23, 51, 51),
}
WEAPON_BOX = {
    "down": (10, 40, 22, 56),
    "up": (30, 26, 51, 56),
    "right": (18, 30, 34, 51),
}
CAPE_BOX = {
    "down": None,  # no cape geometry facing the camera
    "up": None,  # cape dominates the back view; no box restriction needed
    "right": (8, 30, 24, 46),
}

# Weapon grip anchor (rotation pivot for pose.swordAngle), picked at the end
# of the blade box closest to the hand/torso.
WEAPON_ANCHOR = {
    "down": {"x": 20, "y": 42},
    "up": {"x": 31, "y": 28},
    "right": {"x": 30, "y": 30},
}


def color_idx_grid(arr: np.ndarray) -> np.ndarray:
    pal = np.array(b.PALETTE, dtype=np.float32)
    rgb = arr[..., :3].astype(np.float32)
    d = ((rgb[:, :, None, :] - pal[None, None, :, :]) ** 2).sum(axis=3)
    idx = d.argmin(axis=2)
    idx[arr[..., 3] == 0] = -1
    return idx


def rect_mask(shape, box) -> np.ndarray:
    m = np.zeros(shape, dtype=bool)
    if box is None:
        return m
    x0, y0, x1, y1 = box
    m[y0 : y1 + 1, x0 : x1 + 1] = True
    return m


def extract_layers(arr: np.ndarray, direction: str) -> dict[str, np.ndarray]:
    idx = color_idx_grid(arr)
    opaque = arr[..., 3] > 0
    claimed = np.zeros(arr.shape[:2], dtype=bool)
    layers: dict[str, np.ndarray] = {}

    # Reserve the equipment boxes before scanning for head pixels: the
    # shield/weapon boxes sometimes dip above the head cutoff (a shield's
    # top rim, a raised blade) and share the same steel tone as the helmet,
    # which otherwise leaks a few stray pixels into the head layer.
    reserved = rect_mask(arr.shape[:2], SHIELD_BOX[direction]) | rect_mask(
        arr.shape[:2], WEAPON_BOX[direction]
    )
    head_band = rect_mask(arr.shape[:2], (0, 0, CELL - 1, HEAD_Y_CUTOFF))
    head_mask = opaque & ~claimed & head_band & ~reserved & np.isin(idx, list(STEEL))
    layers["head"] = head_mask
    claimed |= head_mask

    cape_mask = opaque & ~claimed & np.isin(idx, list(CAPE_COLORS))
    box = CAPE_BOX.get(direction)
    if box is not None:
        cape_mask &= rect_mask(arr.shape[:2], box)
    if direction == "down":
        cape_mask &= False  # no cape facing the camera
    layers["cape"] = cape_mask
    claimed |= cape_mask

    shield_mask = opaque & ~claimed & rect_mask(arr.shape[:2], SHIELD_BOX[direction])
    layers["shield"] = shield_mask
    claimed |= shield_mask

    weapon_mask = opaque & ~claimed & rect_mask(arr.shape[:2], WEAPON_BOX[direction])
    layers["weapon"] = weapon_mask
    claimed |= weapon_mask

    y1 = PIVOT[1]
    legs_band = rect_mask(arr.shape[:2], (0, y1 - (LEGS_ROWS - 1), CELL - 1, y1))
    legs_mask = opaque & ~claimed & legs_band
    layers["legs"] = legs_mask
    claimed |= legs_mask

    layers["torso"] = opaque & ~claimed
    return layers


def split_legs(mask: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    cx = PIVOT[0]
    left = mask.copy()
    left[:, cx:] = False
    right = mask.copy()
    right[:, :cx] = False
    return left, right


def mask_to_rgba(arr: np.ndarray, mask: np.ndarray) -> np.ndarray:
    out = np.zeros_like(arr)
    out[mask] = arr[mask]
    return out


def bbox_or_none(mask: np.ndarray):
    if not mask.any():
        return None
    ys, xs = np.where(mask)
    return [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]


def strip_outline(arr: np.ndarray) -> np.ndarray:
    """Drop the reference's own baked-in 1px outline (palette index 0).
    compose.ts always finishes a composed frame with strokeOutline() to seam
    the parts back together, so a part that still carried its outer-edge
    outline would get a second, thicker ring drawn just outside the first —
    growing the body bbox by 1px on every side. Parts should carry flesh
    only; the outline is the compositor's job alone."""
    out = arr.copy()
    outline_color = np.array(b.PALETTE[0])
    is_outline = (arr[..., 3] > 0) & np.all(arr[..., :3] == outline_color, axis=-1)
    out[is_outline, 3] = 0
    return out


def build(ref_path: Path, out_dir: Path) -> None:
    ref = Image.open(ref_path)
    base = {
        "down": strip_outline(b.place(b.extract(ref, 0, 0))),
        "up": strip_outline(b.place(b.extract(ref, 3, 0))),
        "right": strip_outline(b.place(b.extract(ref, 2, 0))),
    }
    attack_src = {
        "down": [b.place(b.extract(ref, 1, c)) for c in VFX_FRAMES],
        "right": [b.place(b.extract(ref, 2, c)) for c in VFX_FRAMES],
        "up": [b.place(b.extract(ref, 3, c)) for c in VFX_FRAMES],
    }

    manifest: dict = {
        "cell": {"w": CELL, "h": CELL},
        "pivot": {"x": PIVOT[0], "y": PIVOT[1]},
        "directions": {},
        "vfx": {},
        "manualRegions": {
            "note": (
                "shield e weapon usam caixas retangulares fixas (sem filtro de "
                "cor) por direção — a mão/braço que segura cada peça tem a "
                "mesma cor de aço da armadura, então a máscara por cor sozinha "
                "misturava shield/weapon com torso. down.cape é vazio de "
                "propósito (a referência não mostra a capa de frente)."
            ),
            "shieldBox": SHIELD_BOX,
            "weaponBox": WEAPON_BOX,
            "capeBox": CAPE_BOX,
        },
        "knownLimitations": [
            {
                "direction": "right",
                "part": "weapon",
                "issue": (
                    "a espada cruza o torso na pose fotografada e usa o mesmo "
                    "tom de aço da armadura — a caixa (WEAPON_BOX.right) foi "
                    "apertada em 2 tentativas mas ainda inclui parte do "
                    "braço/torso, não é uma silhueta limpa só da lâmina. "
                    "'left' herda a mesma limitação por espelhamento."
                ),
            }
        ],
    }

    def write_direction(direction: str, arr: np.ndarray, layers: dict[str, np.ndarray]):
        d_dir = out_dir / "parts" / direction
        d_dir.mkdir(parents=True, exist_ok=True)
        entry = {}
        legs_l, legs_r = split_legs(layers["legs"])
        parts = {
            "head": layers["head"],
            "torso": layers["torso"],
            "cape": layers["cape"],
            "shield": layers["shield"],
            "weapon": layers["weapon"],
            "legs_l": legs_l,
            "legs_r": legs_r,
        }
        for name, mask in parts.items():
            rgba = mask_to_rgba(arr, mask)
            Image.fromarray(rgba, "RGBA").save(d_dir / f"{name}.png")
            anchor = {"x": PIVOT[0], "y": PIVOT[1]}
            if name == "weapon" and direction in WEAPON_ANCHOR:
                anchor = WEAPON_ANCHOR[direction]
            entry[name] = {
                "file": f"parts/{direction}/{name}.png",
                "bbox": bbox_or_none(mask),
                "anchor": anchor,
                "px": int(mask.sum()),
            }
        manifest["directions"][direction] = entry

    for direction in ["down", "up", "right"]:
        layers = extract_layers(base[direction], direction)
        write_direction(direction, base[direction], layers)

    # left = exact horizontal mirror of right, part by part.
    left_dir = out_dir / "parts" / "left"
    left_dir.mkdir(parents=True, exist_ok=True)
    left_entry = {}
    for name, right_entry in manifest["directions"]["right"].items():
        right_png = np.asarray(Image.open(out_dir / right_entry["file"]).convert("RGBA"))
        left_png = b.mirror(right_png)
        Image.fromarray(left_png, "RGBA").save(left_dir / f"{name}.png")
        anchor = right_entry["anchor"]
        mirrored_anchor = {"x": CELL - 1 - anchor["x"], "y": anchor["y"]}
        bbox = right_entry["bbox"]
        mirrored_bbox = (
            [CELL - 1 - bbox[2], bbox[1], CELL - 1 - bbox[0], bbox[3]] if bbox else None
        )
        left_entry[name] = {
            "file": f"parts/left/{name}.png",
            "bbox": mirrored_bbox,
            "anchor": mirrored_anchor,
            "px": right_entry["px"],
            "mirroredFrom": "right",
        }
    manifest["directions"]["left"] = left_entry

    # vfx: slash arcs from attack frames 4..6, isolated by the dedicated
    # blade/vfx palette colors (index 15/16) — these colors are otherwise
    # unused outside the swing frames, so no region box is needed.
    vfx_dir = out_dir / "parts" / "vfx"
    vfx_dir.mkdir(parents=True, exist_ok=True)
    for direction in ["down", "up", "right"]:
        manifest["vfx"][direction] = []
        for n, arr in zip(VFX_FRAMES, attack_src[direction]):
            idx = color_idx_grid(arr)
            mask = (arr[..., 3] > 0) & np.isin(idx, list(VFX_COLORS))
            rgba = mask_to_rgba(arr, mask)
            fname = f"slash_{direction}_{n}.png"
            Image.fromarray(rgba, "RGBA").save(vfx_dir / fname)
            if mask.any():
                manifest["vfx"][direction].append(
                    {"frame": n, "file": f"parts/vfx/{fname}", "bbox": bbox_or_none(mask), "px": int(mask.sum())}
                )
    manifest["vfx"]["left"] = []
    for entry in manifest["vfx"]["right"]:
        right_png = np.asarray(Image.open(out_dir / entry["file"]).convert("RGBA"))
        left_png = b.mirror(right_png)
        fname = f"slash_left_{entry['frame']}.png"
        Image.fromarray(left_png, "RGBA").save(vfx_dir / fname)
        bbox = entry["bbox"]
        mirrored_bbox = [CELL - 1 - bbox[2], bbox[1], CELL - 1 - bbox[0], bbox[3]] if bbox else None
        manifest["vfx"]["left"].append(
            {"frame": entry["frame"], "file": f"parts/vfx/{fname}", "bbox": mirrored_bbox, "px": entry["px"], "mirroredFrom": "right"}
        )

    (out_dir / "parts" / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    print("ok ->", out_dir / "parts")


if __name__ == "__main__":
    build(Path(sys.argv[1]), Path(sys.argv[2]))
