import { z } from "zod";
import { clothesSchema } from "./clothes";

export const createImgSchema = z.object({
    model: z
      .instanceof(File)
      .refine(file => file.type.startsWith("image/"), { message: "Debe ser una imagen." }),
    clothe: clothesSchema,
});
