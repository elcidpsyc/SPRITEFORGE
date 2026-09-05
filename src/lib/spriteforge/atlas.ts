import {
  ACTION_META,
  ACTIONS,
  CELL,
  HITBOX,
  PIVOT,
  SPEC_VERSION,
  type ActionId,
} from "./contract";
import type { Atlas, Character } from "./types";

export function buildAtlas(character: Character): Atlas {
  const animations = Object.fromEntries(
    ACTIONS.map((id) => {
      const m = ACTION_META[id];
      return [
        id,
        {
          frames: m.frames,
          fps: m.fps,
          loop: m.loop,
          holdLast: m.holdLast,
          ...(m.hitFrame !== undefined ? { hitFrame: m.hitFrame } : {}),
        },
      ];
    }),
  ) as Atlas["animations"];

  const perAction = Object.fromEntries(
    ACTIONS.map((id) => [id, `engines/_shared/${id}.png`]),
  ) as Record<ActionId, string>;

  return {
    specVersion: SPEC_VERSION,
    id: character.id,
    name: character.name,
    title: character.title,
    cell: { w: CELL, h: CELL },
    pivot: { ...PIVOT },
    hitbox: { ...HITBOX },
    directions: ["down", "up", "right", "left"],
    sheet: {
      master: "sheet.png",
      layout: "actionsStacked",
      cols: 8,
      actionOrder: [...ACTIONS],
      perAction,
    },
    animations,
    icons: {
      hud32: "icons/idle_32.png",
      hud32svg: "icons/idle_32.svg",
    },
    stats: character.stats,
    survivorSkill: character.survivorSkill,
  };
}
