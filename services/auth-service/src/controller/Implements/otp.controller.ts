import { Service } from "typedi";
import type { NextFunction, Request, Response } from "express";
import type IOtpRepository from "../../repository/interface/IOtpRepository";
import type IUserRepository from "../../repository/interface/IUserRepository";
import OtpRepository from "../../repository/Implements/otp.repository";
import UserRepository from "../../repository/Implements/user.repository";
import generateOtp from "../../utils/otpCreator";
import sendMail from "../../utils/sendMail";
import type IOtpController from "../interface/IOtpController";
import type { AuthRequest } from "../../types/api";

@Service()
class OtpController implements IOtpController {
    private readonly otpRepository: IOtpRepository;
    private readonly userRepository: IUserRepository;

    constructor() {
        this.otpRepository = new OtpRepository();
        this.userRepository = new UserRepository();
    }

    //@desc    Verify OTP
    //@body     otp
    //@method  POST
    async verifyOtp(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { otp } = req.body;
            const email = req.userEmail as string;


            const isValid = await this.otpRepository.verifyOtp(email, otp);
            if (!isValid) {
                res.status(400);
                throw new Error("Invalid OTP");
            }


            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                res.status(404);
                throw new Error("User not found");
            }

            await this.userRepository.updateUser(user._id as string, { verified: true });


            await this.otpRepository.deleteByEmail(email);

            res.status(200).json({
                success: true,
                message: "OTP verified successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    //@desc    Resend OTP
    //@method  POST
    async resendOtp(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { user: userId, userEmail: email, userName: name } = req;


            const newOtp = generateOtp();


            const createdOtp = await this.otpRepository.create({
                userId,
                email,
                otp: newOtp,
            });

            if (!createdOtp) {
                res.status(500);
                throw new Error("Failed to create OTP");
            }


            const response = await sendMail(
                email as string,
                `Mocha Verification Code for ${name}`,
                `Your new verification code is ${newOtp}`,
                {
                    name: name,
                    otp: newOtp,
                    link: process.env.FRONTEND_LINK + "/auth/otp"
                }
            );

            if (!response) {
                res.status(500);
                throw new Error("Failed to send OTP email");
            }

            res.status(200).json({
                success: true,
                message: "OTP resent successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    //@desc    Check OTP Status
    //@method  GET
    async checkOtpStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user;

            const otpRecord = await this.otpRepository.findByUserId(userId as string);

            if (!otpRecord) {
                res.status(404);
                throw new Error("🔴 otp not found");
            }

            res.status(200).json({
                success: true,
                data: {
                    hasOtp: !!otpRecord,
                    createdAt: otpRecord.createdAt
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export default OtpController;
