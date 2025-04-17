import { Service } from "typedi";
import type { NextFunction, Request, Response } from "express";
import type IUserRepository from "../../repository/interface/IUserRepository";
import type IOtpRepository from "../../repository/interface/IOtpRepository";
import UserRepository from "../../repository/Implements/user.repository";
import OtpRepository from "../../repository/Implements/otp.repository";
import generateOtp from "../../utils/otpCreator";
import sendMail from "../../utils/sendMail";
import type IJwt from "../../types/interface/IJwt";
import JwtService from "../../utils/jwt";
import { hash } from "../../utils/bcrypt";
import MessageBroker from "../../utils/messageBroker";
import type IKafka from "../../types/interface/IKafka";
import { Event } from "../../types/enums";

@Service()
class PasswordController {
    private readonly userRepository: IUserRepository;
    private readonly otpRepository: IOtpRepository;
    private readonly jwt: IJwt;
    private readonly kafka: IKafka;
    constructor() {
        this.userRepository = new UserRepository();
        this.otpRepository = new OtpRepository();
        this.jwt = new JwtService();
        this.kafka = new MessageBroker();


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
            console.log('otpCode 📫', otpCode)
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
                token,
                data: {
                    email: user.email,
                    _id: user._id
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Reset password with OTP verification
     * @body    email, newPassword
     * @method  POST
     * @access  Public
     */
    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, newPassword } = req.body;


            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                res.status(404);
                throw new Error("User not found");
            }
            const hashedPassword = await hash(newPassword);
            const updatedUser = await this.userRepository.updateUser(user._id as string, { password: hashedPassword });
            this.kafka.publish("Auth-Topic", { data: updatedUser }, Event.UPDATE);
            if (!updatedUser) {
                res.status(500);
                throw new Error("Failed to update password");
            }

            await this.otpRepository.deleteByEmail(email);
            res.cookie("reset_session", "", {
                httpOnly: true,
                maxAge: 0,
                path: "/",
            });
            res.status(200).json({
                success: true,
                message: "Password reset successful"
            });
        } catch (error) {
            next(error);
        }
    }



    /**
     * @desc    Confirm password access
     * @body    resetToken
     * @method  POST
     * @access  Public
     */
    async conformPasswordAccess(req: Request, res: Response, next: NextFunction) {
        try {
            console.log(req.cookies, "this is cookies")
            const resetToken = req.cookies?.reset_session || req.body.resetToken;
            if (!resetToken) {
                res.status(401);
                throw new Error("Not authorized");
            }
            const { userId } = this.jwt.verifyToken(resetToken, "token") as { userId: string };
            if (!userId) {
                res.status(401);
                throw new Error("Not authorized");
            }
            const user = await this.userRepository.findById(userId as string);
            if (!user) {
                res.status(404);
                throw new Error("User not found");
            }
            res.status(200).json({
                success: true,
                message: "Password access confirmed",
                data: {
                    email: user.email,
                    _id: user._id
                }
            })

        } catch (error) {
            console.log(error, "this is error")
            next(error);
        }
    }
}

export default PasswordController;
