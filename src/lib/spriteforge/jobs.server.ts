import { randomUUID } from "node:crypto";
import { getSql } from "../db";
import type { ActionId } from "./contract";

// Durable job ledger for PixelLab generation. Server-only.
//
// Generation is asynchronous (2-5 min) and billed, so a job must outlive the
// tab that started it. The UI polls THIS table, never PixelLab: our own
// database is free to read and survives a refresh, a closed tab or a second
// device. Schema: migrations/0002_pixellab_jobs.sql.

export type JobRow = {
  id: string;
  user_id: string;
  class: string;
  action: string;
  direction: string | null;
  status: "queued" | "processing" | "completed" | "failed" | "timeout";
  job_id: string | null;
  character_id: string | null;
  result_url: string | null;
  error: string | null;
  credits_spent: number | null;
  generations_spent: number | null;
  batch_id: string | null;
  created_at: string;
  updated_at: string;
};

/** One planned unit of work -- and one PixelLab charge. */
export type PlannedJob = {
  className: string;
  action: ActionId | "create";
  direction: string | null;
};

/**
 * Writes the batch's rows BEFORE anything is submitted to PixelLab, so a crash
 * between insert and POST leaves a trace instead of an invisible charge.
 * Returns the rows actually inserted: the unique index on
 * (user_id, class, action, direction) turns a double-clicked button into a
 * no-op rather than a second charge.
 */
export async function reserveJobs(
  userId: string,
  planned: PlannedJob[],
  batchId: string,
): Promise<JobRow[]> {
  const sql = await getSql();
  const rows: JobRow[] = [];

  for (const job of planned) {
    const inserted = await sql.query<JobRow>(
      `insert into pixellab_jobs (id, user_id, class, action, direction, status, batch_id)
       values ($1, $2, $3, $4, $5, 'queued', $6)
       on conflict (user_id, class, action, coalesce(direction, '')) do nothing
       returning *`,
      [randomUUID(), userId, job.className, job.action, job.direction, batchId],
    );
    if (inserted[0]) rows.push(inserted[0]);
  }

  return rows;
}

export async function markSubmitted(
  rowId: string,
  fields: { jobId?: string | null; characterId?: string | null },
): Promise<void> {
  const sql = await getSql();
  await sql.query(
    `update pixellab_jobs
        set status = 'processing', job_id = coalesce($2, job_id),
            character_id = coalesce($3, character_id), updated_at = now()
      where id = $1`,
    [rowId, fields.jobId ?? null, fields.characterId ?? null],
  );
}

export async function markFinished(
  rowId: string,
  fields: {
    status: "completed" | "failed" | "timeout";
    resultUrl?: string | null;
    error?: string | null;
    creditsSpent?: number | null;
    generationsSpent?: number | null;
  },
): Promise<void> {
  const sql = await getSql();
  await sql.query(
    `update pixellab_jobs
        set status = $2, result_url = coalesce($3, result_url),
            error = $4, credits_spent = coalesce($5, credits_spent),
            generations_spent = coalesce($6, generations_spent), updated_at = now()
      where id = $1`,
    [
      rowId,
      fields.status,
      fields.resultUrl ?? null,
      fields.error ?? null,
      fields.creditsSpent ?? null,
      fields.generationsSpent ?? null,
    ],
  );
}

/** What the UI polls. Scoped to the caller -- never trust a client-sent id. */
export async function listJobs(userId: string, batchId?: string): Promise<JobRow[]> {
  const sql = await getSql();
  return batchId
    ? sql.query<JobRow>(
        `select * from pixellab_jobs where user_id = $1 and batch_id = $2
          order by created_at desc`,
        [userId, batchId],
      )
    : sql.query<JobRow>(
        `select * from pixellab_jobs where user_id = $1
          order by created_at desc limit 500`,
        [userId],
      );
}

/**
 * Clears one failed/timed-out row so it can be submitted again.
 *
 * Deliberately the ONLY way back: there is no automatic retry anywhere in this
 * module. An automatic retry on a paid, asynchronous endpoint spends credits
 * silently, and a timeout here does not even mean the work failed -- PixelLab
 * usually finishes it, and the stored character_id recovers the result for
 * free. Retry is a decision a person makes after looking.
 */
export async function clearForManualRetry(userId: string, rowId: string): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql.query<{ id: string }>(
    `delete from pixellab_jobs
      where id = $1 and user_id = $2 and status in ('failed','timeout')
      returning id`,
    [rowId, userId],
  );
  return rows.length > 0;
}

/** Jobs this user has submitted in the current window, for the session cap. */
export async function countJobsSince(userId: string, since: Date): Promise<number> {
  const sql = await getSql();
  const rows = await sql.query<{ n: string }>(
    `select count(*)::text as n from pixellab_jobs
      where user_id = $1 and created_at >= $2`,
    [userId, since.toISOString()],
  );
  return Number(rows[0]?.n ?? 0);
}
