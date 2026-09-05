import { Download } from "lucide-react";
import { CELL, HITBOX, MASTER_HEIGHT, MASTER_WIDTH, PIVOT } from "@/lib/spriteforge/contract";
import { buildAtlas } from "@/lib/spriteforge/atlas";
import { useStudio } from "@/lib/spriteforge/store";
import { Badge, DiffBadge, GoldBtn, Panel, StatBar } from "./bits";

export function Dossier() {
  const character = useStudio((s) => s.character());
  const atlas = buildAtlas(character);

  return (
    <Panel className="flex flex-col gap-4">
      <div>
        <p className="font-sans text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
          {character.role}
        </p>
        <h2 className="font-display text-3xl leading-none text-fg sm:text-4xl">{character.name}</h2>
        <p className="mt-1 font-sans text-sm text-muted">{character.title}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DiffBadge d={character.difficulty} />
        <span className="font-sans text-xs text-muted">{character.weapon}</span>
      </div>

      <p className="font-sans text-sm leading-relaxed text-fg/90">{character.lore}</p>

      <div className="flex flex-col gap-2 rounded-md border border-border bg-bg-deep p-3">
        <StatBar label="HP" value={character.stats.hp} max={760} />
        <StatBar label="ATQ" value={character.stats.atk} max={96} />
        <StatBar label="DEF" value={character.stats.def} max={86} />
        <StatBar
          label="SPD"
          value={character.stats.spd}
          max={5.6}
          format={(n) => n.toFixed(1)}
        />
      </div>

      <div className="rounded-md border border-gold/30 bg-gold/5 p-3">
        <p className="font-sans text-[10px] font-semibold tracking-[0.16em] text-gold uppercase">
          Habilidade Survivor
        </p>
        <p className="mt-1 font-display text-base text-fg">{character.survivorSkill.name}</p>
        <p className="mt-0.5 font-sans text-sm text-muted">{character.survivorSkill.desc}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {character.tags.map((t) => (
          <Badge key={t} className="border-border text-muted">
            {t}
          </Badge>
        ))}
      </div>

      <div className="gold-rule" />

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[11px] text-muted">
        <dt>Célula</dt>
        <dd className="text-right text-fg">
          {CELL}×{CELL} px
        </dd>
        <dt>Pivot</dt>
        <dd className="text-right text-fg">
          ({PIVOT.x}, {PIVOT.y})
        </dd>
        <dt>Hitbox</dt>
        <dd className="text-right text-fg">
          {HITBOX.w}×{HITBOX.h} @ {HITBOX.x},{HITBOX.y}
        </dd>
        <dt>Sheet master</dt>
        <dd className="text-right text-fg">
          {MASTER_WIDTH}×{MASTER_HEIGHT}
        </dd>
        <dt>Layout</dt>
        <dd className="text-right text-fg">{atlas.sheet.layout}</dd>
        <dt>Spec</dt>
        <dd className="text-right text-fg">atlas {atlas.specVersion}</dd>
      </dl>

      <GoldBtn
        onClick={async () => {
          const { exportAtlasJson } = await import("@/lib/spriteforge/export/pack");
          exportAtlasJson(character);
        }}
        className="w-full min-h-10"
      >
        <Download className="size-3.5" />
        Baixar atlas.json
      </GoldBtn>
    </Panel>
  );
}
