import type { JwtPayload } from "jsonwebtoken";

export default interface IJwtService {
    generateAccessToken(payload: object): string;
    generateRefreshToken(payload: object): string;
    verifyAccessToken(token: string): JwtPayload | string;
    verifyRefreshToken(token: string): JwtPayload | string;
}