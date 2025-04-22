import express from "express";
import SubscriptionController from "../controller/Implements/subscription.controller";
import { authCompanyMiddilware } from "../middleware/authMiddileware";


const router = express.Router();
const controller = new SubscriptionController();


/**
 * @route   POST /api/subscription/addSubscriptionToCompany
 * @desc    add subscription to company
 * @access  Private
 */
router.post("/addSubscriptionToCompany", authCompanyMiddilware, controller.addSubscriptionToCompany.bind(controller));


/**
 * @route   GET /api/subscription/getAllSubscriptions
 * @desc    get all subscriptions
 * @access  Private
 */
router.get("/getAllSubscriptions", authCompanyMiddilware, controller.getAllSubscriptions.bind(controller));

export default router;