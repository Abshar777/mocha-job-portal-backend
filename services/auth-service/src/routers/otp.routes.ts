import { Router } from "express";
import OtpController from "../controller/Implements/otp.controller";
import { validate } from "../middleware/validateMiddleware";
import { otpVerifySchema,checkOtpStatusSchema,resendOtpSchema } from "../validator/otp.validator";

const router = Router();
const otpController=new OtpController()

/**
 * @route   PUT /api/otp/verify
 * @desc    Verify OTP
 * @access  Public
 */
router.put(
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
 * @route   POST /api/otp/status
 * @desc    Check OTP status
 * @access  Public
 */
router.post(
    '/status',
    validate(checkOtpStatusSchema),
    otpController.checkOtpStatus.bind(otpController)
);

export default router; 