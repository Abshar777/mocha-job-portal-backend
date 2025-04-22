import { Service } from "typedi";
import type { NextFunction, Request, Response } from "express";
import type IOtpRepository from "../../repository/interface/IOtpRepository";
import type IUserRepository from "../../repository/interface/IUserRepository";
import OtpRepository from "../../repository/Implements/otp.repository";
import UserRepository from "../../repository/Implements/user.repository";
import generateOtp from "../../utils/otpCreator";
import sendMail from "../../utils/sendMail";
import type { AuthRequest } from "../../types/api";
import type IJwtService from "../../types/interface/IJwt";
import JwtService from "../../utils/jwt";
import type { JwtPayload } from "jsonwebtoken";
import { StatusCode } from "../../constants/api";
import MessageBroker from "../../utils/messageBroker";
import type IKafka from "../../types/interface/IKafka";
import { Event } from "../../types/enums";
import { refreshTokenCookie } from "../../constants/cookies";

@Service()
class OtpController  {
    private readonly otpRepository: IOtpRepository;
    private readonly userRepository: IUserRepository;
    private readonly jwt: IJwtService;
    private readonly kafka: IKafka;

    constructor() {
        this.otpRepository = new OtpRepository();
        this.userRepository = new UserRepository();
        this.jwt = new JwtService();
        this.kafka = new MessageBroker();
    }

    /**
     * @desc    Verify OTP
     * @body     otp
     * @method  PUT
     * @access  Public
     * @cookie  otp
     */
    async verifyOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { otp } = req.body;
            const email = req.query.email as string
            const otpToken = req.cookies?.otp;
            if (!otpToken) {
                res.status(StatusCode.BAD_REQUEST);
                throw new Error("otp token is not found ")
            }
            const { type, userId } = this.jwt.verifyToken(otpToken, "token") as JwtPayload;

            if (!otpToken) {
                res.status(401);
                throw new Error("Unauthorized");
            }

            const isValid = await this.otpRepository.verifyOtp(email, otp);
            if (!isValid) {
                res.status(400);
                throw new Error("Invalid OTP");
            }

            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                res.status(404);
                throw new Error("User not found, or User Id does not match cookie");
            }

            await this.otpRepository.deleteByEmail(email);
            res.cookie("otp", "", {
                httpOnly: true,
                maxAge: 0,
                path: "/",
                sameSite: "strict",
                secure: false,
            });


            const jwtPayload = { userId };
            const token = this.jwt.generateToken(jwtPayload, "1d");
            const refreshToken = this.jwt.generateRefreshToken(jwtPayload);
            if (!user.verified) {
                await this.userRepository.updateUser(user._id as string, { verified: true });
                this.kafka.publish("Auth-Topic", { data: user }, Event.UPDATE);
            }


            if (type === "reset_session") {
                res.cookie(type, token, {
                    httpOnly: true,
                    maxAge: 1 * 24 * 60 * 60 * 1000,
                    path: "/",
                    sameSite: "strict",
                    secure: false,
                });

            } else {

                res.cookie("__refreshToken", refreshToken, refreshTokenCookie);
            }
            console.log(type, "this is token type")

            res.status(200).json({
                success: true,
                message: "OTP verified successfully",
                token: token,
                type: type === "reset_session" ? "FORGET_PASSWORD" : "LOGIN"
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Resend OTP
     * @body    email
     * @method  POST
     * @access  Public
     */
    async resendOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                res.status(400);
                throw new Error("User email is not valid");
            }

            const newOtp = generateOtp();
            const createdOtp = await this.otpRepository.create({
                userId: user._id as string,
                email,
                otp: newOtp,
            });

            if (!createdOtp) {
                res.status(500);
                throw new Error("Failed to create OTP");
            }

            const response = await sendMail(
                email,
                `Mocha Verification Code for ${user.name}`,
                `Your new verification code is ${newOtp}`,
                {
                    name: user.name,
                    otp: newOtp,
                    link: process.env.FRONTEND_LINK + "/auth/otp"
                }
            );

            if (!response) {
                res.status(500);
                throw new Error("Failed to send OTP email");
            }

            const type = user.verified ? "reset_session" : "__refreshToken";
            const jwtPayload = { userId: user._id, type };
            const token = this.jwt.generateToken(jwtPayload);

            res.cookie("otp", token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
                path: "/",
                sameSite: "strict",
                secure: false,
            });
            console.log(newOtp, "this code send in you mail 📫 ")


            res.status(200).json({
                success: true,
                message: "OTP resent successfully",
                data: createdOtp
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Check OTP status
     * @query   email
     * @method  GET
     * @access  Public
     * @cookie  otp
     */
    async checkOtpStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies?.otp;
            const email = req.query?.email as string
            const user = await this.userRepository.findByEmail(email);

            if (!user) {
                res.status(400);
                throw new Error("User not found");
            }
            const userData = {
                name: user.name,
                email: user.email,
                role: user.role,
                verified: user.verified,
                _id: user._id
            }


            if (!token) {
                res.status(400).json({
                    success: false,
                    message: "OTP token is not found",
                    verified: user.verified,
                    user: userData
                })
                return;
            }
            const tokendata = this.jwt.verifyToken(token, "token") as JwtPayload;


            if (!tokendata?.userId || !email) {
                res.status(400);
                throw new Error("Missing required parameters");
            }
            const { userId } = tokendata;

            const otpRecord = await this.otpRepository.findByUserId(userId);

            if (!otpRecord || otpRecord.email !== email) {
                res.status(400).json({
                    success: false,
                    message: "OTP is not found",
                    verified: user.verified,
                    user: userData
                })
                return;


            }



            res.status(200).json({
                success: true,
                data: {
                    hasOtp: !!otpRecord,
                    createdAt: otpRecord.createdAt,

                },
                verified: user.verified,
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    verified: user.verified,
                    _id: user._id
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export default OtpController;
