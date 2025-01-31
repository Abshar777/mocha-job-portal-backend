import jwt from "jsonwebtoken";
import { Service } from "typedi";
import type IJwtService from "../types/interface/IJwt";


class JwtService implements IJwtService {
  private accessSecret: string;
  private refreshSecret: string;

  constructor() {
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets are missing. Please set them in environment variables.");
    }

    this.accessSecret = process.env.JWT_ACCESS_SECRET;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET;
  }

  generateAccessToken(payload: object) {
    try {
      const token = jwt.sign(payload, this.accessSecret, { expiresIn: "2m" });
      return token;
    } catch (error) {
      throw new Error("Failed to generate access token");
    }
  }

  generateRefreshToken(payload: object) {
    try {
      const token = jwt.sign(payload, this.refreshSecret, { expiresIn: "30d" });
      return token;
    } catch (error) {
      throw new Error("Failed to generate refresh token");
    }
  }

  verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, this.accessSecret);
    } catch (error) {
      throw new Error("Failed to generate refresh token");
    }
  }

  verifyRefreshToken(token: string) {
    try {
      return jwt.verify(token, this.refreshSecret);
    } catch (error) {
      throw new Error("Failed to generate refresh token");
    }
  }
}

export default JwtService;
