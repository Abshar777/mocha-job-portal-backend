import express from "express";
import SubscriptionController from "../controller/Implements/subscription.controller";
import { authCompanyMiddilware } from "../middleware/authMiddileware";


const router = express.Router();
const controller = new SubscriptionController();




/**
 * @route   GET /api/subscription/getAllSubscriptions
 * @desc    get all subscriptions
 * @access  Public
 * 
 */
router.get("/getAllSubscriptions", controller.getAllSubscriptions.bind(controller));


/**
 * @route   POST /api/subscription/createCheckoutSession
 * @desc    create checkout session for stripe payment
 * @access  Private
 */
router.post("/createCheckoutSession", authCompanyMiddilware, controller.createCheckoutSession.bind(controller));



/**
 * @route   POST /api/subscription/completeSubscriptionPayment
 * @desc    complete subscription payment
 * @access  Private
 */
router.post("/completeSubscriptionPayment", authCompanyMiddilware, controller.completeSubscriptionPayment.bind(controller));


export default router;