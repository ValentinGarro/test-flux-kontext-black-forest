import { z } from "zod";
import { categorySchema } from "../schemas/category";

export type Category =  z.infer<typeof categorySchema>