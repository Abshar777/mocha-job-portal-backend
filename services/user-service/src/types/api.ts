import type { Request } from "express";
import type { Multer } from "multer";
export interface AuthRequest extends Request {
    user?: string;
    userEmail?:string;
    userName?:string;
}

export interface FileRequest extends Request {
    file?: Express.Multer.File;
}

