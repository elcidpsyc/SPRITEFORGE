import { useMemo, useState } from "react";
import { Download, Package } from "lucide-react";
import {
  ACTION_META,
  ACTIONS,
  DIRECTIONS,
  ENGINE_LABEL,
  ENGINES,
  MASTER_COLS,
  type EngineId,
} from "@/lib/spriteforge/contract";
import { getSheet, useStudio } from "@/lib/spriteforge/store";
import { toast } from "sonner";
import { GoldBtn, GhostBtn, Panel } from "./bits";
import { SheetCanvas } from "./PixelView";

export function SheetPanel() {
  const selectedId = useStudio((s) => s.selectedId);
  const engine = useStudio((s) => s.engine);
  const packEpoch = useStudio((s) => s.packEpoch);
  const character = useStudio((s) => s.character());
  const bundle = useMemo(() => getSheet(selectedId), [selectedId, packEpoch]);
  const [busy, setBusy] = useState(false);

  async function pack() {
    return import("@/lib/spriteforge/export/pack");
  }

  async function wrap(label: string, fn: () => Promise<void> | void) {
    try {
      setBusy(true);
      await fn();
      toast.success(label);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no export");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel className="flex flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-sans text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
            Contrato 1.0
          </p>
          <h3 className="font-display text-xl text-fg">Spritesheet Completa</h3>
          <p className="font-sans text-xs text-muted">
            Opção B · 7 ações × 4 dirs × 8 colunas · 512×1792 · células 64×64. Ações de 6 frames
            deixam as colunas 7–8 transparentes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GoldBtn
            disabled={busy}
            onClick={() =>
              wrap("PNG da sheet", async () => {
                const m = await pack();
                await m.exportPng(character, "master");
              })
            }
          >
            .PNG
          </GoldBtn>
          <GoldBtn
            disabled={busy}
            onClick={() =>
              wrap("JPG da sheet", async () => {
                const m = await pack();
                await m.exportJpg(character);
              })
            }
          >
            .JPG
          </GoldBtn>
          <GoldBtn
            disabled={busy}
            onClick={() =>
              wrap("SVG do ícone", async () => {
                const m = await pack();
                m.exportSvg(character);
              })
            }
          >
            .SVG
          </GoldBtn>
          <GoldBtn
            disabled={busy}
            onClick={() =>
              wrap("atlas.json", async () => {
                const m = await pack();
                m.exportAtlasJson(character);
              })
            }
          >
            atlas.json
          </GoldBtn>
          <GoldBtn
            disabled={busy}
            className="bg-gold text-gold-ink hover:bg-gold/90"
            onClick={() =>
              wrap("Game Pack ZIP", async () => {
                const m = await pack();
                await m.exportBatchZip(character);
              })
            }
          >
            <Package className="size-3.5" />
            Batch Export
          </GoldBtn>
          <label className="flex min-h-10 items-center gap-2 rounded-md border border-border bg-surface-2 px-2">
            <span className="font-sans text-[10px] tracking-wider text-muted uppercase">Pack</span>
            <select
              value={engine}
              onChange={(e) => useStudio.getState().setEngine(e.target.value as EngineId)}
              className="bg-transparent font-sans text-xs text-fg outline-none"
            >
              {ENGINES.map((e) => (
                <option key={e} value={e} className="bg-surface">
                  {ENGINE_LABEL[e]}
                </option>
              ))}
            </select>
          </label>
          <GhostBtn
            disabled={busy}
            onClick={() =>
              wrap(`Pack ${ENGINE_LABEL[engine]}`, async () => {
                const m = await pack();
                await m.exportEnginePack(character, engine);
              })
            }
          >
            <Download className="size-3.5" />
            Baixar pack
          </GhostBtn>
        </div>
      </header>

      <div className="overflow-auto rounded-lg border border-border bg-bg-deep p-3">
        <div className="flex min-w-0 gap-2">
          <div className="hidden w-16 shrink-0 sm:block" style={{ height: 1792 }}>
            {ACTIONS.map((a) => (
              <div key={a} className="flex items-start pt-1" style={{ height: 256 }}>
                <span className="font-sans text-[10px] tracking-wider text-muted uppercase">
                  {ACTION_META[a].label}
                </span>
              </div>
            ))}
          </div>
          <div>
            <div className="mb-1 flex w-[512px] font-mono text-[10px] text-subtle">
              {Array.from({ length: MASTER_COLS }, (_, i) => (
                <span key={i} className="w-16 text-center">
                  {i + 1}
                </span>
              ))}
            </div>
            <SheetCanvas pix={bundle.master} className="rounded-sm" />
            <div className="mt-2 flex w-[512px] justify-between font-sans text-[10px] tracking-wider text-subtle uppercase">
              {DIRECTIONS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
