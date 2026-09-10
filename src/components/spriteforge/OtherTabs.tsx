import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Mountain,
  Skull,
  Sparkles,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { CELL, LAYERS } from "@/lib/spriteforge/contract";
import { EQUIPMENT, FAMILY_LABEL, RARITY_LABEL } from "@/lib/spriteforge/equipment";
import { generateConceptArt } from "@/lib/spriteforge/gerador";
import { renderFrame } from "@/lib/spriteforge/render";
import { useStudio } from "@/lib/spriteforge/store";
import { Badge, GhostBtn, GoldBtn, Panel, RARITY_CLASS } from "./bits";
import { Portrait } from "./PixelView";

function Soon({
  icon: Icon,
  title,
  copy,
  children,
}: {
  icon: LucideIcon;
  title: string;
  copy: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="font-sans text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
          Próxima etapa
        </p>
        <h2 className="font-display text-3xl text-fg">{title}</h2>
        <p className="mt-1 max-w-2xl font-sans text-sm text-muted">{copy}</p>
      </header>
      {children}
      <Panel className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 text-gold" />
        <p className="font-sans text-sm text-muted">
          Layout pronto. Pipeline da aba 2 (player + atlas + pack Godot) fecha primeiro — depois
          esta superfície liga no mesmo contrato 64×64.
        </p>
      </Panel>
    </div>
  );
}

const CELL_PREVIEW_SIZE = CELL * 3;

export function TabGerador() {
  const [prompt, setPrompt] = useState(
    "Cavaleiro templário, túnica branca, cruz vermelha, capa escarlate, elmo de fenda, top-down 64×64…",
  );
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ dataUrl: string; usd: number | null } | null>(null);

  const canGenerate = status !== "loading" && prompt.trim().length >= 3;

  async function handleGenerate() {
    setStatus("loading");
    setError(null);
    try {
      const res = await generateConceptArt({ data: { prompt } });
      setResult({ dataUrl: res.dataUrl, usd: res.usd });
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar o rascunho.");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="font-sans text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
          PixelLab
        </p>
        <h2 className="font-display text-3xl text-fg">Gerador de Imagem</h2>
        <p className="mt-1 max-w-2xl font-sans text-sm text-muted">
          IA só como rascunho de conceito. Guarda-rail: célula 64×64, pivot (32, 56), paleta ≤ 24
          cores. Source of truth continua sendo o paper-doll.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel className="flex flex-col gap-3">
          <label className="font-sans text-[11px] tracking-wider text-muted uppercase">
            Prompt de conceito
          </label>
          <textarea
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none rounded-md border border-border bg-bg-deep p-3 font-sans text-sm text-fg"
          />
          <div className="flex items-center gap-3">
            <GoldBtn onClick={handleGenerate} disabled={!canGenerate}>
              {status === "loading" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {status === "loading" ? "Gerando…" : "Gerar rascunho"}
            </GoldBtn>
            {result?.usd != null && (
              <span className="font-mono text-[11px] text-subtle">
                custo ~US$ {result.usd.toFixed(3)}
              </span>
            )}
          </div>
          {status === "error" && error && (
            <p className="flex items-start gap-2 rounded-md border border-hard/40 bg-hard/10 p-2 font-sans text-xs text-hard">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {error}
            </p>
          )}
          {result && (
            <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-bg-deep p-4">
              <img
                src={result.dataUrl}
                alt="Rascunho de conceito gerado por IA"
                width={CELL_PREVIEW_SIZE}
                height={CELL_PREVIEW_SIZE}
                className="pixelated"
                style={{
                  imageRendering: "pixelated",
                  width: CELL_PREVIEW_SIZE,
                  height: CELL_PREVIEW_SIZE,
                }}
              />
              <p className="font-sans text-xs text-muted">
                Rascunho de conceito — não alimenta o paper-doll automaticamente.
              </p>
            </div>
          )}
        </Panel>
        <Panel className="flex flex-col gap-2 font-mono text-xs text-muted">
          <p className="font-sans text-[10px] tracking-wider text-gold uppercase">Guarda-rail</p>
          <p>célula 64×64</p>
          <p>pivot 32, 56</p>
          <p>outline 1px</p>
          <p>paleta 16–24</p>
          <p>4 dirs · 7 ações</p>
        </Panel>
      </div>
    </div>
  );
}

export function TabCenario() {
  return (
    <Soon
      icon={Mountain}
      title="Cenário Survivor & Magias"
      copy="Tileset e VFX no mesmo contrato de célula. Ainda não entra no pack v1 — o herói piloto fecha primeiro."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {["Gramado", "Pedra", "Areia", "Cripta", "Fogo", "Gelo", "Raio", "Sagrado"].map((n) => (
          <Panel key={n} className="flex h-28 items-end">
            <span className="font-display text-sm text-fg">{n}</span>
          </Panel>
        ))}
      </div>
    </Soon>
  );
}

export function TabInimigos() {
  return (
    <Soon
      icon={Skull}
      title="Inimigos & Bosses"
      copy="Mesmo atlas, mesma célula. Placeholders até o Templário fechar as 7 ações com arte de catálogo."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {["Esqueleto", "Goblin", "Wraith", "Ogro", "Boss: Lichelord"].map((n) => (
          <Panel key={n} className="h-32">
            <p className="font-display text-fg">{n}</p>
            <p className="font-sans text-xs text-muted">64×64 · 4 dirs</p>
          </Panel>
        ))}
      </div>
    </Soon>
  );
}

export function TabMontagem() {
  const character = useStudio((s) => s.character());
  const pix = useMemo(() => renderFrame(character, "walk", "down", 0), [character]);
  return (
    <Soon
      icon={Layers}
      title="Base & Montagem Modular"
      copy="Paper-doll em 8 layers. Trocar equipamento não move o pivot. A montagem já alimenta o player da aba 2."
    >
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Panel className="flex flex-col items-center gap-3">
          {character.id === "templar" ? (
            <img
              src="/packs/templar-v3/thumbs/idle_down.png?v=4"
              alt=""
              width={192}
              height={192}
              className="pixelated"
              style={{ imageRendering: "pixelated", width: 192, height: 192 }}
            />
          ) : (
            <Portrait pix={pix} scale={3} />
          )}
          <p className="font-display text-sm text-fg">{character.name}</p>
        </Panel>
        <Panel>
          <ol className="flex flex-col gap-2">
            {LAYERS.map((l, i) => (
              <li
                key={l}
                className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2"
              >
                <span className="font-mono text-xs text-muted">{i}</span>
                <span className="font-sans text-sm text-fg">{l}</span>
                <span className="font-mono text-[11px] text-subtle">
                  {character.layers[l] ?? "kit default"}
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </Soon>
  );
}

export function TabArmory() {
  const rarity = useStudio((s) => s.rarityFilter);
  const armor = useStudio((s) => s.armorFilter);
  const items = EQUIPMENT.filter((e) => {
    if (rarity !== "todas" && e.rarity !== rarity) return false;
    if (armor !== "todas" && e.armor !== armor) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="font-sans text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
          Armory v0
        </p>
        <h2 className="font-display text-3xl text-fg">Equipamentos</h2>
        <p className="mt-1 max-w-2xl font-sans text-sm text-muted">
          Catálogo mínimo tipado. Dual view sprite / ícone 32×32 e o “equipar no herói” entram
          depois do pack Godot do Templário.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["todas", "basico", "raro", "epico", "lendario", "imortal"] as const).map((r) => (
          <GhostBtn
            key={r}
            active={rarity === r}
            onClick={() => useStudio.getState().setRarityFilter(r)}
          >
            {r === "todas" ? "Todas" : RARITY_LABEL[r]}
          </GhostBtn>
        ))}
        <span className="mx-2 w-px bg-border" />
        {(["todas", "leve", "media", "pesada"] as const).map((a) => (
          <GhostBtn
            key={a}
            active={armor === a}
            onClick={() => useStudio.getState().setArmorFilter(a)}
          >
            {a === "todas" ? "Todas" : a === "leve" ? "Leve" : a === "media" ? "Média" : "Pesada"}
          </GhostBtn>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((e) => (
          <Panel key={e.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-base text-fg">{e.name}</h3>
              <Badge className={RARITY_CLASS[e.rarity]}>{RARITY_LABEL[e.rarity]}</Badge>
            </div>
            <p className="font-sans text-xs text-muted">
              {FAMILY_LABEL[e.family]} · {e.slot}
            </p>
            <div className="flex gap-4 font-mono text-xs tabular-nums">
              <span>ATQ {e.atk}</span>
              <span>DEF {e.def}</span>
            </div>
            {e.special && <p className="font-sans text-xs text-gold/80">{e.special}</p>}
          </Panel>
        ))}
      </div>
    </div>
  );
}
