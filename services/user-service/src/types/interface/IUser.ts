import type { Document, ObjectId } from "mongoose";
import type { Roles } from "../enums";

export default interface IUser  {
    name: string;
    email: string;
    role?: Roles.JOBSEEKER | Roles.RECRUITER;
    password: string;
    verified:boolean;
    avatar?:string;
    provider?:OAuthProvider
}

export interface UserDocument extends IUser , Document {
    comparePassword: (password: string) => Boolean;
}

export enum OAuthProvider {
    GOOGLE="google",
    GITHUB="github",
    FACEBOOK="facebook",
    LOCAL="local"
}