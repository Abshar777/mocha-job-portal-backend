import { Router } from "express";
import OtpController from "../controller/Implements/otp.controller";
import { validate } from "../middleware/validateMiddleware";
import { checkOtpStatusSchema, otpVerifySchema, resendOtpSchema } from "../validator/otp.validator";

const router = Router();
const otpController= new OtpController();

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
    validate(checkOtpStatusSchema),
    otpController.checkOtpStatus.bind(otpController)
);

export default router;