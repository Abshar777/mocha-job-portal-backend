import { Router } from "express";
import PasswordController from "../controller/Implements/password.controller";
import { validate } from "../middleware/validateMiddleware";
import { passwordValidationSchemas } from "../validator/password.validator";
import authMiddleware from "../middleware/authMiddileware";

const router = Router();
const passwordController = new PasswordController();

/**
 * @route   POST /api/password/forgot
 * @desc    Request password reset
 * @access  Public
 */
router.post(
    "/forgot",
    validate(passwordValidationSchemas.forgotPassword),
    passwordController.forgotPassword.bind(passwordController)
);

/**
 * @route   POST /api/password/reset
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post(
    "/reset",
    validate(passwordValidationSchemas.resetPassword),
    passwordController.resetPassword.bind(passwordController)
);

/**
 * @route   POST /api/password/change
 * @desc    Change password (when logged in)
 * @access  Private
 */
router.post(
    "/change",
    authMiddleware,
    validate(passwordValidationSchemas.changePassword),
    passwordController.changePassword.bind(passwordController)
);

export default router; 