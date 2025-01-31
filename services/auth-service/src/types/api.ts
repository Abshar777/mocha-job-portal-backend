import type { Request } from "express";

export interface AuthRequest extends Request {
    user?: string;
}

