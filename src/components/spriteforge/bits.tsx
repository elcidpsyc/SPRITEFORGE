import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Difficulty, Rarity } from "@/lib/spriteforge/types";

export const DIFF_LABEL: Record<Difficulty, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
  mestre: "Mestre",
};

export const DIFF_CLASS: Record<Difficulty, string> = {
  facil: "text-easy border-easy/40 bg-easy/10",
  medio: "text-gold border-gold/40 bg-gold/10",
  dificil: "text-hard border-hard/40 bg-hard/10",
  mestre: "text-master border-master/40 bg-master/10",
};

export const RARITY_CLASS: Record<Rarity, string> = {
  basico: "text-muted border-border bg-surface-2",
  raro: "text-rare border-rare/40 bg-rare/10",
  epico: "text-epic border-epic/40 bg-epic/10",
  lendario: "text-gold border-gold/40 bg-gold/10",
  imortal: "text-immortal border-immortal/40 bg-immortal/10",
};

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 font-sans text-[10px] font-semibold tracking-wide uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DiffBadge({ d }: { d: Difficulty }) {
  return <Badge className={DIFF_CLASS[d]}>{DIFF_LABEL[d]}</Badge>;
}

export function GoldBtn({
  children,
  onClick,
  className,
  disabled,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md border border-gold/70 bg-gold/10 px-3 py-1.5 font-sans text-xs font-semibold tracking-wide text-gold transition-colors duration-150 hover:bg-gold/20 disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostBtn({
  children,
  onClick,
  active,
  className,
  title,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-md border px-2.5 py-1.5 font-sans text-xs font-medium transition-colors duration-150 disabled:opacity-40",
        active
          ? "border-gold bg-gold text-gold-ink"
          : "border-border bg-surface-2 text-muted hover:border-border-strong hover:text-fg",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function StatBar({
  label,
  value,
  max,
  format,
}: {
  label: string;
  value: number;
  max: number;
  format?: (n: number) => string;
}) {
  const pct = Math.max(4, Math.min(100, (value / max) * 100));
  return (
    <div className="grid grid-cols-[48px_1fr_52px] items-center gap-2">
      <span className="font-sans text-[11px] font-semibold tracking-wider text-muted uppercase">
        {label}
      </span>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-right font-mono text-xs tabular-nums text-fg">
        {format ? format(value) : value}
      </span>
    </div>
  );
}
