import { ACTION_META, type ActionId } from "./contract";
import type { Pose } from "./types";

const idle: Pose = {
  bob: 0,
  legL: 0,
  legR: 0,
  lean: 0,
  cape: 0,
  swordAngle: 0,
  swordReach: 0,
  shieldRaise: 0,
  knockX: 0,
  fallen: 0,
  smear: 0,
  flash: 0,
  vfx: 0,
};

function mix(a: Pose, b: Pose, t: number): Pose {
  const k = (key: keyof Pose) => Math.round(a[key] + (b[key] - a[key]) * t);
  return {
    bob: k("bob"),
    legL: k("legL"),
    legR: k("legR"),
    lean: k("lean"),
    cape: k("cape"),
    swordAngle: a.swordAngle + (b.swordAngle - a.swordAngle) * t,
    swordReach: k("swordReach"),
    shieldRaise: k("shieldRaise"),
    knockX: k("knockX"),
    fallen: a.fallen + (b.fallen - a.fallen) * t,
    smear: k("smear"),
    flash: a.flash + (b.flash - a.flash) * t,
    vfx: a.vfx + (b.vfx - a.vfx) * t,
  };
}

const WALK: Pose[] = [
  { ...idle, bob: 0, legL: 2, legR: -2, cape: -1 },
  { ...idle, bob: 1, legL: 3, legR: -3, cape: -2 },
  { ...idle, bob: 0, legL: 1, legR: -1, cape: -1 },
  { ...idle, bob: 0, legL: -1, legR: 1, cape: 0 },
  { ...idle, bob: 0, legL: -2, legR: 2, cape: 1 },
  { ...idle, bob: 1, legL: -3, legR: 3, cape: 2 },
  { ...idle, bob: 0, legL: -1, legR: 1, cape: 1 },
  { ...idle, bob: 0, legL: 1, legR: -1, cape: 0 },
];

const RUN: Pose[] = [
  { ...idle, bob: 0, legL: 3, legR: -3, cape: -2, lean: 1, smear: 1 },
  { ...idle, bob: 2, legL: 4, legR: -4, cape: -3, lean: 1, smear: 1 },
  { ...idle, bob: 0, legL: 2, legR: -2, cape: -2, lean: 1 },
  { ...idle, bob: -1, legL: -1, legR: 1, cape: 0, lean: 1 },
  { ...idle, bob: 0, legL: -3, legR: 3, cape: 2, lean: 1, smear: 1 },
  { ...idle, bob: 2, legL: -4, legR: 4, cape: 3, lean: 1, smear: 1 },
  { ...idle, bob: 0, legL: -2, legR: 2, cape: 2, lean: 1 },
  { ...idle, bob: -1, legL: 1, legR: -1, cape: 0, lean: 1 },
];

const ATTACK: Pose[] = [
  { ...idle, swordAngle: -50, swordReach: -3, shieldRaise: 1, cape: 1 },
  { ...idle, swordAngle: -80, swordReach: -4, shieldRaise: 2, cape: 2, bob: -1 },
  { ...idle, swordAngle: -20, swordReach: 2, shieldRaise: 1, cape: -1, lean: 1 },
  {
    ...idle,
    swordAngle: 55,
    swordReach: 6,
    shieldRaise: 0,
    cape: -3,
    lean: 2,
    vfx: 1,
    smear: 2,
  },
  { ...idle, swordAngle: 70, swordReach: 5, cape: -2, lean: 1, vfx: 0.6 },
  { ...idle, swordAngle: 40, swordReach: 2, cape: -1, lean: 0 },
  { ...idle, swordAngle: 15, swordReach: 1, cape: 0 },
  { ...idle, swordAngle: 0, swordReach: 0, cape: 0 },
];

const GUARD: Pose[] = [
  { ...idle, shieldRaise: 2, swordAngle: -10, bob: 0 },
  { ...idle, shieldRaise: 4, swordAngle: -15, bob: 0, lean: -1 },
  { ...idle, shieldRaise: 6, swordAngle: -20, bob: 1, lean: -1 },
  { ...idle, shieldRaise: 7, swordAngle: -22, bob: 1, lean: -1 },
  { ...idle, shieldRaise: 7, swordAngle: -22, bob: 1, lean: -1 },
  { ...idle, shieldRaise: 7, swordAngle: -22, bob: 1, lean: -1 },
];

const DASH: Pose[] = [
  { ...idle, lean: 2, smear: 1, cape: -2, bob: -1 },
  { ...idle, lean: 3, smear: 3, cape: -4, bob: 0, knockX: 2 },
  { ...idle, lean: 3, smear: 4, cape: -5, bob: 0, knockX: 3 },
  { ...idle, lean: 2, smear: 3, cape: -3, bob: 1, knockX: 2 },
  { ...idle, lean: 1, smear: 1, cape: -1, bob: 0, knockX: 1 },
  { ...idle, lean: 0, smear: 0, cape: 0, bob: 0 },
];

const HURT: Pose[] = [
  { ...idle, flash: 0.8, knockX: -1, bob: 0 },
  { ...idle, flash: 1, knockX: -2, bob: 1, cape: 2 },
  { ...idle, flash: 0.5, knockX: -2, bob: 1, cape: 2, swordAngle: -20 },
  { ...idle, flash: 0.2, knockX: -1, bob: 0, cape: 1 },
  { ...idle, flash: 0, knockX: 0, bob: 0 },
  { ...idle },
];

const DEATH: Pose[] = [
  { ...idle, knockX: -1, bob: 0, flash: 0.4 },
  { ...idle, knockX: -2, bob: 1, cape: 2, swordAngle: -30 },
  { ...idle, knockX: -2, bob: 2, fallen: 0.2, cape: 3 },
  { ...idle, knockX: -1, bob: 4, fallen: 0.45, cape: 2, swordAngle: -50 },
  { ...idle, knockX: 0, bob: 8, fallen: 0.7, cape: 1, swordAngle: -80 },
  { ...idle, knockX: 1, bob: 12, fallen: 0.9, cape: 0, swordAngle: -90 },
  { ...idle, knockX: 2, bob: 14, fallen: 1, cape: 0, swordAngle: -90 },
  { ...idle, knockX: 2, bob: 14, fallen: 1, cape: 0, swordAngle: -90 },
];

const TABLES: Record<ActionId, Pose[]> = {
  walk: WALK,
  run: RUN,
  attack: ATTACK,
  guard: GUARD,
  dash: DASH,
  hurt: HURT,
  death: DEATH,
};

export function poseFor(action: ActionId, frame: number): Pose {
  const table = TABLES[action];
  const n = ACTION_META[action].frames;
  const i = ((frame % n) + n) % n;
  return table[i] ?? idle;
}

export { mix };
