import { z } from "zod";
import { createImgSchema } from "../schemas/createImg";
export type CreateImg = z.infer<typeof createImgSchema> 
    
