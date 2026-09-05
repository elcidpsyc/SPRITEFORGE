import { useEffect, useMemo } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Grid3x3,
  Pause,
  Play,
  Repeat,
} from "lucide-react";
import {
  ACTION_META,
  ACTIONS,
  BACKGROUNDS,
  ZOOM_LEVELS,
  type ActionId,
  type Direction,
} from "@/lib/spriteforge/contract";
import { getCell } from "@/lib/spriteforge/sheet";
import { getSheet, useStudio } from "@/lib/spriteforge/store";
import { cn } from "@/lib/utils";
import { GhostBtn, Panel } from "./bits";
import { PixelView } from "./PixelView";

const DIR_BTNS: { id: Direction; icon: typeof ArrowDown; label: string }[] = [
  { id: "down", icon: ArrowDown, label: "Baixo" },
  { id: "up", icon: ArrowUp, label: "Cima" },
  { id: "right", icon: ArrowRight, label: "Direita" },
  { id: "left", icon: ArrowLeft, label: "Esquerda" },
];

const BG_LABEL: Record<(typeof BACKGROUNDS)[number], string> = {
  xadrez: "Xadrez",
  preto: "Preto",
  grama: "Grama",
  areia: "Areia",
  pedra: "Pedra",
};

export function AnimationPlayer() {
  const selectedId = useStudio((s) => s.selectedId);
  const action = useStudio((s) => s.action);
  const direction = useStudio((s) => s.direction);
  const playing = useStudio((s) => s.playing);
  const loop = useStudio((s) => s.loop);
  const fps = useStudio((s) => s.fps);
  const frame = useStudio((s) => s.frame);
  const zoom = useStudio((s) => s.zoom);
  const bg = useStudio((s) => s.bg);
  const onion = useStudio((s) => s.onion);
  const grid = useStudio((s) => s.grid);
  const hitbox = useStudio((s) => s.hitbox);
  const packEpoch = useStudio((s) => s.packEpoch);

  const bundle = useMemo(() => getSheet(selectedId), [selectedId, packEpoch]);
  const meta = ACTION_META[action];
  const n = meta.frames;
  const cell = useMemo(
    () => getCell(bundle.master, action, direction, Math.min(frame, n - 1)),
    [bundle, action, direction, frame, n],
  );
  const onionCell = useMemo(() => {
    if (!onion) return null;
    const prev = (frame - 1 + n) % n;
    return getCell(bundle.master, action, direction, prev);
  }, [onion, bundle, action, direction, frame, n]);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let acc = 0;
    let raf = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      acc += dt;
      const interval = 1000 / Math.max(1, useStudio.getState().fps);
      while (acc >= interval) {
        acc -= interval;
        const s = useStudio.getState();
        const count = ACTION_META[s.action].frames;
        const hold = ACTION_META[s.action].holdLast;
        let next = s.frame + 1;
        if (next >= count) {
          if (s.loop) next = 0;
          else {
            useStudio.setState({ frame: count - 1, playing: hold ? false : false });
            return;
          }
        }
        useStudio.setState({ frame: next });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, action]);

  return (
    <Panel className="flex flex-col gap-3">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="font-sans text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
            Animation Player
          </p>
          <h3 className="font-display text-lg text-fg">Preview 64×64</h3>
        </div>
        <span className="font-mono text-xs tabular-nums text-muted">{fps} fps</span>
      </header>

      <div className="flex flex-wrap gap-1">
        {ACTIONS.map((id) => (
          <GhostBtn
            key={id}
            active={action === id}
            onClick={() => useStudio.getState().setAction(id as ActionId)}
          >
            {ACTION_META[id].label}
          </GhostBtn>
        ))}
      </div>

      <div className="flex justify-center rounded-lg border border-border bg-bg-deep p-3">
        <PixelView
          cell={cell}
          onion={onionCell}
          zoom={zoom}
          bg={bg}
          showGrid={grid}
          showHitbox={hitbox}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <GhostBtn
          active={playing}
          onClick={() => useStudio.getState().togglePlaying()}
          className="min-h-10 min-w-10"
          title={playing ? "Pausar" : "Play"}
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="ml-0.5 size-3.5" />}
        </GhostBtn>
        <GhostBtn
          active={loop}
          onClick={() => useStudio.getState().setLoop(!loop)}
          title="Loop"
          className="min-h-10"
        >
          <Repeat className="size-3.5" />
          Loop
        </GhostBtn>
        <label className="flex min-h-10 flex-1 items-center gap-2 rounded-md border border-border bg-surface-2 px-2">
          <span className="font-sans text-[10px] tracking-wider text-muted uppercase">FPS</span>
          <input
            type="range"
            min={4}
            max={16}
            value={fps}
            onChange={(e) => useStudio.getState().setFps(Number(e.target.value))}
            className="w-full accent-gold"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={n - 1}
          value={Math.min(frame, n - 1)}
          onChange={(e) => {
            useStudio.getState().setPlaying(false);
            useStudio.getState().setFrame(Number(e.target.value));
          }}
          className="flex-1 accent-gold"
        />
        <span className="min-w-28 text-right font-mono text-xs tabular-nums text-muted">
          Frame {Math.min(frame, n - 1) + 1}/{n} ({meta.label})
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-sans text-[10px] tracking-wider text-muted uppercase">Zoom</span>
        {ZOOM_LEVELS.map((z) => (
          <GhostBtn key={z} active={zoom === z} onClick={() => useStudio.getState().setZoom(z)}>
            {z}x
          </GhostBtn>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-sans text-[10px] tracking-wider text-muted uppercase">Fundo</span>
        {BACKGROUNDS.map((b) => (
          <GhostBtn key={b} active={bg === b} onClick={() => useStudio.getState().setBg(b)}>
            {BG_LABEL[b]}
          </GhostBtn>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-sans text-[10px] tracking-wider text-muted uppercase">Dir</span>
        {DIR_BTNS.map(({ id, icon: Icon, label }) => (
          <GhostBtn
            key={id}
            active={direction === id}
            onClick={() => useStudio.getState().setDirection(id)}
            title={label}
            className="min-h-10 min-w-10"
          >
            <Icon className="size-3.5" />
          </GhostBtn>
        ))}
        <GhostBtn active={onion} onClick={() => useStudio.getState().setOnion(!onion)}>
          Onion
        </GhostBtn>
        <GhostBtn active={grid} onClick={() => useStudio.getState().setGrid(!grid)}>
          <Grid3x3 className="size-3.5" />
          Grade 32
        </GhostBtn>
        <GhostBtn active={hitbox} onClick={() => useStudio.getState().setHitbox(!hitbox)}>
          Hitbox
        </GhostBtn>
      </div>

      {action === "attack" && (
        <p className={cn("font-sans text-[11px] text-muted")}>
          hitFrame = 3 (0-index) · o golpe conecta no 4º quadro.
        </p>
      )}
    </Panel>
  );
}
