import { z } from "zod";

export const uploadSchema = z.object({
    body: z.object({
        fileName: z.string(),
        contentType: z.string(),
    })
});