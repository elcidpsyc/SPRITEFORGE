import { CELL, type ActionId, type Direction } from "./contract";
import { poseFor } from "./poses";
import type { Character, CharacterKit, Pose } from "./types";

export type RGBA = readonly [number, number, number, number];

const OUT: RGBA = [16, 12, 10, 255];
const VISOR: RGBA = [10, 8, 12, 255];
const GOLD: RGBA = [201, 162, 39, 255];
const GOLD_DK: RGBA = [140, 108, 24, 255];
const HAIR: RGBA = [28, 20, 16, 255];
const SKIN: RGBA = [210, 164, 118, 255];
const SHADOW: RGBA = [0, 0, 0, 88];

export class Pix {
  readonly w: number;
  readonly h: number;
  readonly data: Uint8ClampedArray;

  constructor(w: number, h: number, data?: Uint8ClampedArray) {
    this.w = w;
    this.h = h;
    this.data = data ?? new Uint8ClampedArray(w * h * 4);
  }

  set(x: number, y: number, c: RGBA) {
    const xi = x | 0;
    const yi = y | 0;
    if (xi < 0 || yi < 0 || xi >= this.w || yi >= this.h) return;
    const a = c[3];
    if (a <= 0) return;
    const i = (yi * this.w + xi) * 4;
    if (a >= 255) {
      this.data[i] = c[0];
      this.data[i + 1] = c[1];
      this.data[i + 2] = c[2];
      this.data[i + 3] = 255;
      return;
    }
    const da = this.data[i + 3] / 255;
    const sa = a / 255;
    const outA = sa + da * (1 - sa);
    if (outA <= 0) return;
    this.data[i] = Math.round((c[0] * sa + this.data[i] * da * (1 - sa)) / outA);
    this.data[i + 1] = Math.round((c[1] * sa + this.data[i + 1] * da * (1 - sa)) / outA);
    this.data[i + 2] = Math.round((c[2] * sa + this.data[i + 2] * da * (1 - sa)) / outA);
    this.data[i + 3] = Math.round(outA * 255);
  }

  rect(x: number, y: number, w: number, h: number, c: RGBA) {
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) this.set(x + xx, y + yy, c);
    }
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, c: RGBA) {
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        if (x * x * ry * ry + y * y * rx * rx <= rx * rx * ry * ry) {
          this.set(cx + x, cy + y, c);
        }
      }
    }
  }

  rgb(rgb: [number, number, number], a = 255): RGBA {
    return [rgb[0], rgb[1], rgb[2], a];
  }
}

function strokeOutline(p: Pix, color: RGBA = OUT) {
  const orig = new Uint8ClampedArray(p.data);
  const aAt = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= p.w || y >= p.h) return 0;
    return orig[(y * p.w + x) * 4 + 3]!;
  };
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (aAt(x, y) > 16) continue;
      if (aAt(x - 1, y) > 16 || aAt(x + 1, y) > 16 || aAt(x, y - 1) > 16 || aAt(x, y + 1) > 16) {
        p.set(x, y, color);
      }
    }
  }
}

function drawCape(p: Pix, kit: CharacterKit, dir: Direction, pose: Pose, y0: number) {
  if (!kit.hasCape || !kit.cape || !kit.capeShadow) return;
  const cape = p.rgb(kit.cape);
  const dk = p.rgb(kit.capeShadow);
  const sway = pose.cape;
  const h = Math.max(10, 20 - Math.round(pose.fallen * 10));
  const y = y0 + 1 + Math.round(pose.fallen * 6);

  if (dir === "down") {
    p.rect(21 + sway, y, 5, h, dk);
    p.rect(22 + sway, y + 2, 3, h - 4, cape);
    p.rect(38 - sway, y, 5, h, cape);
    p.rect(39 - sway, y + 3, 3, h - 6, dk);
  } else if (dir === "up") {
    p.rect(22 + sway, y, 20, h + 2, cape);
    p.rect(24 + sway, y + 3, 16, h - 3, dk);
  } else if (dir === "right") {
    p.rect(20 - sway - pose.lean, y, 8, h, cape);
    p.rect(21 - sway, y + 3, 5, h - 5, dk);
  } else {
    p.rect(36 + sway + pose.lean, y, 8, h, cape);
    p.rect(38 + sway, y + 3, 5, h - 5, dk);
  }
}

function drawLegs(p: Pix, kit: CharacterKit, dir: Direction, pose: Pose, y0: number) {
  const cloth = p.rgb(kit.clothShadow);
  const leather = p.rgb(kit.leather);
  if (pose.fallen > 0.7) {
    p.rect(24 + pose.knockX, 51, 16, 5, cloth);
    p.rect(22 + pose.knockX, 53, 7, 3, leather);
    p.rect(35 + pose.knockX, 53, 7, 3, leather);
    return;
  }
  const ly = y0 + 19;
  const side = dir === "left" || dir === "right";
  if (side) {
    const front = dir === "right" ? pose.legR : pose.legL;
    const back = dir === "right" ? pose.legL : pose.legR;
    p.rect(30 + pose.lean, ly + back, 4, 8, cloth);
    p.rect(29 + pose.lean, ly + 8 + back, 5, 3, leather);
    p.rect(31 + pose.lean, ly + front, 4, 9, p.rgb(kit.cloth));
    p.rect(30 + pose.lean, ly + 9 + front, 6, 3, leather);
  } else {
    p.rect(26, ly + pose.legL, 5, 9, p.rgb(kit.cloth));
    p.rect(33, ly + pose.legR, 5, 9, p.rgb(kit.cloth));
    p.rect(25, ly + 9 + pose.legL, 6, 3, leather);
    p.rect(33, ly + 9 + pose.legR, 6, 3, leather);
  }
}

function drawTorso(p: Pix, kit: CharacterKit, dir: Direction, pose: Pose, y0: number) {
  const cloth = p.rgb(kit.cloth);
  const sh = p.rgb(kit.clothShadow);
  const lt = p.rgb(kit.clothLight);
  const acc = p.rgb(kit.accent);
  const metal = p.rgb(kit.metal);
  const metalLt = p.rgb(kit.metalLight);
  const leather = p.rgb(kit.leather);
  const x = 26 + pose.lean + pose.knockX;
  const y = y0;
  const w = dir === "left" || dir === "right" ? 11 : 12;

  p.rect(x, y, w, 17, cloth);
  p.rect(x + 1, y + 1, w - 2, 2, lt);
  p.rect(x + 1, y + 13, w - 2, 2, sh);
  p.rect(x, y + 14, w, 2, leather);
  p.rect(x + Math.floor(w / 2) - 1, y + 14, 3, 2, GOLD);

  p.rect(x - 1, y + 1, 4, 4, metal);
  p.rect(x, y + 1, 2, 2, metalLt);
  p.rect(x + w - 3, y + 1, 4, 4, metal);
  p.rect(x + w - 2, y + 1, 2, 2, metalLt);

  if (dir === "down") {
    p.rect(x + 5, y + 3, 2, 10, acc);
    p.rect(x + 2, y + 6, 8, 2, acc);
  } else if (dir === "up") {
    p.rect(x + 2, y + 4, w - 4, 7, sh);
  } else {
    p.rect(x + (dir === "right" ? 2 : w - 4), y + 5, 2, 7, acc);
  }
}

function drawHead(p: Pix, kit: CharacterKit, dir: Direction, pose: Pose, y0: number) {
  const metal = p.rgb(kit.metal);
  const metalLt = p.rgb(kit.metalLight);
  const metalDk = p.rgb(kit.metalDark);
  const cloth = p.rgb(kit.cloth);
  const sh = p.rgb(kit.clothShadow);
  const acc = p.rgb(kit.accent);
  const x = 26 + pose.lean + pose.knockX;
  const y = y0 - 11;

  if (pose.fallen > 0.75) {
    p.rect(x + 8, y + 16, 11, 9, metal);
    return;
  }

  if (kit.helm === "hood") {
    p.rect(x + 1, y + 3, 11, 11, sh);
    p.rect(x + 2, y + 4, 9, 7, cloth);
    if (dir === "down") {
      p.rect(x + 4, y + 7, 5, 4, SKIN);
      p.rect(x + 5, y + 8, 1, 1, VISOR);
      p.rect(x + 8, y + 8, 1, 1, VISOR);
    } else if (dir !== "up") {
      const fx = dir === "right" ? x + 7 : x + 3;
      p.rect(fx, y + 7, 4, 4, SKIN);
    }
    return;
  }

  if (kit.helm === "none") {
    p.rect(x + 3, y + 5, 9, 8, SKIN);
    p.rect(x + 3, y + 4, 9, 3, HAIR);
    p.rect(x + 6, y, 3, 5, HAIR);
    p.rect(x + 7, y - 1, 2, 2, acc);
    if (dir === "down") {
      p.rect(x + 5, y + 8, 1, 1, VISOR);
      p.rect(x + 9, y + 8, 1, 1, VISOR);
    } else if (dir !== "up") {
      p.rect(dir === "right" ? x + 10 : x + 4, y + 8, 1, 1, VISOR);
    }
    return;
  }

  p.rect(x + 1, y + 2, 11, 11, metal);
  p.rect(x + 2, y + 3, 9, 2, metalLt);
  p.rect(x + 2, y + 10, 9, 2, metalDk);

  if (kit.helm === "great" || kit.helm === "crest") {
    if (dir === "down") {
      p.rect(x + 5, y + 5, 3, 2, VISOR);
      p.rect(x + 6, y + 5, 1, 5, VISOR);
    } else if (dir === "up") {
      p.rect(x + 3, y + 4, 7, 6, metalDk);
    } else {
      const fx = dir === "right" ? x + 8 : x + 3;
      p.rect(fx, y + 5, 2, 2, VISOR);
      p.rect(fx + (dir === "right" ? 1 : 0), y + 5, 1, 5, VISOR);
    }
  }

  if (kit.helm === "nasal" && dir === "down") {
    p.rect(x + 4, y + 6, 5, 3, SKIN);
    p.rect(x + 6, y + 6, 1, 4, metalDk);
  }

  if (kit.helm === "crest") {
    p.rect(x + 5, y - 2, 3, 4, acc);
  }

  if (kit.helm === "horns") {
    p.rect(x - 2, y + 2, 3, 2, metalLt);
    p.rect(x + 12, y + 2, 3, 2, metalLt);
    if (dir === "down") {
      p.rect(x + 4, y + 6, 5, 3, SKIN);
      p.rect(x + 5, y + 7, 1, 1, VISOR);
      p.rect(x + 8, y + 7, 1, 1, VISOR);
    }
  }
}

function blade(
  p: Pix,
  ox: number,
  oy: number,
  angleDeg: number,
  reach: number,
  length: number,
  kit: CharacterKit,
) {
  const metal = p.rgb(kit.metalLight);
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const sx = ox + Math.round(dx * reach);
  const sy = oy + Math.round(dy * reach);
  for (let i = 0; i < length; i++) {
    const x = sx + Math.round(dx * i);
    const y = sy + Math.round(dy * i);
    p.set(x, y, i < 2 ? GOLD : metal);
    p.set(x, y - 1, i < 2 ? GOLD_DK : p.rgb(kit.metal));
  }
  p.rect(sx - 2, sy - 1, 5, 3, GOLD);
}

function drawWeapon(p: Pix, kit: CharacterKit, dir: Direction, pose: Pose, y0: number) {
  const metal = p.rgb(kit.metalLight);
  const leather = p.rgb(kit.leather);
  const acc = p.rgb(kit.accent);
  const lean = pose.lean + pose.knockX;
  const handY = y0 + 7;
  if (pose.fallen > 0.6) {
    p.rect(16 + pose.knockX, 54, 14, 2, metal);
    return;
  }

  const angleBase = dir === "right" ? 10 : dir === "left" ? 170 : dir === "up" ? -90 : 95;
  const angle = angleBase + pose.swordAngle * (dir === "left" ? -1 : 1);

  if (kit.weapon === "bow") {
    const x = (dir === "left" ? 22 : dir === "right" ? 41 : 20) + lean;
    for (let i = -7; i <= 7; i++) p.set(x, handY + i, leather);
    p.set(x + (dir === "left" ? -1 : 1), handY - 7, leather);
    p.set(x + (dir === "left" ? -1 : 1), handY + 7, leather);
    return;
  }
  if (kit.weapon === "staff") {
    const x = (dir === "left" ? 22 : dir === "right" ? 42 : 20) + lean;
    p.rect(x, y0 - 6, 2, 26, leather);
    p.ellipse(x + 1, y0 - 7, 3, 3, acc);
    return;
  }
  if (kit.weapon === "spear") {
    const x = (dir === "left" ? 20 : dir === "right" ? 43 : 19) + lean;
    if (dir === "left" || dir === "right") {
      const sign = dir === "right" ? 1 : -1;
      for (let i = 0; i < 20; i++) p.set(x + i * sign, handY, leather);
      p.rect(x + 18 * sign, handY - 2, 3, 5, metal);
    } else {
      p.rect(x, y0 - 10, 2, 28, leather);
      p.rect(x - 1, y0 - 12, 4, 5, metal);
    }
    return;
  }
  if (kit.weapon === "daggers") {
    const hx = (dir === "right" ? 40 : dir === "left" ? 22 : 20) + lean;
    blade(p, hx, handY, angle, pose.swordReach, 9, kit);
    blade(p, hx + (dir === "down" ? 20 : 2), handY + 3, angle + 35, 0, 8, kit);
    return;
  }
  if (kit.weapon === "axes") {
    const hx = (dir === "right" ? 40 : dir === "left" ? 21 : 19) + lean;
    p.rect(hx, handY - 2, 2, 12, leather);
    p.rect(hx - 3, handY - 5, 8, 4, metal);
    if (dir === "down") {
      p.rect(hx + 22, handY, 2, 10, leather);
      p.rect(hx + 19, handY - 3, 8, 4, metal);
    }
    return;
  }
  if (kit.weapon === "hammer" || kit.weapon === "mace") {
    const hx = (dir === "right" ? 42 : dir === "left" ? 20 : 19) + lean;
    p.rect(hx, handY - 8, 2, 14, leather);
    p.rect(hx - 3, handY - 12, 8, 6, kit.weapon === "hammer" ? GOLD : metal);
    return;
  }

  const hx =
    (dir === "right" ? 40 : dir === "left" ? 22 : dir === "up" ? 22 : 19) + lean;
  blade(p, hx, handY, angle, pose.swordReach, kit.weapon === "katana" ? 16 : 14, kit);
}

function drawShield(p: Pix, kit: CharacterKit, dir: Direction, pose: Pose, y0: number) {
  if (kit.shield === "none" || pose.fallen > 0.7) return;
  const metal = p.rgb(kit.metal);
  const metalLt = p.rgb(kit.metalLight);
  const metalDk = p.rgb(kit.metalDark);
  const acc = p.rgb(kit.accent);
  const raise = pose.shieldRaise;
  const lean = pose.lean + pose.knockX;
  const front = dir === "left" || dir === "down";

  let x: number;
  const y = y0 + 3 - raise;
  if (dir === "down") x = 39 + lean;
  else if (dir === "up") x = 21 + lean;
  else if (dir === "right") x = 24 + lean;
  else x = 36 + lean;

  if (kit.shield === "tower") {
    const w = front ? 10 : 7;
    p.rect(x, y - 2, w, 20, metal);
    p.rect(x + 1, y - 1, w - 2, 2, metalLt);
    p.rect(x + 2, y + 6, w - 4, 6, metalDk);
    return;
  }
  if (kit.shield === "round") {
    p.ellipse(x + 4, y + 7, 6, 6, metal);
    p.ellipse(x + 4, y + 7, 2, 2, acc);
    p.set(x + 3, y + 6, metalLt);
    return;
  }
  const w = front ? 9 : 6;
  p.rect(x, y, w, 12, metal);
  p.rect(x + 1, y + 11, w - 2, 2, metalDk);
  p.rect(x + 1, y + 1, w - 2, 2, metalLt);
  if (front) {
    p.rect(x + 3, y + 3, 2, 8, acc);
    p.rect(x + 1, y + 6, 6, 2, acc);
  }
}

function drawVfx(p: Pix, dir: Direction, pose: Pose, y0: number) {
  if (pose.vfx <= 0.05) return;
  const a = Math.round(200 * pose.vfx);
  const col: RGBA = [255, 224, 140, a];
  const spark: RGBA = [255, 255, 255, a];
  if (dir === "down") {
    for (let i = 0; i < 11; i++) {
      p.set(18 + i, y0 + 6 + Math.round(Math.sin(i / 2.5) * 2), col);
      p.set(18 + i, y0 + 7 + Math.round(Math.sin(i / 2.5) * 2), spark);
    }
  } else if (dir === "right") {
    for (let i = 0; i < 10; i++) {
      p.set(46 + i, y0 + 6, col);
      p.set(46 + i, y0 + 7, spark);
    }
  } else if (dir === "left") {
    for (let i = 0; i < 10; i++) {
      p.set(16 - i, y0 + 6, col);
      p.set(16 - i, y0 + 7, spark);
    }
  } else {
    for (let i = 0; i < 8; i++) p.set(28 + i, y0 - 2, col);
  }
}

function applyFlash(p: Pix, amount: number) {
  if (amount <= 0) return;
  for (let i = 0; i < p.data.length; i += 4) {
    if (p.data[i + 3]! < 8) continue;
    p.data[i] = Math.min(255, p.data[i]! + Math.round(120 * amount));
    p.data[i + 1] = Math.min(255, p.data[i + 1]! + Math.round(120 * amount));
    p.data[i + 2] = Math.min(255, p.data[i + 2]! + Math.round(120 * amount));
  }
}

export function renderFrame(
  character: Character,
  action: ActionId,
  direction: Direction,
  frame: number,
): Pix {
  const body = new Pix(CELL, CELL);
  const kit = character.kit;
  const pose = poseFor(action, frame);
  const y0 = 23 + pose.bob + Math.round(pose.fallen * 3);

  if (pose.smear > 0 && (direction === "left" || direction === "right")) {
    const sign = direction === "left" ? 1 : -1;
    const a = Math.min(90, 28 * pose.smear);
    body.rect(32 + sign * 9, 22, 3, 24, [kit.cape ? kit.cape[0] : 160, 40, 40, a]);
  }

  if (direction === "up") {
    drawWeapon(body, kit, direction, pose, y0);
    drawShield(body, kit, direction, pose, y0);
    drawLegs(body, kit, direction, pose, y0);
    drawTorso(body, kit, direction, pose, y0);
    drawHead(body, kit, direction, pose, y0);
    drawCape(body, kit, direction, pose, y0);
  } else if (direction === "right") {
    drawCape(body, kit, direction, pose, y0);
    drawShield(body, kit, direction, pose, y0);
    drawLegs(body, kit, direction, pose, y0);
    drawTorso(body, kit, direction, pose, y0);
    drawHead(body, kit, direction, pose, y0);
    drawWeapon(body, kit, direction, pose, y0);
  } else if (direction === "left") {
    drawCape(body, kit, direction, pose, y0);
    drawWeapon(body, kit, direction, pose, y0);
    drawLegs(body, kit, direction, pose, y0);
    drawTorso(body, kit, direction, pose, y0);
    drawHead(body, kit, direction, pose, y0);
    drawShield(body, kit, direction, pose, y0);
  } else {
    drawCape(body, kit, direction, pose, y0);
    drawLegs(body, kit, direction, pose, y0);
    drawWeapon(body, kit, direction, pose, y0);
    drawTorso(body, kit, direction, pose, y0);
    drawHead(body, kit, direction, pose, y0);
    drawShield(body, kit, direction, pose, y0);
  }

  drawVfx(body, direction, pose, y0);
  strokeOutline(body);
  applyFlash(body, pose.flash);

  const out = new Pix(CELL, CELL);
  const squash = 1 + pose.fallen * 0.5;
  out.ellipse(32 + pose.knockX, 57, Math.round(9 * squash), 3, SHADOW);
  blit(out, body, 0, 0);
  return out;
}

export function blit(dest: Pix, src: Pix, dx: number, dy: number) {
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const i = (y * src.w + x) * 4;
      const a = src.data[i + 3]!;
      if (a === 0) continue;
      dest.set(dx + x, dy + y, [src.data[i]!, src.data[i + 1]!, src.data[i + 2]!, a]);
    }
  }
}
