import { Service } from "typedi";
import type IOtp from "../../types/interface/IOtp";
import type IOtpRepository from "../interface/IOtpRepository";
import OtpModel from "../../models/otp.model";
import { Model } from "mongoose";
import type { OtpDocument } from "../../types/interface/IOtp";


@Service()
export default class OtpRepository implements IOtpRepository {
    private readonly otpModel: Model<OtpDocument>;

    constructor() {
        this.otpModel = OtpModel;
    }

    async create(data: IOtp): Promise<IOtp> {
        const otp = await this.otpModel.findOneAndUpdate(
            { email: data.email },
            data,
            { upsert: true, new: true }
        );
        return otp;
    }

    async findByEmail(email: string): Promise<IOtp | null> {
        return await this.otpModel.findOne({ email });
    }

    async findByUserId(userId:string){
        return await this.otpModel.findOne({ userId });
    }

    async deleteByEmail(email: string): Promise<void> {
        await this.otpModel.deleteOne({ email });
    }

    async verifyOtp(email: string, otp: string): Promise<boolean> {
        const otpRecord = await this.otpModel.findOne({ email });
        if (!otpRecord) return false;
        const result = otpRecord.verifyOtp(otp);
        if (result) {
            otpRecord.used = true;
            await otpRecord.save()
            return result
        } else return result;
    }
} 