import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import { Schema } from "mongoose";
import type { UserDocument } from "../types/interface/IUser";
import { Roles } from "../types/enums";

const UserSchema: Schema = new Schema({
    name: { type: String },
    email: { type: String, unique: true },
    role: { type: String, enum:[Roles.JOBSEEKER,Roles.RECRUITER]},
    password: { type: String },
});



UserSchema.pre<UserDocument>("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});



UserSchema.methods.comparePassword = function (password: string) {
    return bcrypt.compareSync(password, this.password);
}

const User = mongoose.model<UserDocument>('User', UserSchema);
export default User;
