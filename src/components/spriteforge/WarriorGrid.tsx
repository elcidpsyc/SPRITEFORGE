import { useMemo } from "react";
import { renderFrame } from "@/lib/spriteforge/render";
import { ROSTER } from "@/lib/spriteforge/roster";
import { useStudio } from "@/lib/spriteforge/store";
import { cn } from "@/lib/utils";
import { Badge, DiffBadge } from "./bits";
import { Portrait } from "./PixelView";

export function WarriorGrid() {
  const selectedId = useStudio((s) => s.selectedId);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {ROSTER.map((c) => {
        const selected = c.id === selectedId;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => useStudio.getState().select(c.id)}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-lg border bg-surface-2 text-left transition-colors duration-150",
              selected
                ? "border-gold shadow-[var(--shadow-gold)]"
                : "border-border hover:border-border-strong",
            )}
          >
            {selected && (
              <span className="absolute top-2 right-2 z-10 rounded-sm bg-gold px-1.5 py-0.5 font-sans text-[9px] font-bold tracking-wider text-gold-ink uppercase">
                Selecionado
              </span>
            )}
            {c.pilot && !selected && (
              <span className="absolute top-2 right-2 z-10 rounded-sm border border-gold/50 bg-bg/80 px-1.5 py-0.5 font-sans text-[9px] font-bold tracking-wider text-gold uppercase">
                Piloto
              </span>
            )}
            <div className="flex h-36 items-end justify-center bg-bg-deep">
              <CardPortrait id={c.id} />
            </div>
            <div className="flex flex-col gap-1.5 p-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-sm leading-tight text-fg">{c.name}</h3>
                <DiffBadge d={c.difficulty} />
              </div>
              <p className="font-sans text-[11px] text-muted">{c.title}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {c.tags.slice(0, 3).map((t) => (
                  <Badge key={t} className="border-border text-subtle">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CardPortrait({ id }: { id: string }) {
  const character = ROSTER.find((c) => c.id === id)!;
  const pix = useMemo(() => renderFrame(character, "walk", "down", 0), [character]);
  if (id === "templar") {
    return (
      <img
        src="/packs/templar-v3/thumbs/idle_down.png?v=4"
        alt=""
        width={128}
        height={128}
        className="pixelated mb-1"
        style={{ imageRendering: "pixelated", width: 128, height: 128 }}
      />
    );
  }
  return <Portrait pix={pix} scale={2} className="mb-1" />;
}
