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


@Service()
class UserController {
    private readonly userRepository: IUserRepository;
    private readonly jwt: IJwt;
    private readonly kafka: IKafka;
    private readonly subscriptionRepository: ISubscriptionRepository;
    private readonly companyRepository: ICompanyRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.jwt = new Jwt();
        this.kafka = new MessageBroker();
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
     * @desc    add subscription to company
     * @body    subscriptionId
     * @method  POST
     * @access  private
     */
    async addSubscriptionToCompany(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const companyId = req.companyId as string;

            const { subscriptionId } = req.body as { subscriptionId: string };

            const subscription = await this.subscriptionRepository.findById(subscriptionId);

            if (!subscription) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Subscription not found")
            }

            const company = await this.companyRepository.findById(companyId);

            if (!company) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Company not found")
            }

            company.subscription = {
                subscriptionId: subscription._id as unknown as any,
                startDate: new Date(),
                endDate: new Date(new Date().getTime() + subscription.validityDays * 24 * 60 * 60 * 1000),
                isActive: true,
            };

            company.plan = subscription.type;

            await company.save();

            res.status(StatusCodes.SUCCESS).json({ message: "Subscription added to company successfully" });
        } catch (error) {
            next(error);
        }
    }



}

export default UserController;
