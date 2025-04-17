import express from "express";
import UserController from "../controller/Implements/user.controller";
import authMiddleware from "../middleware/authMiddileware";


const router = express.Router();
const controller = new UserController();

/**
 * @route   POST /api/user/personal-details
 * @desc    Login user
 * @access  Private
 */
router.post("/personal-details", authMiddleware, controller.addRoleAndPersonalDetails.bind(controller));

/**
 * @route   POST /api/user/ExistsCompany
 * @desc    Check company name or website is already exists
 * @access  Private
 */
router.post("/ExistsCompany", authMiddleware, controller.checkCompanyNameOrWebsite.bind(controller));

export default router;