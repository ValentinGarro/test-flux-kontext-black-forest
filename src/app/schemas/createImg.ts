import { z } from "zod";
import { clothesSchema } from "./clothes";

export const createImgSchema = z.object({
    model: z.union([
      z.instanceof(File).refine(file => file.type.startsWith("image/"), { message: "Debe ser una imagen." }),
      z.string().refine(str => str.startsWith("data:image/"), { message: "Debe ser una imagen base64." }),
      z.null()
    ]),
    clothe: clothesSchema,
});
