import { Service } from "typedi";
import type { NextFunction, Request, Response } from "express";
import type IUserRepository from "../../repository/interface/IUserRepository";
import type IOtpRepository from "../../repository/interface/IOtpRepository";
import UserRepository from "../../repository/Implements/user.repository";
import OtpRepository from "../../repository/Implements/otp.repository";
import generateOtp from "../../utils/otpCreator";
import sendMail from "../../utils/sendMail";
import type { AuthRequest } from "../../types/api";
import type IJwt from "../../types/interface/IJwt";
import JwtService from "../../utils/jwt";

@Service()
class PasswordController {
    private readonly userRepository: IUserRepository;
    private readonly otpRepository: IOtpRepository;
    private readonly jwt: IJwt;

    constructor() {
        this.userRepository = new UserRepository();
        this.otpRepository = new OtpRepository();
        this.jwt = new JwtService();


    }

    /**
     * @desc    Request password reset (forgot password)
     * @body    email
     * @method  POST
     * @access  Public
     */
    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;

            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                res.status(404);
                throw new Error("User not found");
            }

            const otpCode = generateOtp();

            const createdOtp = await this.otpRepository.create({
                email,
                otp: otpCode,
                userId: user._id as string
            });

            if (!createdOtp) {
                res.status(500);
                throw new Error("Failed to create OTP");
            }

            await sendMail(
                email,
                "Password Reset Request",
                `Your password reset code is ${otpCode}`,
                {
                    name: user.name,
                    otp: otpCode,
                    link: process.env.FRONTEND_LINK + "/auth/reset-password"
                }
            );
            const payload = { userId: user._id, type: "reset_session" }
            const token = this.jwt.generateToken(payload)

            res.cookie("otp", token, {
                httpOnly: true,
                maxAge: 1 * 24 * 60 * 60 * 1000,
                path: "/",
            });

            res.status(200).json({
                success: true,
                message: "Password reset instructions sent to email",
                token
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Reset password with OTP verification
     * @body    email, otp, newPassword
     * @method  POST
     * @access  Public
     */
    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, otp, newPassword } = req.body;

            const isValid = await this.otpRepository.verifyOtp(email, otp);
            if (!isValid) {
                res.status(400);
                throw new Error("Invalid or expired OTP");
            }

            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                res.status(404);
                throw new Error("User not found");
            }

            await this.userRepository.updateUser(user._id as string, { password: newPassword });

            await this.otpRepository.deleteByEmail(email);

            res.status(200).json({
                success: true,
                message: "Password reset successful"
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Change password (when logged in)
     * @body    currentPassword, newPassword
     * @method  POST
     * @access  Private
     * @header  Authorization Bearer token
     */
    async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user;

            if (!userId) {
                res.status(401);
                throw new Error("Not authorized");
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                res.status(404);
                throw new Error("User not found");
            }

            const isMatch = user.comparePassword(currentPassword);
            if (!isMatch) {
                res.status(400);
                throw new Error("Current password is incorrect");
            }

            await this.userRepository.updateUser(userId, { password: newPassword });

            res.status(200).json({
                success: true,
                message: "Password changed successfully"
            });
        } catch (error) {
            next(error);
        }
    }
}

export default PasswordController;
