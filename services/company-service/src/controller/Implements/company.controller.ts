import type { NextFunction, Request, Response } from "express";
import Jwt from "../../utils/jwt";
import MessageBroker from "../../utils/messageBroker";
import type { AuthRequest } from "../../types/api";
import { Service } from "typedi";
import UserRepository from "../../repository/Implements/user.repository";
import type IUserRepository from "../../repository/interface/IUserRepository";
import type IJwt from "../../types/interface/IJwt";
import type IKafka from "../../types/interface/IKafka";
import type { ICompanyRepository } from "../../repository/interface/ICompanyRepo";
import { CompanyRepository } from "../../repository/Implements/company.repository";


@Service()
class UserController {
    private readonly userRepository: IUserRepository;
    private readonly jwt: IJwt;
    private readonly kafka: IKafka;
    private readonly companyRepository: ICompanyRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.jwt = new Jwt();
        this.kafka = new MessageBroker();
        this.companyRepository = new CompanyRepository();
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
                res.status(400);
                throw new Error("Company Name already exists");
            } else if (companyWebsiteExists) {
                console.log("companyWebsiteExists");
                res.status(400);
                throw new Error("Company Website already exists");
            } else {
                console.log("company does not exist");
                res.status(200);
                throw new Error("Company does not exist");
            }
        } catch (error) {
            next(error);
        }
    }



}

export default UserController;
