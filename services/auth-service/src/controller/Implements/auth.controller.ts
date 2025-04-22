import type { NextFunction, Request, Response } from "express";
import Jwt from "../../utils/jwt";
import MessageBroker from "../../utils/messageBroker";
import type { AuthRequest } from "../../types/api";
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
import { googleAuthProviderApi, githubAuthProviderApi, facebookAuthProviderApi } from "../../utils/providersApi";
import { v4 as uuid } from "uuid";
import { StatusCode, StatusMessages } from "../../constants/api";
import { Event } from "../../types/enums";
import { refreshTokenCookie } from "../../constants/cookies";

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
                res.status(StatusCode.BAD_REQUEST);
                throw new Error("User already exists");
            }

            const user = await this.userRepository.create({
                name,
                email,
                password,
                verified: false
            });
            this.kafka.publish("Auth-Topic", { data: user, }, Event.CREATE);
            
            if (!user) {
                res.status(StatusCode.INTERNAL_SERVER_ERROR);
                throw new Error(StatusMessages.INTERNAL_SERVER_ERROR);
            }

            const otpCode = generateOtp();
            const createdOtp = await this.otpRepository.create({
                email,
                otp: otpCode,
                userId: user._id as string
            });

            if (!createdOtp) {
                res.status(StatusCode.INTERNAL_SERVER_ERROR);
                throw new Error("Failed to create OTP");
            }

            await sendMail(
                email,
                `Mocha verification code for ${name}`,
                `Your verification code is ${otpCode}`,
                {
                    name,
                    otp: otpCode,
                    link: process.env.FRONTEND_LINK + "/auth/otp"
                }
            );

            const jwtPayload = { userId: user._id, type: "__refreshToken" };
            const token = this.jwt.generateToken(jwtPayload);

            res.cookie("otp", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                path: "/",
                sameSite: "strict",
                secure: false,
            });

            const data = {
                name: user.name,
                email: user.email,
                role: user.role,
                verified: user.verified,
                _id: user._id
            };

            res.status(StatusCode.CREATED).json({
                success: true,
                message: "User successfully registered",
                data,
                token
            });
        } catch (error) {
            next(error);
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
                res.status(StatusCode.NOT_FOUND);
                throw new Error("User not found");
            }

            const isMatch = user.comparePassword(password);
            if (!isMatch) {
                res.status(StatusCode.BAD_REQUEST);
                throw new Error("password is wrong");
            }

            const jwtPayload = { userId: user._id };
            const token = this.jwt.generateAccessToken(jwtPayload);
            const refreshToken = this.jwt.generateRefreshToken(jwtPayload);

            res.cookie("__refreshToken", refreshToken,refreshTokenCookie);

            const data = {
                name: user.name,
                email: user.email,
                role: user.role,
                verified: user.verified,
                _id: user._id
            };

            res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "User successfully logged in",
                data,
                token,
                refreshToken
            });
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
            const data = { name: user.name, email: user.email, role: user.role, verified: user.verified, _id: user._id }
            res.status(200).json({ message: 'user is found', data, token: accessToken })

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
            const refreshToken = req.cookies?.__refreshToken || req.body.refreshToken;

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
                res.cookie("__refreshToken", refreshToken, refreshTokenCookie);

                res.status(200).json({ token, message: "succesfully created token" })
            }


        } catch (error) {
            next(error);
        }
    }







    /**
     * @desc    Update Role
     * @method  PUT
     * @access  Private
     * @header  Authorization Bearer token
     */
    async updateRole(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { role } = req.body;

            const user = await this.userRepository.updateUser(req.user as string, { role });
            if (!user) throw new Error("user not found");
            res.status(StatusCode.SUCCESS).json({ message: "User role updated", data: user.role });
        } catch (error) {
            next(error);
        }
    }



    /**
     * @desc    OAuth Login
     * @body    token, provider
     * @method  POST
     * @access  Public
     */
    async OAuthLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, provider } = req.body;
            let userData;

            if (provider === "google") {
                const googleRes = await googleAuthProviderApi(token);
                userData = googleRes.data;
            } else if (provider === "github") {
                const githubRes = await githubAuthProviderApi(token);
                userData = githubRes.data;
            } else if (provider === "facebook") {
                const facebookRes = await facebookAuthProviderApi(token);
                userData = facebookRes.data;
            } else {
                res.status(StatusCode.BAD_REQUEST);
                throw new Error("Invalid provider");
            }

            if (!userData.email) {
                res.status(StatusCode.BAD_REQUEST);
                throw new Error("Email not found in OAuth response");
            }

            let user = await this.userRepository.findByEmail(userData.email);

            if (!user) {
                user = await this.userRepository.create({
                    email: userData.email,
                    password: uuid(),
                    verified: true,
                    name: userData.name || userData.email.split("@")[0],
                    provider
                });
            }

            const jwtPayload = { userId: user._id };
            const accessToken = this.jwt.generateAccessToken(jwtPayload);
            const refreshToken = this.jwt.generateRefreshToken(jwtPayload);

            res.cookie("__refreshToken", refreshToken, refreshTokenCookie);

            const data = {
                name: user.name,
                email: user.email,
                role: user.role,
                verified: user.verified,
                _id: user._id
            };

            res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "User successfully logged in",
                data,
                token: accessToken,
                refreshToken
            });
        } catch (error) {
            next(error);
        }
    }

}

export default UserController;
