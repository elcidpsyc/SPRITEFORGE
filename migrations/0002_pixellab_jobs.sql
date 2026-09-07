-- SPRITEFORGE × PixelLab: durable record of every generation job.
--
-- Generation is asynchronous (2-5 min) and costs real money, so a job must
-- outlive the browser tab that started it. The UI polls THIS table, never
-- PixelLab directly: a closed tab, a refresh or a second device all pick the
-- work back up, and polling our own Postgres costs nothing.
--
-- One row per (class, action, direction). PixelLab bills animation per
-- DIRECTION -- one animation of a 4-direction character is four jobs and four
-- charges -- so the direction has to be part of the identity of a row or the
-- credit accounting silently under-counts by 4x. See docs/pixellab_api.md §2.

create table if not exists pixellab_jobs (
  id             text primary key,
  user_id        text not null,

  -- What this job is for. `class` is quoted everywhere: it is not reserved in
  -- Postgres, but it is in enough client tooling to be worth the habit.
  class          text not null,
  action         text not null,
  direction      text,

  -- Lifecycle. `queued` is ours (row written before PixelLab answers, so a
  -- crash between insert and POST still leaves a trace); the rest mirror the
  -- API, plus `timeout` for a job we stopped waiting on. A `timeout` row is
  -- NOT lost: character_id is already stored, so the result is recoverable
  -- for free later. It must never trigger an automatic re-submit -- that is a
  -- second charge for work already paid for.
  status         text not null default 'queued'
                 check (status in ('queued','processing','completed','failed','timeout')),

  job_id         text,
  character_id   text,
  result_url     text,
  error          text,

  -- Cost, as PixelLab actually reports it: two currencies, either may be null.
  -- `usage.usd` came back null in the FASE 0 live test, so neither column can
  -- be trusted alone as a spend counter -- the number we trust is the delta of
  -- GET /balance across a batch. These are the audit trail, not the ledger.
  credits_spent  numeric,
  generations_spent numeric,

  -- Groups the rows a single user action created, so the UI can show batch
  -- progress and the cost guard can count a session's jobs.
  batch_id       text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- The UI's poll: "my unfinished jobs, newest first".
create index if not exists pixellab_jobs_user_status_idx
  on pixellab_jobs (user_id, status, created_at desc);

-- The cost guard counts jobs per batch, and the UI groups by batch.
create index if not exists pixellab_jobs_batch_idx
  on pixellab_jobs (batch_id);

-- One row per (class, action, direction) per user: makes a double-submit from
-- a double-clicked button a no-op instead of a second charge.
create unique index if not exists pixellab_jobs_identity_idx
  on pixellab_jobs (user_id, class, action, coalesce(direction, ''));
