import type { NextFunction, Request, Response } from "express";
import Jwt from "../../utils/jwt";
import MessageBroker from "../../utils/messageBroker";
import type { AuthRequest } from "../../types/api";
import { Service } from "typedi";
import UserRepository from "../../repository/Implements/user.repository";
import type IUserRepository from "../../repository/interface/IUserRepository";
import type IJwt from "../../types/interface/IJwt";
import type IKafka from "../../types/interface/IKafka";
import type { ISubscriptionRepository } from "../../repository/interface/ISubscriptionRepo";
import { SubscriptionRepository } from "../../repository/Implements/subscription.repository";
import { CompanyRepository } from "../../repository/Implements/company.repository";
import { StatusCodes } from "../../constants/api";
import type { ICompanyRepository } from "../../repository/interface/ICompanyRepo";
import { seedDefaultSubscriptions } from "../../models/subscription.model";
import { stripe } from "../../config/stripe";
import type Stripe from "stripe";
import type { ObjectId } from "mongoose";
import type { SubscriptionType } from "../../types/subscription.type";


@Service()
class UserController {
    private readonly userRepository: IUserRepository;
    private readonly jwt: IJwt;
    private readonly kafka: IKafka;
    private readonly subscriptionRepository: ISubscriptionRepository;
    private readonly companyRepository: ICompanyRepository;
    private readonly stripe: Stripe;

    constructor() {
        this.userRepository = new UserRepository();
        this.jwt = new Jwt();
        this.kafka = new MessageBroker();
        this.stripe = stripe;
        this.companyRepository = new CompanyRepository();
        this.subscriptionRepository = new SubscriptionRepository();
    }



    /**
     * @desc    get all subscriptions
     * @body    none
     * @method  GET
     * @access  public
     */
    async getAllSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const subscriptions = await this.subscriptionRepository.findAll();
            res.status(StatusCodes.SUCCESS).json({ subscriptions, message: "Subscriptions fetched successfully" });
        } catch (error) {
            next(error);
        }
    }





    /**
     * @desc    create subscription checkout session for stripe payment 
     * @body    subscriptionId
     * @method  POST
     * @access  private
     */
    async createCheckoutSession(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { subscriptionId } = req.body as { subscriptionId: string };

            const subscription = await this.subscriptionRepository.findById(subscriptionId);

            if (!subscription) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Subscription not found")
            }

            console.log(subscription, subscription.productId, "🟢 subscription");
            const session = await this.stripe.checkout.sessions.create({
                mode: "subscription",
                currency: "inr",
                line_items: [{
                    price: subscription.priceId,
                    quantity: 1
                }],
                success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: process.env.STRIPE_CANCEL_URL!,
                payment_method_types: ['card']
            })

            if (!session) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Failed to create checkout session")
            }

            res.status(StatusCodes.SUCCESS).json({ message: "Checkout session created successfully", sessionId: session.id });

        } catch (error) {
            next(error);
        }
    }



    /**
     * @desc    complete subscription payment
     * @body    sessionId
     * @method  POST
     * @access  private
     */
    async completeSubscriptionPayment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.body as { sessionId: string };

            if (!sessionId) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Session ID is required");
            }

            const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['line_items.data.price'],
            });

            if (!session || !session.line_items) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Failed to retrieve checkout session or line items");
            }

            const priceId = session.line_items?.data?.[0]?.price?.id;
            const plan = await this.subscriptionRepository.findOne({ priceId });
            if (!plan) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Subscription plan not found");
            }

            const payemntIsAlreadyDone = await this.companyRepository.findOne({ 'subscription.stripeSessionId': sessionId });
            if (payemntIsAlreadyDone) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Payment already done");
            }

            const customerId = session.customer as string;
            const companyId = req.companyId as string;

            const company = await this.companyRepository.findById(companyId);
            if (!company) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Company not found");
            }

            const data = {
                subscriptionId: plan._id as ObjectId,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                isActive: true,
                customerId: customerId,
                stripeSessionId: sessionId,
            };

            company.subscription = data;
            company.plan = plan.name as SubscriptionType;
            await company.save();

            res.status(StatusCodes.SUCCESS).json({
                message: "Subscription payment completed successfully",
            });

        } catch (error) {
            next(error);
        }
    }

}

export default UserController;

