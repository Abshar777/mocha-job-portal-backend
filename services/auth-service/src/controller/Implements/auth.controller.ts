import type { NextFunction, Request, Response } from "express";
import Jwt from "../../utils/jwt";
import MessageBroker from "../../utils/messageBroker";
import type { AuthRequest } from "../../types/api";
import { Event } from "../../types/enums";
import type { JwtPayload } from "jsonwebtoken";
import { Inject, Service } from "typedi";
import UserRepository from "../../repository/Implements/user.repository";
import type IUserRepository from "../../repository/interface/IUserRepository";
import type IJwt from "../../types/interface/IJwt";
import type IKafka from "../../types/interface/IKafka";
import type IOtpRepository from "../../repository/interface/IOtpRepository";
import OtpRepository from "../../repository/Implements/otp.repository";
import generateOtp from "../../utils/otpCreator";
import { sendEmail } from "../../utils/nodemail";
import sendMail from "../../utils/sendMail";

@Service()
class UserController {
    private readonly userRepository: IUserRepository;
    private readonly jwt: IJwt;
    private readonly kafka: IKafka;
    private readonly otpRepository: IOtpRepository;
    constructor() {
        this.userRepository = new UserRepository();
        this.jwt = new Jwt();
        this.kafka = new MessageBroker();
        this.otpRepository = new OtpRepository();
    }


    //@desc    register user
    //@body    name,email,password
    //@method  POST
    async registerUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, password } = req.body;
            const exist = await this.userRepository.findByEmail(email);
            if (exist) {
                res.status(400);
                throw new Error("User already exists");
            }
            const user = await this.userRepository.create({ name, email, password, verified: false });
            const otpCode = generateOtp()
            const createdOtp = await this.otpRepository.create({ email, otp: otpCode, userId: user._id as string });
            if (createdOtp) {
                await sendMail(email, `mocha verifcation code for ${name}`, `you verification code ${otpCode}`, { name, otp: otpCode, link: process.env.FRONTEND_LINK + "/auth/otp" })
            } else throw new Error("🔴 when creating otp have a problem")
            if (user) {
                const jwtPayload = { userId: user._id }
                const accesToken = this.jwt.generateAccessToken(jwtPayload);
                const refreshToken = this.jwt.generateRefreshToken(jwtPayload);
                await this.kafka.publish("User-Topic", { data: user }, Event.CREATE);
                res.cookie("__refreshToken", refreshToken, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    path: "/",
                });
                res.status(200).json({
                    success: true,
                    message: "User successfully created",
                    data: user,
                    token: accesToken,
                });
            } else {
                res.status(400);
                throw new Error("🔴 User not created");
            }
        } catch (err) {
            next(err);
        }
    }

    //@desc    login route
    //@body    email,password
    //@method  POST
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            console.log()
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                res.status(400);
                throw new Error("User not found");
            }
            const isMatch = user.comparePassword(password);
            if (!isMatch) {
                res.status(400);
                throw new Error("Password is incorrect");
            } else {
                const jwtPayload = { userId: user._id };
                const accesToken = this.jwt.generateAccessToken(jwtPayload);
                const refreshToken = this.jwt.generateRefreshToken(jwtPayload);
                res.cookie("__refreshToken", refreshToken, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    path: "/",
                });
                res.status(200).json({
                    success: true,
                    message: "User successfully logged in",
                    data: user,
                    token: accesToken
                });
            }
        } catch (error) {
            next(error);
        }
    }

    //@desc    check user
    //@method  GET
    async checkUser(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user;
            if (!userId) throw new Error("user not found")
            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("user not found")
            const jwtPayload = { userId: user._id };
            const accessToken = this.jwt.generateAccessToken(jwtPayload);
            res.status(200).json({ message: 'user is found', data: user, token: accessToken })
        } catch (error) {
            next(error)
        }
    }

    // @desc    setup user role
    // @method  POST
    // @body    id:userID,role
    async roleSetup(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id, role } = req.body;
            const user = await this.userRepository.updateUser(id, { role })
            if (!user) throw new Error("user not found");


        } catch (error) {
            next(error)
        }
    }

    //@desc    logout user
    //@method  POST
    logoutUser(req: AuthRequest, res: Response) {
        res.cookie("__refreshToken", "", {
            httpOnly: true,
            expires: new Date(0),
        });
        res.clearCookie("refreshToken");
        delete req.user;
        res.status(200).json({ message: "User successfully logged out" });
    }

    //@desc    refresh token
    //@method  POST
    // @cookies   __refreshToken
    async refreshTokenGet(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies?.__refreshToken;

            if (!refreshToken) {
                console.log('no token')
                res.status(400);
                throw new Error("unothriezed user and user dont have token")
            } else {
                const { userId } = this.jwt.verifyRefreshToken(refreshToken) as JwtPayload;
                if (!userId) {
                    res.status(400);
                    throw new Error("user not found");
                }
                const user = await this.userRepository.findById(userId);
                if (!user) {
                    console.log('user not found or user is Blocked');
                    res.status(400);
                    throw new Error("user not found or user is Blocked");
                }
                const jwtPayload = { userId: user._id };
                const token = this.jwt.generateAccessToken(jwtPayload);
                req.user = userId as string;
                res.cookie("__refreshToken", refreshToken, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                    path: "/",
                });
                res.status(200).json({ token, message: "succesfully created token" })
            }
        } catch (error) {
            next(error);
        }
    }

    //@desc    get all users
    //@method  GET
    async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const users = await this.userRepository.find(100); // Using repository with a limit of 100 users
            res.status(200).json({ message: "Successfully retrieved all users", data: users });
        } catch (error) {
            next(error);
        }
    }


    //@desc    Search user
    //@body    text
    //@method  GET
    async searchUser(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { text } = req.body;
            console.log(text, typeof text, !text, typeof text !== 'string', req.body);

            if (typeof text !== 'string') throw new Error("invalid input ")
            const users = await this.userRepository.search(text, req.user as string);

            if (users.length === 0) throw new Error("users not found")

            res.status(200).json({ message: "Users found", data: users });
        } catch (error) {
            next(error);
        }
    }
}

export default UserController;
