import type { NextFunction, Request, Response } from "express";

export default interface IOtpController {
    verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
    resendOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkOtpStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
} 