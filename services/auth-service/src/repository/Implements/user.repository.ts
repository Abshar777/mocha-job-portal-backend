import { Model } from "mongoose";
import type IUser from "../../types/interface/IUser";
import userModel from "../../models/userModel";
import { Service } from "typedi";
import type { UserDocument } from "../../types/interface/IUser";
import type IUserRepository from "../interface/IUserRepository";
import type { Roles } from "../../types/enums";



@Service()
export default class UserRepository implements IUserRepository {
    private readonly db: Model<UserDocument>;
    constructor() {
        this.db = userModel;
    }
    async create(data: IUser & { role?: Roles.JOBSEEKER | Roles.RECRUITER; }) {
        return await this.db.create(data);
    }
    async updateUser(userId: string, data: Partial<IUser>) {
        return await this.db.findOneAndUpdate({ userId }, data, { new: true });
    }
    async delete(userId: string) {
        await this.db.findOneAndDelete({ userId });
    }
    async findById(id: string): Promise<UserDocument | null> {
        return await this.db.findById(id);
    }
    async findByEmail(email: string): Promise<UserDocument | null> {
        return await this.db.findOne({ email });
    }
    async find(limit: number): Promise<UserDocument[] | []> {
        return await this.db.find({}).limit(limit);
    }
    async search(text: string, currentUserId: string): Promise<UserDocument[]> {
        return await this.db.find({
            $or: [
                { email: { $regex: text, $options: 'i' } },
                { name: { $regex: text, $options: 'i' } }
            ],
            _id: { $ne: currentUserId }
        });
    }
}

