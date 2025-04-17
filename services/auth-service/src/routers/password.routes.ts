import { Router } from "express";
import PasswordController from "../controller/Implements/password.controller";
import { validate } from "../middleware/validateMiddleware";
import { passwordValidationSchemas } from "../validator/password.validator";

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
 * @route   GET /api/password/conformAccess
 * @desc    Conform password access
 * @access  Public
 */
router.post(
    "/conformAccess",
    passwordController.conformPasswordAccess.bind(passwordController)
);


export default router; 