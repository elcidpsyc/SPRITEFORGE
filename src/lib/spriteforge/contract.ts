export const SPEC_VERSION = "1.0" as const;

export const CELL = 64;
export const PIVOT = { x: 32, y: 56 } as const;
export const HITBOX = { x: 22, y: 20, w: 20, h: 36 } as const;

export const DIRECTIONS = ["down", "up", "right", "left"] as const;
export type Direction = (typeof DIRECTIONS)[number];

export const ACTIONS = [
  "walk",
  "run",
  "attack",
  "guard",
  "dash",
  "hurt",
  "death",
] as const;
export type ActionId = (typeof ACTIONS)[number];

export const ACTION_META: Record<
  ActionId,
  {
    id: ActionId;
    label: string;
    frames: number;
    fps: number;
    loop: boolean;
    holdLast: boolean;
    hitFrame?: number;
  }
> = {
  walk: { id: "walk", label: "Caminhada", frames: 8, fps: 8, loop: true, holdLast: false },
  run: { id: "run", label: "Corrida", frames: 8, fps: 12, loop: true, holdLast: false },
  attack: {
    id: "attack",
    label: "Ataque",
    frames: 8,
    fps: 10,
    loop: false,
    holdLast: false,
    hitFrame: 3,
  },
  guard: { id: "guard", label: "Defesa", frames: 6, fps: 8, loop: false, holdLast: true },
  dash: { id: "dash", label: "Dash", frames: 6, fps: 14, loop: false, holdLast: false },
  hurt: { id: "hurt", label: "Dano", frames: 6, fps: 10, loop: false, holdLast: false },
  death: { id: "death", label: "Morte", frames: 8, fps: 8, loop: false, holdLast: true },
};

export const MASTER_COLS = 8;
export const MASTER_ACTION_ROWS = 4; // dirs per action
export const MASTER_WIDTH = MASTER_COLS * CELL; // 512
export const MASTER_HEIGHT = ACTIONS.length * MASTER_ACTION_ROWS * CELL; // 1792

export const ACTION_SHEET_WIDTH = MASTER_COLS * CELL; // 512
export const ACTION_SHEET_HEIGHT = MASTER_ACTION_ROWS * CELL; // 256

export const ZOOM_LEVELS = [2, 3, 4, 6, 8] as const;
export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

export const BACKGROUNDS = ["xadrez", "preto", "grama", "areia", "pedra"] as const;
export type BgId = (typeof BACKGROUNDS)[number];

export const ENGINES = ["godot", "phaser", "pixi", "unity", "generico"] as const;
export type EngineId = (typeof ENGINES)[number];

export const ENGINE_LABEL: Record<EngineId, string> = {
  godot: "Godot 4",
  phaser: "Phaser 3",
  pixi: "PixiJS",
  unity: "Unity 2D",
  generico: "Genérico",
};

export const TABS = [
  { id: "gerador", label: "Gerador de Imagem", short: "Gerador" },
  { id: "guerreiros", label: "Guerreiros Medievais (10)", short: "Guerreiros" },
  { id: "cenario", label: "Cenário Survivor & Magias", short: "Cenário" },
  { id: "inimigos", label: "Inimigos & Bosses", short: "Inimigos" },
  { id: "montagem", label: "Base & Montagem Modular", short: "Montagem" },
  { id: "armory", label: "Equipamentos", short: "Armory" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

export const LAYERS = [
  "shadow",
  "legs",
  "torso",
  "cape",
  "head",
  "weapon",
  "shield",
  "vfx",
] as const;
export type LayerId = (typeof LAYERS)[number];
