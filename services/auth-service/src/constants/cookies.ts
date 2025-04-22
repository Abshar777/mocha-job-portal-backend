import type { CookieOptions } from "express";
import dotenv from "dotenv";
dotenv.config();
export const refreshTokenCookie:CookieOptions = {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
    sameSite: "none",
    secure: false,
    
}
