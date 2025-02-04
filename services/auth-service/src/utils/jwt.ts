import jwt from "jsonwebtoken";
import { Service } from "typedi";
import type IJwtService from "../types/interface/IJwt";
import type { StringValue } from "ms";

@Service()
class JwtService implements IJwtService {
  private accessSecret: string;
  private refreshSecret: string;
  private tokenSecret: string;

  constructor() {
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET || !process.env.JWT_TOKEN) {
      throw new Error("JWT secrets are missing. Please set them in environment variables.");
    }

    this.accessSecret = process.env.JWT_ACCESS_SECRET;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET;
    this.tokenSecret = process.env.JWT_TOKEN;
  }

  generateAccessToken(payload: object) {
    try {
      const token = jwt.sign(payload, this.accessSecret, { expiresIn: "2m" });
      return token;
    } catch (error) {
      throw new Error("Failed to generate access token");
    }
  }

  generateToken(payload: object, expireTime: number | StringValue = "1d") {
    try {
      const token = jwt.sign(payload, this.tokenSecret, { expiresIn: expireTime });
      return token;
    } catch (error) {
      throw new Error("Failed to generate token");
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
      throw new Error("Invalid access token");
    }
  }

  verifyRefreshToken(token: string) {
    try {
      return jwt.verify(token, this.refreshSecret);
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  verifyToken(token: string, type: "access" | "refresh" | "token") {
    try {
      const secret = {
        access: this.accessSecret,
        refresh: this.refreshSecret,
        token: this.tokenSecret
      }[type];

      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error(`Invalid ${type} token`);
    }
  }
}

export default JwtService;
