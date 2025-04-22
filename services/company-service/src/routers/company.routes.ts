import express from "express";
import CompanyController from "../controller/Implements/company.controller";
import authMiddleware from "../middleware/authMiddileware";


const router = express.Router();
const controller = new CompanyController();


/**
 * @route   POST /api/user/ExistsCompany
 * @desc    Check company name or website is already exists
 * @access  Private
 */
router.post("/ExistsCompany", authMiddleware, controller.checkCompanyNameOrWebsite.bind(controller));

export default router;