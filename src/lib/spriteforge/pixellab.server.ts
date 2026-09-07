import { ACTION_META, CELL, type ActionId } from "./contract";

// PixelLab (https://www.pixellab.ai) turns text prompts into pixel-art sprites.
// Server-only: PIXELLAB_API_KEY must never reach the client bundle. Only ever
// import this from inside a createServerFn handler (see gerador.ts).
//
// The endpoint map, the async job model and the credit costs encoded here are
// documented, with sources, in docs/pixellab_api.md. Read that before changing
// any number in this file -- several of them are cost multipliers.
const PIXELLAB_BASE = "https://api.pixellab.ai/v2";

const STYLE_SUFFIX =
  "top-down RPG character sprite, 64x64 pixel art, single 1px dark outline, " +
  "flat cel shading, limited palette under 24 colors, centered on a fully " +
  "transparent background, no ground shadow, no text, no watermark";

type PixellabImagePayload = string | { base64: string; type?: string };

/** What PixelLab charges. Both fields are nullable -- see `usd` note below. */
export type PixellabUsage = {
  type?: string;
  /**
   * Came back `null` on the FASE 0 live call even though the call was billed.
   * Never treat a null here as "free": the charge was probably in
   * `generations`. The trustworthy spend figure is the delta of getBalance().
   */
  usd?: number | null;
  generations?: number | null;
};

function apiKey(): string {
  const key = process.env.PIXELLAB_API_KEY;
  if (!key) {
    throw new Error(
      "PIXELLAB_API_KEY não está configurada no servidor. Peça ao responsável pelo projeto " +
        "para definir essa variável de ambiente (nunca no código).",
    );
  }
  return key;
}

async function pixellab<T>(
  path: string,
  init?: { method?: "GET" | "POST"; body?: unknown },
): Promise<T> {
  const response = await fetch(`${PIXELLAB_BASE}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(init?.body ? { body: JSON.stringify(init.body) } : {}),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    // The body is surfaced verbatim (truncated): a PixelLab rejection is
    // usually specific -- wrong size, missing reference, out of credits -- and
    // paraphrasing it costs a debugging round-trip.
    throw new Error(
      `PixelLab recusou ${path} (${response.status}): ${detail.slice(0, 300) || response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

/* -------------------------------------------------------------------------- */
/* Balance                                                                    */
/* -------------------------------------------------------------------------- */

export type Balance = {
  /** USD credits. The fallback, spent after the subscription runs out. */
  usd: number;
  /** Subscription generations left this period. Spent FIRST. */
  generations: number;
  generationsTotal: number;
  status: string;
  plan: string | null;
};

/**
 * Free to call. Both currencies matter: showing only USD makes a user with an
 * exhausted subscription believe they still have budget, and vice versa.
 */
export async function getBalance(): Promise<Balance> {
  const raw = await pixellab<{
    credits: { usd: number };
    subscription: {
      status: string;
      plan?: string | null;
      generations: number;
      total: number;
    };
  }>("/balance");

  return {
    usd: raw.credits.usd,
    generations: raw.subscription.generations,
    generationsTotal: raw.subscription.total,
    status: raw.subscription.status,
    plan: raw.subscription.plan ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Character creation                                                          */
/* -------------------------------------------------------------------------- */

/** Contract direction -> PixelLab direction. 1:1, no mirroring. */
export const DIRECTION_TO_PIXELLAB = {
  down: "south",
  up: "north",
  right: "east",
  left: "west",
} as const;

export type CreateCharacterInput = {
  description: string;
  /**
   * Base64 PNG whose palette every generation is locked to (`force_colors`).
   * This is the lever the palette contract test depends on: same palette
   * across frames AND across classes. See docs/pixellab_api.md §3.
   */
  styleReference?: string;
  /** Per-direction reference sprites, used AS-IS rather than reinterpreted. */
  directionReferences?: Partial<Record<"south" | "east" | "north" | "west", string>>;
  nDirections?: 4 | 8;
  size?: number;
  seed?: number;
};

export type CreateCharacterResult = {
  characterId: string;
  jobId: string;
  status: string;
  usage: PixellabUsage | null;
};

/**
 * Queues a character. Returns as soon as PixelLab accepts it -- the
 * `characterId` exists before the art does, which is what lets a job be
 * persisted immediately and recovered later without paying twice.
 *
 * NOTE ON SIZE: PixelLab grows the canvas ~40% beyond `size` to leave room for
 * animation, so `size: 64` does NOT yield a 64x64 sprite. There is no API
 * parameter that changes this; cropping back to the contract's 64x64 cell is
 * ours to do, by integer translation, after download.
 */
export async function createCharacter(input: CreateCharacterInput): Promise<CreateCharacterResult> {
  const size = input.size ?? CELL;
  const nDirections = input.nDirections ?? 4;
  const path =
    nDirections === 8
      ? "/create-character-with-8-directions"
      : "/create-character-with-4-directions";

  const raw = await pixellab<{
    character_id: string;
    background_job_id: string;
    status?: string;
    usage?: PixellabUsage | null;
  }>(path, {
    method: "POST",
    body: {
      description: `${input.description}, ${STYLE_SUFFIX}`,
      image_size: { width: size, height: size },
      view: "low top-down",
      ...(input.styleReference
        ? {
            color_image: { type: "base64", base64: input.styleReference },
            force_colors: true,
          }
        : {}),
      ...(input.directionReferences
        ? {
            directions: Object.fromEntries(
              Object.entries(input.directionReferences).map(([dir, b64]) => [
                dir,
                { type: "base64", base64: b64 },
              ]),
            ),
          }
        : {}),
      ...(input.seed !== undefined ? { seed: input.seed } : {}),
    },
  });

  return {
    characterId: raw.character_id,
    jobId: raw.background_job_id,
    status: raw.status ?? "processing",
    usage: raw.usage ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Animation                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * How each contract action is produced.
 *
 * `template` mode is 1 generation per direction and is preferred wherever a
 * template fits. `v3` is used only where no template matches the action --
 * `pro` (20-40 generations per direction) is deliberately absent: it is 20-40x
 * the cost and has no place in an automated batch.
 *
 * The frame counts of the template animations are NOT published by the API and
 * the templates ignore `frame_count`. Whether `attack`, `hurt` and `death`
 * really return the 8/6/8 frames the contract wants is unknown until the first
 * real generation. See docs/pixellab_api.md §2.1.
 */
export const ACTION_TO_PIXELLAB: Record<
  ActionId,
  { mode: "template"; templateId: string } | { mode: "v3"; action: string }
> = {
  walk: { mode: "template", templateId: "walking-8-frames" },
  run: { mode: "template", templateId: "running-8-frames" },
  attack: { mode: "template", templateId: "attack" },
  guard: { mode: "v3", action: "raising a shield into a defensive guard stance" },
  dash: { mode: "v3", action: "dashing forward in a short burst of speed" },
  hurt: { mode: "template", templateId: "taking-punch" },
  death: { mode: "template", templateId: "falling-back-death" },
};

export type AnimateCharacterResult = {
  /** One job per direction. This is also one CHARGE per direction. */
  jobIds: string[];
  directions: string[];
  status: string;
};

export async function animateCharacter(input: {
  characterId: string;
  action: ActionId;
  directions?: string[];
  seed?: number;
  styleReference?: string;
}): Promise<AnimateCharacterResult> {
  const plan = ACTION_TO_PIXELLAB[input.action];
  const meta = ACTION_META[input.action];
  const directions = input.directions ?? Object.values(DIRECTION_TO_PIXELLAB).slice();

  const raw = await pixellab<{
    background_job_ids: string[];
    directions: string[];
    status?: string;
  }>("/characters/animations", {
    method: "POST",
    body: {
      character_id: input.characterId,
      animation_name: input.action,
      directions,
      ...(plan.mode === "template"
        ? { mode: "template", template_animation_id: plan.templateId }
        : {
            mode: "v3",
            action_description: plan.action,
            frame_count: meta.frames,
            // v3 keeps the reference pose as frame 0 by default, which would
            // store frames + 1. The contract counts frames exactly.
            keep_first_frame: false,
          }),
      ...(input.styleReference
        ? {
            color_image: { type: "base64", base64: input.styleReference },
            force_colors: true,
          }
        : {}),
      ...(input.seed !== undefined ? { seed: input.seed } : {}),
    },
  });

  return {
    jobIds: raw.background_job_ids,
    directions: raw.directions,
    status: raw.status ?? "processing",
  };
}

/* -------------------------------------------------------------------------- */
/* Jobs                                                                        */
/* -------------------------------------------------------------------------- */

export type JobStatus = {
  id: string;
  status: "processing" | "completed" | "failed" | string;
  createdAt: string;
  lastResponse: Record<string, unknown> | null;
  usage: PixellabUsage | null;
};

/** Free, so it is safe to call often. Rate limit is the only concern. */
export async function getJob(jobId: string): Promise<JobStatus> {
  const raw = await pixellab<{
    id: string;
    status: string;
    created_at: string;
    last_response?: Record<string, unknown> | null;
    usage?: PixellabUsage | null;
  }>(`/background-jobs/${encodeURIComponent(jobId)}`);

  return {
    id: raw.id,
    status: raw.status,
    createdAt: raw.created_at,
    lastResponse: raw.last_response ?? null,
    usage: raw.usage ?? null,
  };
}

export const POLL_FIRST_DELAY_MS = 30_000;
export const POLL_MAX_DELAY_MS = 30_000;
export const POLL_BACKOFF = 1.5;
/** Twice the worst case PixelLab documents (5 min) for a character. */
export const POLL_TIMEOUT_MS = 10 * 60_000;

/**
 * Polls one job to a terminal state.
 *
 * On timeout this RETURNS a `timeout` status rather than throwing or retrying.
 * Re-submitting is a second charge for work PixelLab is still doing, and the
 * result stays recoverable for free through the stored character_id. Retry is
 * a manual decision, never an automatic one.
 */
export async function pollJob(
  jobId: string,
  options?: { timeoutMs?: number; signal?: AbortSignal },
): Promise<JobStatus & { timedOut: boolean }> {
  const timeoutMs = options?.timeoutMs ?? POLL_TIMEOUT_MS;
  const deadline = Date.now() + timeoutMs;
  let delay = POLL_FIRST_DELAY_MS;
  let last: JobStatus | null = null;

  while (Date.now() < deadline) {
    const wait = Math.min(delay, Math.max(0, deadline - Date.now()));
    await new Promise((resolve) => setTimeout(resolve, wait));
    if (options?.signal?.aborted) break;

    last = await getJob(jobId);
    if (last.status === "completed" || last.status === "failed") {
      return { ...last, timedOut: false };
    }
    delay = Math.min(delay * POLL_BACKOFF, POLL_MAX_DELAY_MS);
  }

  return {
    id: jobId,
    status: last?.status ?? "processing",
    createdAt: last?.createdAt ?? new Date().toISOString(),
    lastResponse: last?.lastResponse ?? null,
    usage: last?.usage ?? null,
    timedOut: true,
  };
}

/** Free. The source of truth for a finished character's rotation URLs. */
export async function getCharacter(characterId: string) {
  return pixellab<{
    id: string;
    status: string;
    size: { width: number; height: number };
    directions: number;
    animation_count: number;
    rotation_urls: Record<string, string | null> | null;
    animations: Array<{
      animation_type: string;
      display_name?: string | null;
      directions: unknown[];
    }>;
  }>(`/characters/${encodeURIComponent(characterId)}`);
}

/* -------------------------------------------------------------------------- */
/* Concept art (aba 1) -- unchanged draft path, kept deliberately              */
/* -------------------------------------------------------------------------- */

/**
 * The single-image sketch behind the "Gerador de Imagem" tab. It does NOT feed
 * the sprite pipeline (no directions, no animation, no contract guarantees)
 * and the UI says so. Kept as-is: it is the one path validated live in FASE 0.
 */
export async function generateConceptSprite(prompt: string) {
  const result = await pixellab<{
    image: PixellabImagePayload;
    usage?: PixellabUsage;
  }>("/create-image-pixflux", {
    method: "POST",
    body: {
      description: `${prompt}, ${STYLE_SUFFIX}`,
      image_size: { width: CELL, height: CELL },
      no_background: true,
    },
  });

  const base64 = typeof result.image === "string" ? result.image : result.image.base64;
  if (!base64) {
    throw new Error("PixelLab não retornou uma imagem válida.");
  }

  return {
    dataUrl: `data:image/png;base64,${base64}`,
    usd: result.usage?.usd ?? null,
  };
}
