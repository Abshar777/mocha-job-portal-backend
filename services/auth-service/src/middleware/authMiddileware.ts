import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../types/api";
import Jwt from "../utils/jwt";
import userSchema from "../models/user.model";
import  type{ JwtPayload } from "jsonwebtoken";


const authMiddilware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // console.log(req.headers);
    try {
        const { authorization: authHeader } = req.headers;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            res.status(401);
            throw new Error("Access token required");
        }
        const jwt = new Jwt();
        const {userId} = jwt.verifyAccessToken(token) as JwtPayload

        if (!userId) {
            res.status(400);
            throw new Error("user not found");
        }
        const user = await userSchema.findById(userId);
        if (!user ) {
            console.log('user not found or user is Blocked');
            res.status(400);
            throw new Error("user not found or user is Blocked");
        }
        req.userName=user.name;
        req.userEmail=user.email;
        req.user = userId as string;
        next();
    } catch (error) {
        res.status(401).json({ message: "user token is expired" })

    }


};




export const refreshTokenMidllWare = async (req: AuthRequest, res: Response, next: NextFunction) => {
   try {
    const refreshToken = req.cookies?.__refreshToken;

    if (!refreshToken) {
        console.log('no token')
        res.status(400);
        throw new Error("unothriezed user and user dont have token")
    } else {
        const jwt = new Jwt();
        const {userId} = jwt.verifyRefreshToken(refreshToken) as JwtPayload
        if (!userId) {
            res.status(400);
            throw new Error("user not found");
        }
        const user = await userSchema.findById(userId);
        if (!user ) {
            console.log('user not found or user is Blocked');
            res.status(400);
            throw new Error("user not found or user is Blocked");
        }
        req.user = userId as string
        next();
    }
   } catch (error) {
    console.log(error, 'refresh token error');
    res.status(400).json({ message: "user token is expired" })
   }
}

export default authMiddilware