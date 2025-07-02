import { z } from "zod";

export const clothesSchema = z.object({
    id: z.string(),
    name: z.string(),
    img: z.string(),
    prompt: z.string(),
});