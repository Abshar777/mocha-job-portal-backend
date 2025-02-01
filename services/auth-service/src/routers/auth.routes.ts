import express from "express";
import UserController from "../controller/Implements/auth.controller";
import authMiddleware, { refreshTokenMidllWare } from "../middleware/authMiddileware";
import { validate } from "../middleware/validateMiddleware";
import { validationSchemas } from "../validator/auth.validator";

const router = express.Router();
const controller = new UserController();

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
    "/login",
    validate(validationSchemas.login),
    controller.login.bind(controller)
);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
    "/register",
    validate(validationSchemas.register),
    controller.registerUser.bind(controller)
);

/**
 * @route   GET /api/auth/check
 * @desc    Check user authentication
 * @access  Private
 */
router.get(
    "/check",
    authMiddleware,
    controller.checkUser.bind(controller)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
    "/logout",
    authMiddleware,
    controller.logoutUser.bind(controller)
);

/**
 * @route   POST /api/auth/token
 * @desc    Get new access token using refresh token
 * @access  Public
 */
router.post(
    "/token",
    refreshTokenMidllWare,
    controller.refreshTokenGet.bind(controller)
);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (for testing purposes)
 * @access  Public (should be Admin in production)
 * @todo    Add admin middleware
 */
router.get(
    "/users",
    controller.getAllUsers.bind(controller)
);

export default router;