import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../types/api";
import Jwt from "../utils/jwt";
import userSchema from "../models/user.model";
import type { JwtPayload } from "jsonwebtoken";
import { StatusCode, StatusMessages } from "../constants/api";


const authMiddilware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { authorization: authHeader } = req.headers;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            console.log('no access token')
            res.status(StatusCode.UNAUTHORIZED);
            throw new Error(StatusMessages.UNAUTHORIZED);
        }

        const jwt = new Jwt();
        const { userId } = jwt.verifyAccessToken(token) as JwtPayload

        if (!userId) {
            res.status(StatusCode.NOT_FOUND);
            throw new Error(StatusMessages.NOT_FOUND);
        }
        const user = await userSchema.findById(userId);
        if (!user) {
            console.log('user not found or user is Blocked');
            res.status(StatusCode.BAD_REQUEST);
            throw new Error("user not found or user is Blocked");
        }
        req.userName = user.name;
        req.userEmail = user.email;
        req.user = userId as string;
        next();
    } catch (error) {
        console.log('error', (error as Error).message) 
        res.status(StatusCode.UNAUTHORIZED).json({ message: "user token is expired" })

    }


};




export const refreshTokenMidllWare = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

        const refreshToken = req.cookies?.__refreshToken || req.body.refreshToken;

        if (refreshToken) {
            const jwt = new Jwt();
            const { userId } = jwt.verifyRefreshToken(refreshToken) as JwtPayload
            console.log('userId', userId)
            if (!userId) {
                res.status(StatusCode.UNAUTHORIZED);
                throw new Error("user not found");
            }

            const user = await userSchema.findById(userId);
            if (!user) {
                console.log('user not found or user is Blocked');
                res.status(StatusCode.BAD_REQUEST);
                throw new Error("user not found or user is Blocked");
            }
            req.user = userId as string
            next();
        } else {
            console.log('no refresh token')
            res.status(StatusCode.BAD_REQUEST).json({ message: "user token is expired" })

        }
    } catch (error) {
        console.log(error, 'refresh token error');
        res.status(StatusCode.BAD_REQUEST).json({ message: "user token is expired" })
    }
}

export default authMiddilware