import { z } from "zod";
import { categorySchema } from "./category";

export const clothesSchema = z.object({
    id: z.string(),
    name: z.string(),
    img: z.string(),
    prompt: z.string(),
    category: categorySchema,
});