import { ACTIONS, DIRECTIONS, type ActionId } from "./contract";
import { ACTION_TO_PIXELLAB, getBalance, type Balance } from "./pixellab.server";
import { countJobsSince, type PlannedJob } from "./jobs.server";

// The cost guard. Server-only, and deliberately unavoidable: every batch
// submission goes through `authorizeBatch`, which is the only place allowed to
// say yes.
//
// This endpoint sits behind a public page. A loop with a bug here is not a
// crash, it is an invoice -- so the guard fails CLOSED. If the balance cannot
// be read, if the estimate cannot be built, or if the cap cannot be counted,
// nothing is submitted.

/** Hard ceiling on jobs one user can queue per window. */
export const DEFAULT_MAX_JOBS_PER_SESSION = 40;
export const SESSION_WINDOW_MS = 60 * 60_000;

export function maxJobsPerSession(): number {
  const raw = process.env.PIXELLAB_MAX_JOBS_PER_SESSION?.trim();
  if (!raw) return DEFAULT_MAX_JOBS_PER_SESSION;
  const n = Number(raw);
  // A malformed cap must not read as "no cap".
  if (!Number.isFinite(n) || n < 1) return DEFAULT_MAX_JOBS_PER_SESSION;
  return Math.floor(n);
}

/**
 * Generations PixelLab charges for one job, from docs/pixellab_api.md §7.
 *
 * Character creation in standard mode is ~1 generation for the whole 4-way
 * character. Animation is ~1 generation PER DIRECTION for both `template` and
 * `v3` at our sprite size (<=96px) -- and the per-direction part is the whole
 * point: one 4-direction animation is four jobs and four charges.
 *
 * `pro` mode (20-40 generations/direction) is not reachable from here at all.
 */
export function estimateGenerations(job: PlannedJob): number {
  if (job.action === "create") return 1;
  const plan = ACTION_TO_PIXELLAB[job.action as ActionId];
  // Both template and v3 land at ~1 generation/direction for a 64px character
  // (canvas ~90px, under the 96px threshold where v3 starts scaling up).
  return plan ? 1 : 1;
}

export type BatchEstimate = {
  jobCount: number;
  generations: number;
  /** Per-class breakdown, so the confirmation dialog can be specific. */
  byClass: Array<{ className: string; jobs: number; generations: number }>;
};

export function estimateBatch(planned: PlannedJob[]): BatchEstimate {
  const byClass = new Map<string, { jobs: number; generations: number }>();
  let generations = 0;

  for (const job of planned) {
    const cost = estimateGenerations(job);
    generations += cost;
    const entry = byClass.get(job.className) ?? { jobs: 0, generations: 0 };
    entry.jobs += 1;
    entry.generations += cost;
    byClass.set(job.className, entry);
  }

  return {
    jobCount: planned.length,
    generations,
    byClass: [...byClass].map(([className, v]) => ({ className, ...v })),
  };
}

/** Every job a full class needs: 1 creation + 7 actions x 4 directions = 29. */
export function planForClass(className: string): PlannedJob[] {
  const jobs: PlannedJob[] = [{ className, action: "create", direction: null }];
  for (const action of ACTIONS) {
    for (const direction of DIRECTIONS) {
      jobs.push({ className, action: action as ActionId, direction });
    }
  }
  return jobs;
}

export type BatchAuthorization =
  | { ok: true; estimate: BatchEstimate; balance: Balance }
  | {
      ok: false;
      reason: "needs_confirmation" | "over_session_cap" | "insufficient_balance";
      message: string;
      estimate: BatchEstimate;
      balance: Balance | null;
      /** Cap state, so the UI can say "12 of 40 used" rather than just "no". */
      cap?: { limit: number; used: number; requested: number };
    };

/**
 * The single gate in front of every batch. All three guards the spec calls
 * blocking are enforced here, in the order that spends least:
 *
 *   1. session cap -- pure arithmetic on our own table, costs nothing
 *   2. explicit confirmation -- required for any batch of more than one job
 *   3. balance -- one free GET /balance, checked against the estimate
 *
 * Returns a refusal instead of throwing, because every branch is something the
 * UI must render rather than an exception: the numbers are the answer.
 */
export async function authorizeBatch(input: {
  userId: string;
  planned: PlannedJob[];
  /** Must be an explicit yes from the user, echoing the estimate they saw. */
  confirmed: boolean;
}): Promise<BatchAuthorization> {
  const estimate = estimateBatch(input.planned);

  const limit = maxJobsPerSession();
  const used = await countJobsSince(input.userId, new Date(Date.now() - SESSION_WINDOW_MS));
  if (used + estimate.jobCount > limit) {
    return {
      ok: false,
      reason: "over_session_cap",
      message:
        `Limite de ${limit} jobs por sessão atingido: ${used} já usados nesta hora, ` +
        `${estimate.jobCount} pedidos. Ajuste PIXELLAB_MAX_JOBS_PER_SESSION ou espere a janela virar.`,
      estimate,
      balance: null,
      cap: { limit, used, requested: estimate.jobCount },
    };
  }

  if (estimate.jobCount > 1 && !input.confirmed) {
    return {
      ok: false,
      reason: "needs_confirmation",
      message:
        `Este lote são ${estimate.jobCount} jobs (~${estimate.generations} gerações). ` +
        "Confirme explicitamente antes de gerar.",
      estimate,
      balance: await getBalance().catch(() => null),
    };
  }

  // Read last: it is a network call, and the two checks above are free.
  const balance = await getBalance();
  const available = balance.generations + balance.usd;
  if (estimate.generations > available) {
    return {
      ok: false,
      reason: "insufficient_balance",
      message:
        `Saldo insuficiente: o lote precisa de ~${estimate.generations} gerações e há ` +
        `${balance.generations} gerações de assinatura + US$ ${balance.usd.toFixed(2)} em créditos.`,
      estimate,
      balance,
    };
  }

  return { ok: true, estimate, balance };
}
