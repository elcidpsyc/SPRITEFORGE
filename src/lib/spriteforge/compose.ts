import { CELL, PIVOT, type Direction } from "./contract.ts";
import { applyFlash, blit, Pix, strokeOutline, type RGBA } from "./render.ts";
import type { PartLayerId, Pose } from "./types.ts";

export type { PartLayerId };

export type PartSet = Partial<Record<PartLayerId, Pix>> & {
  /** Slash/arc overlays keyed by the v4 reference attack-frame number they were cut from (4, 5, 6). */
  vfx?: Partial<Record<number, Pix>>;
};

export type PartAnchors = Partial<Record<PartLayerId, { x: number; y: number }>>;

const SHADOW: RGBA = [0, 0, 0, 88];

/**
 * A 64px-wide cell mirrors around the gap between columns 31 and 32, not
 * around column 32 itself — reversing an array of width 64 sends column x to
 * column (63 - x). PIVOT.x is 32, so anything drawn centered on PIVOT.x for
 * `left` lands 1px off from the mirror of the same thing drawn on `right`.
 * Body parts don't care (they're pre-positioned pixels, offset the same way
 * on both sides — see the sign flip in transformPart), but anything compose
 * itself centers on the pivot (the shadow, the death-fall rotation anchor)
 * needs this adjustment to stay bit-exact with templar-v5.test.ts's mirror
 * check.
 */
function mirrorPivotX(direction: Direction): number {
  return direction === "left" ? CELL - 1 - PIVOT.x : PIVOT.x;
}

/** Vertical midpoint of the standing silhouette (not the feet) — rotating the
 * whole set around the feet for the death animation would fling the head far
 * outside the cell; rotating around the body's own center keeps the 0→90°
 * fall inside the contract's bbox bounds (see templar-v5 tests). */
const FALLEN_ROTATION_ANCHOR_Y = 34;

function snap15(deg: number): number {
  return Math.round(deg / 15) * 15;
}

function clonePix(src: Pix): Pix {
  return new Pix(src.w, src.h, new Uint8ClampedArray(src.data));
}

function offsetPix(src: Pix, dx: number, dy: number): Pix {
  if (dx === 0 && dy === 0) return clonePix(src);
  const out = new Pix(src.w, src.h);
  blit(out, src, dx, dy);
  return out;
}

/** bob shifts every row; lean only shifts rows above the cell's vertical midline. */
function offsetWithLean(src: Pix, bob: number, lean: number, midY = CELL / 2): Pix {
  if (bob === 0 && lean === 0) return clonePix(src);
  const out = new Pix(src.w, src.h);
  for (let y = 0; y < src.h; y++) {
    const dx = y < midY ? lean : 0;
    for (let x = 0; x < src.w; x++) {
      const i = (y * src.w + x) * 4;
      const a = src.data[i + 3]!;
      if (a === 0) continue;
      out.set(x + dx, y + bob, [src.data[i]!, src.data[i + 1]!, src.data[i + 2]!, a]);
    }
  }
  return out;
}

/** Nearest-neighbour rotation (inverse-mapped, so the result has no holes) around an anchor point. Never scales. */
function rotatePix(src: Pix, angleDeg: number, anchor: { x: number; y: number }): Pix {
  const angle = snap15(angleDeg);
  if (angle === 0) return clonePix(src);
  const rad = (-angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const out = new Pix(src.w, src.h);
  for (let oy = 0; oy < src.h; oy++) {
    for (let ox = 0; ox < src.w; ox++) {
      const dx = ox - anchor.x;
      const dy = oy - anchor.y;
      const sx = Math.round(anchor.x + dx * cos - dy * sin);
      const sy = Math.round(anchor.y + dx * sin + dy * cos);
      if (sx < 0 || sy < 0 || sx >= src.w || sy >= src.h) continue;
      const i = (sy * src.w + sx) * 4;
      const a = src.data[i + 3]!;
      if (a === 0) continue;
      out.set(ox, oy, [src.data[i]!, src.data[i + 1]!, src.data[i + 2]!, a]);
    }
  }
  return out;
}

/** Which slash_<dir>_<n>.png to show for the current vfx intensity (poses.ts
 * only ever sets vfx to 1 at the hit frame and 0.6 the frame after). */
export function vfxAssetFrame(vfx: number): 4 | 5 | null {
  if (vfx >= 0.9) return 4;
  if (vfx > 0) return 5;
  return null;
}

type LayerStep = PartLayerId | "legs";

// `left` intentionally reuses `right`'s stacking order instead of
// renderFrame's own (which swaps weapon/shield to put the "far" hand behind
// the torso). left's parts are pure horizontal mirrors of right's, and
// weapon/shield each overlap torso/head — with the swapped order, that
// overlap resolves differently on each side and left stops being an exact
// mirror of right (the paper-doll's own required invariant, see
// templar-v5.test.ts). Keeping the same order sacrifices that "far hand"
// detail for a guaranteed-symmetric result.
const DRAW_ORDER: Record<Direction, LayerStep[]> = {
  up: ["weapon", "shield", "legs", "torso", "head", "cape"],
  right: ["cape", "shield", "legs", "torso", "head", "weapon"],
  left: ["cape", "shield", "legs", "torso", "head", "weapon"],
  down: ["cape", "legs", "weapon", "torso", "head", "shield"],
};

function transformPart(
  name: PartLayerId,
  src: Pix,
  direction: Direction,
  pose: Pose,
  anchors: PartAnchors,
): Pix {
  const bob = pose.fallen > 0 ? 0 : pose.bob; // the fallen rotation already carries the collapse
  const anchor = anchors[name] ?? { x: PIVOT.x, y: PIVOT.y };
  // `left`'s parts are pixel-mirrors of `right`'s (see extract_parts.py), so
  // every horizontal displacement derived from a pose value has to flip sign
  // for `left` too, or the two directions drift out of mirror-symmetry.
  const sign = direction === "left" ? -1 : 1;

  if (name === "legs_l" || name === "legs_r") {
    const amount = name === "legs_l" ? pose.legL : pose.legR;
    const vertical = direction === "down" || direction === "up";
    return offsetPix(src, vertical ? 0 : amount * sign, vertical ? amount : 0);
  }

  if (name === "weapon") {
    let img = src;
    // Skip the weapon's own wrist rotation once the body starts collapsing:
    // the whole-set fallen rotation below already carries it, and stacking
    // both sends the blade tip flying past the cell edge.
    if (pose.fallen === 0) {
      const angle = snap15(pose.swordAngle * sign);
      if (angle !== 0) img = rotatePix(img, angle, anchor);
      if (pose.swordReach !== 0) {
        const rad = (angle * Math.PI) / 180;
        const rdx = Math.round(Math.cos(rad) * pose.swordReach);
        const rdy = Math.round(Math.sin(rad) * pose.swordReach);
        img = offsetPix(img, rdx, rdy);
      }
    }
    return offsetWithLean(img, bob, pose.lean * sign);
  }

  if (name === "shield") {
    return offsetWithLean(src, bob - pose.shieldRaise, pose.lean * sign);
  }

  if (name === "cape") {
    // pose.cape is expected to already be the 1-frame-delayed value — see
    // poseForCompose(), which callers use to build `pose`.
    return offsetPix(offsetWithLean(src, bob, pose.lean * sign), pose.cape * sign, 0);
  }

  // torso, head
  return offsetWithLean(src, bob, pose.lean * sign);
}

/**
 * Composes one 64x64 frame from paper-doll parts, mirroring renderFrame's
 * output contract (a Pix with the drop shadow already baked in). `parts`
 * carries whatever layers exist for `direction` (missing ones are skipped —
 * e.g. templar-v4's down direction has no cape geometry). `anchors` supplies
 * each part's manifest anchor point (rotation pivot for the weapon).
 */
export function composeFrame(
  parts: PartSet,
  direction: Direction,
  pose: Pose,
  anchors: PartAnchors = {},
): Pix {
  const body = new Pix(CELL, CELL);

  for (const step of DRAW_ORDER[direction]) {
    if (step === "legs") {
      const l = parts.legs_l;
      const r = parts.legs_r;
      if (l) blit(body, transformPart("legs_l", l, direction, pose, anchors), 0, 0);
      if (r) blit(body, transformPart("legs_r", r, direction, pose, anchors), 0, 0);
      continue;
    }
    const src = parts[step];
    if (!src) continue;
    blit(body, transformPart(step, src, direction, pose, anchors), 0, 0);
  }

  const vfxFrame = vfxAssetFrame(pose.vfx);
  if (vfxFrame !== null) {
    const slash = parts.vfx?.[vfxFrame];
    if (slash) blit(body, slash, 0, 0);
  }

  strokeOutline(body);
  applyFlash(body, pose.flash);

  const pivotX = mirrorPivotX(direction);
  let finished = body;
  if (pose.fallen > 0) {
    finished = rotatePix(body, pose.fallen * 90, { x: pivotX, y: FALLEN_ROTATION_ANCHOR_Y });
  }

  const out = new Pix(CELL, CELL);
  const sign = direction === "left" ? -1 : 1;
  const squash = 1 + pose.fallen * 0.6;
  out.ellipse(pivotX + pose.knockX * sign, PIVOT.y + 1, Math.round(9 * squash), 3, SHADOW);
  blit(out, finished, 0, 0);
  return out;
}
