import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validate = (schema: z.ZodSchema) =>  (req: Request, res: Response, next: NextFunction) => {
    try {
         schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
         next();
    } catch (error) {
        if (error instanceof z.ZodError) {
             res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        return next(error);
    }
}; 