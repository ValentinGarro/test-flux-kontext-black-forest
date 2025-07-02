import { z } from "zod";
import { clothesSchema } from "../schemas/clothes";

export type clothe = z.infer<typeof clothesSchema>;