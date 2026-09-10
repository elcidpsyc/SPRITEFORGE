import { CELL } from "./contract";

// PixelLab (https://www.pixellab.ai) turns a text prompt into a pixel-art PNG.
// Server-only: PIXELLAB_API_KEY must never reach the client bundle. Only ever
// import this from inside a createServerFn handler (see gerador.ts).
const PIXELLAB_ENDPOINT = "https://api.pixellab.ai/v2/create-image-pixflux";

const STYLE_SUFFIX =
  "top-down RPG character sprite, 64x64 pixel art, single 1px dark outline, " +
  "flat cel shading, limited palette under 24 colors, centered on a fully " +
  "transparent background, no ground shadow, no text, no watermark";

type PixellabImagePayload = string | { base64: string; type?: string };

type PixellabResponse = {
  image: PixellabImagePayload;
  usage?: { type?: string; usd?: number };
};

export async function generateConceptSprite(prompt: string) {
  const apiKey = process.env.PIXELLAB_API_KEY;
  if (!apiKey) {
    throw new Error(
      "PIXELLAB_API_KEY não está configurada no servidor. Peça ao responsável pelo projeto " +
        "para definir essa variável de ambiente (nunca no código).",
    );
  }

  const response = await fetch(PIXELLAB_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      description: `${prompt}, ${STYLE_SUFFIX}`,
      image_size: { width: CELL, height: CELL },
      no_background: true,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `PixelLab recusou o pedido (${response.status}): ${detail.slice(0, 300) || response.statusText}`,
    );
  }

  const result = (await response.json()) as PixellabResponse;
  const base64 = typeof result.image === "string" ? result.image : result.image.base64;
  if (!base64) {
    throw new Error("PixelLab não retornou uma imagem válida.");
  }

  return {
    dataUrl: `data:image/png;base64,${base64}`,
    usd: result.usage?.usd ?? null,
  };
}
