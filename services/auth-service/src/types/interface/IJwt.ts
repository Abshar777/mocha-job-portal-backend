import type { JwtPayload } from "jsonwebtoken";
import type { StringValue } from "ms";

export default interface IJwtService {
    generateAccessToken(payload: object): string;
    generateRefreshToken(payload: object): string;
    generateToken(payload: object, expireTime?: number | StringValue):string;
    verifyAccessToken(token: string): JwtPayload | string;
    verifyRefreshToken(token: string): JwtPayload | string;
    verifyToken(token: string, type: "access" | "refresh" | "token"): string | JwtPayload
}