"use client";

import { Toaster } from "sonner";
import { TABS, type TabId } from "@/lib/spriteforge/contract";
import { useStudio } from "@/lib/spriteforge/store";
import { cn } from "@/lib/utils";
import { AnimationPlayer } from "./AnimationPlayer";
import { Dossier } from "./Dossier";
import { TabArmory, TabCenario, TabGerador, TabInimigos, TabMontagem } from "./OtherTabs";
import { SheetPanel } from "./SheetPanel";
import { WarriorGrid } from "./WarriorGrid";

export function StudioApp() {
  const tab = useStudio((s) => s.tab);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <StudioNav />
      <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-6 sm:px-6 pb-16">
        {tab === "guerreiros" && <TabGuerreiros />}
        {tab === "gerador" && <TabGerador />}
        {tab === "cenario" && <TabCenario />}
        {tab === "inimigos" && <TabInimigos />}
        {tab === "montagem" && <TabMontagem />}
        {tab === "armory" && <TabArmory />}
      </main>
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "#14161A",
            border: "1px solid #2A2D33",
            color: "#E8E6E1",
          },
        }}
      />
    </div>
  );
}

function StudioNav() {
  const tab = useStudio((s) => s.tab);
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-semibold tracking-[0.12em] text-gold sm:text-2xl">
              SPRITEFORGE
            </h1>
            <span className="rounded-sm border border-gold/50 px-1.5 py-0.5 font-sans text-[9px] font-bold tracking-[0.18em] text-gold uppercase">
              Medieval
            </span>
          </div>
          <p className="hidden font-mono text-[11px] text-muted sm:block">64×64 · 4 dirs · atlas 1.0</p>
        </div>
        <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => useStudio.getState().setTab(t.id as TabId)}
                className={cn(
                  "relative shrink-0 rounded-md px-3 py-2 font-sans text-xs font-medium tracking-wide transition-colors duration-150 sm:text-sm",
                  active ? "text-gold" : "text-muted hover:text-fg",
                )}
              >
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.short}</span>
                {active && (
                  <span className="absolute inset-x-3 -bottom-1 h-px bg-gold" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function TabGuerreiros() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h2 className="font-display text-3xl text-fg sm:text-4xl">Guerreiros Medievais</h2>
        <p className="max-w-2xl font-sans text-sm text-muted">
          Dez classes no contrato 64×64. O Cavaleiro Templário é o herói piloto — sheet real,
          player vivo, pack Godot. Os outros compartilham o schema e um paper-doll de kit.
        </p>
      </header>
      <WarriorGrid />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AnimationPlayer />
        <Dossier />
      </div>
      <SheetPanel />
    </div>
  );
}
