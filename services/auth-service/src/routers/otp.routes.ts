import { Router } from "express";
import { Container } from "typedi";
import OtpController from "../controller/Implements/otp.controller";
import { validate } from "../middleware/validateMiddleware";
import { otpVerifySchema, resendOtpSchema } from "../validator/otp.validator";
import type IOtpController from "../controller/interface/IOtpController";

const router = Router();
const otpController: IOtpController = new OtpController();

/**
 * @route   POST /api/otp/verify
 * @desc    Verify OTP
 * @access  Public
 */
router.post(
    '/verify',
    validate(otpVerifySchema),
    otpController.verifyOtp.bind(otpController)
);

/**
 * @route   POST /api/otp/resend
 * @desc    Resend OTP
 * @access  Public
 */
router.post(
    '/resend',
    validate(resendOtpSchema),
    otpController.resendOtp.bind(otpController)
);

/**
 * @route   GET /api/otp/status
 * @desc    Check OTP status
 * @access  Public
 */
router.get(
    '/status',
    otpController.checkOtpStatus.bind(otpController)
);

export default router;