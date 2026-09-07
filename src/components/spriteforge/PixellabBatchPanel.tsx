import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Coins, Loader2, RefreshCw, Zap } from "lucide-react";
import {
  estimateClassBatch,
  fetchBalance,
  fetchJobs,
  retryJob,
  submitClassBatch,
} from "@/lib/spriteforge/pipeline";
import { GhostBtn, GoldBtn, Panel } from "./bits";

// Batch generation against the PixelLab character pipeline.
//
// The button that spends money is gated on three things, and none of them are
// advisory: the balance has to be on screen, the batch has to be priced, and
// the user has to say yes to that specific number. The server enforces all
// three again in cost-guard.server.ts -- this panel is the explanation, not
// the enforcement.

type Balance = Awaited<ReturnType<typeof fetchBalance>>;
type Estimate = Awaited<ReturnType<typeof estimateClassBatch>>["estimate"];
type Job = Awaited<ReturnType<typeof fetchJobs>>["jobs"][number];

const POLL_MS = 15_000;

export function PixellabBatchPanel() {
  const [className, setClassName] = useState("templar");
  const [description, setDescription] = useState(
    "medieval templar knight, white surcoat, red cross, scarlet cape",
  );
  const [balance, setBalance] = useState<Balance | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadBalance = useCallback(async () => {
    try {
      setBalance(await fetchBalance());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao consultar o saldo.");
    }
  }, []);

  const loadJobs = useCallback(async () => {
    try {
      setJobs((await fetchJobs({ data: {} })).jobs);
    } catch {
      // A failed poll is not worth an error banner: the next tick retries, and
      // the jobs are safe in the database either way.
    }
  }, []);

  // The balance must be visible before anything can be priced or spent.
  useEffect(() => {
    void loadBalance();
    void loadJobs();
  }, [loadBalance, loadJobs]);

  // Poll our own table, never PixelLab.
  useEffect(() => {
    const id = setInterval(() => void loadJobs(), POLL_MS);
    return () => clearInterval(id);
  }, [loadJobs]);

  async function handleEstimate() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await estimateClassBatch({ data: { className } });
      setEstimate(res.estimate);
      if (res.balance) setBalance({ ...res.balance, maxJobsPerSession: res.maxJobsPerSession });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao estimar o lote.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    if (!estimate) return;
    // The confirmation quotes the estimate the user is looking at, so a stale
    // panel cannot be used to agree to a number that is no longer on screen.
    const agreed = window.confirm(
      `Gerar ${estimate.jobCount} jobs (~${estimate.generations} gerações) para "${className}"?\n\n` +
        "Isto gasta créditos reais do PixelLab e não pode ser desfeito.",
    );
    if (!agreed) return;

    setBusy(true);
    setError(null);
    try {
      const res = await submitClassBatch({
        data: { className, description, confirmed: true },
      });
      if (res.ok) {
        setNotice(`Lote enviado: ${res.queued} jobs registrados. Personagem ${res.characterId}.`);
        await loadJobs();
      } else {
        setError(res.message);
      }
      await loadBalance();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao enviar o lote.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRetry(id: string) {
    await retryJob({ data: { jobId: id } });
    await loadJobs();
  }

  const failed = jobs.filter((j) => j.status === "failed" || j.status === "timeout");
  const done = jobs.filter((j) => j.status === "completed").length;

  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-sans text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
          Pipeline de personagem · lote
        </p>
        <GhostBtn onClick={() => void loadBalance()}>
          <RefreshCw className="size-3.5" /> Atualizar saldo
        </GhostBtn>
      </div>

      {/* Guard 1 of 3: the balance is always on screen, in BOTH currencies --
          subscription generations are spent first, USD credits are the
          fallback, and showing only one of them misleads. */}
      <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-bg-deep p-3 font-mono text-xs">
        <Coins className="size-4 text-gold" />
        {balance ? (
          <>
            <span className="text-fg">
              {balance.generations}/{balance.generationsTotal} gerações
            </span>
            <span className="text-muted">US$ {balance.usd.toFixed(2)} em créditos</span>
            <span className="text-subtle">assinatura: {balance.status}</span>
            <span className="text-subtle">teto/sessão: {balance.maxJobsPerSession} jobs</span>
          </>
        ) : (
          <span className="text-subtle">saldo indisponível — o lote fica bloqueado</span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="font-sans text-[11px] tracking-wider text-muted uppercase">Classe</span>
          <input
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="rounded-md border border-border bg-bg-deep p-2 font-mono text-sm text-fg"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-sans text-[11px] tracking-wider text-muted uppercase">
            Descrição
          </span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-md border border-border bg-bg-deep p-2 font-sans text-sm text-fg"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <GhostBtn onClick={() => void handleEstimate()} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
          Estimar custo
        </GhostBtn>
        {/* Guard 2 of 3: no estimate, no button. The batch cannot be submitted
            before its price has been computed and displayed. */}
        <GoldBtn onClick={() => void handleSubmit()} disabled={busy || !estimate || !balance}>
          Gerar lote
        </GoldBtn>
      </div>

      {estimate && (
        <div className="rounded-md border border-gold/30 bg-gold/5 p-3 font-mono text-xs text-fg">
          <p>
            {estimate.jobCount} jobs · ~{estimate.generations} gerações
          </p>
          <p className="mt-1 text-muted">
            1 criação + 7 ações × 4 direções. O PixelLab cobra por direção, não por animação.
          </p>
        </div>
      )}

      {notice && (
        <p className="rounded-md border border-gold/30 bg-gold/5 p-2 font-sans text-xs text-fg">
          {notice}
        </p>
      )}
      {error && (
        <p className="flex items-start gap-2 rounded-md border border-hard/40 bg-hard/10 p-2 font-sans text-xs text-hard">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}

      {jobs.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs text-muted">
            {done}/{jobs.length} concluídos · atualiza a cada {POLL_MS / 1000}s pela tabela
          </p>
          {failed.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between gap-2 rounded-md border border-hard/30 p-2 font-mono text-[11px]"
            >
              <span className="text-hard">
                {job.class}/{job.action}
                {job.direction ? `/${job.direction}` : ""} — {job.status}
              </span>
              {/* Retry is manual, always. An automatic retry on a paid async
                  endpoint spends credits silently, and a timeout usually means
                  PixelLab is still working, not that the job failed. */}
              <GhostBtn onClick={() => void handleRetry(job.id)}>Retry manual</GhostBtn>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
