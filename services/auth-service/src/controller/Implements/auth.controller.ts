import type { NextFunction, Request, Response } from "express";
import Jwt from "../../utils/jwt";
import MessageBroker from "../../utils/messageBroker";
import type { AuthRequest } from "../../types/api";
import { Event } from "../../types/enums";
import type { JwtPayload } from "jsonwebtoken";
import { Service } from "typedi";
import UserRepository from "../../repository/Implements/user.repository";
import type IUserRepository from "../../repository/interface/IUserRepository";
import type IJwt from "../../types/interface/IJwt";
import type IKafka from "../../types/interface/IKafka";
import type IOtpRepository from "../../repository/interface/IOtpRepository";
import OtpRepository from "../../repository/Implements/otp.repository";
import generateOtp from "../../utils/otpCreator";
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

    /**
     * @desc    Register new user
     * @body    name, email, password
     * @method  POST
     * @access  Public
     */
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
                await sendMail(email, `mocha verifcation code for ${name}`, `you verification code ${otpCode}`, { name, otp: otpCode, link: process.env.FRONTEND_LINK + "/auth/otp" });

                console.log('email send succefully');

            } else throw new Error("🔴 when creating otp have a problem")

            if (user) {
                const jwtPayload = { userId: user._id, type: "__refreshToken" };

                const token = this.jwt.generateToken(jwtPayload);

                // WIRE UP: User Event Pass

                res.cookie("otp", token, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    path: "/",
                });
                const data = { name: user.name, email: user.email, role: user.role, verified: user.verified,_id:user._id }
                res.status(200).json({
                    success: true,
                    message: "User successfully created",
                    data: data,
                    token: token,
                });

            } else {
                res.status(400);
                throw new Error("🔴 User not created");
            }
        } catch (err) {
            next(err);
        }
    }

    /**
     * @desc    Login user
     * @body    email, password
     * @method  POST
     * @access  Public
     */
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
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

                const refreshToken = this.jwt.generateRefreshToken(jwtPayload);

                res.cookie("__refreshToken", refreshToken, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    path: "/",
                });

                const data = { name: user.name, email: user.email, role: user.role, verified: user.verified,_id:user._id }

                res.status(200).json({
                    success: true,
                    message: "User successfully logged in",
                    data,
                });

            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Check user authentication
     * @method  GET
     * @access  Private
     * @header  Authorization Bearer token
     */
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

    /**
     * @desc    Setup user role
     * @body    id, role
     * @method  POST
     * @access  Private
     * @header  Authorization Bearer token
     */
    async roleSetup(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id, role } = req.body;
            const user = await this.userRepository.updateUser(id, { role })
            if (!user) throw new Error("user not found");


        } catch (error) {
            next(error)
        }
    }

    /**
     * @desc    Logout user
     * @method  POST
     * @access  Private
     * @header  Authorization Bearer token
     */
    logoutUser(req: AuthRequest, res: Response) {
        res.cookie("__refreshToken", "", {
            httpOnly: true,
            expires: new Date(0),
        });
        res.clearCookie("refreshToken");
        delete req.user;
        res.status(200).json({ message: "User successfully logged out" });
    }

    /**
     * @desc    Refresh access token
     * @method  POST
     * @access  Public
     * @cookie  __refreshToken
     */
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

    /**
     * @desc    Get all users
     * @method  GET
     * @access  Public (WIRE_UP :should be Admin)
     * @todo    Add admin access restriction
     */
    async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const users = await this.userRepository.find(100); // Using repository with a limit of 100 users
            res.status(200).json({ message: "Successfully retrieved all users", data: users });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Search users
     * @body    text
     * @method  GET
     * @access  Private
     * @header  Authorization Bearer token
     */
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
