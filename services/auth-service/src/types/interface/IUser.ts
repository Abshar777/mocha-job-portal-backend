import type { Document, ObjectId } from "mongoose";
import type { Roles } from "../enums";

export default interface IUser  {
    name: string;
    email: string;
    role?: Roles.JOBSEEKER | Roles.RECRUITER;
    password: string;
}

export interface UserDocument extends IUser , Document {
    comparePassword: (password: string) => Boolean;
}