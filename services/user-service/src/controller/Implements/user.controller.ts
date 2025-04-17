import type { NextFunction, Request, Response } from "express";
import Jwt from "../../utils/jwt";
import MessageBroker from "../../utils/messageBroker";
import type { AuthRequest } from "../../types/api";
import { Service } from "typedi";
import UserRepository from "../../repository/Implements/user.repository";
import type IUserRepository from "../../repository/interface/IUserRepository";
import type IJwt from "../../types/interface/IJwt";
import type IKafka from "../../types/interface/IKafka";
import { Event, Roles } from "../../types/enums";
import type { TRecruiter } from "../../types/persnolDets";
import type { TJobSeeker } from "../../types/persnolDets";
import type { IProfileRepository } from "../../repository/interface/IProfileRepository";
import { ProfileRepository } from "../../repository/Implements/profile.repository";
import type { ICompanyRepository } from "../../repository/interface/company.repository";
import { CompanyRepository } from "../../repository/Implements/company.repository";


@Service()
class UserController {
    private readonly userRepository: IUserRepository;
    private readonly jwt: IJwt;
    private readonly kafka: IKafka;
    private readonly profileRepository: IProfileRepository;
    private readonly companyRepository: ICompanyRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.jwt = new Jwt();
        this.kafka = new MessageBroker();
        this.profileRepository = new ProfileRepository();
        this.companyRepository = new CompanyRepository();
    }


    /**
     * @desc    add role and personal details or company details
     * @body    role, jobSeeker, recruiter
     * @method  POST
     * @access  private
     */
    async addRoleAndPersonalDetails(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { role, jobSeeker, recruiter } = req.body as { role: Roles, jobSeeker: TJobSeeker, recruiter: TRecruiter };
            const userId = req.user;
            if (!userId) {
                throw new Error("User not found");
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            if (user.role) {
                throw new Error("User already has a role and Personal Details");
            }
            const updatedUser = await this.userRepository.updateUser(userId, { role });

            if (!updatedUser) {
                throw new Error("User not found");
            }
            await this.kafka.publish("User-Topic", { data: updatedUser }, Event.UPDATE);

            if (role === Roles.JOBSEEKER) {

                const data = {
                    ...jobSeeker,
                    isExperience: jobSeeker.experience,
                    userId,
                }
                const profile = await this.profileRepository.create(data);

                if (!profile) {
                    throw new Error("Profile not created");
                }

                await this.kafka.publish("User-Topic", { data: profile }, Event.CREATE);

                res.status(200).json({ message: "Profile created successfully" });
            } else if (role === Roles.RECRUITER) {
                const data = {
                    ...recruiter,
                    userId,
                }
                const existingCompany = await this.companyRepository.findOne({ $or: [{ companyName: data.companyName }, { companyWebsite: data.companyWebsite }] });
                if (existingCompany) {
                    throw new Error("Company already exists");
                }
                const company = await this.companyRepository.create(data);
                if (!company) {
                    throw new Error("Company not created");
                }
                await this.kafka.publish("Company-Topic", { data: company }, Event.CREATE);
                res.status(200).json({ message: "Company created successfully" });
            }
        } catch (error) {
            next(error);
        }
    }


    /**
     * @desc    check company name or website is already exists
     * @body    companyName, companyWebsite
     * @method  POST
     * @access  private
     */
    async checkCompanyNameOrWebsite(req: Request, res: Response, next: NextFunction) {
        try {

            const { companyName, companyWebsite } = req.body as { companyName: string, companyWebsite: string };
            console.log("ssjsbsjb")
            console.log(this?.companyRepository,this,"ccommmaa")
            const companyNameExists = await this.companyRepository.findOne({ companyName: "amamma"});
            const companyWebsiteExists = await this.companyRepository.findOne({ companyWebsite: companyWebsite || "" });
            if (companyNameExists) {
                console.log("companyNameExists");
                res.status(400).json({ message: "Company Name already exists", companyName: true, companyWebsite: false });
            } else if (companyWebsiteExists) {
                console.log("companyWebsiteExists");
                res.status(400).json({ message: "Company Website already exists", companyName: false, companyWebsite: true });
            } else {
                console.log("company does not exist");
                res.status(200).json({ message: "Company does not exist", companyName: false, companyWebsite: false });
            }
        } catch (error) {
            next(error);
        }
    }



}

export default UserController;
