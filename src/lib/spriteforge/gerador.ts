import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  prompt: z.string().trim().min(3, "Descreva o conceito em pelo menos 3 caracteres.").max(400),
});

export const generateConceptArt = createServerFn({ method: "POST" })
  .validator(inputSchema)
  .handler(async ({ data }) => {
    const { generateConceptSprite } = await import("./pixellab.server");
    return generateConceptSprite(data.prompt);
  });
