import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ACTIONS } from "./contract";

// Server functions for the character pipeline. The key lives only in
// pixellab.server.ts, which is imported lazily inside each handler so it never
// reaches a client chunk -- the same shape gerador.ts already uses.

/** Free, and the UI shows it before any batch. Both currencies. */
export const fetchBalance = createServerFn({ method: "POST" }).handler(async () => {
  const { getBalance } = await import("./pixellab.server");
  const { maxJobsPerSession } = await import("./cost-guard.server");
  const balance = await getBalance();
  return { ...balance, maxJobsPerSession: maxJobsPerSession() };
});

const classSchema = z.object({
  className: z.string().trim().min(1).max(60),
});

/**
 * Prices a batch WITHOUT submitting anything. This is what the confirmation
 * dialog renders: the user has to see the number before they can agree to it.
 */
export const estimateClassBatch = createServerFn({ method: "POST" })
  .validator(classSchema)
  .handler(async ({ data }) => {
    const { planForClass, estimateBatch, maxJobsPerSession } = await import("./cost-guard.server");
    const { getBalance } = await import("./pixellab.server");
    const planned = planForClass(data.className);
    return {
      estimate: estimateBatch(planned),
      balance: await getBalance().catch(() => null),
      maxJobsPerSession: maxJobsPerSession(),
    };
  });

const submitSchema = classSchema.extend({
  description: z.string().trim().min(3).max(400),
  /**
   * Must be sent as an explicit true by a user who saw the estimate. It is not
   * defaulted: an omitted flag has to mean "not confirmed".
   */
  confirmed: z.boolean(),
});

/**
 * The only path that spends credits. Everything it needs to refuse is checked
 * before the first PixelLab call, and the rows are written before submission
 * so a crash mid-batch leaves a trace rather than an invisible charge.
 */
export const submitClassBatch = createServerFn({ method: "POST" })
  .validator(submitSchema)
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth/verify.server");
    const { planForClass, authorizeBatch } = await import("./cost-guard.server");
    const { reserveJobs, markSubmitted, markFinished } = await import("./jobs.server");
    const { createCharacter } = await import("./pixellab.server");
    const { randomUUID } = await import("node:crypto");

    const userId = await requireUserId();
    const planned = planForClass(data.className);

    const auth = await authorizeBatch({ userId, planned, confirmed: data.confirmed });
    if (!auth.ok) return auth;

    const batchId = randomUUID();
    const rows = await reserveJobs(userId, planned, batchId);
    const creationRow = rows.find((r) => r.action === "create");
    if (!creationRow) {
      // Every row collided with an existing one: this class is already queued.
      return {
        ok: false as const,
        reason: "already_queued" as const,
        message: `A classe "${data.className}" já tem jobs registrados. Use o retry manual.`,
        estimate: auth.estimate,
        balance: auth.balance,
      };
    }

    // Only the character is submitted here. The 28 animation jobs depend on a
    // finished character, so they are submitted by the worker as it completes
    // -- firing them now would be 28 rejected calls and 28 wasted round-trips.
    try {
      const created = await createCharacter({ description: data.description });
      await markSubmitted(creationRow.id, {
        jobId: created.jobId,
        characterId: created.characterId,
      });
      return {
        ok: true as const,
        batchId,
        characterId: created.characterId,
        estimate: auth.estimate,
        balance: auth.balance,
        queued: rows.length,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await markFinished(creationRow.id, { status: "failed", error: message });
      return { ok: false as const, reason: "pixellab_error" as const, message };
    }
  });

/** What the UI polls -- our own table, never PixelLab. Free. */
export const fetchJobs = createServerFn({ method: "POST" })
  .validator(z.object({ batchId: z.string().uuid().optional() }))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth/verify.server");
    const { listJobs } = await import("./jobs.server");
    return { jobs: await listJobs(await requireUserId(), data.batchId) };
  });

/** Manual retry only: clears one failed/timed-out row so it can be resubmitted. */
export const retryJob = createServerFn({ method: "POST" })
  .validator(z.object({ jobId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { requireUserId } = await import("../auth/verify.server");
    const { clearForManualRetry } = await import("./jobs.server");
    const cleared = await clearForManualRetry(await requireUserId(), data.jobId);
    return { ok: cleared };
  });

export const CONTRACT_ACTIONS = ACTIONS;
