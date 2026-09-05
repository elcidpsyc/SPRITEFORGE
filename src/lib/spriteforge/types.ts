import type { ActionId, Direction, LayerId } from "./contract";

export type Difficulty = "facil" | "medio" | "dificil" | "mestre";
export type Rarity = "basico" | "raro" | "epico" | "lendario" | "imortal";
export type ArmorClass = "leve" | "media" | "pesada";
export type WeaponFamily =
  | "adagas"
  | "arcos"
  | "espadas"
  | "machados"
  | "marretas"
  | "cajados"
  | "lancas"
  | "escudos";
export type EquipSlot = "weapon" | "shield" | "helm" | "chest" | "cape";

export type HelmStyle = "great" | "nasal" | "crest" | "horns" | "hood" | "none";
export type WeaponStyle =
  | "sword"
  | "spear"
  | "katana"
  | "hammer"
  | "bow"
  | "axes"
  | "daggers"
  | "staff"
  | "mace";
export type ShieldStyle = "kite" | "round" | "tower" | "none";

export type Character = {
  id: string;
  name: string;
  title: string;
  difficulty: Difficulty;
  role: string;
  weapon: string;
  lore: string;
  stats: { hp: number; atk: number; def: number; spd: number };
  survivorSkill: { name: string; desc: string };
  tags: string[];
  accent: string;
  layers: Partial<Record<LayerId, string>>;
  pilot?: boolean;
  kit: CharacterKit;
};

export type CharacterKit = {
  cloth: [number, number, number];
  clothShadow: [number, number, number];
  clothLight: [number, number, number];
  cape: [number, number, number] | null;
  capeShadow: [number, number, number] | null;
  leather: [number, number, number];
  metal: [number, number, number];
  metalLight: [number, number, number];
  metalDark: [number, number, number];
  accent: [number, number, number];
  accentDark: [number, number, number];
  helm: HelmStyle;
  weapon: WeaponStyle;
  shield: ShieldStyle;
  hasCape: boolean;
};

export type Equipment = {
  id: string;
  name: string;
  family: WeaponFamily;
  armor: ArmorClass;
  rarity: Rarity;
  atk: number;
  def: number;
  special?: string;
  slot: EquipSlot;
  icon32: string;
  spritePreview: string;
};

export type AtlasAnimation = {
  frames: number;
  fps: number;
  loop: boolean;
  holdLast: boolean;
  hitFrame?: number;
};

export type Atlas = {
  specVersion: "1.0";
  id: string;
  name: string;
  title: string;
  cell: { w: number; h: number };
  pivot: { x: number; y: number };
  hitbox: { x: number; y: number; w: number; h: number };
  directions: Direction[];
  sheet: {
    master: string;
    layout: "actionsStacked";
    cols: 8;
    actionOrder: ActionId[];
    perAction: Record<ActionId, string>;
  };
  animations: Record<ActionId, AtlasAnimation>;
  icons: { hud32: string; hud32svg: string };
  stats: Character["stats"];
  survivorSkill: Character["survivorSkill"];
};

export type Pose = {
  bob: number;
  legL: number;
  legR: number;
  lean: number;
  cape: number;
  swordAngle: number;
  swordReach: number;
  shieldRaise: number;
  knockX: number;
  fallen: number;
  smear: number;
  flash: number;
  vfx: number;
};
