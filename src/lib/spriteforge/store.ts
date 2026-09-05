import { create } from "zustand";
import {
  ACTION_META,
  type ActionId,
  type BgId,
  type Direction,
  type EngineId,
  type TabId,
  type ZoomLevel,
} from "./contract";
import { getCharacter } from "./roster";
import { getSheet, subscribePack } from "./sheet";
import type { Character } from "./types";

export { getSheet };

export type StudioState = {
  tab: TabId;
  selectedId: string;
  action: ActionId;
  direction: Direction;
  playing: boolean;
  loop: boolean;
  fps: number;
  frame: number;
  zoom: ZoomLevel;
  bg: BgId;
  onion: boolean;
  grid: boolean;
  hitbox: boolean;
  engine: EngineId;
  rarityFilter: "todas" | "basico" | "raro" | "epico" | "lendario" | "imortal";
  armorFilter: "todas" | "leve" | "media" | "pesada";
  packEpoch: number;
  bumpPack: () => void;
  setTab: (tab: TabId) => void;
  select: (id: string) => void;
  setAction: (action: ActionId) => void;
  setDirection: (d: Direction) => void;
  setPlaying: (v: boolean) => void;
  togglePlaying: () => void;
  setLoop: (v: boolean) => void;
  setFps: (n: number) => void;
  setFrame: (n: number) => void;
  setZoom: (z: ZoomLevel) => void;
  setBg: (bg: BgId) => void;
  setOnion: (v: boolean) => void;
  setGrid: (v: boolean) => void;
  setHitbox: (v: boolean) => void;
  setEngine: (e: EngineId) => void;
  setRarityFilter: (v: StudioState["rarityFilter"]) => void;
  setArmorFilter: (v: StudioState["armorFilter"]) => void;
  character: () => Character;
  frameCount: () => number;
};

export const useStudio = create<StudioState>((set, get) => ({
  tab: "guerreiros",
  selectedId: "templar",
  action: "walk",
  direction: "down",
  playing: true,
  loop: true,
  fps: 8,
  frame: 0,
  zoom: 4,
  bg: "xadrez",
  onion: false,
  grid: false,
  hitbox: false,
  engine: "godot",
  rarityFilter: "todas",
  armorFilter: "todas",
  packEpoch: 0,
  bumpPack: () => set((s) => ({ packEpoch: s.packEpoch + 1 })),
  setTab: (tab) => set({ tab }),
  select: (id) => set({ selectedId: id, frame: 0 }),
  setAction: (action) => {
    const meta = ACTION_META[action];
    set({
      action,
      frame: 0,
      fps: meta.fps,
      loop: meta.loop,
      playing: true,
    });
  },
  setDirection: (direction) => set({ direction, frame: 0 }),
  setPlaying: (playing) => set({ playing }),
  togglePlaying: () => set({ playing: !get().playing }),
  setLoop: (loop) => set({ loop }),
  setFps: (fps) => set({ fps: Math.max(1, Math.min(24, Math.round(fps))) }),
  setFrame: (frame) => set({ frame }),
  setZoom: (zoom) => set({ zoom }),
  setBg: (bg) => set({ bg }),
  setOnion: (onion) => set({ onion }),
  setGrid: (grid) => set({ grid }),
  setHitbox: (hitbox) => set({ hitbox }),
  setEngine: (engine) => set({ engine }),
  setRarityFilter: (rarityFilter) => set({ rarityFilter }),
  setArmorFilter: (armorFilter) => set({ armorFilter }),
  character: () => getCharacter(get().selectedId),
  frameCount: () => ACTION_META[get().action].frames,
}));

if (typeof window !== "undefined") {
  subscribePack(() => useStudio.getState().bumpPack());
}
