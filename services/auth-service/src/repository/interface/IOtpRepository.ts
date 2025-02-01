import type IOtp from "../../types/interface/IOtp";

export default interface IOtpRepository {
    create(data: Partial<IOtp>): Promise<IOtp>;
    findByEmail(email: string): Promise<IOtp | null>;
    deleteByEmail(email: string): Promise<void>;
    verifyOtp(email: string, otp: string): Promise<boolean>;
    findByUserId(userId:string):Promise<IOtp | null>
} 