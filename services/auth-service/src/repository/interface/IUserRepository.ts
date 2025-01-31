import type IUser from "../../types/interface/IUser";
import type { UserDocument } from "../../types/interface/IUser";

export default interface IUserRepository {
    create(data: IUser): Promise<UserDocument>;
    updateUser(userId: string, data: Partial<IUser>): Promise<UserDocument | null>;
    delete(userId: string): Promise<void>;
    findById(id: string): Promise<UserDocument | null>;
    findByEmail(email: string): Promise<UserDocument | null>;
    find(limit: number): Promise<UserDocument[]>;
    search(text: string, currentUserId: string): Promise<UserDocument[]>;
}